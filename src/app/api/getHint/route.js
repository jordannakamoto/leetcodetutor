import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for API key
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { problemDescription, codeValue, solution } = body;
    console.log(body)

    // Check for required fields
    if (!problemDescription || !codeValue || !solution) {
      return Response.json(
        { error: "Problem description, code value, and solution are required." },
        { status: 400 }
      );
    }

    const prompt = `
    Solution: ${solution}
    Current Code: ${codeValue}
    Task: Based on the solution, provide a single short conceptual step for the next step.  If my approach was wrong, correct it.
    `;
    console.log(prompt);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Replace with your preferred OpenAI model
      messages: [
        { role: "system", content: "You are a helpful computer science tutor providing concise hints." },
        { role: "user", content: prompt },
      ],
      max_tokens: 100, // Generate a short hint
    });

    const hint = response.choices[0]?.message?.content || "No hint available.";
    return Response.json({ hint }, { status: 200 });
  } catch (error) {
    console.error("Error fetching hint:", error);
    return Response.json({ error: "Failed to generate hint." }, { status: 500 });
  }
}