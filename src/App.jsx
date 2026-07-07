import React, { useState } from 'react';

export default function App() {
  const [formType] = useState(null);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ color: '#667eea', textAlign: 'center', marginBottom: '10px' }}>📋 Dashboard - Seguimiento de Respuestas</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>✅ App desplegada correctamente</p>

        <div style={{ background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: '8px', padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>✅ Estado: Funcionando</h2>
          <p style={{ color: '#666' }}>La aplicación está corriendo correctamente en <strong>localhost:5173</strong></p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            <strong>Próximo paso:</strong> Desplegar en Vercel y obtener URL pública para compartir formularios.
          </p>
        </div>

        <div style={{ background: '#f9f9f9', border: '2px dashed #667eea', borderRadius: '8px', padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>🔗 Links para Compartir (Una vez en Vercel)</h2>
          
          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Erick Troncoso (IT)</strong></span>
            <code style={{ background: '#ecf0f1', padding: '10px', borderRadius: '4px', fontSize: '0.9em' }}>
              https://tu-url.vercel.app?form=IT&respondente=Erick%20Troncoso
            </code>
          </div>

          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Jerónimo Silva (Gerencia)</strong></span>
            <code style={{ background: '#ecf0f1', padding: '10px', borderRadius: '4px', fontSize: '0.9em' }}>
              https://tu-url.vercel.app?form=Gerencia&respondente=Jer%C3%B3nimo%20Silva
            </code>
          </div>

          <div style={{ background: 'white', padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Dashboard Admin (Para ti)</strong></span>
            <code style={{ background: '#ecf0f1', padding: '10px', borderRadius: '4px', fontSize: '0.9em' }}>
              https://tu-url.vercel.app
            </code>
          </div>
        </div>

        <div style={{ background: '#fff3e0', border: '2px solid #ff9800', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: '#e65100' }}>⚠️ Nota: App Local vs Vercel</h3>
          <p style={{ color: '#666' }}>
            Actualmente estamos en <strong>localhost</strong>. Para que Erick y Jerónimo accedan, necesitamos desplegar en Vercel (gratuito).
          </p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            <strong>Instrucciones:</strong> Ve a /outputs/03_GUIA_INSTALACION_Completa.html → Paso 2
          </p>
        </div>
      </div>
    </div>
  );
}