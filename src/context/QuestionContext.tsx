'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Question {
  question: string;
  options?: string[];
}

interface QuestionContextType {
  currentQuestions: Question[];
  setQuestions: (q: Question[]) => void;
  previousSets: Question[][];
  customText: string;
  setCustomText: (text: string) => void;
  addToHistory: (q: Question[]) => void;
}

const LOCAL_KEYS = {
  current: 'question_current',
  previous: 'question_previous',
  custom: 'question_custom_text',
};

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const QuestionProvider = ({ children }: { children: ReactNode }) => {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [previousSets, setPreviousSets] = useState<Question[][]>([]);
  const [customText, setCustomText] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const storedCurrent = localStorage.getItem(LOCAL_KEYS.current);
    const storedPrevious = localStorage.getItem(LOCAL_KEYS.previous);
    const storedCustom = localStorage.getItem(LOCAL_KEYS.custom);

    if (storedCurrent) setCurrentQuestions(JSON.parse(storedCurrent));
    if (storedPrevious) setPreviousSets(JSON.parse(storedPrevious));
    if (storedCustom) setCustomText(storedCustom);
  }, []);

  // Save to localStorage when any state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.current, JSON.stringify(currentQuestions));
  }, [currentQuestions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.previous, JSON.stringify(previousSets));
  }, [previousSets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.custom, customText);
  }, [customText]);

  const setQuestions = (newQuestions: Question[]) => {
    if (currentQuestions.length > 0) {
      setPreviousSets((prev) => {
        const updated = [currentQuestions, ...prev];
        return updated.slice(0, 5); // Limit to last 5 sets
      });
    }
    setCurrentQuestions(newQuestions);
  };

  const addToHistory = (q: Question[]) => {
    setPreviousSets((prev) => {
      const updated = [q, ...prev];
      return updated.slice(0, 5); // Limit to last 5 sets
    });
  };

  return (
    <QuestionContext.Provider
      value={{
        currentQuestions,
        setQuestions,
        previousSets,
        customText,
        setCustomText,
        addToHistory,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (!context) throw new Error('useQuestionContext must be used within a QuestionProvider');
  return context;
};
