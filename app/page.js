'use client';
import { useState, useEffect } from 'react';
import Registration from '../components/Registration';
import PanicButton from '../components/PanicButton'; // Added this import

export default function Home() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the phone already has a name saved
    const savedName = localStorage.getItem('user_name');
    if (savedName) setIsRegistered(true);
    setLoading(false);
  }, []);

  if (loading) return <div className="bg-slate-900 min-h-screen" />;

  if (!isRegistered) {
    return <Registration onComplete={() => setIsRegistered(true)} />;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="absolute top-8 text-center">
        <h1 className="text-blue-400 font-bold tracking-widest uppercase text-xs">Butuan Locale Rescue</h1>
        <p className="text-xl font-light">Bro. {localStorage.getItem('user_name')}</p>
      </div>

      <PanicButton /> {/* Replaced the comment with the actual button */}

      <p className="mt-12 text-slate-500 text-sm text-center max-w-xs">
        In case of hypertension or emergency, hold the red circle until the phone speaks to you.
      </p>
    </main>
  );
}