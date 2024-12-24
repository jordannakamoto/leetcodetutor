"use client";

// import "react-tabs/style/react-tabs.css";

import React, { useEffect, useRef, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

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
  // CONTEXT
  const { solution, setWorkspaceContext } = useWorkspace();

  // STATE
  // Pyodide/AceEditor
  const { pyodide, loading, error, runPythonCode } = usePythonRunner();
  const [workspaceCode, setWorkspaceCode] = useState("# Workspace code here...");
  const [testCaseCode, setTestCaseCode] = useState("# Write test cases here...");
  const [solutionCode, setSolutionCode] = useState(solution || "# Solution code here...");
  
  // Console
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);

  // // REFS
  // const containerRef = useRef(null);



  // // Getter function for codeValue
  const getCodeValue = () => workspaceCode;

  // Pre-Process Solution
  // - removes all lines except function headers
  function preProcessSolution(solution) {
    const lines = solution.split("\n");
    const processedLines = lines.filter((line) => line.trim().startsWith("def") || line.trim().startsWith("class"));
    return processedLines.join("\n");
  }

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
    let processedLines = preProcessSolution(solution);
    setWorkspaceCode(processedLines + '\n\t'); 
    setSolutionCode(solution);
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
  }, [workspaceCode]);
  
  // [Execute Code] - Function to execute Python code
  const executeCode = async () => {
    if (!pyodide) return;
    const codeToRun = `${testCaseCode}\n\n${workspaceCode}`;
    const output = await runPythonCode(codeToRun);
    setConsoleLogs(output);
  };


  // --- RENDER ---------------------------------------------------------------------------------------------------------------------------------  //
  return (
    <ResizableBox
      width={800}
      axis="both"
      resizeHandles={["w"]}
      minConstraints={[600, 400]}
      maxConstraints={[1200, 900]}
      className="shadow-md rounded"
    >
      <Tabs>
        <TabList>
          <Tab>Workspace</Tab>
          <Tab>Test Cases</Tab>
          <Tab>Solution</Tab>
        </TabList>

        <TabPanel>
          <AceEditor
            mode="python"
            theme="nord_dark"
            name="workspace-editor"
            width="100%"
            height="80vh"
            value={workspaceCode}
            onChange={(value) => {
              setWorkspaceCode(value); // Update the state
            }}
            fontSize={12}
            setOptions={{ showLineNumbers: true, tabSize: 4 }}
          />
        </TabPanel>

        <TabPanel>
          <AceEditor
            mode="python"
            theme="nord_dark"
            name="testcase-editor"
            width="100%"
            height="80vh"
            value={testCaseCode}
            onChange={(value) => setTestCaseCode(value)}
            fontSize={12}
            setOptions={{ showLineNumbers: true, tabSize: 4 }}
          />
        </TabPanel>

        <TabPanel>
          <AceEditor
            mode="python"
            theme="nord_dark"
            name="solution-editor"
            width="100%"
            height="80vh"
            value={solutionCode}
            onChange={(value) => setSolutionCode(value)}
            fontSize={12}
            setOptions={{ showLineNumbers: true, tabSize: 4 }}
          />
        </TabPanel>
      </Tabs>

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
      <ChatWindow />
    </ResizableBox>
  );
}