import { useState, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'superlocucao_favorite_voices';

export function getFavoriteVoiceIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavoriteVoice(voiceId: string): boolean {
  return getFavoriteVoiceIds().includes(voiceId);
}

export function toggleFavoriteVoice(voiceId: string): boolean {
  try {
    const current = getFavoriteVoiceIds();
    const exists = current.includes(voiceId);
    const updated = exists ? current.filter(id => id !== voiceId) : [...current, voiceId];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('voice-favorites-changed', { detail: updated }));
    return !exists;
  } catch {
    return false;
  }
}

export function useFavoriteVoices() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavoriteVoiceIds());

  useEffect(() => {
    const handleUpdate = () => {
      setFavorites(getFavoriteVoiceIds());
    };
    window.addEventListener('voice-favorites-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('voice-favorites-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const toggleFavorite = (voiceId: string) => {
    toggleFavoriteVoice(voiceId);
  };

  const isFavorite = (voiceId: string) => favorites.includes(voiceId);

  return { favorites, toggleFavorite, isFavorite };
}

