import { useState } from 'react';

export default function Registration({ onComplete }) {
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');

  const handleSave = () => {
    if (!name) return alert("Please enter a name");
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_condition', condition);
    onComplete(); // Tells the main app we are done
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Elderly Registration</h1>
        <p className="text-slate-400 mb-6 text-sm">Butuan Locale - Rescue Project v1</p>
        
        {/* Linked Label using htmlFor and id */}
        <label htmlFor="user_name" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Full Name
        </label>
        <input 
          id="user_name"
          name="user_name"
          type="text" 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4 focus:border-blue-500 outline-none"
          placeholder="e.g., Bro. Juan dela Cruz"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

        {/* Linked Label using htmlFor and id */}
        <label htmlFor="user_condition" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Medical Condition (Optional)
        </label>
        <input 
          id="user_condition"
          name="user_condition"
          type="text" 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mb-6 focus:border-blue-500 outline-none"
          placeholder="e.g., Hypertension"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-colors"
        >
          COMPLETE SETUP
        </button>
      </div>
    </div>
  );
}