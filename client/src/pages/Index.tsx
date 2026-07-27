import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// 3D Animated Shield Icon
function IconShield3D() {
  return (
    <svg className="w-12 h-12 overflow-visible" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow backplate */}
      <path d="M24 4C14 8 14 18 14 26C14 34 24 44 24 44C24 44 34 34 34 26C34 18 34 8 24 4Z" fill="url(#shieldGlow)" opacity="0.35" className="animate-pulse" />
      {/* Front Plate - Isometric look */}
      <path d="M24 6L32 9.5V24C32 30.5 27 36.5 24 39.5L16 24V9.5L24 6Z" fill="url(#shieldGrad)" stroke="#14b8a6" strokeWidth="1" />
      {/* Inner detail */}
      <path d="M24 11L28 13V22C28 26.5 25.5 30.5 24 32.5L20 22V13L24 11Z" fill="url(#shieldInner)" opacity="0.8" />
      {/* Animated scan line */}
      <motion.line 
        x1="12" y1="12" x2="36" y2="12" 
        stroke="#00f2ff" strokeWidth="1.5" strokeLinecap="round"
        animate={{ y: [0, 24, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      />
      <defs>
        <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shieldGrad" x1="16" y1="6" x2="32" y2="39.5">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="shieldInner" x1="20" y1="11" x2="28" y2="32.5">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 3D Animated Message Stack Icon
function IconMessage3D() {
  return (
    <svg className="w-12 h-12 overflow-visible" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lower plate shadow */}
      <rect x="10" y="16" width="28" height="20" rx="4" fill="url(#msgGlow)" opacity="0.3" className="animate-pulse" />
      {/* Lower Message Bubble - isometric offset */}
      <rect x="8" y="18" width="26" height="18" rx="4" fill="#0f172a" stroke="#6366f1" strokeWidth="1" />
      {/* Top Floating Message Bubble */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <rect x="16" y="8" width="26" height="18" rx="4" fill="url(#msgGrad)" stroke="#14b8a6" strokeWidth="1" />
        {/* Dialog lines */}
        <line x1="22" y1="13" x2="36" y2="13" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="17" x2="32" y2="17" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="21" x2="28" y2="21" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      <defs>
        <radialGradient id="msgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="msgGrad" x1="16" y1="8" x2="42" y2="26">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 3D Animated Biometric Lens Icon
function IconBiometric3D() {
  return (
    <svg className="w-12 h-12 overflow-visible" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background target HUD */}
      <circle cx="24" cy="24" r="20" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
      {/* Inner spinning grid */}
      <motion.circle 
        cx="24" cy="24" r="16" 
        stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="6 4"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      {/* Isometric camera lens */}
      <circle cx="24" cy="24" r="10" fill="url(#lensGrad)" stroke="#14b8a6" strokeWidth="1" />
      <circle cx="24" cy="24" r="6" fill="#030611" stroke="#6366f1" strokeWidth="0.75" />
      {/* Pulsing camera light */}
      <motion.circle 
        cx="24" cy="18" r="1.5" 
        fill="#ef4444"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
      {/* Biometric focus lines */}
      <path d="M6 14V6H14" stroke="#14b8a6" strokeWidth="1.5" />
      <path d="M42 14V6H34" stroke="#14b8a6" strokeWidth="1.5" />
      <path d="M6 34V42H14" stroke="#14b8a6" strokeWidth="1.5" />
      <path d="M42 34V42H34" stroke="#14b8a6" strokeWidth="1.5" />
      <defs>
        <linearGradient id="lensGrad" x1="14" y1="14" x2="34" y2="34">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 3D Animated Grid Map Pin Icon
function IconMap3D() {
  return (
    <svg className="w-12 h-12 overflow-visible" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Isometric base grid map */}
      <path 
        d="M24 4L42 14L24 24L6 14L24 4Z" 
        fill="url(#mapGrad)" stroke="#6366f1" strokeWidth="1"
      />
      <path d="M24 12L38 20L24 28L10 20L24 12Z" fill="url(#mapInner)" opacity="0.3" />
      {/* Grid lines inside map */}
      <line x1="15" y1="9" x2="33" y2="19" stroke="#6366f1" strokeWidth="0.5" opacity="0.5" />
      <line x1="33" y1="9" x2="15" y2="19" stroke="#6366f1" strokeWidth="0.5" opacity="0.5" />
      {/* Floating pin indicator */}
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      >
        {/* Pin Shadow on map surface */}
        <ellipse cx="24" cy="22" rx="3" ry="1.5" fill="#ef4444" opacity="0.4" className="animate-pulse" />
        {/* Pin indicator */}
        <path d="M24 6C21.5 6 19.5 8 19.5 10.5C19.5 14 24 20 24 20C24 20 28.5 14 28.5 10.5C28.5 8 26.5 6 24 6Z" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
        <circle cx="24" cy="10.5" r="1.5" fill="#ffffff" />
      </motion.g>
      <defs>
        <linearGradient id="mapGrad" x1="6" y1="4" x2="42" y2="24">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mapInner" x1="10" y1="12" x2="38" y2="28">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Index() {
  const [systemEntered, setSystemEntered] = useState(false);

  const highlights = [
    {
      title: "AI Phishing Link Scanner",
      description: "Analyze web URLs for suspicious structures, redirection parameters, and typo-squatting risks in real-time.",
      icon: IconShield3D,
      link: "/scanner"
    },
    {
      title: "Fraud Message Detector",
      description: "Upload or copy text messages to scan for fraudulent bank SMS alerts, lottery scams, and urgent social engineering traps.",
      icon: IconMessage3D,
      link: "/scanner"
    },
    {
      title: "Deepfake Upload Preview",
      description: "Upload facial media to detect manipulation patterns using pre-trained deep convolutional neural networks.",
      icon: IconBiometric3D,
      link: "/scanner"
    },
    {
      title: "Location Scam Map",
      description: "Visualize live geolocated cyber scam reports near you using spatial database nearest-neighbor queries.",
      icon: IconMap3D,
      link: "/alerts"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 90, damping: 14 }
    }
  };

  // Splash Screen Intro
  if (!systemEntered) {
    return (
      <div className="fixed inset-0 z-50 bg-[#030611] flex flex-col items-center justify-center overflow-hidden cyber-grid-animated">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="text-center relative z-10 flex flex-col items-center max-w-lg px-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mb-12 flex items-center justify-center animate-spin-slow"
          >
            {/* Spinning vector HUD rings */}
            <div className="absolute w-56 h-56 border border-dashed border-teal-500/25 rounded-full" />
            <div className="absolute w-48 h-48 border border-dotted border-indigo-500/20 rounded-full animate-spin-reverse-slow" />
            <div className="absolute w-40 h-40 border border-teal-500/10 rounded-full" />
            <div className="absolute w-32 h-32 border border-indigo-500/35 rounded-full animate-pulse" />
            
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.15)] relative z-10">
              <ShieldCheck className="w-10 h-10 text-teal-400 filter drop-shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-widest font-tech text-white mb-2 uppercase glitch-effect"
          >
            CYBERSHAKTI
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[10px] tracking-[0.35em] font-cyber text-teal-400 uppercase font-semibold mb-8"
          >
            // Shield Matrix & AI Threat Audit
          </motion.p>

          {/* Diagnostic logs console */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="w-80 bg-black/60 border border-white/5 rounded-lg p-4 mb-10 font-cyber text-[10px] text-slate-500 text-left space-y-1.5 shadow-2xl relative"
          >
            <div className="absolute top-0 right-3 bg-red-500/20 px-1.5 py-0.5 rounded text-[8px] text-red-400 border border-red-500/10 animate-pulse uppercase">Secure Channel</div>
            <p className="flex justify-between"><span>CONNECTING TUNNEL...</span><span className="text-teal-400 font-bold">OK</span></p>
            <p className="flex justify-between"><span>LOADING HEURISTICS...</span><span className="text-teal-400 font-bold">OK</span></p>
            <p className="flex justify-between"><span>SPATIAL ALERTS POOL...</span><span className="text-teal-400 font-bold">ONLINE</span></p>
            <p className="flex justify-between text-slate-600"><span>CORE DIAGNOSTICS...</span><span>ACTIVE<span className="animate-cursor">_</span></span></p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSystemEntered(true)}
            className="relative px-10 py-4.5 bg-[#0d1321]/80 border border-teal-500/40 text-teal-400 font-cyber font-bold uppercase tracking-widest text-xs rounded-lg overflow-hidden group shadow-[0_0_25px_rgba(20,184,166,0.15)] hover:border-teal-400 hover:text-white transition-colors"
          >
            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="animate-shimmer" />
            Initiate Shield Core
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen cyber-grid-animated flex flex-col items-center relative"
    >
      {/* Decorative vertical instrument panel */}
      <div className="hidden lg:flex fixed left-6 top-24 bottom-6 w-12 flex-col justify-between items-center text-[10px] font-cyber text-slate-600 border-r border-white/5 pr-6 z-40">
        <span className="transform -rotate-90 uppercase tracking-widest origin-left translate-x-3.5 mb-16 whitespace-nowrap">MATRIX v1.0.4</span>
        <div className="w-[1px] h-32 bg-gradient-to-b from-teal-500/35 to-transparent" />
        <span className="animate-pulse text-teal-400">● SECURE</span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-24 pb-16 relative">
        {/* Asymmetrical Grid Crosshairs */}
        <span className="absolute top-24 left-6 text-teal-500/30 font-cyber text-xs select-none pointer-events-none">+</span>
        <span className="absolute top-24 right-6 text-teal-500/30 font-cyber text-xs select-none pointer-events-none">+</span>

        {/* Hero split layout */}
        <section className="grid lg:grid-cols-12 gap-12 items-center mb-16 relative">
          {/* Left Column: Asymmetrical Editorial Copy */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs text-teal-400 font-semibold tracking-widest uppercase font-cyber shadow-[0_0_15px_rgba(20,184,166,0.05)]">
              <Shield className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              Proactive Digital Defense
            </div>

            {/* Editorial Title Pairing */}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-white">
              Defend Yourself <br />
              Against <span className="font-serif-editorial text-teal-400 block mt-2 text-3xl md:text-5xl font-light">Digital Financial Frauds</span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-sans">
              CyberShakti combines high-performance machine learning heuristics, spatial database mapping, and deepfake verification to keep your digital identity safe.
            </p>

            <div className="flex gap-4 pt-4">
              <Link to="/scanner" className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-bold rounded-lg transition-all duration-200 glow-teal hover:scale-105 font-cyber uppercase text-xs tracking-wider">
                Launch AI Scanners
              </Link>
              <Link to="/alerts" className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 rounded-lg transition-all duration-200 font-cyber uppercase text-xs tracking-wider">
                View Live Scam Map
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Rotating HUD Panel */}
          <div className="lg:col-span-5 flex justify-center items-center relative min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-indigo-500/5 blur-3xl rounded-full" />
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="relative p-8 glass-panel cyber-brackets rounded-2xl flex flex-col justify-center items-center w-72 h-72 shadow-2xl overflow-hidden cursor-crosshair border border-white/5 group"
            >
              {/* Rotating SVG Radar Graphic */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-64 h-64 text-teal-500/10 animate-spin-slow" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 2" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.3" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.3" />
                </svg>
              </div>

              {/* Glowing active core dot */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <ShieldCheck className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-cyber tracking-widest text-teal-400 mt-6 uppercase group-hover:text-white transition-colors">Audit Core Active</span>
              <span className="text-[8px] font-cyber text-slate-500 uppercase tracking-widest mt-1">127.0.0.1:5001</span>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full border-y border-white/5 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-16"
        >
          <div className="p-4 glass-panel cyber-brackets rounded-xl">
            <h2 className="text-3xl font-extrabold text-teal-400 font-cyber">99.4%</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-tech mt-1">Phishing Accuracy</p>
          </div>
          <div className="p-4 glass-panel cyber-brackets rounded-xl">
            <h2 className="text-3xl font-extrabold text-cyan-400 font-cyber">10ms</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-tech mt-1">Scanner Latency</p>
          </div>
          <div className="p-4 glass-panel cyber-brackets rounded-xl">
            <h2 className="text-3xl font-extrabold text-indigo-400 font-cyber">Spatial</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-tech mt-1">Database Queries</p>
          </div>
          <div className="p-4 glass-panel cyber-brackets rounded-xl">
            <h2 className="text-3xl font-extrabold text-red-500 font-cyber">1930</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-tech mt-1">Integrated Helpdesk</p>
          </div>
        </motion.section>

        {/* Feature Grid */}
        <section className="w-full mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 font-tech uppercase tracking-wider">Core Shield Mechanisms</h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {highlights.map((h, i) => {
              const IconComponent = h.icon;
              return (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className="p-6 glass-panel glass-panel-hover cyber-brackets rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-6 h-12 flex items-center">
                      <IconComponent />
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-tech">{h.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{h.description}</p>
                  </div>
                  <Link to={h.link} className="text-teal-400 hover:text-teal-300 font-semibold text-xs uppercase tracking-wider font-cyber flex items-center gap-1.5 transition-colors">
                    Launch Interface &rarr;
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Concept Block: Call Blocker */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="bg-gradient-to-r from-indigo-950/20 via-[#0d1321]/60 to-teal-950/20 border border-teal-500/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] text-teal-400 font-bold uppercase tracking-wider font-cyber mb-4">
                <PhoneCall className="w-3.5 h-3.5" />
                Scam Call Blocker Concept
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 font-tech">Protect Your Phone Numbers</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Explore how automated call blocker integration matches incoming voice traffic patterns against standard spam call databases. Check out model training steps in the python training files.
              </p>
            </div>
            <Link to="/tips" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 rounded-lg transition-colors whitespace-nowrap font-cyber text-xs uppercase tracking-wider">
              Read Security Protocol
            </Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
