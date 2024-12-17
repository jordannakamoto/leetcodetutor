// components/ChatWindow.jsx
import React, { useEffect, useRef, useState } from 'react';

const ChatWindow = () => {
    const [ isVisible, setIsVisible ] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            
            if (e.metaKey && e.shiftKey && e.key === "'"){
                e.preventDefault();
                setIsVisible((prev) => !prev);
                setTimeout(() => inputRef.current?.focus(), 100);
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
            top: "30%",            // Vertically center the window
            left: "55%",           // Position it 25% horizontally
            transform: "translateY(-50%)", // Adjust to center precisely
            zIndex: 9999,          // Ensure it's on top
            width: "300px",        // Set a fixed width for the chat window
          }}
        >
          <div className="flex flex-col shadow-lg rounded-lg">
            <textarea
              ref={inputRef}
              rows="3"
              className="bg-gray-900 border border-black text-white p-2 rounded resize-none focus:outline-none"
              placeholder="Type your query..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
    
            {/* Send Button
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
              onClick={handleSendMessage}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </button> */}
          </div>
        </div>
      );
    };

export default ChatWindow;