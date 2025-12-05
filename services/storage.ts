import { MistakeRecord, PracticeSessionRecord, User } from '../types';

const USERS_KEY = 'spellbound_users';

// Helper to get user-specific key
const getMistakesKey = (username: string) => `spellbound_mistakes_${username}`;
const getHistoryKey = (username: string) => `spellbound_history_${username}`;

// --- Auth Services ---

const getUsers = (): Record<string, User> => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const checkUsernameExists = (username: string): boolean => {
  const users = getUsers();
  return !!users[username];
};

export const registerUser = (user: User): { success: boolean; message: string } => {
  const users = getUsers();
  if (users[user.username]) {
    return { success: false, message: 'Username already exists' };
  }
  users[user.username] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true, message: 'Account created' };
};

export const loginUser = (user: User): { success: boolean; message: string } => {
  const users = getUsers();
  const storedUser = users[user.username];
  
  if (!storedUser) {
    return { success: false, message: 'Username not found' };
  }
  
  if (storedUser.email.toLowerCase() !== user.email.toLowerCase()) {
    return { success: false, message: 'Invalid email for this user' };
  }
  
  return { success: true, message: 'Logged in' };
};

// --- Data Services (User Scoped) ---

export const getMistakes = (username: string): MistakeRecord[] => {
  try {
    const data = localStorage.getItem(getMistakesKey(username));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load mistakes", e);
    return [];
  }
};

export const saveMistake = (username: string, mistake: MistakeRecord) => {
  try {
    const current = getMistakes(username);
    
    // Check if word already exists to update mastery or prevent dupe
    const existingIndex = current.findIndex(m => m.word.toLowerCase() === mistake.word.toLowerCase());
    
    let updated = [...current];

    if (existingIndex >= 0) {
      // If it exists and we are saving a mistake (wrong answer), reset mastery to 0
      // We update the timestamp and the specific sentence context
      updated[existingIndex] = {
        ...updated[existingIndex],
        timestamp: Date.now(),
        masteryScore: 0, // Reset mastery on error
        originalSentence: mistake.originalSentence,
        userSpelling: mistake.userSpelling
      };
    } else {
      updated = [mistake, ...current];
    }

    localStorage.setItem(getMistakesKey(username), JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save mistake", e);
  }
};

export const incrementMastery = (username: string, mistakeId: string) => {
  try {
    const current = getMistakes(username);
    const updated = current.map(m => {
      if (m.id === mistakeId) {
        return { ...m, masteryScore: (m.masteryScore || 0) + 1 };
      }
      return m;
    });
    localStorage.setItem(getMistakesKey(username), JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update mastery", e);
  }
};

export const deleteMistake = (username: string, id: string) => {
  try {
    const current = getMistakes(username);
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(getMistakesKey(username), JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete mistake", e);
  }
};

export const getHistory = (username: string): PracticeSessionRecord[] => {
  try {
    const data = localStorage.getItem(getHistoryKey(username));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveSession = (username: string, session: PracticeSessionRecord) => {
  try {
    const current = getHistory(username);
    const updated = [session, ...current];
    localStorage.setItem(getHistoryKey(username), JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};