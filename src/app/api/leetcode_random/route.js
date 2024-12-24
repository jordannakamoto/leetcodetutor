// LEETCODE API - RANDOM PROBLEM
/* Retrieves a single random "Easy" or "Medium" problem from the source CSV */

import { NextResponse } from "next/server";
import Papa from "papaparse";
import fs from "fs";
import path from "path";

// Load CSV data
const CSV_PATH = path.resolve(process.cwd(), "src/data/leetcode2.csv");

export async function GET(req) {
  try {
    // Read the CSV file
    const fileContent = fs.readFileSync(CSV_PATH, "utf-8");
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    let data = parsed.data;

    // Filter for "Easy" and "Medium" problems only
    const filteredData = data.filter(
      (row) =>
        row.difficulty.toLowerCase() === "easy" // || row.difficulty.toLowerCase() === "medium"
    );

    // If there are no problems available, return an error
    if (filteredData.length === 0) {
      return NextResponse.json(
        { error: "No problems available for the specified difficulties." },
        { status: 404 }
      );
    }

    // Select a random problem
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    const randomProblem = filteredData[randomIndex];

    // Return the random problem
    return NextResponse.json({ problem: randomProblem });
  } catch (error) {
    console.error("Error loading or processing CSV:", error);
    return NextResponse.json(
      { error: "Failed to load or parse CSV data." },
      { status: 500 }
    );
  }
}