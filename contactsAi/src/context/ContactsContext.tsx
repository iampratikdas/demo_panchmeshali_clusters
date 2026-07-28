import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Contact, DUMMY_CONTACTS } from '../data/contacts';

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  importContacts: (imported: Contact[]) => void;
  searchContacts: (query: string) => Contact[];
  aiSearch: (query: string) => Contact | null;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>(DUMMY_CONTACTS);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: Math.random().toString(36).substr(2, 9),
    };
    setContacts(prev => [newContact, ...prev]);
  };

  const importContacts = (imported: Contact[]) => {
    setContacts(prev => [...imported, ...prev]);
  };

  const searchContacts = (query: string) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return contacts.filter(c => c.name.toLowerCase().includes(q));
  };

  const aiSearch = (query: string) => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    
    // Very simple simulated AI search logic
    const matches = contacts.map(c => {
      let score = 0;
      if (c.name.toLowerCase().includes(q)) score += 10;
      if (c.location && q.includes(c.location.toLowerCase())) score += 5;
      if (c.relationship && q.includes(c.relationship.toLowerCase())) score += 5;
      if (c.notes && c.notes.toLowerCase().split(' ').some(word => q.includes(word) && word.length > 3)) score += 3;
      
      return { contact: c, score };
    }).filter(m => m.score > 0);

    if (matches.length === 0) return null;
    
    matches.sort((a, b) => b.score - a.score);
    return matches[0].contact;
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact, importContacts, searchContacts, aiSearch }}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
};
