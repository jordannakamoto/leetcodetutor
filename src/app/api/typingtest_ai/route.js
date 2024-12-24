// LEETCODE API - SUMMARIZE AND EXPLAIN
/* Accepts a problem object, sends it to OpenAI for summarization and explanation, and returns the results. */

import { NextResponse } from "next/server";
import OpenAI from "openai";

// Load API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req) {
  try {
    // Parse the incoming request to get the problem object
    const { problem } = await req.json();

    if (!problem || !problem.title || !problem.problem_description || !problem.solution) {
      return NextResponse.json(
        { error: "Invalid problem object. Ensure it includes title, description, and solution." },
        { status: 400 }
      );
    }

    const { title, problem_description, solution } = problem;

    // Prepare the prompt for OpenAI API
    const prompt = `
You are a programming expert. Analyze the following problem and solution:

Problem Title: ${title}
Description: ${problem_description}

Solution:
${solution}

1. Explain the problem in one line (not conversationally, start with action verb).

2. For each line in the solution (ignoring class and function definitions), give a very short explanation of what the line does toward solving the problem, return to me as a python list`;

    // Send the request to OpenAI API
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful programming assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500, // Adjust as necessary
    });

    const summary = aiResponse.choices[0].message.content;

    // Return the OpenAI-generated summary and explanation
    return NextResponse.json({
      problemTitle: title,
      summary,
    });
  } catch (error) {
    console.error("Error generating summary and explanation:", error);
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 }
    );
  }
}