import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { handleStripeWebhook } from "@/lib/actions/general.action";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    await handleStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
