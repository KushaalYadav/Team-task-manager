import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Clock, User, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetails() {
  const { id } = useParams();
  const { userRole, currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    // Fetch project details
    const fetchProject = async () => {
      const docSnap = await getDoc(doc(db, 'projects', id));
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchProject();

    // Fetch tasks
    const qTasks = query(collection(db, 'tasks'), where('projectId', '==', id));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData = [];
      snapshot.forEach(doc => tasksData.push({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    });

    // Fetch users for assignment (Admin only needs this technically, but we'll fetch for display names too)
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersData = [];
      snapshot.forEach(doc => usersData.push({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeUsers();
    };
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        projectId: id,
        title: taskTitle,
        description: taskDesc,
        assignedTo: assignedTo,
        status: 'TODO',
        dueDate: dueDate,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setAssignedTo('');
      setDueDate('');
    } catch (error) {
      console.error("Error creating task: ", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateDoc(doc(db, 'tasks', taskId), {
      status: newStatus
    });
  };

  const handleDeleteTask = async (taskId) => {
    if(window.confirm('Delete this task?')) {
      await deleteDoc(doc(db, 'tasks', taskId));
    }
  };

  if (!project) return <div className="p-8">Loading project...</div>;

  const getUserName = (uid) => {
    const user = users.find(u => u.uid === uid);
    return user ? user.displayName : 'Unknown';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">{project.name}</h1>
          <p className="text-[var(--color-text-muted)] mt-2 max-w-2xl">{project.description}</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={20} /> Add Task
          </button>
        )}
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 min-h-[500px]">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
              {status.replace('_', ' ')}
              <span className="bg-white text-xs px-2 py-1 rounded-full border border-gray-200">
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>
            
            <div className="space-y-4">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {getUserName(task.assignedTo)}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {(userRole === 'admin' || task.assignedTo === currentUser.uid) && (
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none flex-1"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    )}
                    {userRole === 'admin' && (
                      <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50/50"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px] bg-gray-50/50"
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50/50"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                >
                  <option value="">Select team member...</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50/50"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/30"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
