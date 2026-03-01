'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, Clock, User, Activity, CheckCircle, Trash2, VolumeX } from 'lucide-react';

export default function ServantDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [view, setView] = useState('active');
  const audioRef = useRef(null);

  const fetchAlerts = async () => {
    const { data } = await supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false });
    setAlerts(data || []);
  };

  useEffect(() => {
    fetchAlerts();
    const channel = supabase.channel('untv-realtime').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, 
      (p) => { 
        setAlerts(c => [p.new, ...c]); 
        // TRIGGER SIREN
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Playback blocked until user interacts with page"));
        }
      }
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const resolveAlert = async (id) => {
    const { error } = await supabase.from('emergency_alerts').update({ status: 'RESOLVED' }).eq('id', id);
    if (!error) fetchAlerts();
  };

  const deleteAlert = async (id) => {
    if (confirm("Are you sure you want to delete this alert permanentlly?")) {
      const { error } = await supabase.from('emergency_alerts').delete().eq('id', id);
      if (!error) setAlerts(current => current.filter(a => a.id !== id));
    }
  };

  // NEW: Bulk Delete Function
  const deleteAllInView = async () => {
    const statusToClear = view === 'active' ? 'PENDING' : 'RESOLVED';
    const confirmMsg = `Are you sure you want to PERMANENTLY delete ALL ${view} alerts? This cannot be undone.`;
    
    if (confirm(confirmMsg)) {
      const { error } = await supabase
        .from('emergency_alerts')
        .delete()
        .eq('status', statusToClear);

      if (!error) {
        // Update local state to remove deleted items
        setAlerts(current => current.filter(a => 
          view === 'active' ? a.status === 'RESOLVED' : a.status !== 'RESOLVED'
        ));
      } else {
        alert("Error clearing database. Please check connection.");
      }
    }
  };

  const stopSiren = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const filtered = alerts.filter(a => view === 'active' ? a.status !== 'RESOLVED' : a.status === 'RESOLVED');

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src="/siren.mp3" loop />

      <header style={{ backgroundColor: 'white', borderBottom: '10px solid #CC0000', boxShadow: '0 4px 25px rgba(0,0,0,0.15)', padding: '20px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <h1 style={{ color: '#003366', fontSize: '50px', fontWeight: '950', fontStyle: 'italic', margin: 0, lineHeight: '0.8' }}>UNTV</h1>
              <div style={{ backgroundColor: '#CC0000', color: 'white', display: 'inline-block', padding: '3px 10px', fontSize: '12px', fontWeight: '900', marginTop: '6px' }}>NEWS & RESCUE</div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Silence Button */}
              <button onClick={stopSiren} style={{ backgroundColor: '#ef444415', color: '#ef4444', border: '2px solid #ef4444', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <VolumeX size={18} /> SILENCE
              </button>
              
              {/* NEW: Clear All Button */}
              <button onClick={deleteAllInView} style={{ backgroundColor: '#CC0000', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={18} /> CLEAR {view.toUpperCase()}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#003366', borderRadius: '15px', padding: '6px shadow-xl' }}>
            <button onClick={() => setView('active')} style={{ backgroundColor: view === 'active' ? '#CC0000' : 'transparent', color: 'white', border: 'none', padding: '12px 30px', fontWeight: '900', fontStyle: 'italic', cursor: 'pointer', borderRadius: '10px', transition: '0.3s' }}>ACTIVE FEED</button>
            <button onClick={() => setView('history')} style={{ backgroundColor: view === 'history' ? '#CC0000' : 'transparent', color: 'white', border: 'none', padding: '12px 30px', fontWeight: '900', fontStyle: 'italic', cursor: 'pointer', borderRadius: '10px', transition: '0.3s' }}>RESCUE HISTORY</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        {filtered.map((alert) => (
          <div key={alert.id} style={{ backgroundColor: 'white', border: '2px solid #e2e8f0', borderRadius: '30px', marginBottom: '25px', display: 'flex', overflow: 'hidden', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.1)', borderLeft: `12px solid ${view === 'active' ? '#CC0000' : '#64748b'}` }}>
            <div style={{ flex: 1, padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '20px' }}><User color="#003366" size={40} /></div>
                <div>
                  <h2 style={{ color: '#003366', fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0, textTransform: 'uppercase' }}>{alert.elder_name}</h2>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
                    <span style={{ backgroundColor: '#00336610', color: '#003366', padding: '5px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '13px' }}>🚑 {alert.medical_condition}</span>
                    <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '13px' }}>🕒 {new Date(alert.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${alert.coordinates}`} target="_blank" style={{ backgroundColor: '#003366', color: 'white', padding: '18px 25px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18}/> GPS</a>
                {view === 'active' && (
                  <button onClick={() => resolveAlert(alert.id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '18px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18}/> SAFE</button>
                )}
                <button onClick={() => deleteAlert(alert.id)} style={{ backgroundColor: '#ef444415', color: '#ef4444', border: '2px solid #ef4444', padding: '18px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete Record"><Trash2 size={20}/></button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#CC0000', color: 'white', padding: '12px 0', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', fontSize: '14px', borderTop: '4px solid white' }}>
        <marquee scrollamount="10">TULONG MUNA BAGO BALITA • BUTUAN LOCALE RESCUE COMMAND • REAL-TIME DISPATCH ACTIVE • TO GOD BE THE GLORY •</marquee>
      </div>
    </div>
  );
}