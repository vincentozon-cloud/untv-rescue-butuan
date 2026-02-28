'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Registration() {
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const router = useRouter();

  const handleSetup = (e) => {
    e.preventDefault();
    if (!name) return alert("Please enter your name");
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_condition', condition || 'None');
    router.push('/panic'); // Adjust this to your panic button route name
  };

  return (
    <div style={{ backgroundColor: '#001a33', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Branding Header */}
      <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '20px 20px 0 0', padding: '30px 20px', textAlign: 'center', borderBottom: '8px solid #CC0000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: '#003366', fontSize: '50px', fontWeight: '900', fontStyle: 'italic', margin: 0, lineHeight: '0.8' }}>UNTV</h1>
        <div style={{ backgroundColor: '#CC0000', color: 'white', display: 'inline-block', padding: '4px 12px', marginTop: '10px', fontWeight: '900', fontSize: '11px', letterSpacing: '2px' }}>NEWS & RESCUE</div>
        <p style={{ color: '#003366', fontWeight: '800', fontStyle: 'italic', marginTop: '15px', fontSize: '14px', textTransform: 'uppercase' }}>Butuan Locale - Rescue Project</p>
      </div>

      {/* Registration Form */}
      <div style={{ backgroundColor: '#003366', width: '100%', maxWidth: '400px', borderRadius: '0 0 20px 20px', padding: '40px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ color: 'white', fontWeight: '900', fontStyle: 'italic', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>FULL NAME</label>
            <input 
              required
              placeholder="e.g., Bro. Michael Ozon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', outline: 'none', borderBottom: '2px solid #CC0000' }}
            />
          </div>

          <div>
            <label style={{ color: 'white', fontWeight: '900', fontStyle: 'italic', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>MEDICAL CONDITION (OPTIONAL)</label>
            <input 
              placeholder="e.g., Hypertension, Diabetes"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', outline: 'none', borderBottom: '2px solid #CC0000' }}
            />
          </div>

          <button 
            type="submit"
            style={{ marginTop: '10px', backgroundColor: '#CC0000', color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900', fontStyle: 'italic', fontSize: '16px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(204, 0, 0, 0.3)' }}
          >
            COMPLETE SETUP
          </button>
        </form>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '30px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>TULONG MUNA BAGO BALITA</p>
    </div>
  );
}