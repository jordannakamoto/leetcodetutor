// Main Page.js
"use client";

import "react-resizable/css/styles.css"; // Import Resizable styles

import React, { useRef } from "react";

import LCDisplay from "./components/LCDisplay";
import PythonEditor from "./components/PythonEditor";
import { ResizableBox } from "react-resizable";
import { WorkspaceProvider } from "./contexts/workspaceContext";

export default function Home() {

  return (
    <WorkspaceProvider>

      <main className="flex items-center justify-center min-h-screen bg-gray-1 ">
        <div className="flex w-full max-w-7xl h-screen space-x-2">
          {/* Left Column - LCDisplay */}
          <ResizableBox
            width={500}
            height={Infinity}                // Full height
            axis="x"
            resizeHandles={["e"]}            // Resizable horizontally (east handle)
            minConstraints={[300, Infinity]} // Minimum width
            maxConstraints={[800, Infinity]} // Maximum width
            className="bg-gray-1 shadow-md rounded overflow-auto"
          >
            <div className="p-4 h-full">
              <LCDisplay />
            </div>
          </ResizableBox>
          {/* Right Column - PythonEditor */}
          <PythonEditor />
        </div>
      </main>
    </WorkspaceProvider>
  );
}