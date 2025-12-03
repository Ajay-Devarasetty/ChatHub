import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function OnlineUsers({ onSelectUser }) {
  const { token, user } = useContext(AuthContext);
  const [allUsers, setAllUsers] = useState([]);
  const [existingChatUsers, setExistingChatUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    fetchUsersAndConversations();
  }, []);

  const fetchUsersAndConversations = async () => {
    try {
      setLoading(true);
      // Fetch all users
      const usersResponse = await axios.get(`${API_BASE_URL}/api/chat/users/online`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = usersResponse.data.data || [];
      setAllUsers(users);

      // Fetch existing conversations
      const conversationsResponse = await axios.get(
        `${API_BASE_URL}/api/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const conversations = conversationsResponse.data.data || [];

      // Get IDs of users we have conversations with
      const chatUserIds = new Set();
      conversations.forEach((conv) => {
        conv.participants.forEach((p) => {
          if (p._id !== user?._id) {
            chatUserIds.add(p._id);
          }
        });
      });

      // Separate users into existing chat users and other users
      const existing = users.filter((u) => chatUserIds.has(u._id));
      const others = users.filter((u) => !chatUserIds.has(u._id));

      setExistingChatUsers(existing);
      setOtherUsers(others);
    } catch (error) {
      console.error("Error fetching users and conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    try {
      // Get or create conversation with this user
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/conversations`,
        { userId: selectedUser._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Pass the conversation to parent component
      onSelectUser(response.data.data);

      // Refresh the user lists
      fetchUsersAndConversations();
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
    }
  };

  const filterUsers = (users) => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const filteredExistingChatUsers = filterUsers(existingChatUsers);
  const filteredOtherUsers = filterUsers(otherUsers);

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="online-users-wrapper">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search users..."
          className="search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="online-users">
        {/* Existing Chat Users */}
        {filteredExistingChatUsers.length > 0 && (
          <>
            <div className="users-section-header">Existing Chats</div>
            {filteredExistingChatUsers.map((userItem) => (
              <div
                key={userItem._id}
                className="user-item"
                onClick={() => handleSelectUser(userItem)}
              >
                <div className="user-avatar">
                  {userItem.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{userItem.name}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Other Users */}
        {filteredOtherUsers.length > 0 && (
          <>
            <div className="users-section-header">Other Users</div>
            {filteredOtherUsers.map((userItem) => (
              <div
                key={userItem._id}
                className="user-item"
                onClick={() => handleSelectUser(userItem)}
              >
                <div className="user-avatar">
                  {userItem.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{userItem.name}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {filteredExistingChatUsers.length === 0 &&
          filteredOtherUsers.length === 0 && (
            <div className="no-users">
              {searchText ? "No users found" : "No users available"}
            </div>
          )}
      </div>
    </div>
  );
}
