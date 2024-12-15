"use client";

import "react-resizable/css/styles.css"; // Import Resizable styles

import LCDisplay from "./components/LCDisplay";
import PythonEditor from "./components/PythonEditor";
import React from "react";
import { ResizableBox } from "react-resizable";
import { SolutionProvider } from "./contexts/solutionsContext";

export default function Home() {
  return (
    <SolutionProvider>

      <main className="flex items-center justify-center min-h-screen bg-gray-100 ">
        {/* Container for Resizable Columns */}
        <div className="flex w-full max-w-7xl h-screen space-x-2">
          {/* Left Column - LCDisplay */}
          <ResizableBox
            width={500} // Initial width
            height={Infinity} // Full height
            axis="x"
            resizeHandles={["e"]} // Resizable horizontally (east handle)
            minConstraints={[300, Infinity]} // Minimum width
            maxConstraints={[800, Infinity]} // Maximum width
            className="border bg-white shadow-md rounded overflow-auto"
          >
            <div className="p-4 h-full">
              <LCDisplay />
            </div>
          </ResizableBox>

          {/* Right Column - PythonEditor */}
          <PythonEditor height="100%" width="100%" />
          
        </div>
      </main>
    </SolutionProvider>
  );
}