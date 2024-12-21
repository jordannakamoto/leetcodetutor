"use client";

import React, { useEffect, useRef, useState } from "react";

import ChatWindow from "./ChatWindow";
import { ResizableBox } from "react-resizable";
import ace from "ace-builds";
import dynamic from "next/dynamic";
import usePythonRunner from "../hooks/usePythonRunner";
import { useWorkspace } from "../contexts/workspaceContext"; // Adjust path if needed

// Configure Ace Editor to load from CDN, then Dynamically import AceEditor
const ACE_CDN_BASE = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/";
ace.config.set("basePath", ACE_CDN_BASE);
// Change this to change the theme
ace.config.setModuleUrl("ace/theme/nord_dark", `${ACE_CDN_BASE}theme-nord_dark.js`);
ace.config.setModuleUrl("ace/mode/python", `${ACE_CDN_BASE}mode-python.js`); ace.config.setModuleUrl("ace/ext/language_tools", `${ACE_CDN_BASE}ext-language_tools.js`);
const AceEditor = dynamic(() => import("react-ace"), { ssr: false });


export default function ResizablePythonEditor() {
  // STATE
  // Pyodide/AceEditor
  const { pyodide, loading, error, runPythonCode } = usePythonRunner();
  
  const [codeValue, setCodeValue] = useState("# Write your Python code here...");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);

  // REFS
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // CONTEXT
  const { solution } = useWorkspace();

  // Getter function for codeValue
  const getCodeValue = () => editorRef.current?.editor.getValue();

  // INIT
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
  
  // Set the code value to the solution on load...
  // TODO: make this more sophisticated
  useEffect(() => {
    setCodeValue(solution); 
  }, [solution]);

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
  
  // [Execute Code] - Function to execute Python code
  const executeCode = async () => {
    if (!pyodide) return;
    const output = await runPythonCode(codeValue);
    setConsoleLogs(output);
  };

  // --- RENDER ---------------------------------------------------------------------------------------------------------------------------------  //
  return (
    <ResizableBox
      width={500}
      axis="both"
      resizeHandles={["w"]}
      minConstraints={[400, 300]}
      maxConstraints={[1200, 800]}
      className=" shadow-md rounded"
    >
      <ResizableBox
        width="100%"
        height="60px"
        resizeHandles={["s"]}
        style={{ backgroundColor: "black" }}>
          hello world
      </ResizableBox>
      {/* AI Output/Hints */}
      <div id="ace-spacer" className="ace-nord-dark" style={{height: "60px", paddingTop: "10px"}}></div>
      <div ref={containerRef} className="h-full">
        {/* Ace Editor */}
        <AceEditor
          ref={editorRef}
          mode="python"
          theme="nord_dark"
          name="python-editor"
          width="100%"
          height="80%"
          value={codeValue}
          onChange={(value) => setCodeValue(value)}
          fontSize={12}
          setOptions={{ showLineNumbers: true, tabSize: 2 }}
        />

        {/* Console */}
        {isConsoleVisible && (
          <div className="bg-black text-white font-mono p-2 overflow-y-auto" style={{ maxHeight: "150px" }}>
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
          <ChatWindow getCodeValue={getCodeValue}/>
      </div>
    </ResizableBox>
  );
}