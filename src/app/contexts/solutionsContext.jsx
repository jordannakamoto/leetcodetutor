"use client";

import React, { createContext, useContext, useState } from "react";

const SolutionContext = createContext();

export function SolutionProvider({ children }) {
  const [solution, setSolution] = useState("# Write your Python code here...");

  return (
    <SolutionContext.Provider value={{ solution, setSolution }}>
      {children}
    </SolutionContext.Provider>
  );
}

export function useSolution() {
  return useContext(SolutionContext);
}