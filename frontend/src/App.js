import React, { useState } from "react";

function App() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const sendPrompt = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/__prompt__?prompt=${encodeURIComponent(prompt)}`);
            if (!res.ok) throw new Error("Server error");
            const data = await res.text(); // or .json() if your backend sends JSON
            setResponse(data);
        } catch (err) {
            setResponse("Error: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "sans-serif" }}>
            <h1>AI Assistant</h1>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: "10px" }}
                placeholder="Ask me anything..."
            />
            <button
                onClick={sendPrompt}
                style={{ marginTop: "10px", padding: "10px 20px" }}
            >
                {loading ? "Thinking..." : "Send"}
            </button>
            <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
                {response}
            </div>
        </div>
    );
}

export default App;
