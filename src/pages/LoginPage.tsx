import React, { useEffect, useState } from "react";
import "./css/LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User } from "../types";
const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.email) {
      navigate(`/dashboard/${auth.role}/leave-balance`);
    }
  }, [auth.email, auth.role, navigate]);

  const handleShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: users } = await axios.get<User[]>(
        "http://localhost:3001/users"
      );
      const user = users.find((u) => u.email === userEmail);

      if (!user) return setError("User doesn't exist. Please register first.");
      if (user.password !== userPassword) {
        return setError("Invalid credentials. Please check your password.");
      }
      dispatch(
        setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
          gender: user.gender,
          managerId: user.managerId,
          department: user.department,
          leaveBalance: user.leaveBalance,
          unpaidLeaves: user.unpaidLeaves as number,
        })
      );
      // navigate(`/dashboard/${user.role}/leave-balance`);
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="loginContainer">
      <div className="leftSide">
        <span className="text-color">PAL</span>TECH
      </div>
      <div className="rightSide">
        <div className="formWrapper">
          <h1>Login to Leave Management System</h1>
          <form onSubmit={handleSubmit} className="form-container">
            {error && <div className="errorMsg">{error}</div>}

            <div className="inputContainer">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="inputField"
                required
              />
            </div>

            <div className="inputContainer">
              <label htmlFor="password">Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="inputField"
                required
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={handleShowPassword}
                  className="passwordIcon"
                />
              ) : (
                <FaEye onClick={handleShowPassword} className="passwordIcon" />
              )}
            </div>

            <button type="submit" className="submitBtn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
