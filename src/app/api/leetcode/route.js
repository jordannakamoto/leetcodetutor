// LEETCODE API
/* Retrieves a set of problems from the source csv for display to UI and to enter program */

import { NextResponse } from "next/server";
import Papa from "papaparse";
import fs from "fs";
import path from "path";

// Load CSV data
const CSV_PATH = path.resolve(process.cwd(), "src/data/leetcode2.csv");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty"); // "Easy", "Medium", "Hard"
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
    const size = parseInt(searchParams.get("size")) || 10; // Default to 10 results per page

    // Read CSV File
    const fileContent = fs.readFileSync(CSV_PATH, "utf-8");
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    let data = parsed.data;

    // Filter by difficulty if specified
    if (difficulty) {
      data = data.filter(
        (row) => row.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Paginate results
    const startIndex = (page - 1) * size;
    const paginatedData = data.slice(startIndex, startIndex + size);

    // Return paginated data and total count
    return NextResponse.json({
      total: data.length,
      page,
      size,
      results: paginatedData,
    });
  } // ~ Error (500) 
  catch (error) {
    console.error("Error loading CSV:", error);
    return NextResponse.json(
      { error: "Failed to load or parse CSV data." },
      { status: 500 }
    );
  }
}