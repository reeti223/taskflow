import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>✅ TaskFlow</h2>
        <p>Team Task Manager</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          📁 Projects
        </NavLink>
        <NavLink to="/my-tasks" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          📋 My Tasks
        </NavLink>
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="user-info">
          <p>{user?.name}</p>
          <span>{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">⏏</button>
      </div>
    </div>
  );
}
