import { useState } from 'react';
import { Phone, Globe, MessageSquare, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Tips() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const tipsList = [
    {
      title: "Phishing Link Indicators",
      icon: Globe,
      color: "text-cyan-400 bg-cyan-400/10",
      points: [
        "Double-check domain names: phishing sites often mimic real brands (e.g., payp1.com instead of paypal.com).",
        "Inspect the URL path: look for raw IP addresses (e.g. 192.168.1.1/login) instead of standard domain addresses.",
        "Look for the secure padlock icon, but note that modern phishing sites can also acquire free SSL certificates."
      ]
    },
    {
      title: "Scam Message Warnings",
      icon: MessageSquare,
      color: "text-teal-400 bg-teal-400/10",
      points: [
        "Urgent tone: scammers create panic (e.g., 'your electricity will be disconnected in 2 hours').",
        "Financial threats/offers: prize winnings, job opportunities, or warnings about suspended credit cards.",
        "Requesting sensitive secrets: asking for OTP, CVV, or bank login PINs."
      ]
    },
    {
      title: "Scam Call Shield Protocol",
      icon: Phone,
      color: "text-purple-400 bg-purple-400/10",
      points: [
        "Banks will NEVER call you to ask for your password, PIN, or one-time transaction verification code.",
        "If someone threatens you over the phone, hang up immediately and check with the official branch office.",
        "Do not install remote assistance applications (e.g., AnyDesk, TeamViewer) at the request of any caller."
      ]
    }
  ];

  const faqs = [
    {
      q: "What should I do if I have shared my banking details with a scammer?",
      a: "Immediately block your debit/credit card and freeze your bank account through your bank's official support app or helpline. File an official complaint on the national portal or call the helpline."
    },
    {
      q: "What is the official National Cyber Crime Helpline number in India?",
      a: "The national helpline number is 1930. You can call this number immediately to report financial fraud and initiate transaction blocking before scammers transfer the money out of the banking channel."
    },
    {
      q: "How does the Live Scam Map fetch nearby scams?",
      a: "It requests your geolocated latitude and longitude. The backend queries a MySQL spatial catalog and calculates distance using a stored procedure to return geolocated alerts within a 50km radius."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 font-tech uppercase tracking-wider">Safety Protocols</h1>
        <p className="text-slate-400 text-xs font-sans">Educational checklist and resources to identify cyber threats and fraud attempts.</p>
      </motion.div>

      {/* Emergency helpline block */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-950/20 border border-red-500/20 p-6 rounded-xl flex items-start gap-4 shadow-xl"
      >
        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1 animate-pulse" />
        <div>
          <h3 className="font-bold text-red-400 text-sm font-tech uppercase tracking-wider mb-1">Financial Fraud Incident?</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Call the National Cyber Crime Helpline immediately at <span className="font-bold text-white bg-red-500/20 px-2 py-0.5 rounded font-data">1930</span> to freeze fraudulent transactions, or report it online at the cybercrime portal.
          </p>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 font-tech"
          >
            Visit Cybercrime Portal &rarr;
          </a>
        </div>
      </motion.div>

      {/* Tips Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {tipsList.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel glass-panel-hover p-6 rounded-xl space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tip.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-200 text-xs font-tech uppercase tracking-wider">{tip.title}</h3>
              </div>
              <ul className="space-y-3 pl-2">
                {tip.points.map((pt, idx) => (
                  <li key={idx} className="text-xs text-slate-400 leading-relaxed list-disc list-inside">
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200 font-tech uppercase tracking-wider">Frequently Asked Questions</h3>
        <div className="glass-panel rounded-xl divide-y divide-white/5 overflow-hidden shadow-xl">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-transparent">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-2 font-tech uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-teal-400" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-6 py-4 bg-black/10 border-t border-white/5">
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
