import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugReason, setBugReason] = useState('');

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
      setStatus(res.data.status);
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/tasks/${id}`, { status });
      toast.success('Status updated');
      fetchTask();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleMarkBugged = async () => {
    try {
      await api.put(`/tasks/${id}/bug`, { isBugged: true, bugReason });
      toast.success('Marked as bugged');
      setShowBugModal(false);
      setBugReason('');
      fetchTask();
    } catch {
      toast.error('Failed to mark as bugged');
    }
  };

  const handleUnmarkBug = async () => {
    try {
      await api.put(`/tasks/${id}/bug`, { isBugged: false, bugReason: '' });
      toast.success('Bug cleared');
      fetchTask();
    } catch {
      toast.error('Failed to clear bug');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!task) return <div>Task not found</div>;

  const isManager = user.role === 'manager';

  return (
    <div className="task-detail">
      <div className="page-header">
        <h1>{task.title}</h1>
        <div className="header-actions">
          {isManager && (
            <>
              <Link to={`/tasks/${id}/edit`} className="btn btn-primary">Edit</Link>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          )}
          <Link to="/tasks" className="btn btn-outline">Back</Link>
        </div>
      </div>

      {task.isBugged && (
        <div className="bug-alert">
          <strong>⚠ Bug Reported</strong>
          {task.bugReason && <p>{task.bugReason}</p>}
        </div>
      )}

      <div className="task-meta">
        <div className="badge-group">
          <span className={`badge badge-${task.status}`}>{task.status}</span>
          <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
        </div>
        <div className="meta-info">
          {task.assignedTo && <p><strong>Assigned to:</strong> {task.assignedTo.name || task.assignedTo}</p>}
          {task.createdBy && <p><strong>Created by:</strong> {task.createdBy.name || task.createdBy}</p>}
          {task.team && <p><strong>Team:</strong> {task.team.name || task.team}</p>}
          <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
          <p><strong>Updated:</strong> {new Date(task.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="task-content">
        <h2>Description</h2>
        <div className="rich-content" dangerouslySetInnerHTML={{ __html: task.content }} />
      </div>

      {task.images && task.images.length > 0 && (
        <div className="task-images">
          <h2>Images</h2>
          <div className="image-gallery">
            {task.images.map((img, idx) => (
              <div key={idx} className="image-thumb">
                <img src={img} alt={`task ${idx}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="task-actions-section">
        {isManager && (
          <div className="action-group">
            {task.isBugged ? (
              <button className="btn btn-success" onClick={handleUnmarkBug}>Clear Bug</button>
            ) : (
              <button className="btn btn-danger" onClick={() => setShowBugModal(true)}>Mark as Bugged</button>
            )}
          </div>
        )}

        {!isManager && (
          <div className="action-group">
            <label htmlFor="statusUpdate">Update Status:</label>
            <select id="statusUpdate" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <button className="btn btn-primary" onClick={handleStatusUpdate}>Save</button>
          </div>
        )}
      </div>

      {showBugModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Report Bug</h2>
            <div className="form-group">
              <label htmlFor="bugReason">Reason</label>
              <textarea
                id="bugReason"
                value={bugReason}
                onChange={(e) => setBugReason(e.target.value)}
                placeholder="Describe the bug..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleMarkBugged}>Submit</button>
              <button className="btn btn-outline" onClick={() => setShowBugModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetail;
