import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { CheckSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function MyTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTasks() {
      if (!currentUser) return;
      try {
        const qTasks = query(collection(db, 'tasks'), where('assignedTo', '==', currentUser.uid));
        const querySnapshot = await getDocs(qTasks);
        
        const tasksData = [];
        const projectIds = new Set();
        
        querySnapshot.forEach((doc) => {
          const t = { id: doc.id, ...doc.data() };
          tasksData.push(t);
          projectIds.add(t.projectId);
        });

        // Fetch project names
        const projData = {};
        for (const pid of projectIds) {
          const pDoc = await getDoc(doc(db, 'projects', pid));
          if (pDoc.exists()) {
            projData[pid] = pDoc.data().name;
          }
        }

        setProjects(projData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTasks();
  }, [currentUser]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus
      });
      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-main)]">My Tasks</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Manage tasks assigned directly to you.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <CheckSquare size={48} className="text-gray-300 mb-4" />
            <p>You have no tasks assigned to you right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map(task => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <Link to={`/projects/${task.projectId}`} className="text-primary-600 hover:underline bg-primary-50 px-2 py-0.5 rounded">
                      {projects[task.projectId] || 'Unknown Project'}
                    </Link>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <Clock size={14} />
                        Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 min-w-[150px]">
                  <select 
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-sm rounded-lg px-3 py-2 font-medium border-0 outline-none w-full shadow-sm ${
                      task.status === 'TODO' ? 'bg-gray-100 text-gray-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
