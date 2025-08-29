import React from 'react';
import ChatInputWithCounter from './ChatInputWithCounter';
import './ChatInputWithCounter.css';

const TestCounter = () => {
  const handleSendMessage = (message) => {
    console.log('Message envoyé:', message);
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
        🧪 Test du Compteur de Caractères
      </h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h3>Instructions de test :</h3>
        <ul>
          <li>✅ Tapez dans l'input ci-dessous</li>
          <li>✅ Le compteur doit s'afficher à droite de l'input</li>
          <li>✅ Le compteur change de couleur selon l'utilisation</li>
          <li>✅ Testez avec différentes longueurs de texte</li>
        </ul>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>
          Test du composant ChatInputWithCounter
        </h3>
        
        <ChatInputWithCounter
          onSendMessage={handleSendMessage}
          placeholder="Tapez ici pour voir le compteur..."
          maxLength={200}
          showCounter={true}
        />
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e3f2fd', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>💡 Conseils de test :</strong>
          <ul style={{ margin: '10px 0 0 20px' }}>
            <li>Le compteur doit être visible à droite de l'input</li>
            <li>Format : [nombre_actuel/maximum]</li>
            <li>Couleurs : Vert (normal) → Orange (attention) → Rouge (danger)</li>
            <li>Appuyez sur Entrée pour envoyer le message</li>
          </ul>
        </div>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <strong>🔍 Si le compteur n'est pas visible :</strong>
        <ul style={{ margin: '10px 0 0 20px' }}>
          <li>Vérifiez que le CSS est bien importé</li>
          <li>Vérifiez que showCounter={true}</li>
          <li>Ouvrez la console du navigateur pour les erreurs</li>
          <li>Vérifiez que tous les fichiers sont dans le bon dossier</li>
        </ul>
      </div>
    </div>
  );
};

export default TestCounter;

