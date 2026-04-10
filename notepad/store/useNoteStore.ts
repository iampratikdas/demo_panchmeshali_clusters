import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string; // HTML string from rich text
  createdAt: number;
}

interface NoteState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (note) => set((state) => ({
        notes: [
          {
            ...note,
            id: Date.now().toString(),
            createdAt: Date.now(),
          },
          ...state.notes,
        ],
      })),
      updateNote: (id, updatedNote) => set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updatedNote } : n)),
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),
    }),
    {
      name: 'notepad-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
