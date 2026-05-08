import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getTasks, createTask, updateTask, deleteTask, getMembers, addMember, removeMember, updateProject } from '../api/api';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'in_progress', label: 'In Progress', emoji: '🔄' },
  { key: 'completed', label: 'Completed', emoji: '✅' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');

  const isOwner = project?.owner_id === user?.id || user?.role === 'admin';

  const load = async () => {
    try {
      const [pRes, tRes, mRes] = await Promise.all([getProject(id), getTasks(id), getMembers(id)]);
      setProject(pRes.data); setTasks(tRes.data); setMembers(mRes.data);
    } catch { navigate('/projects'); }
  };

  useEffect(() => { load(); }, [id]);

  const openCreateTask = () => { setEditTask(null); setTaskForm({ title:'',description:'',priority:'medium',assignee_id:'',due_date:'' }); setShowTaskModal(true); };
  const openEditTask = (task) => { setEditTask(task); setTaskForm({ title:task.title, description:task.description||'', priority:task.priority, assignee_id:task.assignee_id||'', due_date: task.due_date ? task.due_date.slice(0,16) : '' }); setShowTaskModal(true); };

  const handleTaskSubmit = async (e) => {
    e.preventDefault(); setError('');
    const payload = { ...taskForm, assignee_id: taskForm.assignee_id ? parseInt(taskForm.assignee_id) : null, due_date: taskForm.due_date || null };
    try {
      if (editTask) await updateTask(editTask.id, payload);
      else await createTask(id, payload);
      setShowTaskModal(false); load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    await updateTask(taskId, { status }); load();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete task?')) return;
    await deleteTask(taskId); load();
  };

  const handleAddMember = async (e) => {
    e.preventDefault(); setError('');
    try { await addMember(id, { email: memberEmail }); setMemberEmail(''); setShowMemberModal(false); load(); }
    catch (err) { setError(err.response?.data?.detail || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove member?')) return;
    await removeMember(id, userId); load();
  };

  const handleStatusUpdate = async (status) => {
    await updateProject(id, { status }); load();
  };

  const isOverdue = (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  if (!project) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>← Back</button>
            <h1>{project.name}</h1>
            <span className={`badge badge-${project.status}`}>{project.status}</span>
          </div>
          <p style={{marginTop:4}}>{project.description || 'No description'} · by {project.owner.name}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {isOwner && (
            <>
              <select className="btn btn-secondary btn-sm" value={project.status} onChange={e => handleStatusUpdate(e.target.value)} style={{cursor:'pointer'}}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>+ Add Member</button>
            </>
          )}
          <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={openCreateTask}>+ Add Task</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='tasks'?'active':''}`} onClick={() => setTab('tasks')}>📋 Tasks ({tasks.length})</button>
        <button className={`tab ${tab==='members'?'active':''}`} onClick={() => setTab('members')}>👥 Members ({members.length})</button>
      </div>

      {tab === 'tasks' && (
        <div className="task-columns">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="task-column">
                <div className="task-column-header">
                  <h3>{col.emoji} {col.label}</h3>
                  <span className="task-count">{colTasks.length}</span>
                </div>
                {colTasks.map(task => (
                  <div key={task.id} className={`task-card ${task.priority}`}>
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-meta">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.assignee && <span className="task-assignee">👤 {task.assignee.name}</span>}
                    </div>
                    {task.due_date && (
                      <p className={`task-due ${isOverdue(task)?'overdue':''}`} style={{marginTop:4}}>
                        {isOverdue(task)?'⚠️ Overdue: ':'📅 '}{new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="task-actions">
                      {col.key !== 'todo' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(task.id, col.key==='in_progress'?'todo':'in_progress')}>← Back</button>}
                      {col.key !== 'completed' && <button className="btn btn-sm" style={{background:'#e6f4ea',color:'#2e7d32'}} onClick={() => handleStatusChange(task.id, col.key==='todo'?'in_progress':'completed')}>→ Next</button>}
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditTask(task)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <p style={{color:'#aaa',fontSize:13,textAlign:'center',padding:'20px 0'}}>No tasks</p>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'members' && (
        <div className="card">
          <div className="card-header">
            <h2>👥 Team Members</h2>
            {isOwner && <button className="btn btn-primary btn-sm" style={{width:'auto'}} onClick={() => setShowMemberModal(true)}>+ Add Member</button>}
          </div>
          <div className="members-list">
            {members.map(m => (
              <div key={m.id} className="member-row">
                <div className="member-info">
                  <div className="member-avatar">{m.name[0].toUpperCase()}</div>
                  <div>
                    <div className="member-name">{m.name}</div>
                    <div className="member-email">{m.email}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className="badge badge-active">{m.role}</span>
                  {isOwner && m.role !== 'owner' && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleRemoveMember(m.id)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={2} placeholder="Optional description" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={taskForm.assignee_id} onChange={e => setTaskForm({...taskForm, assignee_id: e.target.value})}>
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="datetime-local" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
              </div>
              {editTask && (
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status || editTask.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{width:'auto'}}>{editTask ? 'Update' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Member</h2>
              <button className="close-btn" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Member Email</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="member@example.com" required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{width:'auto'}}>Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
