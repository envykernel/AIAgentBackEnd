import React, { useState } from 'react';
import ChatInputWithCounter from './ChatInputWithCounter';
import './ChatExample.css';

const ChatExample = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Ajouter le message utilisateur
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simuler un appel API
      const response = await simulateApiCall(messageText);
      
      // Ajouter la réponse de l'agent
      const agentMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'agent',
        timestamp: new Date(),
        sessionInfo: response
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'error',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateApiCall = async (message) => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Réponse simulée avec les nouvelles propriétés
    return {
      sessionId: "session_" + Math.random().toString(36).substr(2, 9),
      message: `Voici ma réponse à votre message : "${message}". Je suis l'agent IA de MultiAgentsBeta.`,
      role: "assistant",
      timestamp: new Date().toISOString(),
      tokenCount: Math.floor(Math.random() * 50) + 20,
      isNewSession: messages.length === 0,
      totalMessageCount: messages.length + 2,
      totalTokenCount: Math.floor(Math.random() * 500) + 100,
      maxTokens: 4000,
      remainingTokens: Math.floor(Math.random() * 3000) + 1000,
      tokenUsagePercentage: Math.random() * 30 + 5
    };
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageClass = (sender) => {
    switch (sender) {
      case 'user': return 'message user-message';
      case 'agent': return 'message agent-message';
      case 'error': return 'message error-message';
      default: return 'message';
    }
  };

  return (
    <div className="chat-example">
      <div className="chat-header">
        <h2>💬 Chat MultiAgentsBeta</h2>
        <p>Interface de démonstration avec compteur de caractères</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h3>Bienvenue !</h3>
            <p>Commencez une conversation avec l'agent IA</p>
            <p className="tip">💡 Le compteur de caractères s'affiche en temps réel</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={getMessageClass(message.sender)}>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
                
                {/* Affichage des informations de session pour les réponses de l'agent */}
                {message.sender === 'agent' && message.sessionInfo && (
                  <div className="session-info">
                    <div className="token-stats">
                      <span className="stat-item">
                        <strong>Messages:</strong> {message.sessionInfo.totalMessageCount}
                      </span>
                      <span className="stat-item">
                        <strong>Tokens:</strong> {message.sessionInfo.totalTokenCount}/{message.sessionInfo.maxTokens}
                      </span>
                      <span className="stat-item">
                        <strong>Reste:</strong> {message.sessionInfo.remainingTokens}
                      </span>
                    </div>
                    
                    <div className="token-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${message.sessionInfo.tokenUsagePercentage}%`,
                            backgroundColor: message.sessionInfo.tokenUsagePercentage > 70 ? '#ffc107' : '#28a745'
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {message.sessionInfo.tokenUsagePercentage.toFixed(1)}% utilisé
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message agent-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="typing-text">L'agent réfléchit...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-section">
        <ChatInputWithCounter
          onSendMessage={handleSendMessage}
          placeholder="Tapez votre message ici..."
          maxLength={500}
          showCounter={true}
          disabled={isLoading}
        />
        
        <div className="input-tips">
          <p>💡 <strong>Entrée</strong> pour envoyer • <strong>Shift+Entrée</strong> pour nouvelle ligne</p>
          <p>🎯 Le compteur change de couleur selon l'utilisation : <span className="color-success">Vert</span> → <span className="color-warning">Orange</span> → <span className="color-danger">Rouge</span></p>
        </div>
      </div>
    </div>
  );
};

export default ChatExample;

