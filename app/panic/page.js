'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert } from 'lucide-react';

export default function PanicButton() {
  const [status, setStatus] = useState('READY');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const triggerSOS = async () => {
    if (status !== 'READY') return;
    setStatus('SENDING');
    setProgress(0);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([500, 200, 500]);
    }

    const name = localStorage.getItem('user_name') || 'Unknown Member';
    const condition = localStorage.getItem('user_condition') || 'None';

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await supabase.from('emergency_alerts').insert([
        { elder_name: name, medical_condition: condition, coordinates: `${latitude},${longitude}`, status: 'PENDING' }
      ]);
      
      setStatus('SUCCESS');
      const speech = new SpeechSynthesisUtterance("Alert sent to Butuan Rescue.");
      window.speechSynthesis.speak(speech);
      setTimeout(() => setStatus('READY'), 5000);
    }, (err) => {
      alert("Enable GPS to send alert.");
      setStatus('READY');
    });
  };

  const startPress = () => {
    if (status !== 'READY') return;
    let val = 0;
    progressRef.current = setInterval(() => {
      val += 2;
      setProgress(val);
      if (val >= 100) {
        clearInterval(progressRef.current);
        triggerSOS();
      }
    }, 30); // 3 seconds total
  };

  const cancelPress = () => {
    clearInterval(progressRef.current);
    setProgress(0);
  };

  return (
    <div 
      onMouseDown={startPress} onMouseUp={cancelPress}
      onTouchStart={startPress} onTouchEnd={cancelPress}
      style={{ 
        backgroundColor: '#001a33', minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'space-between', color: 'white', overflow: 'hidden', 
        fontFamily: 'sans-serif', userSelect: 'none', touchAction: 'none' 
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: 'white', width: '100%', padding: '20px 0', textAlign: 'center', borderBottom: '8px solid #CC0000' }}>
        <h1 style={{ color: '#003366', fontSize: '40px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>UNTV</h1>
        <div style={{ backgroundColor: '#CC0000', color: 'white', padding: '2px 10px', display: 'inline-block', fontWeight: '900', fontSize: '10px' }}>NEWS & RESCUE</div>
      </div>

      {/* Full Screen Visual Feedback */}
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
        <div style={{ 
          width: '280px', height: '280px', borderRadius: '50%', margin: '0 auto', position: 'relative',
          border: '10px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Progress Ring */}
          <div style={{ 
            position: 'absolute', inset: '-10px', borderRadius: '50%', 
            border: `10px solid ${status === 'SUCCESS' ? '#00FF00' : '#CC0000'}`,
            clipPath: `inset(${100 - progress}% 0 0 0)`, transition: '0.1s'
          }} />
          
          <ShieldAlert size={100} color={progress > 0 ? '#CC0000' : 'white'} />
        </div>
        
        <h2 style={{ marginTop: '30px', fontWeight: '900', fontStyle: 'italic' }}>
          {status === 'READY' ? (progress > 0 ? 'HOLDING...' : 'SQUEEZE SCREEN') : status}
        </h2>
        <p style={{ fontSize: '12px', opacity: 0.6 }}>ANYWHERE ON SCREEN TO CALL FOR HELP</p>
      </div>

      <div style={{ padding: '20px', fontSize: '10px', letterSpacing: '2px' }}>TULONG MUNA BAGO BALITA</div>
    </div>
  );
}