import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Plus, Folder, Trash2 } from 'lucide-react';

export default function Projects() {
  const { userRole, currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projData = [];
      snapshot.forEach((doc) => projData.push({ id: doc.id, ...doc.data() }));
      setProjects(projData);
    });
    return unsubscribe;
  }, []);

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        description: newProjectDesc,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (error) {
      console.error("Error creating project: ", error);
    }
  }

  async function handleDelete(id) {
    if(window.confirm('Are you sure you want to delete this project?')) {
      await deleteDoc(doc(db, 'projects', id));
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Projects</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Manage and view team projects.</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 rounded-2xl border border-dashed border-gray-300">
            No projects found. {userRole === 'admin' && 'Create one to get started!'}
          </div>
        )}
        {projects.map(project => (
          <div key={project.id} className="glass-panel p-6 rounded-2xl group flex flex-col relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                <Folder size={24} />
              </div>
              {userRole === 'admin' && (
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-gray-500 text-sm line-clamp-2 flex-1">{project.description}</p>
            
            <Link 
              to={`/projects/${project.id}`}
              className="mt-6 w-full py-2 text-center text-primary-600 font-medium bg-primary-50 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors"
            >
              View Project
            </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-4">Create Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50/50"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="E.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px] bg-gray-50/50"
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="Brief description of the project..."
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
