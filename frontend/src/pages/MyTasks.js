import React, { useEffect, useState } from 'react';
import { getMyTasks, updateTask } from '../api/api';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = () => getMyTasks().then(r => setTasks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleStatus = async (taskId, status) => { await updateTask(taskId, { status }); load(); };

  const isOverdue = (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const filtered = filter === 'all' ? tasks : filter === 'overdue' ? tasks.filter(isOverdue) : tasks.filter(t => t.status === filter);

  return (
    <div>
      <div className="page-header">
        <div><h1>📋 My Tasks</h1><p>All tasks assigned to you</p></div>
      </div>

      <div className="tabs">
        {['all','todo','in_progress','completed','overdue'].map(f => (
          <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${tasks.length})` : f === 'overdue' ? `⚠️ Overdue (${tasks.filter(isOverdue).length})` : f.replace('_',' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:48}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <h3>No tasks here!</h3>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtered.map(task => (
            <div key={task.id} className="card" style={{padding:'16px 20px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <h3 style={{fontSize:15,fontWeight:600,marginBottom:4}}>{task.title}</h3>
                  {task.description && <p style={{fontSize:13,color:'#888',marginBottom:6}}>{task.description}</p>}
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_',' ')}</span>
                    {task.due_date && (
                      <span className={`task-due ${isOverdue(task)?'overdue':''}`} style={{fontSize:12}}>
                        {isOverdue(task)?'⚠️ Overdue: ':'📅 '}{new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  {task.status !== 'todo' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatus(task.id,'todo')}>To Do</button>}
                  {task.status !== 'in_progress' && <button className="btn btn-sm" style={{background:'#e8eaf6',color:'#3949ab'}} onClick={() => handleStatus(task.id,'in_progress')}>In Progress</button>}
                  {task.status !== 'completed' && <button className="btn btn-sm" style={{background:'#e6f4ea',color:'#2e7d32'}} onClick={() => handleStatus(task.id,'completed')}>Done ✓</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
