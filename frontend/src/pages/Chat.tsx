import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";

const API = "http://localhost:5000";
const SESSION_ID = "session_" + Date.now();

export const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            text: "Ahoj! Jak ti mohu dnes pomoci?",
            sender: "bot",
        },
    ]);
    const [isWaiting, setIsWaiting] = useState(false);
    const inputRef = useRef();

    useEffect(() => {
        if (!localStorage.getItem("isAuthenticated")) {
            navigate("/auth");
        }
    }, [navigate]);

    const sendMessage = async () => {
        const text = inputRef.current.value.trim();
        if (!text || isWaiting) return;

        const userMsg = { text, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        inputRef.current.value = "";
        setIsWaiting(true);

        try {
            const response = await fetch(
                `${API}/__ai_stream__?prompt=${encodeURIComponent(
                    text
                )}&session=${SESSION_ID}`
            );
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            const botMsg = { text: "", sender: "bot" };
            setMessages((prev) => [...prev, botMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.text) {
                                fullText += data.text;
                                setMessages((prev) =>
                                    prev.map((m, i) =>
                                        i === prev.length - 1 ? { ...m, text: fullText } : m
                                    )
                                );
                            }
                            if (data.done && data.full) {
                                setMessages((prev) =>
                                    prev.map((m, i) =>
                                        i === prev.length - 1 ? { ...m, text: data.full } : m
                                    )
                                );
                            }
                        } catch {}
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { text: "Omlouvám se, něco se pokazilo.", sender: "bot" },
            ]);
        }

        setIsWaiting(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
            <GlassCard className="w-full max-w-3xl p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-black mb-4">AI Chat</h1>
                    <p className="text-gray-600 mb-6">
                        Popovídej si s AI a získej doporučení na míru.
                    </p>

                    {/* Chat Box */}
                    <div className="h-96 overflow-y-auto p-4 border-2 border-gray-200/50 rounded-xl bg-white/60 backdrop-blur-sm mb-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-xl max-w-[85%] mb-2 ${
                                    msg.sender === "user"
                                        ? "bg-gradient-to-r from-[#5a67d8] to-[#6b46c1] text-white self-end"
                                        : "bg-white text-gray-800 self-start shadow-sm"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Napiš zprávu..."
                            className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#86BC25]"
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="px-6 py-3 bg-gradient-to-r from-black to-gray-900 text-white rounded-xl font-bold hover:from-[#86BC25] hover:to-[#6a9c1d] transition-all"
                            onClick={sendMessage}
                            disabled={isWaiting}
                        >
                            Odeslat
                        </button>
                    </div>
                </motion.div>
            </GlassCard>
        </div>
    );
};
