import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import UserProfile from "../components/UserProfile";
import axios from "axios";
import "../styles/Chat.css";

export default function ChatPage() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [conversationsRefreshKey, setConversationsRefreshKey] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${API_BASE_URL}/api/chat/users/online`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = (res.data.data || []).filter((u) => u._id !== user?._id);
      setUsersList(users);
    } catch (err) {
      console.error("Error fetching users for new chat:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const startConversationWith = async (u) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chat/conversations`,
        { userId: u._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const conversation = res.data.data;
      setSelectedConversation(conversation);
      setShowNewChat(false);
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-app-header">
        <div className="header-left">
          <h1 className="app-title">ChatHub</h1>
        </div>
        <div className="header-right">
          <button className="profile-btn" onClick={() => setShowProfile(!showProfile)} title="Profile">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            )}
          </button>
        </div>
      </div>

      {showProfile && <UserProfile user={user} onClose={() => setShowProfile(false)} onLogout={handleLogout} />}

      <div className="chat-layout">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-actions" style={{ padding: 12 }}>
            <button className="tab-btn active" style={{ marginRight: 8 }}>Chats</button>
            <button className="image-upload-label" onClick={openNewChat}>New Chat</button>
          </div>

          <ChatList
            onSelectConversation={handleSelectConversation}
            refreshKey={conversationsRefreshKey}
            selectedConversation={selectedConversation}
          />
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} onMessageSent={() => setConversationsRefreshKey(k => k + 1)} />
          ) : (
            <div className="no-chat-selected">
              <div className="welcome-message">
                <h2>Welcome to ChatHub!</h2>
                <p>Select a conversation to start chatting or click "New Chat" to start one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start new chat</h3>
              <button className="close-btn" onClick={() => setShowNewChat(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div className="users-list">
                {loadingUsers ? (
                  <div className="loading">Loading users...</div>
                ) : usersList.length === 0 ? (
                  <div className="no-users">No users found</div>
                ) : (
                  usersList
                    .filter((u) => u.name.toLowerCase().includes(searchText.toLowerCase()))
                    .map((u) => (
                      <div key={u._id} className="user-item" onClick={() => startConversationWith(u)}>
                        <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                          <div className="user-name">{u.name}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
