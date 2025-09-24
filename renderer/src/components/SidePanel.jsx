import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faClipboardList,
  faShoppingCart,
  faCreditCard,
  faPeopleGroup,
  faListAlt,
  faExchangeAlt,
  faUser,
  faIdBadge,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./SidePanel.css";
import { useEffect, useState } from "react";

const SidePanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // ✅ Watch for login/logout changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="sidebar bg-dark text-white d-flex flex-column justify-content-between">
      {/* Top brand + nav */}
      <div>
        <h4 className="sidebar-brand mt-4">My-Accountant</h4>
        <div className="row mt-5">
          <ul className="col-12 navbar-nav navbar-dark text-light h5 gap-2">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/transactions" className="nav-link">
                <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                Transactions
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/ledger" className="nav-link">
                <FontAwesomeIcon icon={faListAlt} className="me-2" />
                ledger
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/summary" className="nav-link">
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Daily Summary
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/partners" className="nav-link">
                <FontAwesomeIcon icon={faPeopleGroup} className="me-2" />
                Partners
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/accounts" className="nav-link">
                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                Accounts
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom section: Profile + Auth button */}
      <div className="mt-auto mb-3">
        {user && (
          <div className="nav-item mb-2">
            <NavLink to="/profile" className="nav-link">
              <FontAwesomeIcon icon={faIdBadge} className="me-2" />
              {user.username || "Profile"}
            </NavLink>
          </div>
        )}

        <div className="nav-item">
          {user ? (
            <button
              className="btn btn-outline-light w-100 text-start"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Sign Out
            </button>
          ) : (
            <button
              className="btn btn-outline-light w-100 text-start"
              onClick={() => navigate("/login")}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
