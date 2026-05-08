import React, { useEffect, useState } from 'react';
import { getDashboard, getMyTasks } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getDashboard().then(r => setStats(r.data)).catch(() => {});
    getMyTasks().then(r => setMyTasks(r.data)).catch(() => {});
  }, []);

  const isOverdue = (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Good day, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's what's happening with your projects</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-value">{stats.total_projects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total_tasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟡</div>
            <div className="stat-value">{stats.todo_tasks}</div>
            <div className="stat-label">To Do</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔵</div>
            <div className="stat-value">{stats.in_progress_tasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.completed_tasks}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-value" style={{color: stats.overdue_tasks > 0 ? '#e53e3e' : 'inherit'}}>
              {stats.overdue_tasks}
            </div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>📋 My Assigned Tasks</h2>
          <span style={{fontSize: 13, color: '#888'}}>{myTasks.length} tasks</span>
        </div>
        {myTasks.length === 0 ? (
          <p style={{color: '#888', fontSize: 14}}>No tasks assigned to you yet.</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {myTasks.map(task => (
              <div key={task.id} style={{
                padding: '14px 16px', background: '#f8f9fa', borderRadius: 8,
                borderLeft: `4px solid ${task.priority === 'high' ? '#e53e3e' : task.priority === 'medium' ? '#dd6b20' : '#38a169'}`
              }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <span style={{fontWeight: 500, fontSize: 14}}>{task.title}</span>
                  <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_',' ')}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </div>
                </div>
                {task.due_date && (
                  <p style={{fontSize: 12, marginTop: 4}} className={isOverdue(task) ? 'task-due overdue' : 'task-due'}>
                    {isOverdue(task) ? '⚠️ Overdue: ' : '📅 Due: '}
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
