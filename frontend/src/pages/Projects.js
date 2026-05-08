import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => getProjects().then(r => setProjects(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      await createProject(form);
      setShowModal(false); setForm({ name: '', description: '' }); load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create project'); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    await deleteProject(id); load();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>📁 Projects</h1><p>{projects.length} projects</p></div>
        <button className="btn btn-primary" style={{width:'auto'}} onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding: 48}}>
          <div style={{fontSize:48,marginBottom:12}}>📁</div>
          <h3 style={{marginBottom:8}}>No projects yet</h3>
          <p style={{color:'#888',marginBottom:20}}>Create your first project to get started</p>
          <button className="btn btn-primary" style={{width:'auto'}} onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <h3>{p.name}</h3>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </div>
              <p>{p.description || 'No description'}</p>
              <div className="project-meta">
                <span style={{fontSize:12,color:'#888'}}>by {p.owner.name}</span>
                {(p.owner_id === user?.id || user?.role === 'admin') && (
                  <button className="btn btn-sm btn-danger" onClick={(e) => handleDelete(e, p.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Website Redesign" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="What is this project about?" rows={3} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{width:'auto'}}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
