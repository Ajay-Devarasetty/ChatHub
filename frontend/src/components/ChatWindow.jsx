import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ChatWindow({ conversation, onMessageSent }) {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000";

  // Find the other participant
  const otherParticipant = conversation?.participants?.find(
    (p) => p._id !== user?._id
  );

  useEffect(() => {
    if (conversation?._id) {
      fetchMessages();
    }
  }, [conversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/chat/conversations/${conversation._id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/conversations/${conversation._id}/messages`,
        { text: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages([...messages, response.data.data]);
      setNewMessage("");
      if (typeof onMessageSent === "function") onMessageSent(response.data.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-window empty">
        <p>No conversation selected</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="header-info">
          <div className="header-avatar">
            {otherParticipant?.avatar ? (
              <img src={otherParticipant.avatar} alt="avatar" className="header-avatar-img" />
            ) : (
              otherParticipant?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2>{otherParticipant?.name || "Chat"}</h2>
            <p>Available</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${
                msg.senderId._id === user?._id ? "sent" : "received"
              }`}
            >
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-btn">
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
