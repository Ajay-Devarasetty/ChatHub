import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ChatList({ onSelectConversation, refreshKey, selectedConversation }) {
  const { token, user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    fetchConversations();
    // re-fetch when parent signals via refreshKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // If no conversation is selected by parent, auto-select the first one after fetch
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      // choose the first conversation as default
      onSelectConversation(conversations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const participantNames = conv.participants
      .map((p) => p.name)
      .join(" ")
      .toLowerCase();
    return participantNames.includes(searchText.toLowerCase());
  });

  return (
    <div className="chat-list-wrapper">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search conversations..."
          className="search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="chat-list">
        {loading ? (
          <div className="loading">Loading chats...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="no-chats">
            {conversations.length === 0
              ? "No conversations yet"
              : "No matches found"}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              (p) => p._id !== user?._id
            );

            const isActive = selectedConversation?._id === conversation._id;

            return (
              <div
                key={conversation._id}
                className={`chat-list-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="chat-avatar">
                  {otherParticipant?.avatar ? (
                    <img src={otherParticipant.avatar} alt="avatar" className="chat-avatar-img" />
                  ) : (
                    otherParticipant?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-name">
                    {otherParticipant?.name}
                  </div>
                  <div className="chat-list-preview">
                    {conversation.lastMessage || "No messages yet"}
                  </div>
                </div>
                {conversation.lastMessageTime && (
                  <div className="chat-list-time">
                    {new Date(
                      conversation.lastMessageTime
                    ).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
