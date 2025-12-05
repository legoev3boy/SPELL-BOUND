import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, checkUsernameExists } from '../services/storage';
import { Wand2, ArrowRight, UserPlus, Mail, CheckCircle2, XCircle } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Availability state: null = not checking/empty, true = available, false = taken
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Check username availability when typing in "Create Account" mode
  useEffect(() => {
    if (isLogin || !username.trim()) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      const exists = checkUsernameExists(username.trim());
      setIsAvailable(!exists);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [username, isLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Prevent submission if username is taken in signup mode
    if (!isLogin && isAvailable === false) {
      setError("Please choose a different username");
      return;
    }

    const user: User = { username: username.trim(), email: email.trim() };

    if (isLogin) {
      const result = loginUser(user);
      if (result.success) {
        onLoginSuccess(user.username);
      } else {
        setError(result.message);
      }
    } else {
      const result = registerUser(user);
      if (result.success) {
        // Auto login after register
        onLoginSuccess(user.username);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-2 border-primary/10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Wand2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SpellBound</h1>
          <p className="text-gray-500">
            {isLogin ? 'Welcome back! Ready to practice?' : 'Create an account to track your spelling.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                  ${!isLogin && isAvailable === true ? 'border-green-400 focus:border-green-500 focus:ring-green-100' : ''}
                  ${!isLogin && isAvailable === false ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary/10'}
                  ${!isLogin && isAvailable !== null ? 'focus:ring-4' : 'focus:ring-4'}
                `}
                placeholder="Enter your name"
                autoComplete="off"
              />
              {/* Availability Icons */}
              {!isLogin && username.trim().length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isAvailable === true && <CheckCircle2 size={20} className="text-green-500" />}
                  {isAvailable === false && <XCircle size={20} className="text-red-500" />}
                </div>
              )}
            </div>
            {/* Availability Message */}
            {!isLogin && username.trim().length > 0 && (
              <div className="absolute -bottom-5 right-1 text-xs font-bold">
                 {isAvailable === true && <span className="text-green-600">Username available</span>}
                 {isAvailable === false && <span className="text-red-500">Username taken</span>}
              </div>
            )}
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="you@example.com"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium animate-pulse mt-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isLogin && isAvailable === false}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-6
              ${!isLogin && isAvailable === false 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'}
            `}
          >
            {isLogin ? (
              <>Sign In <ArrowRight size={20} /></>
            ) : (
              <>Create Account <UserPlus size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setUsername('');
              setEmail('');
              setIsAvailable(null);
            }}
            className="text-gray-500 hover:text-primary font-medium text-sm transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            {isLogin ? (
              <>New here? Create an account</>
            ) : (
              <>Already have an account? Sign In</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;