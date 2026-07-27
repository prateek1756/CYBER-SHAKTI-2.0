import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { AlertCircle, PlusCircle, Navigation, Loader2 } from 'lucide-react';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEventsHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function Alerts() {
  const [scams, setScams] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Delhi default
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScams();
    locateUser();
  }, []);

  const fetchScams = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      let url = '/api/scams';
      if (lat !== undefined && lng !== undefined) {
        url = `/api/scams?lat=${lat}&lng=${lng}&radius=50`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setScams(data);
    } catch (err) {
      console.error("Failed to load scams", err);
    } finally {
      setLoading(false);
    }
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc);
          setLatInput(pos.coords.latitude.toFixed(6));
          setLngInput(pos.coords.longitude.toFixed(6));
          fetchScams(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          console.warn("Geolocation blocked, using default central location.");
          fetchScams();
        }
      );
    } else {
      fetchScams();
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setLatInput(lat.toFixed(6));
    setLngInput(lng.toFixed(6));
  };

  const handleReportScam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !latInput || !lngInput) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/scams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          latitude: parseFloat(latInput),
          longitude: parseFloat(lngInput)
        })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        fetchScams(userLocation ? userLocation[0] : undefined, userLocation ? userLocation[1] : undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
      {/* Map display */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-tech uppercase tracking-wider flex items-center gap-2.5">
              Live Scam Alerts
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 pulse-circle inline-block" />
            </h1>
            <p className="text-slate-400 text-xs">Geolocated scam incidents reported in your local area.</p>
          </div>
          <button
            onClick={locateUser}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-teal-400 transition-colors flex items-center gap-1.5 text-xs font-semibold font-tech uppercase tracking-wider"
          >
            <Navigation className="w-4 h-4 animate-bounce" />
            Recenter GPS
          </button>
        </div>

        <div className="h-[450px] w-full rounded-xl overflow-hidden relative border border-white/5 shadow-2xl">
          <MapContainer center={mapCenter} zoom={11} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {scams.map((scam) => (
              <Marker key={scam.id} position={[scam.latitude, scam.longitude]} icon={markerIcon}>
                <Popup>
                  <div className="text-slate-900 p-1">
                    <h4 className="font-bold text-sm mb-1 font-tech">{scam.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{scam.description}</p>
                    {scam.distance !== undefined && (
                      <p className="text-[10px] text-teal-600 font-bold mt-2 font-data">
                        Distance: {scam.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapEventsHandler onMapClick={handleMapClick} />
          </MapContainer>
        </div>
      </div>

      {/* Form Submission */}
      <div className="space-y-6">
        <div className="p-6 glass-panel rounded-xl shadow-xl">
          <h3 className="font-bold text-base text-slate-200 mb-4 flex items-center gap-2 font-tech uppercase tracking-wider">
            <PlusCircle className="w-5 h-5 text-teal-400" />
            Report Local Scam
          </h3>
          <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
            Spotted a scam in your neighborhood? Fill in the details. You can tap anywhere on the map to set the coordinates.
          </p>

          <form onSubmit={handleReportScam} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Scam Title</label>
              <input
                type="text"
                placeholder="e.g. Bank Call center fraud"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Description</label>
              <textarea
                rows={3}
                placeholder="Describe how the scam operated..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Latitude</label>
                <input
                  type="text"
                  placeholder="28.6139"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none font-data"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-tech">Longitude</label>
                <input
                  type="text"
                  placeholder="77.2090"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 vault-input rounded-lg text-sm text-slate-200 focus:outline-none font-data"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 font-tech uppercase text-xs tracking-wider"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "File Report"}
            </button>
          </form>
        </div>

        {/* List of Recent reports */}
        <div className="p-6 glass-panel rounded-xl space-y-4 max-h-[300px] overflow-y-auto shadow-xl">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-tech">Recent Verified Incidents</h4>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-500 gap-2 text-xs">
                <Loader2 className="w-4.5 h-4.5 animate-spin text-teal-400" />
                Fetching reports...
              </div>
            ) : scams.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No reports in this area.</p>
            ) : (
              scams.map((scam) => (
                <div key={scam.id} className="p-3 bg-white/5 border border-white/5 rounded-lg">
                  <h5 className="font-semibold text-sm text-slate-200 mb-1 flex items-center gap-1.5 font-tech">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    {scam.title}
                  </h5>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{scam.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
