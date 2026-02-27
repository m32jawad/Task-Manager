import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', { name: teamName });
      toast.success('Team created');
      setTeamName('');
      setShowForm(false);
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="teams-page">
      <div className="page-header">
        <h1>Teams</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Team'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            required
          />
          <button type="submit" className="btn btn-success">Create</button>
        </form>
      )}

      <div className="card-grid">
        {teams.map((team) => (
          <Link to={`/teams/${team._id}`} key={team._id} className="team-card">
            <h3>{team.name}</h3>
            <p>{team.members?.length || 0} members</p>
          </Link>
        ))}
        {teams.length === 0 && <p>No teams yet. Create one to get started.</p>}
      </div>
    </div>
  );
}

export default Teams;
