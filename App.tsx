import React, { useState, useEffect } from 'react';
import { User, UserRole, Stream } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { ICONS } from './constants';

const App: React.FC = () => {
  // Simple State Management for "Auth" and Views
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'signup' | 'app'>('login');
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mock
  
  // Signup Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [standard, setStandard] = useState('');
  const [stream, setStream] = useState<Stream>(Stream.SCIENCE);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    // Sync with DOM
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(email === 'admin@jarvis.ai') {
        setUser({ id: 'admin1', name: 'Admin User', role: UserRole.ADMIN, email });
        setView('app');
    } else {
        // Mock Student Login - normally would validate against DB
        const savedUser = localStorage.getItem(`user_${email}`);
        if(savedUser) {
            setUser(JSON.parse(savedUser));
            setView('app');
        } else {
            alert("User not found. Please sign up.");
        }
    }
  };

  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          role,
          standard: role === UserRole.STUDENT ? standard : undefined,
          stream: role === UserRole.STUDENT ? stream : undefined,
          isPro
      };
      
      localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      setUser(newUser);
      setView('app');
  };

  const handleLogout = () => {
      setUser(null);
      setView('login');
      setEmail('');
      setPassword('');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-800/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-slate-700/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute top-4 right-4 z-10">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
            >
                {theme === 'dark' ? <ICONS.Sun /> : <ICONS.Moon />}
            </button>
        </div>
        <div className="max-w-md w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl transition-colors duration-300 relative z-10">
          <div className="flex justify-center mb-6 text-blue-700 dark:text-blue-400">
             <div className="w-20 h-20 bg-gradient-to-br from-blue-400/20 to-slate-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="transform scale-125">
                  <ICONS.JarvisLogo />
                </div>
             </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2 tracking-tight">Welcome to Jarvis</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm">Your intelligent, adaptive AI Tutor.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Email</label>
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    placeholder="student@example.com"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Password</label>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98]">
                Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setView('signup')} className="text-blue-600 dark:text-blue-400 text-sm hover:underline font-medium">
                New to Jarvis? Create an account
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-600">
            Hint: Use admin@jarvis.ai for Admin Dashboard
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute top-4 right-4 z-10">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700"
            >
                {theme === 'dark' ? <ICONS.Sun /> : <ICONS.Moon />}
            </button>
        </div>
        <div className="max-w-lg w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] transition-colors duration-300 relative z-10 scrollbar-hide">
          <div className="flex items-center justify-center gap-3 mb-6 text-blue-700 dark:text-blue-400">
             <ICONS.JarvisLogo />
             <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Create Account</h2>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all">
                        <option value={UserRole.STUDENT}>Student</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all" />
            </div>

            {role === UserRole.STUDENT && (
                <>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Standard/Year</label>
                        <input type="text" placeholder="e.g. 12th" required value={standard} onChange={e => setStandard(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 tracking-wider">Stream</label>
                        <select value={stream} onChange={e => setStream(e.target.value as Stream)} className="w-full bg-gray-50 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all">
                            <option value={Stream.SCIENCE}>Science</option>
                            <option value={Stream.COMMERCE}>Commerce</option>
                            <option value={Stream.ENGINEERING}>Engineering</option>
                            <option value={Stream.ARTS}>Arts</option>
                        </select>
                    </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50 dark:bg-[#1e293b]/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-slate-900 dark:text-white font-bold flex items-center gap-2"><ICONS.Sparkles className="text-indigo-500"/> Jarvis Pro</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Advanced models, image gen, exam prediction.</p>
                        </div>
                        <button type="button" onClick={() => setIsPro(!isPro)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isPro ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${isPro ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
                </>
            )}

            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98]">
                Start Learning
            </button>
          </form>
           <div className="mt-6 text-center">
            <button onClick={() => setView('login')} className="text-blue-600 dark:text-blue-400 text-sm hover:underline font-medium">
                Already have an account? Login
            </button>
          </div>
        </div>
      </div>
      );
  }

  // App View
  return (
    <>
      {user?.role === UserRole.ADMIN ? (
        <AdminDashboard onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        user && <StudentDashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      )}
    </>
  );
};

export default App;