import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ teams: 0, tasks: 0, buggedTasks: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tasksRes = await api.get('/tasks');
      const taskList = tasksRes.data;
      setTasks(taskList);

      let teamCount = 0;
      if (user.role === 'manager') {
        try {
          const teamsRes = await api.get('/teams');
          teamCount = teamsRes.data.length;
        } catch {
          teamCount = 0;
        }
      }

      setStats({
        teams: teamCount,
        tasks: taskList.length,
        buggedTasks: taskList.filter((t) => t.isBugged).length,
      });
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <p className="role-badge">{user.role}</p>

      <div className="stats-grid">
        {user.role === 'manager' && (
          <div className="stat-card">
            <h3>{stats.teams}</h3>
            <p>Teams</p>
          </div>
        )}
        <div className="stat-card">
          <h3>{stats.tasks}</h3>
          <p>{user.role === 'manager' ? 'Total Tasks' : 'Assigned Tasks'}</p>
        </div>
        <div className="stat-card stat-card-danger">
          <h3>{stats.buggedTasks}</h3>
          <p>Bugged Tasks</p>
        </div>
      </div>

      <div className="quick-links">
        <h2>Quick Links</h2>
        <div className="link-grid">
          {user.role === 'manager' && (
            <Link to="/teams" className="quick-link-card">
              <h3>Teams</h3>
              <p>Manage your teams</p>
            </Link>
          )}
          <Link to="/tasks" className="quick-link-card">
            <h3>Tasks</h3>
            <p>View all tasks</p>
          </Link>
          {user.role === 'manager' && (
            <Link to="/tasks/new" className="quick-link-card">
              <h3>New Task</h3>
              <p>Create a new task</p>
            </Link>
          )}
        </div>
      </div>

      {stats.buggedTasks > 0 && (
        <div className="bugged-section">
          <h2>Bugged Tasks</h2>
          <div className="task-list">
            {tasks
              .filter((t) => t.isBugged)
              .map((task) => (
                <Link to={`/tasks/${task._id}`} key={task._id} className="task-card bugged">
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <span className="badge badge-danger">Bug</span>
                  </div>
                  {task.bugReason && <p className="bug-reason">{task.bugReason}</p>}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
