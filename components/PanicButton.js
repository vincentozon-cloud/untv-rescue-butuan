'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert, Pill, Plus, X } from 'lucide-react';
// IMPORT the medication logic
import MedicationCard, { useMedication } from '@/components/Medication/MedicationCard';

export default function PanicButton() {
  const [status, setStatus] = useState('READY');
  const timerRef = useRef(null);
  
  // NEW STATES FOR FORM & ALARMS
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState('1x');
  const [newTime, setNewTime] = useState('08:00');

  // INITIALIZE medication hook
  const { meds, recordDose, addMed, removeMed } = useMedication();

  // --- BACKGROUND ALARM CHECKER ---
  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toDateString();

      meds.forEach(med => {
        if (med.reminderTime === currentTime && med.lastTaken !== today) {
          const speech = new SpeechSynthesisUtterance(`Reminder: It is time to take your ${med.name}.`);
          speech.rate = 0.9;
          window.speechSynthesis.speak(speech);
          if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        }
      });
    }, 60000);
    return () => clearInterval(checkAlarms);
  }, [meds]);

  const handleAddMed = () => {
    if (newName.trim()) {
      addMed(newName, "Standard Dose", newFreq, newTime);
      setNewName('');
      setShowAdd(false);
    }
  };

  const triggerSOS = async () => {
    setStatus('SENDING');
    const name = localStorage.getItem('user_name') || 'Unknown';
    const condition = localStorage.getItem('user_condition') || 'N/A';

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await supabase.from('emergency_alerts').insert([
        { elder_name: name, medical_condition: condition, coordinates: `${latitude},${longitude}`, status: 'PENDING' }
      ]);
      setStatus('SUCCESS');
      const speech = new SpeechSynthesisUtterance("Alert sent to Butuan Rescue.");
      window.speechSynthesis.speak(speech);
      setTimeout(() => setStatus('READY'), 5000);
    });
  };

  const startPress = () => { timerRef.current = setTimeout(triggerSOS, 3000); };
  const cancelPress = () => { clearTimeout(timerRef.current); };

  return (
    <div style={{ backgroundColor: '#001a33', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', color: 'white', overflowY: 'auto' }}>
      
      {/* Top Banner */}
      <div style={{ backgroundColor: 'white', width: '100%', paddingTop: '30px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '8px solid #CC0000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: '#003366', fontSize: '60px', fontWeight: '900', fontStyle: 'italic', margin: 0, lineHeight: '0.8' }}>UNTV</h1>
        <div style={{ backgroundColor: '#CC0000', color: 'white', padding: '4px 15px', marginTop: '10px', fontWeight: '900', fontSize: '12px', letterSpacing: '3px' }}>NEWS & RESCUE</div>
      </div>

      {/* Locale Label */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-1px', margin: 0 }}>BUTUAN LOCALE</h2>
        <div style={{ height: '3px', backgroundColor: '#CC0000', width: '60px', margin: '8px auto' }}></div>
      </div>

      {/* SOS Button Container */}
      <div style={{ position: 'relative', margin: '40px 0' }}>
        <div style={{ 
          position: 'absolute', inset: '-40px', borderRadius: '50%', filter: 'blur(40px)', opacity: '0.4',
          backgroundColor: status === 'READY' ? '#CC0000' : '#003366',
          animation: 'pulse 2s infinite'
        }} />
        <button
          onMouseDown={startPress} onMouseUp={cancelPress}
          onTouchStart={startPress} onTouchEnd={cancelPress}
          style={{
            position: 'relative', width: '220px', height: '220px', borderRadius: '50%', cursor: 'pointer',
            border: status === 'READY' ? '12px solid #8b0000' : '12px solid #001a33',
            backgroundColor: status === 'READY' ? '#CC0000' : (status === 'SENDING' ? '#003366' : '#008000'),
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)', transition: 'all 0.2s'
          }}
        >
          <ShieldAlert color="white" size={60} strokeWidth={3} />
          <span style={{ color: 'white', fontSize: '18px', fontWeight: '900', fontStyle: 'italic' }}>
            {status === 'READY' ? 'HOLD 3 SEC' : status === 'SENDING' ? 'SENDING...' : 'SENT!'}
          </span>
        </button>
      </div>

      {/* UPGRADED: HEALTH CHECK SECTION */}
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={24} color="#10b981" />
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>DAILY HEALTH CHECK</h3>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            style={{ backgroundColor: showAdd ? '#ef4444' : '#10b981', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
          >
            {showAdd ? 'CLOSE' : '+ ADD'}
          </button>
        </div>

        {/* ADD MEDICINE FORM */}
        {showAdd && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px', color: '#0f172a', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <input 
              placeholder="Medicine Name..." 
              value={newName} onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0', marginBottom: '12px', fontSize: '16px' }}
            />
            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: '800', fontSize: '12px', color: '#64748b' }}>ALARM TIME:</p>
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '16px', fontWeight: 'bold' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              {['1x', '2x', '3x', '4x'].map(f => (
                <button key={f} onClick={() => setNewFreq(f)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: newFreq === f ? '#10b981' : '#f1f5f9', color: newFreq === f ? 'white' : '#64748b', fontWeight: '900' }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={handleAddMed}
              style={{ width: '100%', backgroundColor: '#003366', color: 'white', padding: '15px', borderRadius: '12px', fontWeight: '900', border: 'none' }}
            >
              SAVE MEDICINE
            </button>
          </div>
        )}
        
        {meds.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic' }}>No medications added.</p>
        ) : (
          meds.map(med => (
            <MedicationCard key={med.id} med={med} onTake={recordDose} onRemove={removeMed} />
          ))
        )}
      </div>

      {/* Footer Instructions */}
      <div style={{ backgroundColor: '#003366', width: '100%', padding: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          TULONG MUNA BAGO BALITA
        </p>
      </div>
    </div>
  );
}