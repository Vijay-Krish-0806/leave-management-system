import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import "./css/Navbar.css";

/**
 * Navbar component for displaying the application navigation bar.
 *
 * This component shows the application logo, the username of the logged-in user,
 * and a logout button. Clicking the logo redirects to the home page, while the
 * logout button logs the user out and navigates to the home page.
 *
 *
 * @returns {JSX.Element} The rendered Navbar component.
 *
 * @example
 * return <Navbar />;
 */

const Navbar = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const username = auth.username;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  return (
    <div className="navbar-container">
      <div className="navbar-logo" onClick={handleLogoClick}>
        <img
          src="/paltech_logo.svg"
          alt="logo"
          width={"30px"}
          height={"30px"}
          style={{ marginRight: "5px" }}
        />
        <span>Paltech</span>
      </div>
      <div className="navbar-right">
        <div className="navbar-username">{username}</div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
