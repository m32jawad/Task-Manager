import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';
import { toast } from 'react-toastify';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block', 'list', 'link', 'image',
];

function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [team, setTeam] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [images, setImages] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchTask();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (team) {
      fetchMembers(team);
    } else {
      setMembers([]);
    }
  }, [team]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch {
      // ignore
    }
  };

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      const task = res.data;
      setTitle(task.title || '');
      setContent(task.content || '');
      setTeam(task.team?._id || task.team || '');
      setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'todo');
      setImages(task.images || []);
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (teamId) => {
    try {
      const res = await api.get(`/teams/${teamId}`);
      setMembers(res.data.members || []);
    } catch {
      setMembers([]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url || res.data.imageUrl;
      setImages((prev) => [...prev, url]);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    }
  };

  const insertImage = (url) => {
    setContent((prev) => prev + `<img src="${url}" alt="task image" />`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { title, content, team, assignedTo, priority, status, images };
    try {
      if (isEdit) {
        await api.put(`/tasks/${id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created');
      }
      navigate('/tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="task-form-page">
      <h1>{isEdit ? 'Edit Task' : 'Create Task'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Task title"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="team">Team</label>
            <select id="team" value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">Select team</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assign To</label>
            <select id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>

            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Content</label>
          <div className="editor-container">
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Describe the task..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Images</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {images.length > 0 && (
            <div className="image-gallery">
              {images.map((img, idx) => (
                <div key={idx} className="image-thumb">
                  <img src={img} alt={`upload ${idx}`} />
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => insertImage(img)}>
                    Insert
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/tasks')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
