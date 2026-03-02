'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert, Pill, Plus, X, Clock, History, Waves, Zap, Mountain, AlertTriangle } from 'lucide-react';
// IMPORT the new medication logic
import MedicationCard, { useMedication } from '@/components/Medication/MedicationCard';

export default function PanicButton() {
  const [status, setStatus] = useState('READY');
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  
  // NEW STATES FOR FORM, ALARMS, HISTORY & DISASTER
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDisaster, setShowDisaster] = useState(false);
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
          const speech = new SpeechSynthesisUtterance(`Attention. It is time to take your ${med.name}. Please check your screen.`);
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
    }, 30);
  };

  const cancelPress = () => {
    clearInterval(progressRef.current);
    setProgress(0);
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#001a33', minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'flex-start', color: 'white', overflowY: 'auto', 
        fontFamily: 'sans-serif', userSelect: 'none', paddingBottom: '100px' 
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: 'white', width: '100%', padding: '20px 0', textAlign: 'center', borderBottom: '8px solid #CC0000' }}>
        <h1 style={{ color: '#003366', fontSize: '40px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>UNTV</h1>
        <div style={{ backgroundColor: '#CC0000', color: 'white', padding: '2px 10px', display: 'inline-block', fontWeight: '900', fontSize: '10px' }}>NEWS & RESCUE</div>
      </div>

      {/* SOS Visual Section */}
      <div 
        onMouseDown={startPress} onMouseUp={cancelPress}
        onTouchStart={startPress} onTouchEnd={cancelPress}
        style={{ textAlign: 'center', padding: '40px 0', width: '100%', touchAction: 'none' }}
      >
        <div style={{ 
          width: '240px', height: '240px', borderRadius: '50%', margin: '0 auto', position: 'relative',
          border: '10px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ 
            position: 'absolute', inset: '-10px', borderRadius: '50%', 
            border: `10px solid ${status === 'SUCCESS' ? '#00FF00' : '#CC0000'}`,
            clipPath: `inset(${100 - progress}% 0 0 0)`, transition: '0.1s'
          }} />
          <ShieldAlert size={80} color={progress > 0 ? '#CC0000' : 'white'} />
        </div>
        
        <h2 style={{ marginTop: '20px', fontWeight: '900', fontStyle: 'italic' }}>
          {status === 'READY' ? (progress > 0 ? 'HOLDING...' : 'SQUEEZE SCREEN') : status}
        </h2>
        <p style={{ fontSize: '12px', opacity: 0.6 }}>ANYWHERE ON RING TO CALL FOR HELP</p>
      </div>

      {/* --- MEDICINE SECTION --- */}
      <div style={{ width: '100%', maxWidth: '450px', padding: '0 20px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={24} color="#10b981" />
            <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>DAILY HEALTH CHECK</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}
            >
              <History size={20} />
            </button>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              style={{ backgroundColor: showAdd ? '#ef4444' : '#10b981', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
            >
              {showAdd ? 'CLOSE' : '+ ADD'}
            </button>
          </div>
        </div>

        {/* HISTORY VIEW */}
        {showHistory && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#10b981', fontWeight: '900' }}>RECENT ACTIVITY LOG</h4>
            {meds.length === 0 ? <p style={{ fontSize: '12px', opacity: 0.5 }}>No history records.</p> : 
              meds.map(med => (
                <div key={`hist-${med.id}`} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>{med.name}</div>
                  {med.logs && med.logs.length > 0 ? (
                    med.logs.map((log, i) => (
                      <div key={i} style={{ fontSize: '11px', opacity: 0.7, paddingLeft: '10px', marginTop: '2px' }}>• Taken: {log}</div>
                    ))
                  ) : <div style={{ fontSize: '11px', opacity: 0.4, paddingLeft: '10px' }}>No doses recorded yet.</div>}
                </div>
              ))
            }
          </div>
        )}

        {/* ADD MEDICINE FORM */}
        {showAdd && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px', color: '#0f172a', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <input 
              placeholder="Medicine Name..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '15px', fontSize: '16px' }}
            />
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '800', fontSize: '12px', color: '#64748b' }}>ALARM TIME:</p>
              <input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '18px', fontWeight: 'bold' }}
              />
            </div>
            <p style={{ margin: '0 0 10px 0', fontWeight: '800', fontSize: '12px', color: '#64748b' }}>DOSAGE PER DAY:</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['1x', '2x', '3x', '4x'].map(f => (
                <button 
                  key={f}
                  onClick={() => setNewFreq(f)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: newFreq === f ? '#10b981' : '#f1f5f9', color: newFreq === f ? 'white' : '#64748b', fontWeight: '900' }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button 
              onClick={handleAddMed}
              style={{ width: '100%', backgroundColor: '#003366', color: 'white', padding: '16px', borderRadius: '12px', fontWeight: '900', border: 'none' }}
            >
              SAVE & SET ALARM
            </button>
          </div>
        )}
        
        {meds.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>No medications scheduled.</p>
        ) : (
          meds.map(med => (
            <MedicationCard key={med.id} med={med} onTake={recordDose} onRemove={removeMed} />
          ))
        )}
      </div>

      {/* --- DISASTER TRAY --- */}
      <div 
        onClick={() => setShowDisaster(!showDisaster)}
        style={{
          position: 'fixed', bottom: 0, width: '100%', maxWidth: '450px',
          backgroundColor: '#CC0000', borderRadius: '30px 30px 0 0',
          padding: '15px 20px', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: showDisaster ? 'translateY(0)' : 'translateY(calc(100% - 60px))',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)', zIndex: 100, cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle color="white" size={24} />
            <h3 style={{ margin: 0, fontWeight: '900', fontStyle: 'italic', fontSize: '16px' }}>DISASTER REPORTING</h3>
          </div>
          <span style={{ fontSize: '10px', backgroundColor: 'white', color: '#CC0000', padding: '2px 8px', borderRadius: '20px', fontWeight: '900' }}>
            CONSTRUCTION
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', opacity: showDisaster ? 1 : 0, transition: '0.3s' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '20px', border: '2px dashed rgba(255,255,255,0.4)', marginBottom: '5px' }}>
              <Waves size={30} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '900' }}>FLOOD</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '20px', border: '2px dashed rgba(255,255,255,0.4)', marginBottom: '5px' }}>
              <Zap size={30} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '900' }}>QUAKE</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '20px', border: '2px dashed rgba(255,255,255,0.4)', marginBottom: '5px' }}>
              <Mountain size={30} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '900' }}>LANDSLIDE</span>
          </div>
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px', fontWeight: 'bold', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>
          Coming Soon: NAR Disaster Dispatch
        </p>
      </div>

      <div style={{ padding: '20px', fontSize: '10px', letterSpacing: '2px' }}>TULONG MUNA BAGO BALITA</div>
    </div>
  );
}