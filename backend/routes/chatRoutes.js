const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { generateChatResponse } = require('../services/aiAnalysisService');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many chat requests. Please slow down and try again shortly.' }
});

const optionalAuth = (req, _res, next) => {
  const token = req.header('x-auth-token');
  if (!token || !process.env.JWT_SECRET) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, firebaseUid: decoded.firebaseUid || decoded.firebaseUID };
  } catch (error) {
    console.warn('[chat] Ignoring invalid optional auth token:', error.message);
  }

  return next();
};

const sanitizeMessages = (messages = []) => messages
  .filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
  .slice(-12)
  .map((message) => ({ role: message.role, content: message.content.slice(0, 4000) }));

router.post('/message', chatLimiter, optionalAuth, async (req, res) => {
  try {
    const { message, history = [], pageContext = {} } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'A chat message is required.' });
    }

    if (message.length > 4000) {
      return res.status(413).json({ success: false, message: 'Message is too long. Please keep it under 4,000 characters.' });
    }

    const result = await generateChatResponse({
      message: message.trim(),
      history: sanitizeMessages(history),
      pageContext: {
        title: typeof pageContext.title === 'string' ? pageContext.title.slice(0, 120) : 'ResumeZen',
        pathname: typeof pageContext.pathname === 'string' ? pageContext.pathname.slice(0, 200) : '/',
        description: typeof pageContext.description === 'string' ? pageContext.description.slice(0, 500) : ''
      },
      userContext: req.user ? { userId: req.user.userId, isAuthenticated: true } : { isAuthenticated: false }
    });

    if (!result.success) {
      return res.status(502).json({ success: false, message: result.error || 'AI assistant failed to respond.' });
    }

    return res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('[chat] Failed to generate response:', error);
    return res.status(500).json({ success: false, message: 'Unable to reach the AI assistant right now.' });
  }
});

module.exports = router;
