import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5000";
const SESSION_ID = "session_" + Date.now();

interface Message {
    text: string;
    sender: "user" | "bot";
}

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isWaiting]);

    const sendMessage = async () => {
        const text = inputRef.current?.value.trim();
        if (!text || isWaiting) return;

        // Hide welcome on first message
        if (showWelcome) setShowWelcome(false);

        const userMsg: Message = { text, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        if (inputRef.current) inputRef.current.value = "";
        setIsWaiting(true);

        try {
            const response = await fetch(
                `${API}/__ai_stream__?prompt=${encodeURIComponent(text)}&session=${SESSION_ID}`,
            );
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response reader");

            const decoder = new TextDecoder();
            let fullText = "";

            // Add empty bot message that we'll update
            const botMsgIndex = messages.length + 1;
            setMessages((prev) => [...prev, { text: "", sender: "bot" }]);
            setIsWaiting(false);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                chunk.split("\n").forEach((line) => {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.text) {
                                fullText += data.text;
                                setMessages((prev) =>
                                    prev.map((m, i) =>
                                        i === botMsgIndex ? { ...m, text: fullText } : m
                                    )
                                );
                            }
                            if (data.done && data.full) {
                                setMessages((prev) =>
                                    prev.map((m, i) =>
                                        i === botMsgIndex ? { ...m, text: data.full } : m
                                    )
                                );
                            }
                        } catch {}
                    }
                });
            }
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { text: "Omlouvám se, něco se pokazilo.", sender: "bot" },
            ]);
            setIsWaiting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-green-400 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-400 rounded-full flex items-center justify-center text-3xl shadow-md">
                        👩‍🎓
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                            Klára
                        </h1>
                        <p className="text-white/80 text-sm">Školní poradkyně</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="p-6"
                >
                    {/* Chat Box */}
                    <div className="h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-2xl mb-4 flex flex-col gap-3">
                        <AnimatePresence>
                            {showWelcome && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center py-8"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ahoj!</h2>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        Jsem Klára, tvoje školní poradkyně. Pomohu ti vybrat tu správnou střední školu v Plzeňském kraji.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`max-w-[85%] px-4 py-3 break-words ${
                                    msg.sender === "user"
                                        ? "self-end bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-md rounded-[18px] rounded-br-md"
                                        : "self-start bg-white text-gray-800 shadow-sm rounded-[18px] rounded-bl-md"
                                }`}
                            >
                                {msg.text}
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {isWaiting && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="self-start bg-white px-5 py-4 rounded-[18px] rounded-bl-md shadow-sm flex items-center gap-1"
                                >
                                    <div className="flex gap-1">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
                                            className="w-2 h-2 bg-green-400 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                                            className="w-2 h-2 bg-green-400 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                                            className="w-2 h-2 bg-green-400 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Napiš zprávu..."
                            className="flex-1 px-5 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white transition-all"
                            onKeyPress={handleKeyPress}
                            disabled={isWaiting}
                        />
                        <button
                            className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            onClick={sendMessage}
                            disabled={isWaiting}
                        >
                            <span className="text-xl">➤</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}