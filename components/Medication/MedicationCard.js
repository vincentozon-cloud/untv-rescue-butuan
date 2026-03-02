import { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, Clock } from 'lucide-react';

export const useMedication = () => {
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('butuan_elder_meds');
    if (saved) {
      setMeds(JSON.parse(saved));
    }
  }, []);

  const addMed = (name, dosage, frequency, reminderTime) => {
    const newMed = {
      id: Date.now(),
      name,
      dosage,
      frequency, 
      reminderTime,
      lastTaken: null,
      logs: [] // Initialize empty logs array
    };
    const updated = [...meds, newMed];
    setMeds(updated);
    localStorage.setItem('butuan_elder_meds', JSON.stringify(updated));
  };

  const removeMed = (id) => {
    const updated = meds.filter(m => m.id !== id);
    setMeds(updated);
    localStorage.setItem('butuan_elder_meds', JSON.stringify(updated));
  };

  const recordDose = (medId) => {
    const now = new Date();
    const today = now.toDateString();
    const timestamp = now.toLocaleString('en-PH', { 
      hour: '2-digit', 
      minute: '2-digit', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const updatedMeds = meds.map(m => {
      if (m.id === medId) {
        // Add new timestamp and keep only the last 10 entries to save space
        const currentLogs = m.logs || [];
        const updatedLogs = [timestamp, ...currentLogs].slice(0, 10);
        
        return { 
          ...m, 
          lastTaken: today, 
          logs: updatedLogs 
        };
      }
      return m;
    });
    
    setMeds(updatedMeds);
    localStorage.setItem('butuan_elder_meds', JSON.stringify(updatedMeds));
  };

  return { meds, addMed, removeMed, recordDose };
};

export default function MedicationCard({ med, onTake, onRemove }) {
  const isAlreadyTaken = med.lastTaken === new Date().toDateString();

  return (
    <div style={{
      backgroundColor: isAlreadyTaken ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      borderRadius: '24px', padding: '20px', marginBottom: '16px',
      border: isAlreadyTaken ? '2px solid rgba(255,255,255,0.1)' : '4px solid #10b981',
      boxShadow: isAlreadyTaken ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.2)',
      position: 'relative',
      transition: 'all 0.3s ease'
    }}>
      {/* Delete Button */}
      <button 
        onClick={() => onRemove(med.id)} 
        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
      >
        <Trash2 size={18} />
      </button>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ backgroundColor: isAlreadyTaken ? '#475569' : '#10b981', padding: '12px', borderRadius: '16px' }}>
          <Pill size={24} color="white" />
        </div>
        <div>
          <h3 style={{ color: isAlreadyTaken ? '#94a3b8' : '#0f172a', fontSize: '20px', fontWeight: '900', margin: 0 }}>
            {med.name}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
             <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '14px' }}>💊 {med.dosage}</span>
             <span style={{ color: '#10b981', fontWeight: '900', fontSize: '13px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                ⏱ {med.frequency}
             </span>
             {med.reminderTime && (
               <span style={{ color: '#003366', fontWeight: '900', fontSize: '13px', backgroundColor: 'rgba(0, 51, 102, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                 🔔 {med.reminderTime}
               </span>
             )}
          </div>
        </div>
      </div>

      {isAlreadyTaken ? (
        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '15px', color: '#10b981', fontWeight: '900', fontSize: '14px' }}>
          ✅ DONE FOR TODAY
        </div>
      ) : (
        <button 
          onClick={() => onTake(med.id)} 
          style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '15px', padding: '16px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
        >
          I TOOK THIS NOW
        </button>
      )}
    </div>
  );
}