import { Router } from 'express';
import fetch from 'node-fetch';
import { config } from '../config.js';

const router = Router();

router.post('/phishing', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing required URL parameter." });
  }

  const flaskUrl = `http://${config.flask.host}:${config.flask.port}/api/phishing/detect`;

  try {
    const response = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (err: any) {
    console.warn(`[Phishing Proxy Warning] Could not connect to Flask AI server (${err.message}). Using local mock fallback.`);
  }

  // Local JS Fallback Heuristics
  let score = 10;
  const reasons: string[] = [];
  try {
    const host = url.includes('://') ? new URL(url).hostname : new URL(`http://${url}`).hostname;

    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(host)) {
      score += 40;
      reasons.push("URL host is a raw IP address instead of a domain name.");
    }

    const suspiciousKeywords = ['secure', 'login', 'verify', 'update', 'bank', 'support', 'kyc', 'free', 'gift', 'prize', 'win'];
    suspiciousKeywords.forEach(kw => {
      if (host.toLowerCase().includes(kw)) {
        score += 15;
        reasons.push(`Domain contains high-risk keyword: "${kw}"`);
      }
    });

    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly'];
    if (shorteners.includes(host.toLowerCase())) {
      score += 20;
      reasons.push("Uses a URL shortening service, commonly used to mask malicious sites.");
    }

    const subdomainCount = host.split('.').length - 2;
    if (subdomainCount > 2) {
      score += 15;
      reasons.push(`Excessive subdomains (${subdomainCount}), often used in phishing redirection.`);
    }

    if (host.includes('-')) {
      score += 10;
      reasons.push("Domain contains hyphens, typical of typo-squatted imitation domains.");
    }
  } catch (err) {
    score = 85;
    reasons.push("Failed to parse URL structure, indicating non-standard structure or malformed URL.");
  }

  score = Math.min(score, 99);
  const isPhishing = score >= 50;
  const status = score < 30 ? 'safe' : score < 60 ? 'suspicious' : 'dangerous';

  return res.json({
    url,
    risk_score: score,
    status,
    is_phishing: isPhishing,
    reasons: reasons.length > 0 ? reasons : ["No immediate flags detected; link appears normal."],
    analyzed_at: new Date().toISOString(),
    using_fallback_heuristics: true
  });
});

router.post('/message', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing required message parameter." });
  }

  const flaskUrl = `http://${config.flask.host}:${config.flask.port}/api/message/detect`;

  try {
    const response = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (err: any) {
    console.warn(`[Message Proxy Warning] Could not connect to Flask AI server (${err.message}). Using local mock fallback.`);
  }

  // Local JS Fallback Heuristics
  let score = 5;
  const reasons: string[] = [];
  const lowerMsg = message.toLowerCase();

  const highRiskKeywords = [
    { kw: 'kyc', weight: 45, reason: "Urgent request to complete KYC verification." },
    { kw: 'blocked', weight: 35, reason: "Threat of account or card blockage." },
    { kw: 'suspended', weight: 35, reason: "Threat of service suspension." },
    { kw: 'lottery', weight: 40, reason: "Unsolicited announcement of winning a lottery/reward." },
    { kw: 'crore', weight: 30, reason: "Mentions large sums of cash (e.g. Crores/Lakhs)." },
    { kw: 'gift card', weight: 25, reason: "Mentions free gift cards or vouchers." },
    { kw: 'otp', weight: 40, reason: "Request to share OTP (One Time Password)." },
    { kw: 'click here', weight: 20, reason: "Includes urgent call-to-action link text." },
    { kw: 'urgently', weight: 15, reason: "Creates false sense of urgency." },
    { kw: 'part time job', weight: 35, reason: "Offers part-time jobs requiring security deposit." },
    { kw: 'electricity bill', weight: 30, reason: "Threatens unpaid electricity bill service cutoffs." }
  ];

  highRiskKeywords.forEach(item => {
    if (lowerMsg.includes(item.kw)) {
      score += item.weight;
      reasons.push(item.reason);
    }
  });

  const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi;
  if (linkRegex.test(message)) {
    score += 20;
    reasons.push("Message contains a link, which is a common delivery mechanism for credential harvesting.");
  }

  score = Math.min(score, 99);
  const isFraud = score >= 45;
  const status = score < 25 ? 'safe' : score < 50 ? 'suspicious' : 'dangerous';

  return res.json({
    message_length: message.length,
    risk_score: score,
    status,
    is_fraud: isFraud,
    reasons: reasons.length > 0 ? reasons : ["Message text appears normal."],
    analyzed_at: new Date().toISOString(),
    using_fallback_heuristics: true
  });
});

router.post('/call', async (req, res) => {
  const { phoneNumber, duration, frequency, spamReports, carrierRep, isIntl } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Missing required phoneNumber parameter." });
  }

  const flaskUrl = `http://${config.flask.host}:${config.flask.port}/api/call/detect`;

  try {
    const response = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        call_duration: duration ? parseFloat(duration) : 120,
        call_frequency: frequency ? parseFloat(frequency) : 2,
        call_hour: new Date().getHours(),
        spam_reports: spamReports ? parseFloat(spamReports) : 0,
        carrier_reputation: carrierRep ? parseFloat(carrierRep) : 4,
        is_international: isIntl ? 1 : 0
      })
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      return res.json({
        phone: phoneNumber,
        ...data
      });
    }
  } catch (err: any) {
    console.warn(`[Call Proxy Warning] Could not connect to Flask AI server (${err.message}). Using local mock fallback.`);
  }

  // Fallback Heuristics
  const r = spamReports ? parseInt(spamReports as string, 10) : 0;
  const f = frequency ? parseInt(frequency as string, 10) : 2;
  const rep = carrierRep ? parseInt(carrierRep as string, 10) : 4;
  
  const scamScore = (r * 15 + f * 5 + (5 - rep) * 15 + (isIntl ? 30 : 0));
  const scoreNormalized = Math.min(Math.max(scamScore, 5), 99);
  const isScam = scoreNormalized >= 50;

  return res.json({
    phone: phoneNumber,
    risk_score: scoreNormalized,
    is_scam: isScam,
    status: scoreNormalized < 30 ? 'safe' : scoreNormalized < 60 ? 'suspicious' : 'dangerous',
    details: [
      `Call rate: ${f} dials/hr (Threshold: >15 dials/hr indicates autodialer).`,
      `Community spam reports: ${r} flag(s).`,
      `Carrier network reputation: Grade ${rep}/5.`,
      `VoIP Origin: ${isIntl ? 'Offshore VoIP range detected' : 'Standard regional carrier'}.`,
      `Note: Flask server was unavailable; successfully evaluated using Express backup heuristic analysis.`
    ],
    using_fallback_heuristics: true
  });
});

export default router;
