import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Tasks</h1>
        {user.role === 'manager' && (
          <Link to="/tasks/new" className="btn btn-primary">Create Task</Link>
        )}
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="task-list">
        {filtered.map((task) => (
          <Link to={`/tasks/${task._id}`} key={task._id} className={`task-card ${task.isBugged ? 'bugged' : ''}`}>
            <div className="task-card-header">
              <h3>{task.title}</h3>
              <div className="badge-group">
                <span className={`badge badge-${task.status}`}>{task.status}</span>
                <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                {task.isBugged && <span className="badge badge-danger">Bug</span>}
              </div>
            </div>
            <div className="task-card-meta">
              {task.assignedTo && <span>Assigned to: {task.assignedTo.name || task.assignedTo}</span>}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p>No tasks found.</p>}
      </div>
    </div>
  );
}

export default Tasks;
