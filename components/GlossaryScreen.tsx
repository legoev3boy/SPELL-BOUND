import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, AlertCircle, Search, Play, Trash2, Star } from 'lucide-react';
import { MistakeRecord } from '../types';
import { getMistakes } from '../services/storage';

interface GlossaryScreenProps {
  username: string;
  onBack: () => void;
  onPractice: (word: string, grade: string, mistakeId: string) => void;
  onDelete: (id: string) => void;
}

const GlossaryScreen: React.FC<GlossaryScreenProps> = ({ username, onBack, onPractice, onDelete }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setMistakes(getMistakes(username));
  }, [username]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
    setMistakes(prev => prev.filter(m => m.id !== id));
  };

  const filteredMistakes = mistakes.filter(m => 
    m.word.toLowerCase().includes(filter.toLowerCase()) || 
    m.grade.toLowerCase().includes(filter.toLowerCase())
  );

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
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">My Misspelled Words</h1>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search words..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-300 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
          />
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No misspelled words yet!</h3>
          <p className="text-gray-500">You're doing great. Keep practicing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMistakes.map((mistake) => (
            <div key={mistake.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
               {/* Mastery Progress Bar Background (Subtle) */}
               <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                  <div 
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${((mistake.masteryScore || 0) / 3) * 100}%` }}
                  />
               </div>

              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                   <h3 className="text-xl font-bold text-red-600 mb-1">{mistake.word}</h3>
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                       {mistake.grade}
                     </span>
                     {/* Mastery Stars */}
                     <div className="flex gap-0.5" title={`${mistake.masteryScore || 0}/3 to master`}>
                       {[1, 2, 3].map(star => (
                         <Star 
                           key={star} 
                           size={12} 
                           className={star <= (mistake.masteryScore || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                         />
                       ))}
                     </div>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDelete(mistake.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove from glossary"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => onPractice(mistake.word, mistake.grade, mistake.id)}
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 transition-all shadow-md shadow-primary/30"
                    title="Practice this word"
                  >
                     <Play size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm relative z-10">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600">
                    You wrote: <span className="font-medium text-red-500 line-through decoration-red-300">{mistake.userSpelling}</span>
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-gray-600 italic border border-gray-100">
                  "{mistake.originalSentence}"
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlossaryScreen;