// Main Page.js
"use client";

import "react-resizable/css/styles.css"; // Import Resizable styles

import React, { useRef } from "react";

import LCDisplay from "./components/LCDisplay";
import PythonEditor from "./components/PythonEditor";
import { ResizableBox } from "react-resizable";
import TypingTest from  './components/TypingTest';
import { WorkspaceProvider } from "./contexts/workspaceContext";

export default function Home() {

  return (
    <WorkspaceProvider>

      <main className="flex items-center justify-center min-h-screen">
        <TypingTest/>
      </main>
    </WorkspaceProvider>
  );
}