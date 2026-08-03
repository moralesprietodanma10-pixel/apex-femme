import { PlayerProfile, ScheduleDay, MatchLog, ChatMessage, Challenge, Badge } from '../types';
import { 
  INITIAL_PLAYER_PROFILE, 
  INITIAL_WEEKLY_SCHEDULE, 
  INITIAL_CHAT_HISTORY, 
  INITIAL_CHALLENGES, 
  INITIAL_BADGES 
} from '../data/initialData';
import { safeJsonParse, sanitizeObject, cleanObjectStrings } from '../utils/security';

export const CURRENT_SCHEMA_VERSION = '1.2';

export interface FullProfileRecord {
  schemaVersion?: string;
  id: string;
  lastActive: string; // ISO date string
  profile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  matchLogs: MatchLog[];
  chatHistory: ChatMessage[];
  challenges: Challenge[];
  badges: Badge[];
}

const STORAGE_PROFILES_KEY = 'apex_femme_profiles_v2';
const STORAGE_ACTIVE_ID_KEY = 'apex_femme_active_profile_id';
const SESSION_KEY = 'apex_femme_session_active';

// Generate safe unique ID
export function generateProfileId(): string {
  return `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Migration engine: Upgrades legacy data structures to current schema
 */
export function migrateProfileRecord(record: any): FullProfileRecord {
  if (!record || typeof record !== 'object') {
    throw new Error('Invalid profile record object');
  }

  const rawMigrated: FullProfileRecord = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: record.id || generateProfileId(),
    lastActive: record.lastActive || new Date().toISOString(),
    profile: {
      ...INITIAL_PLAYER_PROFILE,
      ...(record.profile || {})
    },
    weeklySchedule: Array.isArray(record.weeklySchedule) ? record.weeklySchedule : INITIAL_WEEKLY_SCHEDULE,
    matchLogs: Array.isArray(record.matchLogs) ? record.matchLogs : [],
    chatHistory: Array.isArray(record.chatHistory) ? record.chatHistory : INITIAL_CHAT_HISTORY,
    challenges: Array.isArray(record.challenges) ? record.challenges : INITIAL_CHALLENGES,
    badges: Array.isArray(record.badges) ? record.badges : INITIAL_BADGES
  };

  return cleanObjectStrings(rawMigrated);
}

// Get all saved profiles safely with auto-migration
export function getSavedProfiles(): FullProfileRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    const parsed = safeJsonParse<any[]>(raw, []);

    if (Array.isArray(parsed)) {
      return parsed.map(p => migrateProfileRecord(p));
    }
  } catch (e) {
    console.error('Error loading and migrating saved profiles:', e);
  }
  return [];
}

// Save all profiles array with sanitization
function saveAllProfiles(profiles: FullProfileRecord[]) {
  try {
    const sanitized = sanitizeObject(profiles);
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving profiles to localStorage:', e);
  }
}

// Get active profile ID
export function getActiveProfileId(): string | null {
  try {
    return localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

// Set active profile ID
export function setActiveProfileId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
      localStorage.setItem(SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Error updating active profile ID:', e);
  }
}

// Get active profile record
export function getActiveProfileRecord(): FullProfileRecord | null {
  const activeId = getActiveProfileId();
  const profiles = getSavedProfiles();
  if (activeId) {
    const found = profiles.find(p => p.id === activeId);
    if (found) return found;
  }
  return profiles.length > 0 ? profiles[0] : null;
}

// Save or update a single profile record
export function saveProfileRecord(record: FullProfileRecord) {
  const profiles = getSavedProfiles();
  const index = profiles.findIndex(p => p.id === record.id);
  const updatedRecord: FullProfileRecord = {
    ...record,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastActive: new Date().toISOString()
  };

  if (index >= 0) {
    profiles[index] = updatedRecord;
  } else {
    profiles.push(updatedRecord);
  }

  saveAllProfiles(profiles);
}

// Delete a profile by ID
export function deleteProfileRecord(id: string): FullProfileRecord[] {
  let profiles = getSavedProfiles();
  profiles = profiles.filter(p => p.id !== id);
  saveAllProfiles(profiles);

  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
  }

  return profiles;
}

// Create a new default profile record
export function createNewProfileRecord(params: {
  name: string;
  position: string;
  jerseyNumber: string;
  preferredFoot: string;
  themeColor: PlayerProfile['themeColor'];
  country?: string;
  avatarUrl?: string;
}): FullProfileRecord {
  const id = generateProfileId();
  const freshProfile: PlayerProfile = {
    ...INITIAL_PLAYER_PROFILE,
    name: params.name || 'Jugadora APEX',
    position: params.position || 'Volante de Contención / MC',
    jerseyNumber: params.jerseyNumber.startsWith('#') ? params.jerseyNumber : `#${params.jerseyNumber || '10'}`,
    preferredFoot: params.preferredFoot || 'Derecho',
    themeColor: params.themeColor || 'flash',
    country: params.country || 'ESP',
    avatarUrl: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    playerCardPhotoUrl: params.avatarUrl || INITIAL_PLAYER_PROFILE.playerCardPhotoUrl,
    level: 1,
    OVR: 60,
    xp: 0,
    xpToNextLevel: 1000,
    attributes: {
      rhythm: 60,
      passing: 60,
      vision: 60,
      physical: 60,
      recovery: 60,
      shooting: 60,
    },
    streakDays: 1,
    monthlyMinutes: 0,
    avgRating: 7.0,
    aiTone: 'gemini',
  };

  const newRecord: FullProfileRecord = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id,
    lastActive: new Date().toISOString(),
    profile: freshProfile,
    weeklySchedule: INITIAL_WEEKLY_SCHEDULE.map(s => ({ ...s })),
    matchLogs: [],
    chatHistory: [
      {
        id: 'msg-welcome-init',
        sender: 'ai',
        text: `¡Bienvenida ${freshProfile.name}! 👋 Tu perfil ha sido creado con éxito. Estoy lista para ser tu entrenadora personal de rendimiento. ¡Comencemos! ⚽`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    challenges: INITIAL_CHALLENGES.map(c => ({ ...c })),
    badges: INITIAL_BADGES.map(b => ({ ...b }))
  };

  saveProfileRecord(newRecord);
  setActiveProfileId(id);
  return newRecord;
}

// Export profile to JSON file for manual backup
export function exportProfileBackup(record: FullProfileRecord) {
  const jsonStr = JSON.stringify(record, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `APEX_Perfil_${record.profile.name.replace(/\s+/g, '_')}_${record.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import profile from JSON object
export function importProfileBackup(rawJson: string): FullProfileRecord | null {
  try {
    const parsed = safeJsonParse<any>(rawJson, null);
    if (parsed && parsed.profile && parsed.profile.name) {
      const migrated = migrateProfileRecord(parsed);
      migrated.id = generateProfileId();
      migrated.lastActive = new Date().toISOString();
      saveProfileRecord(migrated);
      return migrated;
    }
  } catch (e) {
    console.error('Error parsing profile backup JSON:', e);
  }
  return null;
}
