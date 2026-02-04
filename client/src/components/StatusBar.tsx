import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <header className="status-bar">
      <span className="time font-black text-xs tracking-tighter">{formatTime(time)}</span>
      <div className="status-icons">
        <Wifi size={14} strokeWidth={2.5} />
        <Signal size={14} strokeWidth={2.5} />
        <Battery size={14} strokeWidth={2.5} className="rotate-90" />
      </div>
    </header>
  );
};
