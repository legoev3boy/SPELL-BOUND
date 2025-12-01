import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { FeedbackData } from '../types';

interface FeedbackScreenProps {
  feedback: FeedbackData;
  onContinue: () => void;
  onSwitchGrade: () => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ feedback, onContinue, onSwitchGrade }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      <div className={`
        inline-flex items-center justify-center p-4 rounded-full mb-6 shadow-sm
        ${feedback.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
      `}>
        {feedback.isCorrect ? (
          <CheckCircle2 className="w-12 h-12" />
        ) : (
          <XCircle className="w-12 h-12" />
        )}
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        {feedback.isCorrect ? 'Great Job!' : 'Almost there!'}
      </h2>
      <p className="text-gray-500 mb-8">
        {feedback.isCorrect 
          ? 'You spelled everything correctly.' 
          : 'Check the differences below to improve.'}
      </p>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correct Sentence</h3>
          <p className="text-2xl font-medium text-gray-800">{feedback.originalText}</p>
        </div>

        {!feedback.isCorrect && (
          <div className="p-6 bg-red-50/50">
             <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Your Answer</h3>
             <div className="text-xl leading-relaxed flex flex-wrap justify-center gap-2">
                {feedback.diff.map((part, idx) => (
                  <span 
                    key={idx}
                    className={`
                      px-2 py-1 rounded-lg border-2
                      ${part.correct 
                        ? 'bg-white border-transparent text-gray-600' 
                        : 'bg-red-100 border-red-200 text-red-700 font-bold decoration-wavy underline decoration-red-400'}
                    `}
                    title={part.correct ? 'Correct' : `Expected: ${part.part}`}
                  >
                    {part.userAttempt || '_'}
                  </span>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onSwitchGrade}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Home size={20} /> Change Grade
        </button>
        <button
          onClick={onContinue}
          className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          Next Sentence <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FeedbackScreen;
