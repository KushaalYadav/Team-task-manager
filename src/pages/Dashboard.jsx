import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function Dashboard() {
  const { currentUser, userRole } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        let tasksQuery;
        
        // Admins see all tasks, Members see their assigned tasks
        if (userRole === 'admin') {
          tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
        } else {
          tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', currentUser.uid));
        }

        const querySnapshot = await getDocs(tasksQuery);
        let s = { totalTasks: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
        let recent = [];

        querySnapshot.forEach((doc) => {
          const task = { id: doc.id, ...doc.data() };
          s.totalTasks++;
          
          if (task.status === 'TODO') s.todo++;
          else if (task.status === 'IN_PROGRESS') s.inProgress++;
          else if (task.status === 'DONE') s.done++;

          if (task.dueDate && task.status !== 'DONE') {
            const dueDate = new Date(task.dueDate);
            if (isPast(dueDate) && !isToday(dueDate)) {
              s.overdue++;
            }
          }

          if (recent.length < 5) {
            recent.push(task);
          }
        });

        setStats(s);
        setRecentTasks(recent);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, userRole]);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Welcome back, {currentUser?.displayName}. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={TrendingUp} color="blue" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="yellow" />
        <StatCard title="Completed" value={stats.done} icon={CheckCircle2} color="green" />
        <StatCard title="Overdue" value={stats.overdue} icon={AlertCircle} color="red" />
      </div>

      {/* Recent Tasks */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-6">Recent Tasks</h2>
        
        {recentTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tasks found. Create a project to get started!</div>
        ) : (
          <div className="space-y-4">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'TODO' ? 'bg-gray-300' :
                    task.status === 'IN_PROGRESS' ? 'bg-yellow-400' :
                    'bg-green-500'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {task.status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
        <p className="text-2xl font-bold text-[var(--color-text-main)] mt-1">{value}</p>
      </div>
    </div>
  );
}
