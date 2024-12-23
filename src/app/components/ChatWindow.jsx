// components/ChatWindow.jsx
import React, { useEffect, useRef, useState } from 'react';

import { useWorkspace } from "../contexts/workspaceContext"; // Adjust path if needed

const ChatWindow = ({ getCodeValue }) => {
    const inputRef = useRef(null);

    // STATE
    const [ isVisible, setIsVisible ] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [loading, setLoading] = useState(false); // Add this state for loading feedback
    const [hint, setHint] = useState("");

    // ACCESS CONTEXT
    const {problemDescription, solution} = useWorkspace(); // codeValue is pulled from getter


    const fetchHint = async () =>{
        setLoading(true);
        setHint("");

        try{
            // get the code value from PythonEditor component
                const currentCodeValue = getCodeValue();

            const response = await fetch("/api/getHint",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    problemDescription,
                    codeValue: currentCodeValue,
                    solution,
                }),
            });

            const data = await response.json();

            if (response.ok){
                setHint(data.hint);
            } else{
                setHint("Failed to fetch hint.");
            }
        } catch (error) {
            console.error("Error fetching hint:", error);
            setHint("Error fetching hint. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // KEY HANDLERS
    // 1. Display Window
    // 2. Display Chat Window
    useEffect(() => {
        const handleKeyDown = (e) => {
            
            if (e.metaKey && e.shiftKey && e.key === "'"){
                e.preventDefault();
                setIsVisible((prev) => !prev);
                setHint("");
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            else if (e.metaKey && e.key === "'"){
                e.preventDefault();
                setIsVisible(true);
                fetchHint();
            }
            else if (e.key === 'Escape'){
                e.preventDefault();
                setIsVisible(false);
            }

        };

        window.addEventListener("keydown",handleKeyDown);
        return () => window.removeEventListener("keydown",handleKeyDown);
    }, []);

    // Handle sending the message
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try{
            const response = await fetch("/api/chatgpt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: inputValue }),
            });

            const data = await response.json();
            console.log("Response from /api/chatgpt:", data);
            setInputValue("");
        } catch (error) {
            console.error("Error sending query:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Submit with Enter Key
    const handleKeyDown = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div
          className={`fixed  ${
            isVisible ? "block" : "hidden"
          }`}
          style={{
            top: "3%",            // Vertically center the window
            left: "40%",           // Position it 25% horizontally
            transform: "translateY(-45%)", // Adjust to center precisely
            zIndex: 9999,          // Ensure it's on top
            width: "700px",        // Set a fixed width for the chat window
            fontSize: '12px'
          }}
        >
          <div className="flex flex-col shadow-lg rounded-lg">
            {/* Toggle Display Hint - Query Area */}
            {hint ? (
                <div className="bg-gray-800 text-gray-300 p-2 mt-2 rounded">
                <strong>Hint:</strong> {loading ? "Loading..." : hint}
                </div>
            ) : (
                <textarea
                ref={inputRef}
                rows="3"
                className="bg-gray-900 border border-black text-white p-2 rounded resize-none focus:outline-none"
                placeholder="Type your query..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                />
            )}

          </div>
        </div>
      );
    };

export default ChatWindow;