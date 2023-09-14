import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faTrophy, faClipboardList, faVideo, faUserAlt, faSignOutAlt, faHome } from "@fortawesome/free-solid-svg-icons";

function Sidebar({ isOpen, handleTrigger, navigate, handleLogout }) {
  return (
    <div className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}>
      <div className="trigger" onClick={handleTrigger}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </div>

      <div className={"sidebar-position"}>
        <img
          className="user-avatar"
          src="https://via.placeholder.com/30x30"
          alt="User Avatar"
        />
        <span>ADMIN</span>
      </div>

      <div className="sidebar-position" onClick={() => navigate('/home')}>
        <FontAwesomeIcon icon={faHome} />
        <span>Home</span>
      </div>

      <div className="sidebar-position" onClick={() => navigate('/reward')}>
        <FontAwesomeIcon icon={faTrophy} />
        <span>REWARD</span>
      </div>

      <div className="sidebar-position" onClick={() => navigate('/task')}>
        <FontAwesomeIcon icon={faClipboardList} />
        <span>TASK</span>
      </div>

      <div className="sidebar-position" onClick={() => navigate('/cctv-preview')}>
        <FontAwesomeIcon icon={faVideo} />
        <span>CCTV PREVIEW</span>
      </div>

      <div className="sidebar-position" onClick={() => navigate('/user')}>
        <FontAwesomeIcon icon={faUserAlt} />
        <span>USERS VERIFICATION</span>
      </div>

      <div className="sidebar-logout-position" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} />
        <span>Logout</span>
      </div>
    </div>
  );
}

export default React.memo(Sidebar);
