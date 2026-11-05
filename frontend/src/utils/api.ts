import { BirthdayFormData, BirthdaySurprise, AdminStats } from '../types/birthday';

const API_BASE = '/api';

export async function createSurprise(data: BirthdayFormData): Promise<BirthdaySurprise> {
  const payload = {
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
    settings: data.settings
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

export async function getSurpriseBySlug(slug: string): Promise<BirthdaySurprise> {
  const res = await fetch(`${API_BASE}/birthday/share/${slug}`);
  if (!res.ok) {
    throw new Error('Birthday surprise not found for this link');
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

