import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are an expert interviewer with comprehensive knowledge of all industries and job roles. You are creating questions for a ${role} position.
        
        First, understand the core aspects of a ${role} position:
        1. Key responsibilities and daily tasks
        2. Required skills and competencies
        3. Industry-specific knowledge
        4. Common challenges in this role
        
        Then, generate ${amount} high-quality interview questions that:
        - Are specifically tailored for a ${level} ${role} position
        - Focus on ${type} style questions
        - Assess both role-specific expertise and general professional capabilities
        - Match the ${level} experience level expectations
        - Use clear, conversational language (avoid special characters)
        
        Question types to include:
        For Role-specific questions:
        - Focus on day-to-day responsibilities
        - Test industry-specific knowledge
        - Assess technical skills relevant to the role
        
        For Behavioral questions:
        - Past experiences handling role-specific situations
        - Team collaboration and communication
        - Problem-solving in context of the role
        
        For Situational questions:
        - Present realistic scenarios common in this role
        - Challenge-resolution scenarios
        - Client/stakeholder interaction scenarios
        
        For Mixed questions:
        - Balanced combination of above types
        - Cover both technical and soft skills
        
        Return only the questions in this format:
        ["Question 1", "Question 2", "Question 3"]
        `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
