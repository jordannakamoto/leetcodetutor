"use client";

import React, { useEffect, useRef, useState } from "react";

import { ResizableBox } from "react-resizable";
import ace from "ace-builds";
import dynamic from "next/dynamic";
import usePythonRunner from "../hooks/usePythonRunner";
import { useSolution } from "../contexts/solutionsContext"; // Adjust path if needed

// Configure Ace Editor to load from CDN
const ACE_CDN_BASE = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/";
ace.config.set("basePath", ACE_CDN_BASE);
ace.config.setModuleUrl("ace/mode/python", `${ACE_CDN_BASE}mode-python.js`);
ace.config.setModuleUrl("ace/theme/nord_dark", `${ACE_CDN_BASE}theme-nord_dark.js`);
ace.config.setModuleUrl("ace/ext/language_tools", `${ACE_CDN_BASE}ext-language_tools.js`);

// Dynamically import AceEditor
const AceEditor = dynamic(() => import("react-ace"), { ssr: false });


export default function ResizablePythonEditor() {
  const { pyodide, loading, error, runPythonCode } = usePythonRunner();
  const [codeValue, setCodeValue] = useState("# Write your Python code here...");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);

  const containerRef = useRef(null);
  const [editorDimensions, setEditorDimensions] = useState({ width: 700, height: 400 }); // Default init 

  const { solution } = useSolution(); // Access solution from context


  useEffect(() => {
    setCodeValue(solution); // Update editor content when solution changes
  }, [solution]);


  // UpdateDimensions
  // Update height dynamically on window resize
  // Sets height to 100vh equivalent
  useEffect(() => {
    const updateDimensions = () => {
      setEditorDimensions((prev) => ({
        ...prev,
        height: window.innerHeight, 
      }));
    };
  
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Key Handler for running code with CMD + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.key === "Enter") {
        executeCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [codeValue]);


  // Workaround for loading in ace editor on client side
  useEffect(() => {
    const loadAceBuilds = async () => {
      if (typeof window !== "undefined") {
        await import("ace-builds/src-noconflict/mode-python");
        await import("ace-builds/src-noconflict/theme-nord_dark");
        await import("ace-builds/src-noconflict/ext-language_tools");
      }
    };
    loadAceBuilds();
    window.define = window.define || (() => {});
  }, []);
  

  // Function to execute Python code
  const executeCode = async () => {
    if (!pyodide) return;
    const output = await runPythonCode(codeValue);
    setConsoleLogs(output);
  };

  return (
    <ResizableBox
      width={editorDimensions.width}
      height={editorDimensions.height}
      axis="both"
      resizeHandles={["w"]}
      minConstraints={[400, 300]}
      maxConstraints={[1200, 800]}
      onResizeStop={(e, data) => {
        setEditorDimensions({ width: data.size.width, height: data.size.height });
      }}
      className="border bg-white shadow-md rounded"
    >
      <div ref={containerRef} className="p-4 h-full">
        {/* Ace Editor */}
        <AceEditor
          mode="python"
          theme="nord_dark"
          name="python-editor"
          width="100%"
          height="80%"
          value={codeValue}
          onChange={(value) => setCodeValue(value)}
          fontSize={11}
          setOptions={{ showLineNumbers: true, tabSize: 2 }}
        />

        {/* Console */}
        {isConsoleVisible && (
          <div className="bg-black text-white font-mono p-2 mt-4 rounded overflow-y-auto" style={{ maxHeight: "150px" }}>
            {consoleLogs.length === 0 ? (
              <p>Console Output...</p>
            ) : (
              consoleLogs.map((line, index) => (
                <p key={index} className={line.includes("Error") ? "text-red-500" : ""}>
                  {line}
                </p>
              ))
            )}
          </div>
        )}

        {/* Controls */}
        {/* <div className="mt-4 flex justify-between">
          <button
            onClick={executeCode}
            className="bg-green-500 text-white px-3 py-1 rounded"
            disabled={!pyodide || loading}
          >
            {loading ? "Loading Pyodide..." : "Run Code (Ctrl + Enter)"}
          </button>
          <button
            onClick={() => setIsConsoleVisible(!isConsoleVisible)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            {isConsoleVisible ? "Hide Console" : "Show Console"}
          </button>
        </div> */}
      </div>
    </ResizableBox>
  );
}