import "highlight.js/styles/atom-one-dark.css"; // Highlight.js theme

import React, { useEffect, useState } from "react";

import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python"; // Use Python as the language

hljs.registerLanguage("python", python); // Register Python

const TypingTest = () => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [desc, setDesc] = useState(""); // Store description
  const [steps, setSteps] = useState(""); // Store code steps
  const [showPopup, setShowPopup] = useState(false); // Control popup visibility

  useEffect(() => {
    const fetchRandomProblemAndProcess = async () => {
      setLoading(true);
      try {
        // Fetch random problem
        const response = await fetch("/api/leetcode_random");
        const data = await response.json();
        const fetchedProblem = data.problem;

        // Fetch explanation for the problem
        const explanationResponse = await fetch("/api/typingtest_ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problem: fetchedProblem }),
        });
        const explanationData = await explanationResponse.json();
        
        // Ensure explanationData.summary exists and is a string
        const explanationText = explanationData.summary || "";
        
        // New logic to trim everything before the first ':' (inclusive)
        const parseInput = (text) => {
            if (!text || typeof text !== "string") return ""; // Handle empty or non-string cases
          
            // Split into lines and remove characters up to and including the first colon in each line
            const cleanedLines = text
              .split("\n")
              .map((line) => {
                const colonIndex = line.indexOf(":");
                const cleanedLine = colonIndex !== -1 ? line.slice(colonIndex + 1).trim() : line.trim(); // Remove up to and including `:`
                return cleanedLine.startsWith("1. ") ? cleanedLine.slice(3).trim() : cleanedLine; // Remove "1. " if it exists
              });
          
            // Join cleaned lines back into a single string
            return cleanedLines.join("\n").trim();
          };
        
        // Apply the parseInput function to explanationText
        const trimmedExplanationText = parseInput(explanationText);
        
        // Extract steps and description
        const stepsMatch = trimmedExplanationText.match(/```python([\s\S]*?)```/);
        const stepsCode = stepsMatch ? stepsMatch[1].trim() : "";
        const descText = trimmedExplanationText.replace(/```python[\s\S]*?```/, "").trim();
        
        // Debugging logs
        console.log("Fetched Problem:", fetchedProblem);
        console.log("Explanation Text:", explanationText);
        console.log("Trimmed Explanation Text:", trimmedExplanationText);
        console.log("Description:", descText);
        console.log("Steps (Code):", stepsCode);
        
        setProblem(fetchedProblem);
        setDesc(descText);
        setSteps(stepsCode);
        setShowPopup(true);
      } catch (error) {
        console.error("Error fetching problem or explanation:", error);
      }
      setLoading(false);
    };

    fetchRandomProblemAndProcess();
  }, []);

  if (loading) {
    return <p>Loading problem...</p>;
  }

  if (!problem) {
    return <p>No problem available at this time.</p>;
  }

  const solutions = `
Problem: ${problem.title} (${problem.difficulty})

${problem.solution}
`;

  const highlightedSolutions = hljs.highlight(solutions, { language: "python" }).value;
  const highlightedUserInput = hljs.highlight(userInput || " ", { language: "python" }).value;

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const newValue =
        userInput.substring(0, cursorPosition) + "  " + userInput.substring(cursorPosition); // Insert 2 spaces
      setUserInput(newValue);

      setTimeout(() => {
        e.target.selectionStart = cursorPosition + 2;
        e.target.selectionEnd = cursorPosition + 2;
      }, 0);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1e1e1e",
        color: "#fff",
        fontFamily: "monospace",
        lineHeight: "1.5",
      }}
    >
      {/* Background Highlighted Solutions */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          fontSize: "16px",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          opacity: 0.2,
          pointerEvents: "none",
          zIndex: 1,
        }}
        dangerouslySetInnerHTML={{ __html: highlightedSolutions }}
      ></div>

      {/* Highlighted User Input Layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          fontSize: "16px",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          zIndex: 2,
          pointerEvents: "none",
          color: "#fff",
        }}
        dangerouslySetInnerHTML={{ __html: highlightedUserInput }}
      ></div>

      {/* Transparent Typing Input */}
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          fontSize: "16px",
          lineHeight: "1.5",
          fontFamily: "monospace",
          backgroundColor: "transparent",
          color: "transparent",
          caretColor: "#fff",
          border: "none",
          resize: "none",
          outline: "none",
          zIndex: 3,
        }}
      ></textarea>

      {/* Popup for API Response */}
      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translate(-50%, -20%)",
            backgroundColor: "#282c34",
            color: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
            zIndex: 4,
            maxWidth: "80vw",
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          <h3>Description</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{desc}</p>
          <h3>Steps</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{steps}</pre>
          <button
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#007acc",
              border: "none",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => setShowPopup(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingTest;