'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert } from 'lucide-react';

export default function PanicButton() {
  const [status, setStatus] = useState('READY');
  const timerRef = useRef(null);
  const isPressingRef = useRef(false);

  const triggerSOS = async () => {
    if (status !== 'READY') return;
    setStatus('SENDING');
    
    // Haptic feedback (Vibrate)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    const name = localStorage.getItem('user_name') || 'Unknown Member';
    const condition = localStorage.getItem('user_condition') || 'None';

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await supabase.from('emergency_alerts').insert([
        { 
          elder_name: name, 
          medical_condition: condition, 
          coordinates: `${latitude},${longitude}`, 
          status: 'PENDING' 
        }
      ]);
      
      setStatus('SUCCESS');
      
      // Voice Confirmation
      const speech = new SpeechSynthesisUtterance("Emergency alert sent. Help is on the way.");
      window.speechSynthesis.speak(speech);

      setTimeout(() => setStatus('READY'), 5000);
    }, (err) => {
      alert("Error: Please enable GPS Location to send alert.");
      setStatus('READY');
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Listen for Volume Up (175) or Volume Down (174)
      if (e.keyCode === 174 || e.keyCode === 175 || e.key === 'AudioVolumeUp' || e.key === 'AudioVolumeDown') {
        e.preventDefault(); 
        if (!isPressingRef.current) {
          isPressingRef.current = true;
          timerRef.current = setTimeout(triggerSOS, 3000);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.keyCode === 174 || e.keyCode === 175 || e.key === 'AudioVolumeUp' || e.key === 'AudioVolumeDown') {
        isPressingRef.current = false;
        clearTimeout(timerRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status]);

  const startPress = () => { timerRef.current = setTimeout(triggerSOS, 3000); };
  const cancelPress = () => { clearTimeout(timerRef.current); };

  return (
    <div style={{ backgroundColor: '#001a33', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', color: 'white', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* Branding Header */}
      <div style={{ backgroundColor: 'white', width: '100%', paddingTop: '30px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '8px solid #CC0000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: '#003366', fontSize: '60px', fontWeight: '900', fontStyle: 'italic', margin: 0, lineHeight: '0.8' }}>UNTV</h1>
        <div style={{ backgroundColor: '#CC0000', color: 'white', padding: '4px 15px', marginTop: '10px', fontWeight: '900', fontSize: '12px', letterSpacing: '3px' }}>NEWS & RESCUE</div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-1px', margin: 0 }}>BUTUAN LOCALE</h2>
        <div style={{ height: '3px', backgroundColor: '#CC0000', width: '60px', margin: '8px auto' }}></div>
      </div>

      {/* The Squeeze Button */}
      <div style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', inset: '-40px', borderRadius: '50%', filter: 'blur(40px)', opacity: '0.4',
          backgroundColor: status === 'READY' ? '#CC0000' : '#003366',
          transition: '0.5s'
        }} />
        <button
          onMouseDown={startPress} onMouseUp={cancelPress}
          onTouchStart={startPress} onTouchEnd={cancelPress}
          style={{
            position: 'relative', width: '260px', height: '260px', borderRadius: '50%', cursor: 'pointer',
            border: status === 'READY' ? '12px solid #8b0000' : '12px solid #001a33',
            backgroundColor: status === 'READY' ? '#CC0000' : (status === 'SENDING' ? '#003366' : '#008000'),
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)', transition: 'all 0.2s'
          }}
        >
          <ShieldAlert color="white" size={80} strokeWidth={3} />
          <span style={{ color: 'white', fontSize: '22px', fontWeight: '900', fontStyle: 'italic' }}>
            {status === 'READY' ? 'HOLD 3 SEC' : status === 'SENDING' ? 'SENDING...' : 'SENT!'}
          </span>
        </button>
      </div>

      {/* Instructional Footer */}
      <div style={{ backgroundColor: '#003366', width: '100%', padding: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          HOLD VOLUME KEY OR RED BUTTON
        </p>
      </div>
    </div>
  );
}