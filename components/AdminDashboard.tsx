import React, { useState } from 'react';
import { User, Stream } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_ADMIN_STATS, ICONS } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, theme, toggleTheme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    examPrediction: true,
    liveVoice: true,
    advancedImages: false
  });

  const toggleFeature = (key: keyof typeof featureFlags) => {
    if (!isEditing) return;
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-6 transition-colors duration-300">
      <header className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="text-blue-700 dark:text-blue-400">
             <ICONS.JarvisLogo />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 leading-tight">Jarvis Admin</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">System Overview & Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={toggleTheme}
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
                {theme === 'dark' ? <ICONS.Sun /> : <ICONS.Moon />}
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors">
            <ICONS.LogOut /> Logout
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Daily Active Users</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1,245</p>
          <span className="text-green-500 dark:text-green-400 text-xs">↑ 12% vs last week</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Time Spent</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">34m</p>
          <span className="text-green-500 dark:text-green-400 text-xs">↑ 5m vs last week</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Practice Completion</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">87%</p>
          <span className="text-blue-600 dark:text-blue-400 text-xs">High engagement</span>
        </div>
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Revenue (Subscribers)</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">$4,200</p>
          <span className="text-green-500 dark:text-green-400 text-xs">Monthly Recurring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 h-80 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-blue-100">User Activity (Hours)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_ADMIN_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                    border: theme === 'dark' ? 'none' : '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    color: theme === 'dark' ? '#fff' : '#0f172a' 
                }}
              />
              <Bar dataKey="active" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 h-80 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-blue-100">Engagement Trends</h3>
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_ADMIN_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                    border: theme === 'dark' ? 'none' : '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    color: theme === 'dark' ? '#fff' : '#0f172a' 
                }}
              />
              <Line type="monotone" dataKey="time" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Configuration</h3>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              isEditing ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-500/50 dark:border-blue-400'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Features'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg border ${featureFlags.examPrediction ? 'border-green-500/30 bg-green-500/10 dark:bg-green-900/10' : 'border-red-500/30 bg-red-500/10 dark:bg-red-900/10'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Exam Prediction (AI)</span>
              <div 
                onClick={() => toggleFeature('examPrediction')}
                className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                  featureFlags.examPrediction ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${featureFlags.examPrediction ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Allows students to generate mock exam questions based on stream.</p>
          </div>

          <div className={`p-4 rounded-lg border ${featureFlags.liveVoice ? 'border-green-500/30 bg-green-500/10 dark:bg-green-900/10' : 'border-red-500/30 bg-red-500/10 dark:bg-red-900/10'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Live Voice Tutor</span>
              <div 
                onClick={() => toggleFeature('liveVoice')}
                className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                  featureFlags.liveVoice ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${featureFlags.liveVoice ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Enables real-time audio interaction via Gemini Live API.</p>
          </div>

          <div className={`p-4 rounded-lg border ${featureFlags.advancedImages ? 'border-green-500/30 bg-green-500/10 dark:bg-green-900/10' : 'border-red-500/30 bg-red-500/10 dark:bg-red-900/10'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Advanced Diagrams</span>
              <div 
                onClick={() => toggleFeature('advancedImages')}
                className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                  featureFlags.advancedImages ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${featureFlags.advancedImages ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Pro Feature: Generates visual aids for complex explanations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;