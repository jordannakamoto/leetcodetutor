// GET HINT API
import OpenAI from "openai";

// Load API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST
export async function POST(req) {
  try {
    const body = await req.json();
    const { problemDescription, codeValue, solution } = body;
    console.log(body)

    // Check: (400) for required fields
    if (!problemDescription || !codeValue || !solution) { return Response.json( { error: "Problem description, code value, and solution are required." }, { status: 400 } ); }

    // ~ Prompt
    const prompt = ` Solution: ${solution} Current Code: ${codeValue}
    Task: Based on the solution, provide a single short conceptual step for the next step.  If my approach was wrong, correct it.
    `;
    // console.log(prompt);
    
    // ~ Send
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // model
      messages: [
        { role: "system", content: "You are a helpful computer science tutor providing concise hints." },
        { role: "user", content: prompt },
      ],
      max_tokens: 100, // Generate a short hint
    });

    // ~ Return Hint (200)
    const hint = response.choices[0]?.message?.content || "No hint available.";
    return Response.json({ hint }, { status: 200 });
  } // ~ Error (500)
  catch (error) {
    console.error("Error fetching hint:", error); return Response.json({ error: "Failed to generate hint." }, { status: 500 });
  }
}