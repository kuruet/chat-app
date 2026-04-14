import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const initialized = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const token = localStorage.getItem("token");

  let userId = null;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.userId;
    }
  } catch (err) {
    console.error("Invalid token");
  }

  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-white rounded-2xl shadow-md px-8 py-6 text-gray-500 text-sm">
          Session expired. Please login again.
        </div>
      </div>
    );
  }

  const receiverId =
    userId === "69de0742a093e76063560e56"
      ? "69de1443dbb7c11dcb1f58f9"
      : "69de0742a093e76063560e56";

  const users = {
    "69de0742a093e76063560e56": "Suraj",
    "69de1443dbb7c11dcb1f58f9": "Kuruet",
  };

  const receiverName = users[receiverId] || "Unknown";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    socket.connect();
    socket.emit("register", userId);

    fetch(
      `https://chat-app-production-e81b.up.railway.app/api/messages/${receiverId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch((err) => console.error(err));

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message_sent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_sent");
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit("send_message", {
      senderId: userId,
      receiverId,
      content: message,
    });
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 overflow-hidden">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-16 w-80 h-80 bg-purple-200 opacity-20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-4 py-3 backdrop-blur-md bg-white/70 border-b border-white/60 shadow-sm">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm select-none shadow-sm">
            {receiverName.charAt(0).toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-800">{receiverName}</span>
          <span className="text-xs text-emerald-500 font-medium">Online</span>
        </div>
      </header>

      {/* Messages */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-400 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
              No messages yet. Say hi! 👋
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.senderId === userId;
          const showAvatar =
            !isMine && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);

          return (
            <div
              key={i}
              className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} animate-fadeSlideUp`}
            >
              {/* Receiver avatar placeholder for alignment */}
              {!isMine && (
                <div className="w-6 flex-shrink-0 flex items-end mb-1">
                  {showAvatar ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-semibold select-none">
                      {(users[msg.senderId] || "?").charAt(0).toUpperCase()}
                    </div>
                  ) : null}
                </div>
              )}

              <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-xs sm:max-w-md`}>
                <div
                  className={`
                    px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                    transition-all duration-150
                    ${isMine
                      ? "bg-gray-900 text-white rounded-br-sm shadow-md hover:bg-gray-800"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm hover:bg-gray-50 border border-gray-100"
                    }
                  `}
                >
                  {msg.content}
                </div>
                {msg.createdAt && (
                  <span className="text-[10px] text-gray-400 mt-1 px-1 select-none">
                    {formatTime(msg.createdAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </main>

      {/* Input bar */}
      <footer className="relative z-10 px-4 py-3 backdrop-blur-md bg-white/70 border-t border-white/60 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
              ${message.trim()
                ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-95 shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 translate-x-[1px]"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </footer>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.22s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default Chat;