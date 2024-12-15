import { useEffect, useState } from "react";

import { useScript } from "usehooks-ts";

const PYODIDE_VERSION = "0.25.0";

export default function usePythonRunner() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pyodideScriptStatus = useScript(
    `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`
  );

  useEffect(() => {
    const loadPyodideInstance = async () => {
      try {
        if (pyodideScriptStatus === "ready" && !pyodide) {
          const loadedPyodide = await globalThis.loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
          });
          setPyodide(loadedPyodide);
        }
      } catch (err) {
        setError("Failed to load Pyodide");
      } finally {
        setLoading(false);
      }
    };
    loadPyodideInstance();
  }, [pyodideScriptStatus]);

  // Function to execute Python code
  const runPythonCode = async (code) => {
    if (!pyodide) return [];
    let logs = [];
    pyodide.setStdout({ batched: (msg) => logs.push(msg) });
    pyodide.setStderr({ batched: (msg) => logs.push(`Error: ${msg}`) });

    try {
      await pyodide.runPythonAsync(code);
    } catch (err) {
      logs.push(`Error: ${err.message}`);
    }
    return logs;
  };

  return { pyodide, loading, error, runPythonCode };
}