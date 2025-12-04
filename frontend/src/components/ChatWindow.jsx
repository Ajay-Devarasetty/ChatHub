import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function ChatWindow({ conversation, onMessageSent, socket }) {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  // Socket handlers: join conversation room and listen for messages/typing
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    // join room
    socket.emit('joinConversation', conversation._id);

    const onNewMessage = ({ conversationId, message }) => {
      if (conversationId !== conversation._id) return;
      setMessages((prev) => [...prev, message]);
      if (typeof onMessageSent === 'function' && message.senderId._id === user?._id) {
        onMessageSent(message);
      }
    };

    const onTyping = ({ conversationId, userId }) => {
      if (conversationId !== conversation._id) return;
      if (userId === user?._id) return; // ignore our own typing echoes
      setOtherTyping(true);
    };

    const onStopTyping = ({ conversationId, userId }) => {
      if (conversationId !== conversation._id) return;
      if (userId === user?._id) return;
      setOtherTyping(false);
    };

    socket.on('newMessage', onNewMessage);
    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStopTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversation?._id]);

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

    // send via socket for real-time broadcast and persistence on server
    if (socket && conversation?._id) {
      socket.emit('sendMessage', { conversationId: conversation._id, text: newMessage });
      setNewMessage('');
      // clear our typing locally
      socket.emit('stopTyping', { conversationId: conversation._id });
    } else {
      // fallback to REST
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/chat/conversations/${conversation._id}/messages`,
          { text: newMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages((prev) => [...prev, response.data.data]);
        setNewMessage('');
        if (typeof onMessageSent === 'function') onMessageSent(response.data.data);
      } catch (error) {
        console.error('Error sending message (fallback):', error);
      }
    }
  };

  // handle typing local -> emit socket 'typing' and debounce 'stopTyping'
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !conversation?._id) return;
    socket.emit('typing', { conversationId: conversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { conversationId: conversation._id });
    }, 2000); // local stopTyping after 2s of inactivity
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
            {otherTyping && <div className="typing-indicator">{otherParticipant?.name} is typing...</div>}
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
          onChange={handleInputChange}
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
