import React from 'react';
import { GradeLevel } from '../types';
import { GraduationCap, Sparkles, BookOpen, BarChart3 } from 'lucide-react';

interface GradeSelectorProps {
  onSelectGrade: (grade: GradeLevel) => void;
  onShowGlossary: () => void;
  onShowStats: () => void;
}

const GradeSelector: React.FC<GradeSelectorProps> = ({ onSelectGrade, onShowGlossary, onShowStats }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-4">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to SpellBound!</h1>
        <p className="text-xl text-gray-600">Choose your grade level to start practicing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
        {Object.entries(GradeLevel).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onSelectGrade(label)}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity duration-300">
               <Sparkles className="w-12 h-12 text-yellow-400" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">
                Level {key.replace('G', '')}
              </span>
              <h3 className="text-2xl font-bold text-gray-800">{label}</h3>
              <p className="text-gray-500 mt-2 text-sm">Tap to start spelling!</p>
            </div>
          </button>
        ))}
      </div>

      {/* Progress & Tools Section */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Your Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={onShowGlossary}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group"
          >
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-800">My Glossary</div>
              <div className="text-xs text-gray-500">Review misspelled words</div>
            </div>
          </button>

          <button
            onClick={onShowStats}
            className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
          >
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-800">Statistics</div>
              <div className="text-xs text-gray-500">Track your improvements</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeSelector;