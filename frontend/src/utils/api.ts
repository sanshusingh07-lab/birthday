import { 
  BirthdayFormData, 
  BirthdaySurprise, 
  RecipientSurprise, 
  AdminStats, 
  AnalyticsData, 
  ShareSettings,
  VoiceMessageData,
  CustomThemeData
} from '../types/birthday';

const API_BASE = '/api';

// Creator ID helper (saved in localStorage for the browser session)
export function getOrCreateCreatorId(): string {
  let cid = localStorage.getItem('birthday_creator_id');
  if (!cid) {
    cid = 'creator_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('birthday_creator_id', cid);
  }
  return cid;
}

export async function createSurprise(data: BirthdayFormData): Promise<BirthdaySurprise> {
  const creatorId = getOrCreateCreatorId();
  
  const payload = {
    creator_id: creatorId,
    recipient_name: data.recipient_name,
    sender_name: data.sender_name,
    relationship: data.relationship,
    birth_date: data.birth_date || null,
    celebration_date: data.celebration_date || null,
    birthday_message: data.birthday_message || null,
    birthday_letter: data.birthday_letter || null,
    wishes: data.wishes.filter(w => w.answer.trim().length > 0),
    memories: data.memories.map(m => ({
      image_url: m.image_url,
      caption: m.caption || null
    })),
    voice_message: data.voice_message || null,
    custom_theme: data.custom_theme ? {
      ...data.custom_theme,
      animation_settings: typeof data.custom_theme.animation_settings === 'string'
        ? data.custom_theme.animation_settings
        : JSON.stringify(data.custom_theme.animation_settings)
    } : null,
    settings: data.settings,
    visibility: data.visibility || 'unlisted',
    password: data.password || null,
    expires_at: data.expires_at || null
  };

  const res = await fetch(`${API_BASE}/birthday/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create surprise' }));
    throw new Error(err.detail || 'Failed to create birthday surprise');
  }

  return res.json();
}

export async function getSurpriseById(id: number): Promise<BirthdaySurprise> {
  const res = await fetch(`${API_BASE}/birthday/${id}`);
  if (!res.ok) {
    throw new Error('Birthday surprise not found');
  }
  return res.json();
}

// Recipient endpoint (pure read-only)
export async function getRecipientSurprise(slug: string): Promise<RecipientSurprise> {
  const res = await fetch(`${API_BASE}/surprise/${slug}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Surprise not found' }));
    throw new Error(err.detail || 'Birthday surprise not found for this link');
  }
  return res.json();
}

// Backward-compatible alias
export async function getSurpriseBySlug(slug: string): Promise<RecipientSurprise> {
  return getRecipientSurprise(slug);
}

// Recipient password verification
export async function verifyRecipientPassword(slug: string, password: string): Promise<RecipientSurprise> {
  const res = await fetch(`${API_BASE}/surprise/${slug}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Incorrect secret password' }));
    throw new Error(err.detail || 'Incorrect secret password');
  }

  return res.json();
}

export async function uploadTempPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/birthday/upload-temp`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Image upload failed');
  }

  const data = await res.json();
  return data.image_url;
}

// Voice upload
export async function uploadTempVoice(
  audioBlob: Blob, 
  duration: number = 0, 
  title: string = 'A special voice message for you ❤️'
): Promise<VoiceMessageData> {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a') ? 'm4a' : 'webm';
  formData.append('file', audioBlob, `recording.${ext}`);
  formData.append('duration', duration.toString());
  formData.append('title', title);

  const res = await fetch(`${API_BASE}/birthday/voice-temp`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Audio upload failed' }));
    throw new Error(err.detail || 'Voice recording upload failed');
  }

  return res.json();
}

// Creator surprises list
export async function getCreatorSurprises(): Promise<BirthdaySurprise[]> {
  const creatorId = getOrCreateCreatorId();
  const res = await fetch(`${API_BASE}/creator/surprises?creator_id=${encodeURIComponent(creatorId)}`);
  if (!res.ok) {
    throw new Error('Failed to load created surprises');
  }
  return res.json();
}

// Share settings update
export async function updateShareSettings(id: number, settings: Partial<ShareSettings>): Promise<any> {
  const res = await fetch(`${API_BASE}/birthday/${id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update share settings' }));
    throw new Error(err.detail || 'Failed to update share settings');
  }
  return res.json();
}

// Regenerate link
export async function regenerateShareLink(id: number): Promise<{ message: string; unique_slug: string; share_url: string }> {
  const res = await fetch(`${API_BASE}/birthday/${id}/regenerate-link`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to regenerate link');
  }
  return res.json();
}

// Toggle disable/enable link
export async function toggleShareLink(id: number): Promise<{ message: string; is_active: boolean }> {
  const res = await fetch(`${API_BASE}/birthday/${id}/disable-link`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to update link status');
  }
  return res.json();
}

// Analytics
export async function getSurpriseAnalytics(id: number): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/birthday/${id}/analytics`);
  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return res.json();
}

export async function generateLetter(params: {
  recipient_name: string;
  sender_name: string;
  relationship: string;
  style: string;
  memories_or_notes?: string;
  answers?: Record<string, string>;
}): Promise<{ letter: string; style: string; suggested_wishes: string[] }> {
  const res = await fetch(`${API_BASE}/birthday/generate-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    throw new Error('Failed to generate letter');
  }

  return res.json();
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) {
    throw new Error('Failed to fetch admin stats');
  }
  return res.json();
}

export async function deleteSurprise(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/birthday/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete birthday surprise');
  }
}

export async function seedDemoSurprise(): Promise<{ message: string; slug: string }> {
  const res = await fetch(`${API_BASE}/admin/seed`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to seed demo surprise');
  }
  return res.json();
}
