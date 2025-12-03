import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function UserProfile({ user, onClose, onLogout }) {
  const { token, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Persist updates to backend
      const updates = { name: formData.name, avatar: profileImage };
      const res = await updateProfile(updates);
      if (!res.success) {
        throw new Error(res.error || 'Update failed');
      }

      // Update local UI with returned user
      setIsEditing(false);
      // Optionally close the dropdown or keep open
      // Update local profileImage and formData from response
      const updatedUser = res.user;
      setProfileImage(updatedUser.avatar || null);
      setFormData((prev) => ({ ...prev, name: updatedUser.name }));
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-header">
        <h3>Profile</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="profile-content">
        <div className="profile-image-section">
              <div className="profile-image-wrapper">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
          {isEditing && (
            <label className="image-upload-label">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          )}
        </div>

        {isEditing ? (
          <div className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                disabled
              />
            </div>
            <div className="profile-actions">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <label>Name</label>
              <p>{user?.name}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
