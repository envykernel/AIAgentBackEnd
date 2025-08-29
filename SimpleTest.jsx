import React from 'react';
import ChatInputWithCounter from './ChatInputWithCounter';
import './ChatInputWithCounter.css';

const SimpleTest = () => {
  const handleSend = (message) => {
    alert(`Message envoyé: "${message}"`);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🧪 Test Simple du Compteur
      </h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h3>Instructions :</h3>
        <ul>
          <li>✅ Tapez dans l'input ci-dessous</li>
          <li>✅ Le compteur doit être visible à droite</li>
          <li>✅ Format : [nombre/maximum]</li>
          <li>✅ Couleurs : Vert → Orange → Rouge</li>
        </ul>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <ChatInputWithCounter
          onSendMessage={handleSend}
          placeholder="Tapez ici pour voir le compteur..."
          maxLength={100}
          showCounter={true}
        />
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e3f2fd', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>💡 Ce que vous devriez voir :</strong>
        <ul style={{ margin: '10px 0 0 20px' }}>
          <li>Un input de texte à gauche</li>
          <li>Un compteur à droite avec format [0/100]</li>
          <li>Le compteur change de couleur selon l'utilisation</li>
          <li>Une barre de progression sous l'input</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleTest;

