import { useEffect, useState } from 'react';
import { getTasks, createTask, deleteTask, updateTask, loginUser, registerUser } from './api';
import './index.css';

function App() {
  // Auth States
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wecare_user')) || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Task States
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const loadTasks = async () => {
    if (!user) return;
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      if (err.response?.status === 401) handleLogout(); // Clear if token is expired
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  // Handle Authentication Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      let data;
      if (isRegistering) {
        data = await registerUser({ username, email, password });
      } else {
        data = await loginUser({ email, password });
      }
      localStorage.setItem('wecare_user', JSON.stringify(data));
      setUser(data);
      // Clear forms
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.error || "Authentication failed. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wecare_user');
    setUser(null);
    setTasks([]);
  };

  // Handle Task CRUD
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
      loadTasks(); 
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  // --- RENDERING CONDITION: IF NOT LOGGED IN ---
  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '1rem' }}>
        <h1 style={{ textAlign: 'center' }}>WeCare</h1>
        <form onSubmit={handleAuthSubmit}>
          <h3>{isRegistering ? 'Create Account' : 'Welcome Back'}</h3>
          
          {authError && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{authError}</p>}

          {isRegistering && (
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          )}
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit">{isRegistering ? 'Sign Up' : 'Log In'}</button>
          
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span 
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} 
              style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering ? 'Log In here' : 'Register here'}
            </span>
          </p>
        </form>
      </div>
    );
  }

  // --- RENDERING CONDITION: IF LOGGED IN ---
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>WeCare Tasks</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#aaa' }}>Hello, <strong>{user.username}</strong></span>
          <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', background: '#333' }}>Log Out</button>
        </div>
      </div>
      
      <div className="dashboard-container">
        {/* Left Side: Create Form */}
        <div>
          <form onSubmit={handleSubmitTask}>
            <h3>Create New Task</h3>
            <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button type="submit">Add Task</button>
          </form>
        </div>

        {/* Right Side: Tasks List */}
        <div>
          <h3>Your Private Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <p style={{ color: '#666' }}>No tasks found. Create your first task above!</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="task-card" style={{ opacity: task.status === 'completed' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.5rem', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                    {task.title}
                  </strong>
                  
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    style={{ width: 'auto', padding: '0.25rem', margin: 0, fontSize: '0.85rem' }}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">⚡ In-Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>

                <p style={{ margin: '0 0 1.5rem 0', color: '#aaa', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                  {task.description || "No description provided."}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  <button onClick={() => handleDeleteTask(task._id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
