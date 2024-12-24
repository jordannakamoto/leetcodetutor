// Workspace Context:
// problem description, solution, codevalue

"use client";

import React, { createContext, useContext, useState } from "react";

import { set } from "mongoose";

// Create WorkspaceContext
const WorkspaceContext = createContext();

// Provider Component
export function WorkspaceProvider({ children }) {
  const [problemDescription, setProblemDescription] = useState("Default problem description...");
  const [workspaceContext, setWorkspaceContext] = useState("# Workspace code here...");
  const [solution, setSolution] = useState("# Write your solution here...");
  const [codeValue, setCodeValue] = useState("# Write your Python code here...");

  return (
    <WorkspaceContext.Provider
      value={{
        problemDescription,
        setProblemDescription,
        workspaceContext,
        setWorkspaceContext,
        solution,
        setSolution,
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