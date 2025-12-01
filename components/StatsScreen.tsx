import React, { useEffect, useState } from 'react';
    import { ArrowLeft, BarChart3, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
    import { PracticeSessionRecord } from '../types';
    import { getHistory } from '../services/storage';
    
    interface StatsScreenProps {
      username: string;
      onBack: () => void;
    }
    
    const StatsScreen: React.FC<StatsScreenProps> = ({ username, onBack }) => {
      const [history, setHistory] = useState<PracticeSessionRecord[]>([]);
    
      useEffect(() => {
        setHistory(getHistory(username));
      }, [username]);
    
      // Calculate Stats
      const totalSessions = history.length;
      const correctSessions = history.filter(h => h.correct).length;
      const accuracy = totalSessions > 0 ? Math.round((correctSessions / totalSessions) * 100) : 0;
      
      // Group by Grade
      const gradeStats = history.reduce((acc, curr) => {
        if (!acc[curr.grade]) {
          acc[curr.grade] = { correct: 0, total: 0 };
        }
        acc[curr.grade].total++;
        if (curr.correct) acc[curr.grade].correct++;
        return acc;
      }, {} as Record<string, { correct: number; total: number }>);
    
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <button 
              onClick={onBack}
              className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <BarChart3 size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
            </div>
          </div>
    
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-primary mb-1">{accuracy}%</div>
              <div className="text-gray-500 font-medium">Overall Accuracy</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">{correctSessions}</div>
              <div className="text-gray-500 font-medium">Correct Sentences</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-gray-800 mb-1">{totalSessions}</div>
              <div className="text-gray-500 font-medium">Total Practiced</div>
            </div>
          </div>
    
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent History */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-gray-400" /> Recent Activity
              </h2>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No practice history yet.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                    {history.slice(0, 10).map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">{item.text}</div>
                            <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{item.grade}</span>
                            </div>
                        </div>
                        <div className={`p-1.5 rounded-full ${item.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {item.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
              </div>
              {history.length > 10 && <div className="text-center mt-2 text-xs text-gray-400">Showing recent 10 sessions</div>}
            </div>
    
            {/* Grade Breakdown */}
            <div>
               <h2 className="text-lg font-bold text-gray-800 mb-4">Performance by Grade</h2>
               <div className="space-y-3">
                 {Object.entries(gradeStats).map(([grade, stats]) => (
                   <div key={grade} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-gray-800">{grade}</span>
                        <span className="text-sm font-bold text-primary">
                            {Math.round((stats.correct / stats.total) * 100)}%
                        </span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                        ></div>
                     </div>
                     <div className="text-xs text-gray-400 mt-2 text-right">
                        {stats.correct} / {stats.total} Correct
                     </div>
                   </div>
                 ))}
                 {Object.keys(gradeStats).length === 0 && (
                     <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-100">
                         No data available.
                     </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default StatsScreen;