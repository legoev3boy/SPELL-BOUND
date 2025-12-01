import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, RotateCcw, Check, SkipForward } from 'lucide-react';
import { SentenceData } from '../types';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';

interface PracticeScreenProps {
  sentenceData: SentenceData;
  audioBase64: string | null;
  onCheck: (userText: string) => void;
  onSkip: () => void;
  currentGrade: string;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ 
  sentenceData, 
  audioBase64, 
  onCheck, 
  onSkip,
  currentGrade
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      if (audioBase64) {
        try {
          // Initialize AudioContext only when needed to adhere to browser policies
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          
          const rawBytes = decodeBase64(audioBase64);
          const buffer = await decodeAudioData(rawBytes, audioContextRef.current);
          audioBufferRef.current = buffer;
          
          // Auto-play first time if possible (browsers might block this without interaction, 
          // but we can try or wait for user click)
          // For best UX, we wait for user to click play.
        } catch (e) {
          console.error("Audio decoding failed", e);
        }
      }
    };
    initAudio();

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
         audioContextRef.current?.close();
         audioContextRef.current = null;
      }
    }
  }, [audioBase64]);

  const playAudio = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    // Resume context if suspended (common browser policy)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsPlaying(true);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCheck(inputValue);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {currentGrade}
        </span>
        <button 
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium transition-colors"
        >
          Skip <SkipForward size={16} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center border-2 border-primary/10">
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Volume2 className={`w-12 h-12 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Listen carefully!</h2>
          <p className="text-gray-500 mb-6">Type the sentence you hear below.</p>

          <button
            onClick={playAudio}
            disabled={isPlaying || !audioBase64}
            className={`
              inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold shadow-lg transform transition-all hover:-translate-y-1
              ${isPlaying 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/30'}
            `}
          >
            {isPlaying ? 'Playing...' : (
              <>
                <Play className="fill-current" /> Play Sentence
              </>
            )}
          </button>
        </div>
        
        {sentenceData.hint && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-6 inline-block border border-yellow-100">
             <span className="font-bold mr-1">Hint:</span> {sentenceData.hint}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type here..."
            className="w-full text-center text-xl p-6 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-300"
            autoFocus
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onCheck(inputValue)}
          disabled={!inputValue.trim()}
          className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold px-12 py-4 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answer <Check strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default PracticeScreen;
