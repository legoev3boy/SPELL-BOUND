import React, { useState, useCallback } from 'react';
import GradeSelector from './components/GradeSelector';
import PracticeScreen from './components/PracticeScreen';
import FeedbackScreen from './components/FeedbackScreen';
import GlossaryScreen from './components/GlossaryScreen';
import StatsScreen from './components/StatsScreen';
import AuthScreen from './components/AuthScreen';
import Spinner from './components/Spinner';
import { AppState, GradeLevel, SentenceData, FeedbackData } from './types';
import { generateSentenceForGrade, generateSpeechFromText, gradeSpelling } from './services/gemini';
import { saveMistake, saveSession, deleteMistake, getMistakes, incrementMastery } from './services/storage';
import { LogOut, User as UserIcon } from 'lucide-react';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const [currentGrade, setCurrentGrade] = useState<GradeLevel | string | null>(null);
  const [currentSentence, setCurrentSentence] = useState<SentenceData | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we are practicing a specific mistake from glossary
  const [targetMistakeId, setTargetMistakeId] = useState<string | null>(null);

  const loadNewSentence = useCallback(async (grade: GradeLevel | string, targetWord?: string) => {
    if (!currentUser) return;

    setAppState(AppState.LOADING);
    setError(null);
    setAudioData(null);
    
    try {
      let wordToPractice = targetWord;
      let reviewMistakeId = targetMistakeId;

      // Logic: If not explicitly practicing a target word (via glossary button),
      // there is a chance (40%) we pick a word from the glossary automatically to review.
      if (!wordToPractice) {
        const mistakes = getMistakes(currentUser);
        if (mistakes.length > 0 && Math.random() < 0.4) {
           const randomMistake = mistakes[Math.floor(Math.random() * mistakes.length)];
           wordToPractice = randomMistake.word;
           reviewMistakeId = randomMistake.id;
           setTargetMistakeId(randomMistake.id); // Set tracking state
        }
      }

      // 1. Get Sentence (optionally with target word)
      const sentenceData = await generateSentenceForGrade(grade, wordToPractice);
      setCurrentSentence(sentenceData);

      // 2. Get Audio
      const audio = await generateSpeechFromText(sentenceData.text);
      
      if (!audio) {
        throw new Error("Could not generate audio.");
      }
      
      setAudioData(audio);
      setAppState(AppState.PRACTICE);

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setAppState(AppState.GRADE_SELECTION); // Fallback
    }
  }, [currentUser, targetMistakeId]);

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    setAppState(AppState.GRADE_SELECTION);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState(AppState.AUTH);
    setCurrentGrade(null);
    setTargetMistakeId(null);
  };

  const handleGradeSelect = (grade: GradeLevel) => {
    setCurrentGrade(grade);
    setTargetMistakeId(null);
    loadNewSentence(grade);
  };

  const handleGlossaryPractice = (word: string, grade: string, mistakeId: string) => {
    setCurrentGrade(grade);
    setTargetMistakeId(mistakeId);
    loadNewSentence(grade, word);
  };

  const handleDeleteMistake = (id: string) => {
    if (currentUser) deleteMistake(currentUser, id);
  };

  const handleCheck = (userText: string) => {
    if (!currentSentence || !currentGrade || !currentUser) return;
    const result = gradeSpelling(currentSentence.text, userText);
    
    // Save Session Stats
    saveSession(currentUser, {
      id: generateId(),
      timestamp: Date.now(),
      grade: currentGrade as string,
      correct: result.isCorrect,
      text: currentSentence.text
    });

    // Handle Glossary Logic
    if (result.isCorrect && targetMistakeId) {
       // User spelled a glossary word correctly!
       // Increment mastery score.
       incrementMastery(currentUser, targetMistakeId);
       
       // Check if we should remove it (fetch fresh list to check score)
       // This is a bit of a "blind" update, but simplest for now. 
       // Ideally we check state, but storage is sync so it's fine.
       const mistakes = getMistakes(currentUser);
       const updatedMistake = mistakes.find(m => m.id === targetMistakeId);
       
       if (updatedMistake && (updatedMistake.masteryScore || 0) >= 3) {
          deleteMistake(currentUser, targetMistakeId);
       }
    }

    // Save New Mistakes if any
    if (!result.isCorrect) {
      result.diff.forEach(diffPart => {
        if (!diffPart.correct && diffPart.part.trim().length > 0) {
           saveMistake(currentUser, {
             id: generateId(),
             word: diffPart.part,
             userSpelling: diffPart.userAttempt,
             originalSentence: currentSentence.text,
             timestamp: Date.now(),
             grade: currentGrade as string,
             masteryScore: 0
           });
        }
      });
    }

    setFeedback(result);
    setAppState(AppState.FEEDBACK);
  };

  const handleContinue = () => {
    if (currentGrade) {
      setTargetMistakeId(null); // Clear specific target so next one is random/auto
      loadNewSentence(currentGrade);
    }
  };

  const handleSwitchGrade = () => {
    setAppState(AppState.GRADE_SELECTION);
    setCurrentGrade(null);
    setAudioData(null);
    setCurrentSentence(null);
    setTargetMistakeId(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-gray-900 selection:bg-primary/20">
      {/* Header / Nav */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
             <div className="flex items-center gap-2 cursor-pointer" onClick={currentUser ? handleSwitchGrade : undefined}>
               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
               <span className="font-bold text-xl text-gray-800">SpellBound</span>
             </div>
             
             {currentUser && appState !== AppState.AUTH && (
               <div className="flex items-center gap-4">
                 <span className="text-sm font-medium text-gray-500 hidden sm:flex items-center gap-1">
                   {targetMistakeId ? 'Glossary Review' : (currentGrade ? `Current: ${currentGrade}` : '')}
                 </span>
                 <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                     <UserIcon size={16} className="text-primary" />
                     {currentUser}
                   </div>
                   <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Sign Out"
                   >
                     <LogOut size={20} />
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-5xl">
        {error && (
          <div className="m-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {appState === AppState.AUTH && (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {appState === AppState.GRADE_SELECTION && (
          <GradeSelector 
            onSelectGrade={handleGradeSelect} 
            onShowGlossary={() => setAppState(AppState.GLOSSARY)}
            onShowStats={() => setAppState(AppState.STATS)}
          />
        )}

        {appState === AppState.LOADING && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
             <Spinner />
             <p className="mt-4 text-gray-500">
               {targetMistakeId ? 'Preparing your review sentence...' : 'Preparing lesson...'}
             </p>
          </div>
        )}

        {appState === AppState.PRACTICE && currentSentence && (
          <PracticeScreen 
            sentenceData={currentSentence}
            audioBase64={audioData}
            onCheck={handleCheck}
            onSkip={() => loadNewSentence(currentGrade!)}
            currentGrade={currentGrade as string || ''}
          />
        )}

        {appState === AppState.FEEDBACK && feedback && (
          <FeedbackScreen 
            feedback={feedback}
            onContinue={handleContinue}
            onSwitchGrade={handleSwitchGrade}
          />
        )}

        {appState === AppState.GLOSSARY && currentUser && (
          <GlossaryScreen 
            username={currentUser}
            onBack={() => setAppState(AppState.GRADE_SELECTION)} 
            onPractice={handleGlossaryPractice}
            onDelete={handleDeleteMistake}
          />
        )}

        {appState === AppState.STATS && currentUser && (
          <StatsScreen 
            username={currentUser}
            onBack={() => setAppState(AppState.GRADE_SELECTION)} 
          />
        )}
      </main>
      
      {appState !== AppState.AUTH && (
        <footer className="py-6 text-center text-gray-400 text-sm">
          Powered by Gemini • Learn to spell efficiently
        </footer>
      )}
    </div>
  );
};

export default App;