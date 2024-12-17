"use client";

import React, { createContext, useContext, useState } from "react";

// CONTAINS:
// problem description, solution, codevalue

// Create WorkspaceContext
const WorkspaceContext = createContext();

// Provider Component
export function WorkspaceProvider({ children }) {
  const [problemDescription, setProblemDescription] = useState("Default problem description...");
  const [solution, setSolution] = useState("# Write your solution here...");
  const [codeValue, setCodeValue] = useState("# Write your Python code here...");

  return (
    <WorkspaceContext.Provider
      value={{
        problemDescription,
        setProblemDescription,
        solution,
        setSolution,
        codeValue,
        setCodeValue,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// Custom Hook to Use WorkspaceContext
export function useWorkspace() {
  return useContext(WorkspaceContext);
}