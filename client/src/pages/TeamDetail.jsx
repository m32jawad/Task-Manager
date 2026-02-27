import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

function TeamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
      try {
        const tasksRes = await api.get(`/tasks?teamId=${id}`);
        setTasks(tasksRes.data);
      } catch {
        // tasks may fail
      }
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/teams/${id}/members`, { email });
      toast.success('Member added');
      setEmail('');
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      toast.success('Member removed');
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!team) return <div>Team not found</div>;

  const isManager = user.role === 'manager';

  return (
    <div className="team-detail">
      <div className="page-header">
        <h1>{team.name}</h1>
        <Link to="/teams" className="btn btn-outline">Back to Teams</Link>
      </div>

      <div className="section">
        <h2>Members ({team.members?.length || 0})</h2>

        {isManager && (
          <form className="inline-form" onSubmit={handleAddMember}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Member email"
              required
            />
            <button type="submit" className="btn btn-primary">Add Member</button>
          </form>
        )}

        <div className="member-list">
          {team.members?.map((member) => (
            <div key={member._id} className="member-item">
              <div>
                <strong>{member.name}</strong>
                <span className="member-email">{member.email}</span>
              </div>
              {isManager && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveMember(member._id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {(!team.members || team.members.length === 0) && <p>No members yet.</p>}
        </div>
      </div>

      <div className="section">
        <h2>Tasks ({tasks.length})</h2>
        <div className="task-list">
          {tasks.map((task) => (
            <Link to={`/tasks/${task._id}`} key={task._id} className={`task-card ${task.isBugged ? 'bugged' : ''}`}>
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <div className="badge-group">
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                  <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                  {task.isBugged && <span className="badge badge-danger">Bug</span>}
                </div>
              </div>
            </Link>
          ))}
          {tasks.length === 0 && <p>No tasks for this team.</p>}
        </div>
      </div>
    </div>
  );
}

export default TeamDetail;
