import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/apiCalls";
import "./css/LoginPage.css";
import { FaCircleArrowRight } from "react-icons/fa6";

/**
 * LoginPage component for user authentication in the Leave Management System.
 * This component allows users to log in by entering their email and password.
 * It handles user authentication, displays error messages, and navigates to the dashboard upon successful login.
 *
 *
 * @returns {JSX.Element} The rendered LoginPage component.
 *
 * @example
 * // Usage
 * <LoginPage />
 */

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Login Page";
  }, []);

  useEffect(() => {
    if (auth.email) {
      navigate(`/dashboard/${auth.role}/leave-balance`);
    }
  }, [auth.email, auth.role, navigate]);

  const handleShowPassword = () => setShowPassword((prev) => !prev);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getAll,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = users?.find((u) => u.email === userEmail);

      if (!user) return setError("User doesn't exist. Please register first.");
      if (user.password !== userPassword) {
        return setError("Invalid credentials. Please check your password.");
      }
      dispatch(
        setUser({
          id: user.id as string,
          username: user.username,
          email: user.email,
          role: user.role,
          managerId: user.managerId,
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
    <div className="login-container">
      <div className="left-side">
        <span className="text-color">PAL</span>TECH
      </div>
      <div className="right-side">
        <div className="form-wrapper">
          <h1>Login to Leave Management System</h1>
          <form
            onSubmit={handleSubmit}
            className="form-container"
            id="login-form"
          >
            {error && <div className="error-msg">{error}</div>}

            <div className="input-container">
              <label htmlFor="email" className="required">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>

            <div className="input-container">
              <label htmlFor="password" className="required">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="input-field"
                required
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={handleShowPassword}
                  className="password-icon"
                />
              ) : (
                <FaEye onClick={handleShowPassword} className="password-icon" />
              )}
            </div>

            <button type="submit" className="submit-btn">
              <FaCircleArrowRight />
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
