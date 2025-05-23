import React from "react";
import "./css/404Page.css";
import { Link } from "react-router-dom";

/**
 * NotFoundPage component for displaying a 404 error page.
 *
 * This component informs the user that the requested page does not exist
 * and provides a link to navigate back to the home page.
 *
 *
 * @returns {JSX.Element} The rendered NotFoundPage component.
 *
 * @example
 * return <NotFoundPage />;
 */

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/" className="not-found-link">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
