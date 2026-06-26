/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { sendChatMessage } from '../services/chatService';
import { CHAT_STORAGE_KEY } from '../types/chat';

const ChatContext = createContext(null);
const MAX_PERSISTED_MESSAGES = 80;
const HISTORY_WINDOW = 12;

const pageDescriptions = {
  '/': ['Landing page', 'The public homepage with product overview, pricing, FAQ, and resume upload entry points.'],
  '/login': ['Login', 'Authentication page for signing in or creating an account.'],
  '/dashboard': ['Dashboard', 'User dashboard overview with resume health, uploads, insights, and actions.'],
  '/dashboard/profile': ['Profile', 'Profile editor for career and account information.'],
  '/dashboard/plans': ['Plans', 'Subscription and resume analysis credits page.'],
  '/dashboard/studio': ['Resume Analysis', 'Resume studio for upload, OCR, AI analysis, ATS feedback, and resume optimization.'],
  '/dashboard/jobs': ['Jobs', 'Job matching and career opportunity exploration page.']
};

const createMessage = (role, content, extra = {}) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
  ...extra
});

const readStoredMessages = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((message) => message?.role && typeof message.content === 'string') : [];
  } catch {
    return [];
  }
};

export const ChatProvider = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState(readStoredMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_PERSISTED_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const pageContext = useMemo(() => {
    const [title, description] = pageDescriptions[location.pathname] || ['ResumeZen', `Current route: ${location.pathname}`];
    return { title, description, pathname: location.pathname };
  }, [location.pathname]);

  const sendMessage = useCallback(async (content, options = {}) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setError('');

    const userMessage = options.skipUserMessage ? null : createMessage('user', trimmed);
    const loadingMessage = createMessage('assistant', '', { pending: true, originalPrompt: trimmed });
    const nextMessages = options.replaceMessageId
      ? messages.filter((message) => message.id !== options.replaceMessageId).map((message) => ({ ...message, error: false }))
      : [...messages, userMessage];

    setMessages([...nextMessages, loadingMessage]);
    setIsLoading(true);

    try {
      const history = nextMessages.slice(-HISTORY_WINDOW).map(({ role, content }) => ({ role, content }));
      const response = await sendChatMessage({ message: trimmed, history, pageContext, signal: abortController.signal });
      const reply = response?.data?.message || 'I could not generate a response.';
      setMessages((current) => current.map((message) => (
        message.id === loadingMessage.id ? { ...message, content: reply, model: response?.data?.model, pending: false } : message
      )));
      if (!isOpen) setUnreadCount((count) => count + 1);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setMessages((current) => current.filter((message) => message.id !== loadingMessage.id));
        return;
      }

      const message = err.response?.data?.message || 'The assistant is unavailable right now.';
      setError(message);
      setMessages((current) => current.map((item) => (
        item.id === loadingMessage.id ? { ...item, content: message, error: true, pending: false, originalPrompt: trimmed } : item
      )));
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  }, [isLoading, isOpen, messages, pageContext]);

  const retryMessage = useCallback((message) => {
    const prompt = message.originalPrompt || message.content;
    sendMessage(prompt, { skipUserMessage: true, replaceMessageId: message.id });
  }, [sendMessage]);

  const regenerateLastResponse = useCallback(() => {
    const lastAssistantIndex = [...messages].map((message) => message.role).lastIndexOf('assistant');
    if (lastAssistantIndex === -1) return;
    const previousUser = [...messages.slice(0, lastAssistantIndex)].reverse().find((message) => message.role === 'user');
    if (!previousUser) return;
    sendMessage(previousUser.content, { skipUserMessage: true, replaceMessageId: messages[lastAssistantIndex].id });
  }, [messages, sendMessage]);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError('');
  }, []);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({
    isOpen,
    setIsOpen,
    unreadCount,
    messages,
    isLoading,
    error,
    pageContext,
    sendMessage,
    retryMessage,
    regenerateLastResponse,
    clearChat,
    stopGeneration
  }), [isOpen, unreadCount, messages, isLoading, error, pageContext, sendMessage, retryMessage, regenerateLastResponse, clearChat, stopGeneration]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
