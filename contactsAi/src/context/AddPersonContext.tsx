import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Contact } from '../data/contacts';

type AddPersonData = Partial<Omit<Contact, 'id' | 'hasDetails' | 'imported'>>;

interface AddPersonContextType {
  data: AddPersonData;
  updateData: (updates: Partial<AddPersonData>) => void;
  reset: () => void;
}

const AddPersonContext = createContext<AddPersonContextType | undefined>(undefined);

export const AddPersonProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AddPersonData>({});

  const updateData = (updates: Partial<AddPersonData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const reset = () => setData({});

  return (
    <AddPersonContext.Provider value={{ data, updateData, reset }}>
      {children}
    </AddPersonContext.Provider>
  );
};

export const useAddPerson = () => {
  const context = useContext(AddPersonContext);
  if (!context) throw new Error('useAddPerson must be used within AddPersonProvider');
  return context;
};
