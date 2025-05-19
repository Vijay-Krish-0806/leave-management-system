import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import "./css/Navbar.css";

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
        Paltech
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
