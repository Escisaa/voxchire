"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import Stripe from "stripe";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { User, Subscription } from "@/models";
import dbConnect from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, earlyEnd } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const promptAddition = earlyEnd
      ? `Note: The candidate ended the interview early, which shows a lack of commitment and professionalism. This should be reflected in the scoring and feedback with significantly lower scores across all categories.`
      : "";

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        ${promptAddition}
        
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.

        ${
          earlyEnd
            ? "Important: Due to the early termination of the interview, the maximum possible score in any category should not exceed 30."
            : ""
        }
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: earlyEnd
        ? `${object.finalAssessment}\n\nNote: The candidate ended the interview prematurely, which significantly impacted their overall assessment. This demonstrates a lack of commitment and professionalism that would be concerning in a real interview setting.`
        : object.finalAssessment,
      createdAt: new Date().toISOString(),
      earlyEnd: earlyEnd || false,
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    // Add a cache-busting query parameter to ensure fresh data
    const timestamp = Date.now();

    const interviewRef = db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    const snapshot = await interviewRef.get();
    if (snapshot.empty) return [];

    const interviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    // Get any associated feedback for each interview
    const interviewsWithFeedback = await Promise.all(
      interviews.map(async (interview) => {
        const feedbackRef = db
          .collection("feedback")
          .where("interviewId", "==", interview.id)
          .limit(1);

        const feedbackSnapshot = await feedbackRef.get();
        const feedback = feedbackSnapshot.empty
          ? null
          : feedbackSnapshot.docs[0].data();

        return {
          ...interview,
          feedback,
        };
      })
    );

    return interviewsWithFeedback;
  } catch (error) {
    console.error("Error getting interviews:", error);
    return null;
  }
}

export async function deleteUserInterviews(userId: string): Promise<boolean> {
  try {
    // Get all interviews for the user
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .get();

    // Get all feedback for the user's interviews
    const interviewIds = interviews.docs.map((doc) => doc.id);
    const feedback = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .get();

    // Delete in batches
    const batch = db.batch();

    // Delete interviews
    interviews.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete feedback
    feedback.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting user interviews:", error);
    return false;
  }
}

export async function checkUserCredits(
  userId: string
): Promise<{ credits: number; hasSubscription: boolean }> {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) throw new Error("User not found");

    const hasActiveSubscription =
      userData.subscription &&
      new Date(userData.subscription.expiresAt) > new Date();

    return {
      credits: userData.credits || 0,
      hasSubscription: hasActiveSubscription,
    };
  } catch (error) {
    console.error("Error checking credits:", error);
    throw error;
  }
}

export async function deductCredit(userId: string): Promise<boolean> {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    // Check if user has an active unlimited subscription
    if (userData?.subscription) {
      const now = new Date();
      const expiresAt = new Date(userData.subscription.expiresAt);
      if (expiresAt > now) {
        return true; // No need to deduct credits
      }
    }

    // Check if user has enough credits
    if (!userData?.credits || userData.credits < 1) {
      return false;
    }

    // Deduct 1 credit
    await userRef.update({
      credits: userData.credits - 1,
    });

    return true;
  } catch (error) {
    console.error("Error deducting credit:", error);
    return false;
  }
}

export async function verifyAndProcessPayment(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      throw new Error("No userId found in session");
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      throw new Error("No price found in session");
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const currentCredits = userDoc.data()?.credits || 0;

    // Map priceId to credits or subscription
    const creditMap: { [key: string]: number } = {
      price_1RFgEFG0PfCKs8gByynO8i9P: 5, // 5 credits package
      price_1RFgFpG0PfCKs8gBn5vPS92f: 10, // 10 credits package
    };

    const subscriptionMap: { [key: string]: string } = {
      price_1RFgI7G0PfCKs8gBUtouZngv: "6m", // 6 months unlimited
      price_1RFgLzG0PfCKs8gBfrPat8J4: "12m", // 12 months unlimited
    };

    if (priceId in creditMap) {
      // Handle credit purchase
      const creditsToAdd = creditMap[priceId];
      await userRef.update({
        credits: currentCredits + creditsToAdd,
      });
      return { success: true, credits: currentCredits + creditsToAdd };
    } else if (priceId in subscriptionMap) {
      // Handle unlimited subscription
      const duration = subscriptionMap[priceId];
      const months = duration === "6m" ? 6 : 12;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      await userRef.update({
        subscription: {
          type: `unlimited_${duration}`,
          expiresAt: expiresAt.toISOString(),
        },
      });
      return { success: true, subscription: true };
    }

    return { success: false, error: "Invalid price ID" };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, error: error.message };
  }
}

export async function createStripeCheckoutSession(
  userId: string,
  priceId: string
) {
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?cancelled=true&user_id=${userId}`,
      metadata: {
        userId,
      },
      client_reference_id: userId,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
      custom_text: {
        submit: {
          message: "Your session will be preserved when you return",
        },
      },
    });

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: "Failed to create checkout session" };
  }
}

export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) {
        throw new Error("No userId in session metadata");
      }

      // Get the price details
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      const priceId = lineItems.data[0]?.price?.id;

      if (!priceId) {
        throw new Error("No price found in session");
      }

      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const currentCredits = userDoc.data()?.credits || 0;

      // Map priceId to credits or subscription
      const creditMap: { [key: string]: number } = {
        price_1RFgEFG0PfCKs8gByynO8i9P: 5, // 5 credits package
        price_1RFgFpG0PfCKs8gBn5vPS92f: 10, // 10 credits package
      };

      const subscriptionMap: { [key: string]: string } = {
        price_1RFgI7G0PfCKs8gBUtouZngv: "6m", // 6 months unlimited
        price_1RFgLzG0PfCKs8gBfrPat8J4: "12m", // 12 months unlimited
      };

      if (priceId in creditMap) {
        // Handle credit purchase
        const creditsToAdd = creditMap[priceId];
        await userRef.update({
          credits: currentCredits + creditsToAdd,
        });
        console.log(`Added ${creditsToAdd} credits to user ${userId}`);
      } else if (priceId in subscriptionMap) {
        // Handle unlimited subscription
        const duration = subscriptionMap[priceId];
        const months = duration === "6m" ? 6 : 12;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + months);

        await userRef.update({
          subscription: {
            type: `unlimited_${duration}`,
            expiresAt: expiresAt.toISOString(),
          },
        });
        console.log(`Added ${duration} subscription to user ${userId}`);
      } else {
        throw new Error(`Unknown priceId: ${priceId}`);
      }
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw error;
  }
}
