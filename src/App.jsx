import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Sparkles,
  Trash2,
  LayoutGrid,
  ShoppingBag,
  ArrowRight,
  User,
  ChevronRight,
  RefreshCcw,
  Heart,
  Shirt,
  HandMetal,
  X,
  Check,
  Mail,
  Lock,
  LogOut,
  Plane,
  MapPin,
  Calendar,
  MessageCircle,
  Send,
  Globe
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';


// --- CONFIGURATION ---
const apiKey = ""; // Provided by environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'muse-closet-ai';
const firebaseConfig = JSON.parse(__firebase_config);


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- HELPERS ---
const cleanJson = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  } catch (e) {
    return text;
  }
};


const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};


const loadConfetti = () => {
  return new Promise((resolve) => {
    if (window.confetti) return resolve(window.confetti);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => resolve(window.confetti);
    document.head.appendChild(script);
  });
};


const getMyntraUrl = (queryText, gender) => {
  if (!queryText) return "https://www.myntra.com/";
  const genderSuffix = gender === 'Men' ? ' men' : gender === 'Women' ? ' women' : '';
  const fullQuery = queryText.toLowerCase().includes(gender.toLowerCase())
    ? queryText
    : `${queryText}${genderSuffix}`;

  const cleanSlug = fullQuery
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-0\s-]/g, '')
    .replace(/\s+/g, '-');
  return `https://www.myntra.com/${cleanSlug}`;
};


// --- SUB-COMPONENTS ---


const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };


  const handleAuth = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }


    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-[#E5D3B3] z-[400] flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
      <div className="w-16 h-16 bg-[#800020] rounded-2xl flex items-center justify-center shadow-2xl mb-6">
        <Sparkles className="text-white w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-2 text-gray-900">Muse<span className="text-[#800020]">.</span></h1>
      <p className="text-gray-600 font-medium mb-8 max-w-xs leading-relaxed">Sign in to access your digitized wardrobe from any device.</p>

      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#D4C4A8]/40">
        <div className="flex bg-[#E5D3B3]/20 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm text-[#800020]' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm text-[#800020]' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>


        <form onSubmit={handleAuth} className="space-y-4 text-left">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="style@muse.com"
                className="w-full p-4 pl-12 rounded-2xl bg-[#E5D3B3]/10 border border-[#D4C4A8]/40 focus:border-[#800020] outline-none transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 pl-12 rounded-2xl bg-[#E5D3B3]/10 border border-[#D4C4A8]/40 focus:border-[#800020] outline-none transition-all font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mt-2 bg-[#800020] hover:bg-[#600018] disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            {loading ? "Authenticating..." : isLogin ? "Login to Closet" : "Create Account"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};


const ProfileSetupScreen = ({ nickname, setNickname, gender, setGender, handleProfileSubmit, loading }) => (
  <div className="fixed inset-0 bg-[#E5D3B3] z-[300] flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
    <h2 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Finish Your Profile</h2>
    <p className="text-gray-600 font-medium mb-8 max-w-xs leading-relaxed">Tell us a bit about yourself to get personalized styling recommendations.</p>

    <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#D4C4A8]/40">
      <form onSubmit={handleProfileSubmit} className="space-y-5 text-left">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nickname</label>
          <input
            required
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="How should Muse call you?"
            className="w-full mt-1.5 p-4 rounded-2xl bg-[#E5D3B3]/20 border border-[#D4C4A8]/40 focus:border-[#800020] outline-none transition-all font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Style Preference</label>
          <div className="grid grid-cols-3 gap-3 mt-1.5">
            {['Men', 'Women', 'Unisex'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`py-3 rounded-xl text-xs font-bold transition-all border ${gender === g ? 'bg-[#800020] text-white border-[#800020] shadow-lg' : 'bg-white text-gray-500 border-[#D4C4A8]/40'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !nickname || !gender}
          className="w-full py-5 mt-4 bg-[#800020] hover:bg-[#600018] disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-rose-950/20 active:scale-95 transition-all"
        >
          {loading ? "Saving..." : "Enter Muse Closet"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  </div>
);


const ClosetView = ({ profile, closet, fileInputRef, deleteItem, startManualCreate }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">
          Hi, {profile?.nickname || 'Style Icon'}
        </h2>
        <p className="text-sm text-gray-600 font-medium">Ready to style your {closet.length} pieces?</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={startManualCreate}
          className="bg-white text-[#800020] border border-[#800020]/20 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm font-bold text-sm active:scale-95 transition-transform"
        >
          <HandMetal className="w-5 h-5" /> Create Manually
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="bg-[#800020] text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-rose-950/20 font-bold text-sm active:scale-95 transition-transform">
          <Plus className="w-5 h-5" /> Add Piece
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {closet.map(item => (
        <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-[#D4C4A8] shadow-sm relative group hover:shadow-xl transition-all duration-300">
          <div className="aspect-[4/5]"><img src={item.image} className="w-full h-full object-cover" alt={item.description} /></div>
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-[#800020]/60">{item.category}</span>
            <p className="text-sm font-bold text-gray-800 truncate">{item.description}</p>
          </div>
          <button onClick={() => deleteItem(item.id)} className="absolute top-2 right-2 p-2 bg-white/80 rounded-xl text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  </div>
);


const ManualCreatorView = ({ closet, onSave, onCancel }) => {
  const [selected, setSelected] = useState({ top: null, bottom: null, shoes: null, accessory: null });
  const [activeCategory, setActiveCategory] = useState('Top');


  const categories = ['Top', 'Bottom', 'Shoes', 'Accessory'];

  const toggleSelect = (item) => {
    const key = item.category.toLowerCase();
    setSelected(prev => ({
      ...prev,
      [key]: prev[key]?.id === item.id ? null : item
    }));
  };


  const isReady = selected.top && selected.bottom;


  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-300 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-[#D4C4A8] shadow-sm">
        <h2 className="text-2xl font-black text-gray-900">Custom Look</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="p-3 text-gray-400 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>
          <button
            disabled={!isReady}
            onClick={() => onSave(selected)}
            className="bg-[#800020] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-30 transition-all shadow-xl shadow-rose-900/20"
          >
            <Check className="w-5 h-5" /> Save Look
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/40 p-8 rounded-[3rem] border border-[#D4C4A8] space-y-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#800020]">Your Composition</p>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => {
              const item = selected[cat.toLowerCase()];
              return (
                <div key={cat} className="space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{cat}</span>
                  <div className={`aspect-[3/4] rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${item ? 'border-[#800020] bg-white' : 'border-[#D4C4A8] bg-[#E5D3B3]/20'}`}>
                    {item ? (
                      <img src={item.image} className="w-full h-full object-cover" alt="selected" />
                    ) : (
                      <Plus className="w-6 h-6 text-[#D4C4A8]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex bg-[#E5D3B3]/40 p-1.5 rounded-2xl border border border-[#D4C4A8]/40 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 whitespace-nowrap py-3 px-4 rounded-xl text-xs font-black transition-all ${activeCategory === cat ? 'bg-white text-[#800020] shadow-sm' : 'text-gray-500'}`}
              >
                {cat}s
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {closet.filter(i => i.category === activeCategory).length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 opacity-50">
                <Plus className="w-8 h-8 mb-2" />
                <p className="text-xs font-bold">No {activeCategory}s found</p>
              </div>
            ) : (
              closet.filter(i => i.category === activeCategory).map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleSelect(item)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-4 transition-all ${selected[activeCategory.toLowerCase()]?.id === item.id ? 'border-[#800020] scale-95 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={item.image} className="w-full h-full object-cover" alt="browse" />
                  {selected[activeCategory.toLowerCase()]?.id === item.id && (
                    <div className="absolute inset-0 bg-[#800020]/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2 text-[#800020] shadow-lg"><Check className="w-4 h-4" /></div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const SavedOutfitsView = ({ outfits, deleteOutfit }) => (
  <div className="space-y-8 animate-in fade-in duration-500 pb-10">
    <div className="text-center space-y-2">
      <h2 className="text-3xl font-black text-gray-900">Your Lookbook</h2>
      <p className="text-gray-700 font-medium">Saved curated outfits</p>
    </div>
    {outfits.length === 0 ? (
      <div className="text-center py-20 bg-white/40 rounded-[2.5rem] border border-dashed border-[#D4C4A8]">
        <Heart className="w-12 h-12 text-[#D4C4A8] mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No saved looks yet.</p>
      </div>
    ) : (
      <div className="space-y-8">
        {outfits.map((outfit) => (
          <div key={outfit.id} className="bg-white rounded-[2.5rem] p-8 border border-[#D4C4A8] shadow-xl space-y-6 relative group">
            <button
              onClick={() => deleteOutfit(outfit.id)}
              className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="border-b border-gray-100 pb-4 pr-10">
              <p className="italic text-[#4a0404] font-medium leading-tight">
                {outfit.reasoning ? `"${outfit.reasoning}"` : "Custom curated ensemble."}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[outfit.top, outfit.bottom, outfit.shoes, outfit.accessory].map((item, idx) => (
                item && (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-[#D4C4A8]/20 aspect-[4/5] bg-[#F8F4EB]">
                    <img src={item.image} className="w-full h-full object-cover" alt="outfit piece" />
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


const ShopView = ({ profile, curatedLooks, createNewMyntraLook }) => (
  <div className="space-y-8 animate-in fade-in duration-500 pb-10">
    <div className="text-center space-y-2">
      <h2 className="text-3xl font-black text-gray-900">Muse Shop</h2>
      <p className="text-gray-700 font-medium">AI Curated {profile?.gender} Collections</p>
    </div>
    <div className="flex flex-wrap justify-center gap-3">
      {['Old Money Aesthetic', 'Streetwear Vibe', 'Summer Wedding', 'Gorpcore', 'Indie Sleaze'].map(theme => (
        <button
          key={theme}
          onClick={() => createNewMyntraLook(theme)}
          className="px-5 py-2 rounded-2xl bg-white border border-[#D4C4A8] text-sm font-bold hover:bg-[#800020] hover:text-white transition-all shadow-sm active:scale-95"
        >
          {theme}
        </button>
      ))}
    </div>
    <div className="space-y-6">
      {curatedLooks.map((look, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-[#D4C4A8] shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-[#800020]">{look.lookName}</h3>
              <p className="text-sm text-gray-500 italic">"{look.vibe}"</p>
            </div>
            <div className="px-3 py-1 bg-[#800020]/10 text-[#800020] rounded-full text-[10px] font-bold uppercase tracking-widest">Trend Alert</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {look.items.map((item, idx) => (
              <div key={idx} className="bg-[#E5D3B3]/20 p-5 rounded-3xl border border-[#D4C4A8]/30 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#800020]/60 tracking-widest">{item.type}</span>
                  <p className="font-bold text-gray-900 mt-1 leading-tight">{item.name}</p>
                </div>
                <a
                  href={getMyntraUrl(item.query, profile?.gender)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-between text-xs font-bold bg-white p-3 rounded-xl border border-[#D4C4A8]/50 hover:border-[#800020] transition-colors"
                >
                  View on Myntra
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- NEW FEATURES ---

const TripPackerView = ({ closet, onBack }) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [packedItems, setPackedItems] = useState(null);
  const [advice, setAdvice] = useState('');

  const generatePack = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Gemini Call
    const inventorySummary = closet.map(item => ({ id: item.id, category: item.category, description: item.description, color: item.color }));
    const prompt = `Travel Stylist Agent. Task: Create a packing list from User Inventory for a ${days} day trip to ${destination}. 
    Inventory: ${JSON.stringify(inventorySummary)}.
    Return ONLY JSON: { "selectedItemIds": ["id1", "id2"], "travelAdvice": "Brief, witty style advice for this destination." }`;

    try {
      const result = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = JSON.parse(cleanJson(result.candidates[0].content.parts[0].text));

      const items = closet.filter(c => data.selectedItemIds.includes(c.id));
      setPackedItems(items);
      setAdvice(data.travelAdvice);
      loadConfetti().then(c => c && c({ particleCount: 100, spread: 70, origin: { y: 0.6 } }));
    } catch (err) {
      console.error(err);
      setAdvice("Couldn't reach your digital stylist. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-[#D4C4A8] shadow-sm">
        <button onClick={onBack} className="p-3 bg-[#E5D3B3]/30 rounded-full hover:bg-[#E5D3B3] transition-colors"><ChevronRight className="w-5 h-5 rotate-180 text-[#800020]" /></button>
        <h2 className="text-2xl font-black text-gray-900">Trip Packer ✨</h2>
      </div>

      {!packedItems ? (
        <div className="bg-white p-8 rounded-[3rem] border border-[#D4C4A8] shadow-xl max-w-md mx-auto">
          <form onSubmit={generatePack} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Paris, France" className="w-full p-4 pl-12 rounded-2xl bg-[#E5D3B3]/10 border border-[#D4C4A8]/40 focus:border-[#800020] outline-none font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Duration (Days)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="number" min="1" max="30" value={days} onChange={e => setDays(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-[#E5D3B3]/10 border border-[#D4C4A8]/40 focus:border-[#800020] outline-none font-bold" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-[#800020] hover:bg-[#600018] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50">
              {loading ? "Planning..." : "Generate Packing List"}
              <Plane className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#800020] text-white p-8 rounded-[2.5rem] shadow-xl border border-rose-900/30 flex items-start gap-4">
            <Globe className="w-8 h-8 shrink-0 text-rose-300" />
            <div>
              <h3 className="font-bold text-xl mb-1">Pack for {destination}</h3>
              <p className="text-rose-100/80 leading-relaxed italic">"{advice}"</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {packedItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-[#D4C4A8] shadow-sm relative group">
                <div className="aspect-[4/5]"><img src={item.image} className="w-full h-full object-cover" alt="packed item" /></div>
                <div className="absolute bottom-0 inset-x-0 p-3 bg-white/90 backdrop-blur-sm">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#800020]">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setPackedItems(null)} className="mx-auto block text-gray-500 font-bold hover:text-[#800020] mt-8">Plan another trip</button>
        </div>
      )}
    </div>
  );
};

const ChatOracle = ({ onClose, profile }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Ciao ${profile?.nickname}! I'm Muse. Ask me anything about your style or fashion trends.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    const prompt = `You are Muse, a witty, chic, and helpful high-end fashion stylist bot. 
    User Profile: ${JSON.stringify(profile)}.
    Chat History: ${JSON.stringify(messages.slice(-4))}.
    User Question: ${newMsg.text}.
    Keep responses short (under 50 words), engaging, and helpful. Use emojis.`;

    try {
      const result = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const responseText = result.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Darling, I'm having a moment. Ask me later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border border-[#D4C4A8]">
        <div className="p-6 bg-[#800020] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="font-black text-lg">Muse Oracle</h3>
              <p className="text-xs text-rose-200 font-medium">Your AI Stylist</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-6 h-6 text-white/70 hover:text-white" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F4EB]" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-[#800020] text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm border border-[#D4C4A8]/40 rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-[#D4C4A8]/40 flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-[#D4C4A8]/30 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about trends, matching..."
            className="flex-1 bg-[#F8F4EB] rounded-xl px-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
          />
          <button disabled={!input || loading} type="submit" className="p-3 bg-[#800020] text-white rounded-xl disabled:opacity-50"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </div>
  );
};


// --- MAIN APP ---


const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [closet, setCloset] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [view, setView] = useState('closet');
  const [loading, setLoading] = useState(false);
  const [activeOutfit, setActiveOutfit] = useState(null);
  const [shopRecommendation, setShopRecommendation] = useState(null);
  const [curatedLooks, setCuratedLooks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [savingOutfit, setSavingOutfit] = useState(false);

  const [onboarding, setOnboarding] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');

  // New States
  const [showStylistMenu, setShowStylistMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);


  const fileInputRef = useRef(null);


  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
        // App starts with AuthScreen if no user is signed in
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();
    loadConfetti();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoading(true);
        const profileRef = doc(db, 'artifacts', appId, 'users', u.uid, 'settings', 'profile');
        const docSnap = await getDoc(profileRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setNickname(data.nickname);
          setGender(data.gender);
          setOnboarding(false);
        } else {
          setOnboarding(true);
        }
        setLoading(false);
      } else {
        setProfile(null);
        setOnboarding(false);
      }
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) return;
    const closetRef = collection(db, 'artifacts', appId, 'users', user.uid, 'clothes');
    const unsubCloset = onSnapshot(query(closetRef), (snapshot) => {
      setCloset(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));


    const outfitsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'outfits');
    const unsubOutfits = onSnapshot(query(outfitsRef), (snapshot) => {
      setSavedOutfits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));


    return () => { unsubCloset(); unsubOutfits(); };
  }, [user]);


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!nickname || !gender || !user) return;
    setLoading(true);
    try {
      const profileData = { nickname, gender, createdAt: Date.now() };
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), profileData);
      setProfile(profileData);
      setOnboarding(false);
      setCuratedLooks([]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };


  const handleLogout = async () => {
    await signOut(auth);
    setView('closet');
  };


  const triggerConfetti = async () => {
    const confetti = await loadConfetti();
    if (confetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#800020', '#4a0404', '#ffffff'] });
  };


  const identifyClothing = async (base64Image) => {
    const prompt = `Identify this clothing item. Context: ${JSON.stringify(profile)}. Return JSON: { "category": "Top/Bottom/Shoes/Accessory", "color": "str", "style": "str", "description": "str" }`;
    try {
      const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: base64Image.split(',')[1] } }] }] })
      });
      return JSON.parse(cleanJson(data.candidates[0].content.parts[0].text));
    } catch (err) { return { category: "Unknown", color: "Unknown", style: "Casual", description: "Item" }; }
  };


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const metadata = await identifyClothing(reader.result);
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'clothes'), { image: reader.result, ...metadata, createdAt: Date.now() });
      setUploading(false);
      triggerConfetti();
    };
  };


  const generateOutfit = async (occasion = "Casual") => {
    if (closet.length < 1) return;
    setLoading(true);
    const inventorySummary = closet.map(item => ({ id: item.id, category: item.category, color: item.color, description: item.description }));
    const prompt = `Stylist AI. Profile: ${JSON.stringify(profile)}. Occasion: ${occasion}. Inventory: ${JSON.stringify(inventorySummary)}. Suggest a unique outfit matching the user's gender/preference. Return ONLY JSON: { "topId": "str", "bottomId": "str", "shoesId": "str", "accessoryId": "str|null", "reasoning": "str", "missingItem": { "name": "str", "type": "str", "why": "str", "myntraQuery": "str" } }`;
    try {
      const result = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const selection = JSON.parse(cleanJson(result.candidates[0].content.parts[0].text));
      setActiveOutfit({
        top: closet.find(i => i.id === selection.topId) || null,
        bottom: closet.find(i => i.id === selection.bottomId) || null,
        shoes: closet.find(i => i.id === selection.shoesId) || null,
        accessory: selection.accessoryId ? (closet.find(i => i.id === selection.accessoryId) || null) : null,
        reasoning: selection.reasoning || ""
      });
      setShopRecommendation(selection.missingItem || null);
      setView('generate');
      triggerConfetti();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };


  const saveCurrentOutfit = async (customOutfit = null) => {
    const outfitToSave = customOutfit || activeOutfit;
    if (!outfitToSave || !user) return;
    setSavingOutfit(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'outfits'), {
        ...outfitToSave,
        missingItem: customOutfit ? null : shopRecommendation,
        createdAt: Date.now(),
        reasoning: customOutfit ? "Personally curated look." : outfitToSave.reasoning
      });
      triggerConfetti();
      setView('outfits');
    } catch (err) { console.error(err); } finally { setSavingOutfit(false); }
  };


  const createNewMyntraLook = async (theme) => {
    setLoading(true); setView('shop');
    const prompt = `Create a trending look for "${theme}". IMPORTANT: The user identifies as "${profile?.gender || 'Unisex'}". Suggest ONLY clothing items designed for this gender category. Return JSON: { "lookName": "str", "vibe": "str", "items": [{ "type": "str", "name": "str", "query": "str" }] }`;
    try {
      const result = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = JSON.parse(cleanJson(result.candidates[0].content.parts[0].text));
      setCuratedLooks(prev => [data, ...prev]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };


  const deleteItem = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'clothes', id));
  const deleteOutfit = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'outfits', id));


  // --- RENDERING LOGIC ---
  if (!user) return <AuthScreen />;
  if (onboarding) return <ProfileSetupScreen nickname={nickname} setNickname={setNickname} gender={gender} setGender={setGender} handleProfileSubmit={handleProfileSubmit} loading={loading} />;


  return (
    <div className="min-h-screen bg-[#E5D3B3] text-gray-900 font-sans pb-36">
      <header className="sticky top-0 z-50 bg-[#E5D3B3]/80 backdrop-blur-xl border-b border-[#D4C4A8]/50 px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#800020] rounded-xl flex items-center justify-center shadow-lg"><Sparkles className="text-white w-5 h-5" /></div>
          <h1 className="text-2xl font-black tracking-tighter text-[#800020]">Muse<span className="text-gray-900">.</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-[#800020] transition-colors"><LogOut className="w-5 h-5" /></button>
          <div className="flex items-center gap-2 p-1.5 pr-4 bg-white/50 rounded-full border border-[#D4C4A8]/30">
            <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center text-white"><User className="w-4 h-4" /></div>
            <span className="text-xs font-bold text-gray-700">{profile?.nickname || 'Guest'}</span>
          </div>
        </div>
      </header>


      <main className="max-w-5xl mx-auto p-6 min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-[#800020] animate-pulse">Styling your world...</p>
          </div>
        ) : (
          <>
            {view === 'closet' && <ClosetView profile={profile} closet={closet} fileInputRef={fileInputRef} deleteItem={deleteItem} startManualCreate={() => setView('manual')} />}
            {view === 'outfits' && <SavedOutfitsView outfits={savedOutfits} deleteOutfit={deleteOutfit} />}
            {view === 'manual' && <ManualCreatorView closet={closet} onCancel={() => setView('closet')} onSave={saveCurrentOutfit} />}
            {view === 'pack' && <TripPackerView closet={closet} onBack={() => setView('closet')} />}
            {view === 'generate' && activeOutfit && (
              <div className="space-y-6">
                <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-[#D4C4A8] shadow-2xl overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[#D4C4A8]/20 pb-8">
                    <div className="max-w-2xl">
                      <span className="text-[10px] font-black uppercase text-[#800020] tracking-widest mb-2 block">Stylist Notes</span>
                      <p className="italic text-[#4a0404] text-xl font-serif leading-relaxed">"{activeOutfit.reasoning}"</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => generateOutfit()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#800020] bg-[#800020]/5 py-3 px-6 rounded-2xl border border-[#800020]/10"><RefreshCcw className="w-4 h-4" />Refresh</button>
                      <button onClick={() => saveCurrentOutfit()} disabled={savingOutfit} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-[#800020] py-3 px-6 rounded-2xl shadow-xl active:scale-95 disabled:opacity-50"><Heart className="w-4 h-4" />{savingOutfit ? 'Saving...' : 'Save Look'}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['top', 'bottom', 'shoes', 'accessory'].map(key => {
                      const val = activeOutfit[key];
                      return val ? (
                        <div key={key} className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{key}</span>
                          <div className="rounded-[2rem] overflow-hidden border border-[#D4C4A8]/20 aspect-[4/5] bg-[#F8F4EB]"><img src={val.image} className="w-full h-full object-cover" alt={key} /></div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase truncate px-2">{val.description}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                {shopRecommendation && (
                  <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-8 items-center border border-rose-900/30">
                    <ShoppingBag className="w-12 h-12 text-rose-400 shrink-0" />
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-bold text-2xl mb-1">Add a {shopRecommendation.name}</h4>
                      <p className="text-gray-400 mb-6 text-lg">{shopRecommendation.why}</p>
                      <a href={getMyntraUrl(shopRecommendation.myntraQuery, profile?.gender)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-sm">Shop Now <ArrowRight className="w-4 h-4" /></a>
                    </div>
                  </div>
                )}
              </div>
            )}
            {view === 'shop' && <ShopView profile={profile} curatedLooks={curatedLooks} createNewMyntraLook={createNewMyntraLook} />}
          </>
        )}
      </main>

      {/* Floating Chat Button */}
      {!showChat && (
        <button onClick={() => setShowChat(true)} className="fixed bottom-24 right-6 z-40 bg-white text-[#800020] p-4 rounded-full shadow-xl border border-[#D4C4A8] hover:scale-110 transition-transform">
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Overlays */}
      {showChat && <ChatOracle profile={profile} onClose={() => setShowChat(false)} />}

      {showStylistMenu && (
        <div className="fixed inset-0 z-50 bg-[#800020]/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#E5D3B3] rounded-[3rem] p-6 pb-8 space-y-4 animate-in slide-in-from-bottom-20 shadow-2xl">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-2xl text-[#800020]">Stylist Studio</h3>
              <button onClick={() => setShowStylistMenu(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/40"><X className="w-6 h-6 text-[#800020]" /></button>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => { setShowStylistMenu(false); if (closet.length < 1) fileInputRef.current.click(); else generateOutfit(); }}
                className="bg-white p-5 rounded-[2rem] flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-md group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#800020] text-white flex items-center justify-center group-hover:rotate-12 transition-transform"><Sparkles className="w-6 h-6" /></div>
                <div className="text-left">
                  <h4 className="font-black text-gray-900">Instant Outfit</h4>
                  <p className="text-xs font-bold text-gray-500">Daily AI generated look</p>
                </div>
              </button>

              <button
                onClick={() => { setShowStylistMenu(false); setView('pack'); }}
                className="bg-white p-5 rounded-[2rem] flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-md group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2a4858] text-white flex items-center justify-center group-hover:-rotate-12 transition-transform"><Plane className="w-6 h-6" /></div>
                <div className="text-left">
                  <h4 className="font-black text-gray-900">Trip Packer ✨</h4>
                  <p className="text-xs font-bold text-gray-500">Smart packing lists</p>
                </div>
              </button>

              <button
                onClick={() => { setShowStylistMenu(false); setShowChat(true); }}
                className="bg-white p-5 rounded-[2rem] flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-md group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#d4a373] text-white flex items-center justify-center group-hover:rotate-12 transition-transform"><MessageCircle className="w-6 h-6" /></div>
                <div className="text-left">
                  <h4 className="font-black text-gray-900">Ask Muse ✨</h4>
                  <p className="text-xs font-bold text-gray-500">Fashion advice chat</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}


      <nav className="fixed bottom-0 left-0 right-0 bg-[#E5D3B3]/90 backdrop-blur-2xl border-t border-[#D4C4A8]/50 px-6 py-5 pb-10 flex justify-around items-center z-40 rounded-t-[3rem] shadow-2xl">
        <button onClick={() => setView('closet')} className={`flex flex-col items-center gap-1 ${view === 'closet' ? 'text-[#800020]' : 'text-gray-400'}`}><LayoutGrid className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Closet</span></button>
        <button onClick={() => setView('outfits')} className={`flex flex-col items-center gap-1 ${view === 'outfits' ? 'text-[#800020]' : 'text-gray-400'}`}><Shirt className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Outfits</span></button>

        {/* Central Button now opens the Stylist Menu */}
        <button onClick={() => setShowStylistMenu(true)} className="w-16 h-16 -mt-20 bg-[#800020] rounded-[1.5rem] flex items-center justify-center shadow-2xl text-white border-[6px] border-[#E5D3B3] hover:scale-110 transition-all">{uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-7 h-7" />}</button>

        <button onClick={() => { setView('shop'); if (curatedLooks.length === 0) createNewMyntraLook('Current Trends'); }} className={`flex flex-col items-center gap-1 ${view === 'shop' ? 'text-[#800020]' : 'text-gray-400'}`}><ShoppingBag className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Shop</span></button>
        <button onClick={() => setOnboarding(true)} className="flex flex-col items-center gap-1 text-gray-400"><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Profile</span></button>
      </nav>


      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
    </div>
  );
};


export default App;
