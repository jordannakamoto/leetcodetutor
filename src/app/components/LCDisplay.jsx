// LCDisplay
// View 1: Shows leetcode problems in a panel
// View 2: Shows problem details

"use client";

import React, { useEffect, useState } from "react";

import { useWorkspace } from "../contexts/workspaceContext";

const highlightVariables = (description) => {
    // Regex to detect variables, bracketed values, and standalone numbers
    const variableRegex = /(?<!\w)([b-zB-Z])(?!\w)|(\[.*?\])|(?<!\d)(-?\d+(?:\^\d+)?)(?!-bit|\d)/g;
  
    return description.replace(variableRegex, (match, letter, brackets, number) => {
      if (letter) return `<span class="variable">${match}</span>`;
      if (brackets) return `<span class="bracketed">${match}</span>`;
      if (number) return `<span class="number">${match}</span>`;
      return match;
    });
  };
  
  // Function to format problem description with sections
  const formatProblemDescription = (description) => {
    const lines = description.split("\n");
    let inExamples = false;
  
    return lines
      .map((line) => {
        // Detect section markers
        if (/^Example \d+:/.test(line)) {
          inExamples = true;
          return `<p class="example-title font-bold">${line}</p>`;
        }
  
        if (/^Constraints:/.test(line)) {
          inExamples = false;
          return `<p class="constraints-title font-bold mt-4">${line}</p>`;
        }
  
        if (inExamples) {
          if (/^\s*Input:/.test(line)) {
            return `<p class="example-input font-bold">${line}</p>`;
          }
          if (/^\s*Output:/.test(line)) {
            return `<p class="example-output font-bold">${line}</p>`;
          }
          return `<p class="example-line">${line}</p>`; // Normal example line
        }
  
        // Handle constraints with bullets and highlighting
        if (/^\s*[-•]/.test(line)) {
          return `<p class="constraint-item bg-gray-800 p-2 rounded-lg mt-2">• ${line.trim().replace(/^[-•]\s*/, "")}</p>`;
        }
  
        // Default highlighting for the main description
        return `<p>${highlightVariables(line)}</p>`;
      })
      .join("");
  };
  
export default function LCDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState(""); // Difficulty filter
  const [page, setPage] = useState(1);
  const [size] = useState(10); // Rows per page
  const [total, setTotal] = useState(0);
  const [selectedProblem, setSelectedProblem] = useState(null); // Selected problem for details view
  const { setSolution, setProblemDescription } = useWorkspace();

  // Function to fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leetcode?difficulty=${difficulty}&page=${page}&size=${size}`
      );
      const result = await response.json();

      if (response.ok) {
        setData(result.results);
        setTotal(result.total);
        setError(null);
      } else {
        setError(result.error || "Failed to load data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [difficulty, page]);

  // Return to problem list
  const handleBack = () => {
    setSelectedProblem(null);
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setProblemDescription(problem.problem_description)
    setSolution(problem.solution || "# Solution not available.");
    // console.log(problem.solution);
  };


  return (
    <div className=" bg-gray-1 ">
      {/* <h2 className="text-2xl font-bold mb-4">
        {selectedProblem ? "Problem Details" : "LeetCode Problems"}
      </h2> */}

      {selectedProblem ? (
        // Problem Details View
        <div>
          <button
            onClick={handleBack}
            className="text-blue-1 hover:underline mb-4 flex items-center"
          >
            ← Back to Problem List
          </button>
          <h3 className="text-xl font-semibold mb-2">
            {selectedProblem.title}
          </h3>
          <p
        className="text-gray-700 whitespace-pre-line"
        dangerouslySetInnerHTML={{
            __html: formatProblemDescription(selectedProblem.problem_description),
        }}
        ></p>
          <div className="mt-4">
            <a
              href={selectedProblem.problem_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-1 hover:underline"
            >
              View Problem on LeetCode
            </a>
          </div>
        </div>
      ) : (
        // Problem List View
        <>
          {/* Dropdown for difficulty */}
          <div className="mb-4">
            <label className="mr-2">Filter by Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1); // Reset to page 1
              }}
              style={{backgroundColor:"black",border:"None", color: "gray"}}
              className="border rounded px-2 py-1"
            >
              <option value="">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Loading and Error State */}
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {/* Table of Problems */}
              <div className="overflow-x-auto">
                <table style={{color:"gray"}}className="w-full border-collapse border border-gray-900">
                  <thead>
                    <tr className="bg-gray-900">
                      <th className=" px-4 py-2">Title</th>
                      {!difficulty && (
                        <th className=" px-4 py-2">Difficulty</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((problem, index) => (
                      <tr key={index} className="hover:bg-gray-900">
                        <td
                          className=" px-4 py-2 text-blue-500 hover:underline cursor-pointer"
                          onClick={() => handleSelectProblem(problem)}
                        >
                          {problem.title}
                        </td>
                        {!difficulty && (
                          <td className=" px-4 py-2">
                            {problem.difficulty}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-3 py-1 bg-blue-900 text-white rounded disabled:bg-gray-900"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {Math.ceil(total / size)}
                </span>
                <button
                  disabled={page * size >= total}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 bg-blue-900 text-white rounded disabled:bg-gray-900"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}