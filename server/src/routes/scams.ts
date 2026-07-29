import { Router } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const router = Router();
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('[Database] SUPABASE_URL or SUPABASE_ANON_KEY not set. Using in-memory mock.');
    return null;
  }
  supabase = createClient(config.supabase.url, config.supabase.anonKey);
  console.log('[Database] Supabase client initialized.');
  return supabase;
}

interface ScamReport {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

const mockScams: ScamReport[] = [
  { id: 1, title: "Fake Bank KYC SMS Scam", description: "Fraudsters sending SMS asking to update SBI KYC immediately via a suspicious link to avoid account suspension.", latitude: 28.6139, longitude: 77.2090, status: 'verified', created_at: new Date().toISOString() },
  { id: 2, title: "Electricity Bill Fraud Call", description: "Received call from an unknown number threatening to disconnect electricity within 2 hours if payment is not made via APK link.", latitude: 19.0760, longitude: 72.8777, status: 'verified', created_at: new Date().toISOString() },
  { id: 3, title: "Part-time Job Offer Telegram Scam", description: "Scammers offering Rs 5000/day for liking YouTube videos. They eventually ask to deposit money in a crypto wallet.", latitude: 12.9716, longitude: 77.5946, status: 'verified', created_at: new Date().toISOString() }
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/', async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : null;
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10;

  const db = getSupabase();
  if (db) {
    try {
      let query = db.from('scam_reports').select('id, title, description, latitude, longitude, status, created_at').eq('status', 'verified').order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;

      if (lat !== null && lng !== null) {
        const nearby = (data as ScamReport[])
          .map(s => ({ ...s, distance: haversineDistance(lat, lng, s.latitude, s.longitude) }))
          .filter(s => s.distance <= radius)
          .sort((a, b) => a.distance - b.distance);
        return res.json(nearby);
      }
      return res.json(data);
    } catch (err: any) {
      console.error('[Database Error] Supabase query failed:', err.message);
    }
  }

  if (lat !== null && lng !== null) {
    return res.json(
      mockScams.filter(s => s.status === 'verified')
        .map(s => ({ ...s, distance: haversineDistance(lat, lng, s.latitude, s.longitude) }))
        .filter(s => s.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
    );
  }
  return res.json(mockScams.filter(s => s.status === 'verified'));
});

router.post('/', async (req, res) => {
  const { title, description, latitude, longitude } = req.body;
  if (!title || !description || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing required fields: title, description, latitude, longitude' });
  }

  const db = getSupabase();
  if (db) {
    try {
      const { data, error } = await db.from('scam_reports').insert([{ title, description, latitude: parseFloat(latitude), longitude: parseFloat(longitude), status: 'verified' }]).select('id').single();
      if (error) throw error;
      return res.status(201).json({ message: 'Scam report submitted successfully', id: (data as any).id });
    } catch (err: any) {
      console.error('[Database Error] Supabase insert failed:', err.message);
    }
  }

  const newScam: ScamReport = { id: mockScams.length + 1, title, description, latitude: parseFloat(latitude), longitude: parseFloat(longitude), status: 'verified', created_at: new Date().toISOString() };
  mockScams.unshift(newScam);
  return res.status(201).json({ message: 'Scam report submitted successfully (Saved in-memory mock)', id: newScam.id });
});

export default router;
