import React from "react";
import {
  FaEnvelope,
  FaUserTie,
  FaBuilding,
  FaUserFriends,
} from "react-icons/fa";

interface UserCardProps {
  username?: string;
  email?: string;
  role?: string;
  department?: string;
  managerName?: string;
  className?: string;
}

/**
 * @description
 * UserCard component for displaying user information in a card format.
 * This component shows user details including name, email, role, department,
 * and manager information with appropriate icons.
 *
 * @param {UserCardProps} props - The props for the UserCard component
 * @returns {JSX.Element}
 */
const UserCard: React.FC<UserCardProps> = ({
  username,
  email,
  role,
  department,
  managerName,
  className = "",
}) => {
  return (
    <div className={`user-card ${className}`}>
      <div className="user-header">
        <div className="avatar-placeholder">{username?.charAt(0) || "U"}</div>
        <h2>{username || "User"}</h2>
      </div>

      <div className="user-info-list">
        <div className="info-item">
          <FaEnvelope className="info-icon" />
          <div>
            <span className="info-label">Email</span>
            <span className="info-value">{email || "N/A"}</span>
          </div>
        </div>

        <div className="info-item">
          <FaUserTie className="info-icon" />
          <div>
            <span className="info-label">Role</span>
            <span className="info-value">{role || "N/A"}</span>
          </div>
        </div>

        <div className="info-item">
          <FaUserFriends className="info-icon" />
          <div>
            <span className="info-label">Reports to</span>
            <span className="info-value">{managerName || "N/A"}</span>
          </div>
        </div>

        <div className="info-item">
          <FaBuilding className="info-icon" />
          <div>
            <span className="info-label">Department</span>
            <span className="info-value">{department || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
