/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Navigation, 
  RotateCcw, 
  Zap, 
  MapPin, 
  Info,
  ChevronRight,
  Orbit
} from 'lucide-react';

// Constants for Earth's rotation
const EARTH_RADIUS_EQUATOR = 6378137; // meters
const SIDEREAL_DAY_SECONDS = 86164.0905; // seconds
const EQUATORIAL_SPEED = (2 * Math.PI * EARTH_RADIUS_EQUATOR) / SIDEREAL_DAY_SECONDS; // ~465.1 m/s

export default function App() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestRef = useRef<number>(null);
  const previousTimeRef = useRef<number>(null);

  // Calculate speed based on latitude
  const currentSpeed = latitude !== null 
    ? EQUATORIAL_SPEED * Math.cos((latitude * Math.PI) / 180) 
    : 0;

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined && startTime !== null) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // seconds
      setDistance(prev => prev + currentSpeed * deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [currentSpeed, startTime]);

  useEffect(() => {
    if (startTime !== null) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [startTime, animate]);

  const getLocation = () => {
    setIsLocating(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLocating(false);
      setLatitude(0); // Default to equator if failed
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setIsLocating(false);
        if (startTime === null) setStartTime(performance.now());
      },
      (err) => {
        setError("Could not determine location. Defaulting to Equator.");
        setLatitude(0);
        setIsLocating(false);
        if (startTime === null) setStartTime(performance.now());
      }
    );
  };

  const handleReset = () => {
    setDistance(0);
    setStartTime(performance.now());
  };

  useEffect(() => {
    getLocation();
  }, []);

  const formatDistance = (m: number) => {
    if (m < 1000) return `${m.toFixed(2)} m`;
    if (m < 1000000) return `${(m / 1000).toFixed(4)} km`;
    return `${(m / 1000).toFixed(2)} km`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      <main className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col gap-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Orbit className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400/70">Cosmic Drift Protocol</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter leading-none"
          >
            SPACE <br />
            <span className="text-emerald-400">TRACKER</span>
          </motion.h1>
        </header>

        {/* Main Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
            
            <div className="flex flex-col gap-12 relative z-10">
              {/* Distance Counter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Distance Traveled</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono">Real-time Sync</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl md:text-8xl font-mono font-medium tracking-tighter tabular-nums">
                    {distance.toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-2xl md:text-4xl font-mono text-white/30 tabular-nums">
                    .{distance.toFixed(2).split('.')[1]}
                  </span>
                  <span className="text-xl md:text-2xl font-mono text-emerald-400/50 ml-auto">m</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Velocity</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-medium">{currentSpeed.toFixed(2)}</span>
                    <span className="text-[10px] text-white/30 font-mono">m/s</span>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">{(currentSpeed * 3.6).toFixed(1)} km/h</span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Latitude</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-medium">
                      {latitude !== null ? Math.abs(latitude).toFixed(4) : '--'}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {latitude !== null ? (latitude >= 0 ? '°N' : '°S') : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">
                    {latitude === 0 ? 'Equatorial Reference' : 'Geodetic Position'}
                  </span>
                </div>
              </div>
            </div>

            {/* Earth Rotation Visualizer (Subtle) */}
            <div className="absolute bottom-[-50px] right-[-50px] opacity-10 pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="w-64 h-64 text-white" strokeWidth={0.5} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Controls & Info */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-emerald-400 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
              Reset Tracker
            </button>
            <button 
              onClick={getLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full font-medium hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
              {isLocating ? 'Locating...' : 'Update Location'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-white/40">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
              <Info className="w-3 h-3" />
              Based on Earth's Rotation
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-mono flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Details */}
        <footer className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Earth Radius</span>
            <span className="text-sm font-mono">6,378.1 km</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Sidereal Day</span>
            <span className="text-sm font-mono">23h 56m 4.1s</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Max Velocity</span>
            <span className="text-sm font-mono">1,674.4 km/h</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
