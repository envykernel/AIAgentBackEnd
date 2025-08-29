import React, { useState, useRef, useEffect } from 'react';
import './ChatInputWithCounter.css';

const ChatInputWithCounter = ({ 
  onSendMessage, 
  placeholder = "Tapez votre message...",
  maxLength = 1000,
  showCounter = true,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);

  // Mettre à jour le compteur de caractères
  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      setIsTyping(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      
      // Reset la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleClearMessage = () => {
    setMessage('');
    setIsTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const getCharCountColor = () => {
    if (charCount === 0) return 'text-muted';
    if (charCount > maxLength * 0.9) return 'text-danger';
    if (charCount > maxLength * 0.7) return 'text-warning';
    return 'text-success';
  };

  const getCharCountClass = () => {
    if (charCount === 0) return 'char-counter empty';
    if (charCount > maxLength * 0.9) return 'char-counter danger';
    if (charCount > maxLength * 0.7) return 'char-counter warning';
    return 'char-counter success';
  };

  return (
    <div className="chat-input-container">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`chat-input ${disabled ? 'disabled' : ''}`}
          rows={1}
          maxLength={maxLength}
        />
        
        {/* Compteur de caractères */}
        {showCounter && (
          <div className={getCharCountClass()}>
            <span className="char-count">{charCount}</span>
            <span className="char-separator">/</span>
            <span className="char-max">{maxLength}</span>
          </div>
        )}
      </div>

      {/* Barre d'outils */}
      <div className="input-toolbar">
        <div className="toolbar-left">
          {/* Indicateur de frappe */}
          {isTyping && charCount > 0 && (
            <span className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          )}
        </div>

        <div className="toolbar-right">
          {/* Bouton d'effacement */}
          {charCount > 0 && (
            <button
              type="button"
              onClick={handleClearMessage}
              className="clear-btn"
              title="Effacer le message"
              disabled={disabled}
            >
              ✕
            </button>
          )}

          {/* Bouton d'envoi */}
          <button
            type="button"
            onClick={handleSendMessage}
            className={`send-btn ${!message.trim() || disabled ? 'disabled' : 'active'}`}
            disabled={!message.trim() || disabled}
            title="Envoyer le message (Entrée)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Barre de progression des caractères */}
      {showCounter && (
        <div className="char-progress-bar">
          <div 
            className={`progress-fill ${getCharCountColor()}`}
            style={{ width: `${(charCount / maxLength) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInputWithCounter;

