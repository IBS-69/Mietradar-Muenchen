import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Apartment, FilterState, ViewState, ChatSession, ChatMessage } from './types';
import { MOCK_OFFERS, DISTRICTS, HERO_IMAGES, DISTRICT_CENTERS, MOCK_CHATS } from './constants';
import {
  MapPin, Search, Home, Moon, Sun, Menu, X,
  CheckCircle, Star, Heart,
  ChevronLeft, ChevronRight, Mail, User, Lock,
  Maximize2, Upload, DollarSign, Info, CheckSquare,
  Shield, Zap, ImageOff, Eye, EyeOff, LockKeyhole, Send
} from 'lucide-react';
import HotspotAnalytics from "./HotspotAnalytics";



// --- Typ & Mapping für DB-Listings (PostgREST) ---

// feste Basis-URL für deine PostgREST-API
const API_BASE_URL = 'https://api.mixmaxjulien.de';

type DbListing = {
  id: string;          // UUID aus PostgREST
  title: string | null;
  rent: number | null;
  rooms: number | null;
  size_sqm: number | null;
  created_at: string;
};

type DbListingImage = {
  id: string;
  listing_id: string;
  position: number;
  data: string; // kommt von PostgREST (hex oder base64)
};

// Bild aus der DB in ein Browser-kompatibles src umwandeln
const dbImageToDataUrl = (value: string): string => {
  // Fall 1: Hex-Format wie "\xFFD8..."
  if (value.startsWith('\\x')) {
    const hex = value.slice(2);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:image/jpeg;base64,${base64}`;
  }

  // Fall 2: ist schon Base64
  return `data:image/jpeg;base64,${value}`;
};


// Mapping von PostgREST-Row → dein Apartment-Typ
const mapDbListingToApartment = (row: DbListing): Apartment => {
  const template = MOCK_OFFERS[0];

  // irgendeinen „stabilen“ numerischen ID-Wert aus der UUID bauen
  const numericId =
    parseInt(row.id.replace(/-/g, '').slice(0, 9), 16) ||
    Math.floor(Math.random() * 1_000_000);

  const district = template.district || 'München';
  const center = DISTRICT_CENTERS[district] || {
    lat: 48.137154,
    lng: 11.576124,
  };

  return {
    ...template,
    id: numericId,
    title: row.title || template.title,
    price: row.rent ?? template.price,
    size: row.size_sqm ?? template.size,
    rooms: row.rooms ?? template.rooms ?? 2,
    district,
    // Adresse kommt später ggf. aus listing_address – aktuell Dummy
    street: template.street,
    zipCode: template.zipCode,
    lat: center.lat + (Math.random() - 0.5) * 0.01,
    lng: center.lng + (Math.random() - 0.5) * 0.01,
    contactName: 'Vermieter (API)',
    description: template.description,
    isNew: true,
    isVerified: true,
  };
};


// --- Navbar ---

const Navbar = ({
  darkMode,
  toggleTheme,
  setView,
  currentView,
  isLoggedIn,
  onLogout,
  savedCount,
  unreadMessages
}: {
  darkMode: boolean;
  toggleTheme: () => void;
  setView: (v: ViewState) => void;
  currentView: ViewState;
  isLoggedIn: boolean;
  onLogout: () => void;
  savedCount: number;
  unreadMessages: number;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparentNav = !isScrolled && currentView === 'home';

  const brandTextColor = isTransparentNav ? 'text-white' : 'text-emerald-800 dark:text-white';
  const navTextColor = isTransparentNav ? 'text-gray-100 hover:text-white' : 'text-gray-700 dark:text-gray-200';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        !isTransparentNav
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div
            className="flex items-center cursor-pointer gap-2"
            onClick={() => setView('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Home size={18} strokeWidth={3} />
            </div>
            <span className={`font-bold text-xl tracking-tight ${brandTextColor}`}>
              MietRadar
              <span className={isTransparentNav ? 'text-white/80' : 'text-emerald-500'}> München</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setView('listings')}
              className={`font-medium transition-colors ${navTextColor}`}
            >
              Wohnungen finden
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`font-medium transition-colors ${navTextColor}`}
              >
              Hotspots
            </button>

            <button
              onClick={() => setView('db-listings')}
              className={`font-medium transition-colors ${navTextColor}`}
            >
              Wohnungen Datenbank
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => setView('create-listing')}
                className={`font-medium transition-colors ${navTextColor}`}
              >
                Inserat aufgeben
              </button>
            ) : (
              <button
                onClick={() => setView('landlord-landing')}
                className={`font-medium transition-colors ${navTextColor}`}
              >
                Für Vermieter
              </button>
            )}

            <div className={`h-6 w-px ${isTransparentNav ? 'bg-white/40' : 'bg-gray-300/60'}`} />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {darkMode ? (
                <Sun size={20} className={isTransparentNav ? 'text-white' : 'text-gray-700 dark:text-gray-200'} />
              ) : (
                <Moon size={20} className={isTransparentNav ? 'text-white' : 'text-gray-700'} />
              )}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* Favorites */}
                <button
                  onClick={() => setView('favorites')}
                  className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isTransparentNav ? 'text-white hover:text-gray-900' : 'text-gray-700 dark:text-gray-200'
                  }`}
                  title="Merkzettel"
                >
                  <Heart size={20} />
                  {savedCount > 0 && (
                    <span className="absolute top-1 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </button>

                {/* Messages */}
                <button
                  onClick={() => setView('messages')}
                  className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    isTransparentNav ? 'text-white hover:text-gray-900' : 'text-gray-700 dark:text-gray-200'
                  }`}
                  title="Nachrichten"
                >
                  <Mail size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </button>

                <button
                  onClick={onLogout}
                  className={`font-medium ml-2 ${isTransparentNav ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  Abmelden
                </button>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                  A
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('login')}
                  className={`font-medium ${
                    isTransparentNav ? 'text-white hover:text-emerald-100' : 'text-gray-700 dark:text-gray-200 hover:text-emerald-600'
                  }`}
                >
                  Anmelden
                </button>
                <button
                  onClick={() => setView('register')}
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition-transform hover:scale-105 shadow-lg ${
                    isTransparentNav
                      ? 'bg-white text-emerald-700 hover:bg-gray-100'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  }`}
                >
                  Registrieren
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="text-current">
              {darkMode ? (
                <Sun size={20} className={isTransparentNav ? 'text-white' : 'text-gray-400'} />
              ) : (
                <Moon size={20} className={isTransparentNav ? 'text-white' : 'text-gray-600'} />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={isTransparentNav ? 'text-white' : 'text-gray-800 dark:text-white'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 space-y-4 shadow-xl">
          <button
            onClick={() => {
              setView('listings');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
          >
            Wohnungen finden
          </button>
          <button
            onClick={() => {
              setView('db-listings');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
          >
            Wohnungen Datenbank
          </button>
          <button
            onClick={() => {
              setView('analytics');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
            >
              Hotspots
          </button>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setView('favorites');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
              >
                Merkzettel ({savedCount})
              </button>
              <button
                onClick={() => {
                  setView('messages');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
              >
                Nachrichten ({unreadMessages})
              </button>
              <button
                onClick={() => {
                  setView('create-listing');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left font-medium text-emerald-600"
              >
                Inserat erstellen
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
              >
                Abmelden
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setView('landlord-landing');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
              >
                Für Vermieter
              </button>
              <button
                onClick={() => {
                  setView('login');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left font-medium text-gray-700 dark:text-gray-200"
              >
                Anmelden
              </button>
              <button
                onClick={() => {
                  setView('register');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-center bg-emerald-600 text-white py-3 rounded-lg font-semibold"
              >
                Registrieren
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

// --- Hero Section ---

const HeroSection = ({ onSearch, setFilters }: { onSearch: () => void; setFilters: (f: any) => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [district, setDistrict] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    setFilters({
      district: district,
      maxPrice: 5000,
      minRooms: 0,
      query: ''
    });
    onSearch();
  };

  return (
    <div className="relative h-[650px] md:h-[780px] w-full overflow-hidden flex items-center justify-center bg-gray-900">
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <img
          src={HERO_IMAGES[currentImageIndex].url}
          alt={HERO_IMAGES[currentImageIndex].alt}
          className="w-full h-full object-cover scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-gray-50 dark:to-gray-900" />
      </div>
      <div className="relative z-10 max-w-5xl w-full px-4 text-center mt-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 shadow-lg">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span>MietRadar: Deine #1 für München</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-xl">
          Zuhause finden in <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">
            Deutschlands schönster Stadt
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium opacity-90">
          Entdecke exklusive Wohnungen, charmante Altbauten und moderne Lofts in Münchens besten Lagen.
        </p>
        <div className="bg-white p-2.5 rounded-2xl shadow-2xl shadow-black/20 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="flex-[2] relative group">
            <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-600">
              <MapPin size={20} />
            </div>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-xl bg-white border border-transparent focus:border-emerald-200 focus:bg-emerald-50/50 focus:ring-0 outline-none text-gray-900 font-medium appearance-none cursor-pointer hover:bg-gray-50 transition-colors text-base"
            >
              <option value="">Beliebiger Stadtteil</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4.5 pointer-events-none text-gray-400">
              <ChevronLeft size={16} className="-rotate-90" />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 sm:w-auto w-full"
          >
            <Search size={20} />
            <span>Suchen</span>
          </button>
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/90 text-sm font-semibold drop-shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" /> Geprüfte Anbieter
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" /> Datenschutz Konform
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" /> Täglich Updates
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Karte ---

const MapComponent = ({
  apartments,
  onMarkerClick,
  selectedDistrict
}: {
  apartments: Apartment[];
  onMarkerClick: (apt: Apartment) => void;
  selectedDistrict: string;
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    if (typeof window.L === 'undefined') return;
    const L = window.L;
    mapInstance.current = L.map(mapContainer.current).setView([48.137154, 11.576124], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance.current);
    setTimeout(() => {
      mapInstance.current?.invalidateSize();
    }, 100);
  }, []);

  useEffect(() => {
    if (!mapInstance.current || typeof window.L === 'undefined') return;
    const L = window.L;
    if (selectedDistrict && DISTRICT_CENTERS[selectedDistrict]) {
      const center = DISTRICT_CENTERS[selectedDistrict];
      mapInstance.current.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
    }
    markersRef.current.forEach((m) => mapInstance.current.removeLayer(m));
    markersRef.current = [];
    apartments.forEach((apt) => {
      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: white; color:#047857; padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 13px; border: 2px solid #10b981; box-shadow: 0 4px 6px rgba(0,0,0,0.15); width: max-content; cursor: pointer; transition: transform 0.2s;">${apt.price} €</div>`,
        iconSize: [40, 20],
        iconAnchor: [20, 10]
      });
      const marker = L.marker([apt.lat, apt.lng], { icon }).addTo(mapInstance.current);
      marker.on('click', () => onMarkerClick(apt));
      markersRef.current.push(marker);
    });
  }, [apartments, onMarkerClick, selectedDistrict]);

  return <div ref={mapContainer} className="h-full w-full bg-gray-100 rounded-xl overflow-hidden z-0" />;
};

// --- Landlord Landing Page ---

const LandlordLandingPage = ({ onStartListing }: { onStartListing: () => void }) => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* HERO */}
      <div className="relative text-white pt-32 pb-24 overflow-hidden">
        {/* Hintergrundbild */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000"
            className="w-full h-full object-cover"
            alt="Background"
          />
        </div>

        {/* Helle, leicht milchige Overlay-Schicht */}
        <div className="absolute inset-0 bg-white/10 dark:bg-black/40" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Vermieten leicht gemacht.
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Inserieren Sie Ihre Immobilie in München kostenlos und erreichen Sie tausende geprüfte Mietinteressenten.
          </p>
          <button
            onClick={onStartListing}
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-105"
          >
            Jetzt kostenlos inserieren
          </button>
        </div>
      </div>
      <div className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Sicher & Seriös</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Wir prüfen Inserate und Anfragen, um Spam und Betrug zu verhindern.
            </p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <DollarSign size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">100% Kostenlos</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Für private Vermieter ist das Inserieren auf MietRadar komplett gebührenfrei.
            </p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Schnelle Vermittlung</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Dank Smart-Matching finden Sie in Rekordzeit den passenden Mieter.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 dark:text-white">Bereit, den perfekten Mieter zu finden?</h2>
          <button
            onClick={onStartListing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-105"
          >
            Kostenloses Konto erstellen
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Listing Card ---

const ListingCard = ({
  item,
  onClick,
  isSaved,
  onToggleSave
}: {
  item: Apartment;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden bg-gray-200">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageOff size={32} className="mb-2" />
            <span className="text-xs">Bild nicht verfügbar</span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(e);
          }}
          className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full transition-colors z-10 ${
            isSaved ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <p className="text-white font-bold text-xl shadow-black/50 drop-shadow-sm">{item.price} €</p>
            <p className="text-white/80 text-xs font-medium">
              {item.size} m² • {item.rooms} Zi.
            </p>
          </div>
          {item.isVerified && (
            <span className="bg-white/90 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <CheckCircle size={10} /> GEPRÜFT
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
          <MapPin size={14} /> {item.district}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          {(item.amenities || []).slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
          {item.amenities && item.amenities.length > 3 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-md">
              +{item.amenities.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Lightbox ---

const ImageLightbox = ({
  images,
  initialIndex,
  onClose
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(initialIndex);
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-colors"
      >
        <X size={24} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
        }}
        className="absolute left-4 text-white/70 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all"
      >
        <ChevronLeft size={40} />
      </button>
      <img
        src={images[index]}
        alt={`Gallery ${index}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-2xl"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://via.placeholder.com/800x600?text=Bild+nicht+verfügbar';
        }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
        }}
        className="absolute right-4 text-white/70 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all"
      >
        <ChevronRight size={40} />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full text-white text-sm font-medium">
        {index + 1} / {images.length}
      </div>
    </div>
  );
};

// --- Property Details ---

const PropertyDetails = ({
  item,
  onBack,
  isSaved,
  onToggleSave,
  onContact
}: {
  item: Apartment;
  onBack: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onContact: (message: string) => void;
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState(
    `Guten Tag,\n\nich interessiere mich für Ihr Angebot "${item.title}" und würde gerne einen Besichtigungstermin vereinbaren.`
  );

  const allImages = [item.image, ...(item.gallery || [])];
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContact(contactMessage);
  };

  return (
    <div className="pt-20 pb-12 bg-white dark:bg-gray-900 min-h-screen">
      {lightboxOpen && (
        <ImageLightbox images={allImages} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-emerald-600" onClick={onBack}>
            Suche
          </span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-emerald-600" onClick={onBack}>
            München
          </span>
          <ChevronRight size={14} />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {item.title}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] mb-8 rounded-2xl overflow-hidden cursor-pointer group">
          <div className="md:col-span-2 h-full relative bg-gray-200" onClick={() => openLightbox(0)}>
            <img
              src={item.image}
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
              alt="Main"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/800x600?text=Bild+nicht+verfügbar';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm font-medium flex items-center gap-2">
                <Maximize2 size={16} /> Alle Bilder ansehen
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.();
              }}
              className={`absolute top-4 right-4 p-3 rounded-full z-20 backdrop-blur-md transition-colors ${
                isSaved ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-2 h-full">
            {(item.gallery || []).slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="relative h-full overflow-hidden bg-gray-200"
                onClick={() => openLightbox(i + 1)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  alt={`Gallery ${i}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/800x600?text=Bild+nicht+verfügbar';
                  }}
                />
                {i === 3 && (item.gallery || []).length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl">
                    +{(item.gallery || []).length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h1>
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> {item.street ? `${item.street}, ` : ''}
                  {item.zipCode} {item.district}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="flex items-center gap-1">ID: {item.id + 94820}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{item.price} €</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Kaltmiete</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{item.size} m²</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Wohnfläche</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{item.rooms}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Zimmer</div>
              </div>
            </div>
            <section className="mb-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Objektbeschreibung</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </section>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                    {item.contactName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{item.contactName}</div>
                    <div className="text-xs text-emerald-600 font-medium">Geprüfter Anbieter</div>
                  </div>
                </div>
                <form className="space-y-3" onSubmit={handleContactSubmit}>
                  <textarea
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:border-emerald-500 outline-none resize-none"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                  >
                    Nachricht senden
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Landing Page ---

const LandingPage = ({ onSearch, setFilters }: { onSearch: () => void; setFilters: (f: any) => void }) => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection onSearch={onSearch} setFilters={setFilters} />

      {/* Features Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Warum MietRadar?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Wir machen die Wohnungssuche in München einfach, transparent und stressfrei.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Geprüfte Inserate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Jedes Inserat wird von unserem Team manuell geprüft, um Fake-Angebote auszuschließen.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Echtzeit-Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Erhalte Benachrichtigungen, sobald eine passende Wohnung online geht.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Sichere Kommunikation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kommuniziere sicher über unser integriertes Nachrichtensystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Auth Page ---

const AuthPage = ({
  type,
  setView,
  onLogin
}: {
  type: 'login' | 'register';
  setView: (v: ViewState) => void;
  onLogin: (admin: boolean) => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [honeyPot, setHoneyPot] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [startTime] = useState(Date.now());

  const strength = useMemo(() => {
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (honeyPot) return;

    if (Date.now() - startTime < 2000) {
      alert('Bitte füllen Sie das Formular langsamer aus (Spam-Schutz).');
      return;
    }

    if (type === 'login') {
      if (email.toLowerCase() === 'admin' && password === '123') {
        onLogin(true);
      } else {
        onLogin(false);
      }
    } else {
      if (password !== passwordConfirm) {
        alert('Passwörter stimmen nicht überein.');
        return;
      }
      if (!tosAccepted) {
        alert('Bitte akzeptieren Sie die AGB und Datenschutzbestimmungen.');
        return;
      }
      onLogin(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {type === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h2>
          <p className="text-sm text-gray-500">
            {type === 'login' ? 'Bitte melden Sie sich an, um fortzufahren.' : 'Starten Sie Ihre Wohnungssuche heute.'}
          </p>
        </div>

        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-lg flex items-start gap-3 text-sm border border-emerald-100 dark:border-emerald-800">
          <Shield size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Sicher & Verschlüsselt</span>
            <p className="text-xs opacity-80 mt-0.5">Ihre Daten werden per SSL übertragen und sicher gespeichert.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="hidden">
            <input
              type="text"
              value={honeyPot}
              onChange={(e) => setHoneyPot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {type === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vorname *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    required={type === 'register'}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nachname *
                </label>
                <input
                  type="text"
                  required={type === 'register'}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Mustermann"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === 'login' ? 'E-Mail oder Benutzername' : 'E-Mail Adresse *'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder={type === 'login' ? 'E-Mail oder Benutzer' : 'name@beispiel.de'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {type === 'login' && (
              <p className="text-xs text-gray-400 mt-1 ml-1">(Hint: admin / 123)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passwort {type === 'register' && '*'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {type === 'register' && password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 h-1 mb-1">
                  <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-green-600' : 'bg-gray-200'}`} />
                </div>
                <p className="text-xs text-gray-500">
                  {strength < 2 ? 'Schwach' : strength < 4 ? 'Mittel' : 'Stark'}
                </p>
              </div>
            )}
          </div>

          {type === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passwort wiederholen *
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>
          )}

          {type === 'register' && (
            <div className="flex items-start gap-2 mt-4">
              <input
                type="checkbox"
                id="tos"
                className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
              />
              <label htmlFor="tos" className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                Ich akzeptiere die{' '}
                <button
                  type="button"
                  onClick={() => setView('legal')}
                  className="text-emerald-600 hover:underline"
                >
                  AGB
                </button>{' '}
                und habe die{' '}
                <button
                  type="button"
                  onClick={() => setView('legal')}
                  className="text-emerald-600 hover:underline"
                >
                  Datenschutzerklärung
                </button>{' '}
                gelesen.
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 mt-4"
          >
            {type === 'login' ? 'Anmelden' : 'Kostenlos registrieren'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {type === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button
                onClick={() => setView('register')}
                className="text-emerald-600 hover:underline font-medium"
              >
                Jetzt registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              <button
                onClick={() => setView('login')}
                className="text-emerald-600 hover:underline font-medium"
              >
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Create Listing Wizard ---

const CreateListingWizard = ({
  onSubmit,
  onCancel,
  isAdmin
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isAdmin: boolean;
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    type: 'Wohnung',
    price: '',
    costs: '',
    size: '',
    rooms: '',
    floor: '',
    street: '',
    zip: '',
    district: '',
    images: [] as string[]
  });
  const [customDistrict, setCustomDistrict] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validateStep1 = () => {
    if (isAdmin) return true;
    const newErrors: Record<string, boolean> = {};
    if (!formData.title) newErrors.title = true;
    if (!formData.price) newErrors.price = true;
    if (!formData.size) newErrors.size = true;
    if (!formData.rooms) newErrors.rooms = true;
    if (formData.district === '' && customDistrict === '') newErrors.district = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      onSubmit({
        ...formData,
        district: formData.district === 'custom' ? customDistrict : formData.district
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file as Blob));
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                step >= 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100'
              }`}
            >
              1
            </div>
            <span className="text-xs font-medium">Eckdaten</span>
          </div>
          <div className={`flex-grow h-1 mx-4 ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                step >= 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100'
              }`}
            >
              2
            </div>
            <span className="text-xs font-medium">Details & Bilder</span>
          </div>
          <div className={`flex-grow h-1 mx-4 ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                step >= 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100'
              }`}
            >
              3
            </div>
            <span className="text-xs font-medium">Vorschau</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Neues Inserat erstellen</h1>
        <p className="text-gray-500 mb-6">
          Felder mit einem <span className="text-red-500">*</span> sind Pflichtfelder.
        </p>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">
                Titel des Inserats <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-lg border dark:bg-gray-900 ${
                  errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:border-emerald-500'
                }`}
                placeholder="z.B. Helle 3-Zimmer Wohnung in Schwabing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Kaltmiete (€) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className={`w-full px-4 py-3 rounded-lg border dark:bg-gray-900 ${
                      errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <span className="absolute right-4 top-3 text-gray-400">€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Grundmiete ohne Nebenkosten</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Nebenkosten (€)</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
                    placeholder="0"
                    value={formData.costs}
                    onChange={(e) => setFormData({ ...formData, costs: e.target.value })}
                  />
                  <span className="absolute right-4 top-3 text-gray-400">€</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Wohnfläche (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className={`w-full px-4 py-3 rounded-lg border dark:bg-gray-900 ${
                    errors.size ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Zimmer <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className={`w-full px-4 py-3 rounded-lg border dark:bg-gray-900 ${
                    errors.rooms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="1"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">
                Stadtteil <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 rounded-lg border dark:bg-gray-900 cursor-pointer ${
                  errors.district ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              >
                <option value="">Bitte wählen...</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="custom">Anderer Stadtteil...</option>
              </select>
              {formData.district === 'custom' && (
                <input
                  type="text"
                  className="w-full mt-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
                  placeholder="Stadtteil eingeben"
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                />
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Beschreibung</label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500"
                placeholder="Beschreiben Sie die Wohnung, Lage und Besonderheiten..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 dark:text-white">Bilder hochladen</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border border-gray-200"
                  >
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-500">
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs font-medium">Bild wählen</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageSelect} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tipp: Laden Sie hochwertige Bilder hoch für mehr Anfragen.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in text-center py-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckSquare size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fast geschafft!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Ihr Inserat ist bereit zur Veröffentlichung. Es wird nach einer kurzen Prüfung für alle Nutzer
              sichtbar sein.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-left max-w-md mx-auto border border-gray-200 dark:border-gray-600">
              <div className="font-bold text-gray-900 dark:text-white mb-1">{formData.title}</div>
              <div className="text-sm text-gray-500 mb-3">
                {formData.district === 'custom' ? customDistrict : formData.district} • {formData.rooms} Zi •{' '}
                {formData.size} m²
              </div>
              <div className="font-bold text-emerald-600">{formData.price} € Kaltmiete</div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-8 mt-8 border-t border-gray-100 dark:border-gray-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              <ChevronLeft size={18} /> Zurück
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Abbrechen
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            {step === 3 ? 'Kostenlos inserieren' : 'Weiter'} {step < 3 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Legal Page ---

const LegalPage = () => (
  <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 min-h-screen">
    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-8 rounded-r-lg">
      <div className="flex gap-3">
        <Info className="text-emerald-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-emerald-800">Projektarbeit – Studenten der FOM München</p>
          <p className="text-sm text-emerald-700">
            Dies ist ein reines Studienprojekt im Rahmen des Moduls Anwendungsentwicklung. Keine echten Angebote.
          </p>
        </div>
      </div>
    </div>

    <h1 className="text-3xl font-bold mb-8 dark:text-white">Impressum & Rechtliches</h1>

    <div className="space-y-8 text-gray-700 dark:text-gray-300">
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">Impressum</h2>
        <p className="mb-4">
          <strong>Angaben gemäß § 5 TMG:</strong>
          <br />
          Christian Falkner
          <br />
          Student der FOM Hochschule für Oekonomie &amp; Management
          <br />
          München
        </p>
        <p>
          <strong>Kontakt:</strong>
          <br />
          E-Mail: webmaster@falkner.info
          <br />
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">Datenschutzerklärung</h2>

        <h3 className="font-bold mt-4 mb-2">1. Datenschutz auf einen Blick</h3>
        <p className="mb-2">
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
          passiert, wenn Sie diese Website besuchen.
        </p>

        <h3 className="font-bold mt-4 mb-2">2. Hosting (All-Inkl)</h3>
        <p className="mb-2">
          Wir hosten die Inhalte unserer Website bei All-Inkl. Anbieter ist die ALL-INKL.COM - Neue Medien
          Münnich, Inh. René Münnich, Hauptstraße 68, 02742 Friedersdorf.
        </p>

        <h3 className="font-bold mt-4 mb-2">3. Externe Dienste</h3>
        <ul className="list-disc pl-5 space-y-1 mb-2">
          <li>
            <strong>Google Fonts:</strong> Zur einheitlichen Darstellung von Schriftarten.
          </li>
          <li>
            <strong>OpenStreetMap / Leaflet:</strong> Zur Darstellung von Kartenmaterial.
          </li>
          <li>
            <strong>Unsplash:</strong> Für Beispielbilder (in dieser Demo).
          </li>
        </ul>
      </section>
    </div>
  </div>
);

// --- Footer ---

const Footer = ({ setView, isLoggedIn }: { setView: (v: ViewState) => void; isLoggedIn: boolean }) => (
  <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Home size={18} strokeWidth={3} />
          </div>
          <span className="font-bold text-xl text-emerald-800 dark:text-white">MietRadar</span>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">
          Die Nummer 1 Plattform für die Wohnungssuche in München. Schnell, sicher und verifiziert.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Für Mieter</h4>
        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <button onClick={() => setView('listings')} className="hover:text-emerald-600">
              Wohnungen suchen
            </button>
          </li>
          <li>
            <button onClick={() => setView('db-listings')} className="hover:text-emerald-600">
              Wohnungen Datenbank
            </button>
          </li>
          <li>
            <button onClick={() => setView('favorites')} className="hover:text-emerald-600">
              Merkzettel
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Für Vermieter</h4>
        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <button
              onClick={() => (isLoggedIn ? setView('create-listing') : setView('landlord-landing'))}
              className="hover:text-emerald-600"
            >
              Inserat aufgeben
            </button>
          </li>
          <li>
            <button onClick={() => setView('landlord-landing')} className="hover:text-emerald-600">
              Preisübersicht
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Rechtliches</h4>
        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <button onClick={() => setView('legal')} className="hover:text-emerald-600">
              Impressum
            </button>
          </li>
          <li>
            <button onClick={() => setView('legal')} className="hover:text-emerald-600">
              Datenschutz
            </button>
          </li>
          <li>
            <button onClick={() => setView('legal')} className="hover:text-emerald-600">
              AGB
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
      &copy; {new Date().getFullYear()} MietRadar München GmbH. Alle Rechte vorbehalten.
    </div>
  </footer>
);

// --- Favorites Page ---

const FavoritesPage = ({
  savedIds,
  onRemove,
  onItemClick
}: {
  savedIds: number[];
  onRemove: (id: number) => void;
  onItemClick: (apt: Apartment) => void;
}) => {
  const savedApartments = MOCK_OFFERS.filter((apt) => savedIds.includes(apt.id));

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mein Merkzettel</h1>

        {savedApartments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Noch keine Favoriten</h3>
            <p className="text-gray-500">Markiere Wohnungen mit dem Herz-Symbol, um sie hier zu speichern.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedApartments.map((apt) => (
              <div key={apt.id} className="h-[400px]">
                <ListingCard
                  item={apt}
                  onClick={() => onItemClick(apt)}
                  isSaved={true}
                  onToggleSave={() => onRemove(apt.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Messages Page ---

const MessagesPage = ({
  chats,
  onSendMessage
}: {
  chats: ChatSession[];
  onSendMessage: (chatId: string, text: string) => void;
}) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(chats.length > 0 ? chats[0].id : null);
  const [inputText, setInputText] = useState('');
  const activeChat = chats.find((c) => c.id === activeChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeChatId && inputText.trim()) {
      onSendMessage(activeChatId, inputText);
      setInputText('');
    }
  };

  return (
    <div className="pt-24 pb-8 min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">Nachrichten</h2>
          </div>
          <div className="flex-grow overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  activeChatId === chat.id ? 'bg-emerald-50 dark:bg-gray-700/50 border-l-4 border-l-emerald-600' : ''
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-gray-900 dark:text-white truncate">{chat.partnerName}</span>
                  <span className="text-xs text-gray-500">
                    {chat.messages[chat.messages.length - 1]?.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mb-1">{chat.apartmentTitle}</p>
                <p className="text-sm text-gray-400 truncate">
                  {chat.messages[chat.messages.length - 1]?.text}
                </p>
              </div>
            ))}
            {chats.length === 0 && (
              <div className="p-8 text-center text-gray-400">Keine Nachrichten vorhanden.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  {activeChat.partnerName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{activeChat.partnerName}</div>
                  <div className="text-xs text-gray-500">{activeChat.apartmentTitle}</div>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.sender === 'me'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          msg.sender === 'me' ? 'text-emerald-100' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Nachricht schreiben..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-400">
              Wählen Sie einen Chat aus.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- App Main Logic ---

export default function App() {
  // ---------- Dark / Light Mode ----------
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Synchronisiere State → DOM + localStorage
  useEffect(() => {
    try {
      // im Browser speichern
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    } catch {
      // Ignorieren, wenn localStorage nicht geht (z.B. Private Mode)
    }

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Beim ersten Laden: gespeichertes Theme oder System-Theme auslesen
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      const initialDark =
        saved === "dark" || (!saved && prefersDark);

      setDarkMode(initialDark);
    } catch {
      // Fallback: kein Darkmode
      setDarkMode(false);
    }
  }, []);

  // Wird von der Navbar aufgerufen
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const [view, setView] = useState<ViewState>('home');
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);

  const [dbApartments, setDbApartments] = useState<Apartment[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

const [filters, setFilters] = useState<FilterState>({
  query: '',
  maxPrice: 0,      // 0 = kein Limit
  minRooms: 0,
  district: ''
});


// Wohnungen aus PostgREST-API + Bilder laden
useEffect(() => {
  setDbLoading(true);
  setDbError(null);

  const listingsUrl = `${API_BASE_URL}/listings?select=id,title,rent,rooms,size_sqm,created_at&limit=20`;

  fetch(listingsUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`API-Fehler: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(async (rows: DbListing[]) => {
      console.log('Listings aus PostgREST:', rows);

      if (rows.length === 0) {
        setDbApartments([]);
        setDbLoading(false);
        return;
      }

      // IDs für listing_images in einem IN()-Filter zusammenbauen
      const ids = rows.map((r) => r.id).join(',');
      const imagesUrl =
        `${API_BASE_URL}/listing_images` +
        `?select=id,listing_id,position,data` +
        `&listing_id=in.(${ids})` +
        `&order=position.asc`;

      const imgRes = await fetch(imagesUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!imgRes.ok) {
        throw new Error(`Image-API-Fehler: ${imgRes.status} ${imgRes.statusText}`);
      }

      const images: DbListingImage[] = await imgRes.json();
      console.log('Images aus PostgREST:', images);

      // Pro listing_id nur das erste Bild (position 1) als Thumbnail nehmen
      const imageByListingId: Record<string, DbListingImage> = {};
      images.forEach((img) => {
        if (!imageByListingId[img.listing_id]) {
          imageByListingId[img.listing_id] = img;
        }
      });

      // Listings → Apartment mappen + Bild setzen
      const mapped = rows.map((row) => {
        const apt = mapDbListingToApartment(row);
        const img = imageByListingId[row.id];

        if (img) {
          apt.image = dbImageToDataUrl(img.data);
        }

        return apt;
      });

      setDbApartments(mapped);
      setDbLoading(false);
    })
    .catch((err: any) => {
      console.error('Fehler beim Laden der Listings/Bilder aus PostgREST:', err);
      setDbError('Verbindung zur API fehlgeschlagen.');
      setDbLoading(false);
    });
}, []);



  // Simulierter User-Login
  useEffect(() => {
    if (isLoggedIn) {
      setChats(MOCK_CHATS);
    } else {
      setChats([]);
      setSavedIds([]);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setView('home');
  };

  const handleLogin = (asAdmin: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(asAdmin);
    setView(asAdmin ? 'create-listing' : 'home');
  };

  const handleCreateListing = (data: any) => {
    console.log('Neues Inserat (Mock):', data);
    alert('Inserat erfolgreich erstellt! (Mock)');
    setView('home');
  };

  const toggleSave = (id: number) => {
    if (!isLoggedIn) {
      alert('Bitte melden Sie sich an, um Favoriten zu speichern.');
      return;
    }
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleStartChat = (message: string) => {
    if (!isLoggedIn) {
      alert('Bitte melden Sie sich an, um Nachrichten zu senden.');
      return;
    }
    if (!selectedApartment) return;

    const existingChat = chats.find((c) => c.apartmentTitle === selectedApartment.title);
    if (existingChat) {
      const updatedChats = chats.map((c) =>
        c.id === existingChat.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: Date.now().toString(), sender: 'me', text: message, timestamp: new Date() } as ChatMessage
              ],
              lastMessage: message
            }
          : c
      );
      setChats(updatedChats);
      setView('messages');
    } else {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        partnerName: selectedApartment.contactName,
        apartmentTitle: selectedApartment.title,
        lastMessage: message,
        unreadCount: 0,
        messages: [
          { id: Date.now().toString(), sender: 'me', text: message, timestamp: new Date() }
        ]
      };
      setChats([newChat, ...chats]);
      setView('messages');
    }
  };

  const handleSendMessage = (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: text,
              messages: [
                ...c.messages,
                { id: Date.now().toString(), sender: 'me', text, timestamp: new Date() }
              ]
            }
          : c
      )
    );

    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const replyText = 'Vielen Dank für Ihre Nachricht. Wir werden uns zeitnah bei Ihnen melden.';
            return {
              ...c,
              lastMessage: replyText,
              messages: [
                ...c.messages,
                { id: Date.now().toString(), sender: 'other', text: replyText, timestamp: new Date() }
              ]
            };
          }
          return c;
        })
      );
    }, 2000);
  };

const filteredApartments = useMemo(() => {
  return MOCK_OFFERS.filter((apt) => {
    const matchesQuery =
      apt.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      apt.district.toLowerCase().includes(filters.query.toLowerCase());

    // ⬅︎ HIER ändern:
    const matchesPrice =
      filters.maxPrice === 0        // 0 = "kein Limit"
        ? true
        : apt.price <= filters.maxPrice;

    const matchesRooms = apt.rooms >= filters.minRooms;
    const matchesDistrict = filters.district ? apt.district === filters.district : true;

    return matchesQuery && matchesPrice && matchesRooms && matchesDistrict;
  });
}, [filters]);


  const handleDetailsClick = (apt: Apartment) => {
    setSelectedApartment(apt);
    setView('details');
    window.scrollTo(0, 0);
  };

 // ListingsPage (Mock-Daten)
const ListingsPage = () => {
  // eigener Eingabe-State für das Max-Preis-Feld
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice.toString());

  return (
    <div className="pt-20 h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Suche */}
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Suchen..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-none text-sm focus:ring-2 focus:ring-emerald-500"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
            </div>

            {/* Stadtteil */}
            <select
              className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            >
              <option value="">Alle Stadtteile</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Zimmer ab */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2.5 rounded-lg">
              <span className="text-xs font-medium text-gray-500 uppercase">Zimmer ab:</span>
              <input
                type="number"
                className="bg-transparent border-none p-0 w-12 text-sm font-semibold focus:ring-0 text-gray-900 dark:text-white"
                value={filters.minRooms}
                onChange={(e) => setFilters({ ...filters, minRooms: Number(e.target.value) })}
                min={0}
              />
            </div>

            {/* Max Preis – neu */}
<div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2.5 rounded-lg">
  <span className="text-xs font-medium text-gray-500 uppercase">Max Preis:</span>
  <input
    type="text"
    inputMode="numeric"
    className="bg-transparent border-none p-0 w-20 text-sm font-semibold focus:ring-0 text-gray-900 dark:text-white"
    value={maxPriceInput}
    onChange={(e) => {
      const v = e.target.value;

      // leer = kein Limit
      if (v === '') {
        setMaxPriceInput('');
        setFilters({ ...filters, maxPrice: 0 });  // 0 = kein Preisfilter
        return;
      }

      // nur Ziffern erlauben
      if (/^\d+$/.test(v)) {
        setMaxPriceInput(v);
        setFilters({ ...filters, maxPrice: Number(v) });
      }
    }}
  />
</div>

            <div className="ml-auto text-sm text-gray-500 hidden md:block">
              <strong className="text-gray-900 dark:text-white">{filteredApartments.length}</strong> Treffer
            </div>
          </div>
        </div>
      </div>

      {/* Liste + Karte */}
      <div className="flex-grow flex overflow-hidden">
        <div className="w-full md:w-1/2 lg:w-7/12 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {filteredApartments.map((apt) => (
              <div key={apt.id} className="h-[420px]">
                <ListingCard
                  item={apt}
                  onClick={() => handleDetailsClick(apt)}
                  isSaved={savedIds.includes(apt.id)}
                  onToggleSave={() => toggleSave(apt.id)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:block w-1/2 lg:w-5/12 relative border-l border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0">
            <MapComponent
              apartments={filteredApartments}
              onMarkerClick={handleDetailsClick}
              selectedDistrict={filters.district}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

  // DbListingsPage (DB-Daten)
  const DbListingsPage = () => (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Wohnungen aus der Datenbank (Test)
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Diese Seite zeigt Wohnungen an, die direkt aus der PostgreSQL-Datenbank geladen werden. Aktuell nutze ich
          das zu Testzwecken mit zwei Beispielwohnungen.
        </p>

        {dbLoading && <p className="text-gray-500 dark:text-gray-400">Daten werden geladen…</p>}

        {dbError && (
          <p className="text-red-500">Fehler beim Laden aus der Datenbank: {dbError}</p>
        )}

        {!dbLoading && !dbError && dbApartments.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            Es sind aktuell keine Wohnungen in der Datenbank hinterlegt.
          </p>
        )}

        {!dbLoading && !dbError && dbApartments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {dbApartments.slice(0, 2).map((apt) => (
              <div key={apt.id} className="h-[420px]">
                <ListingCard
                  item={apt}
                  onClick={() => handleDetailsClick(apt)}
                  isSaved={savedIds.includes(apt.id)}
                  onToggleSave={() => toggleSave(apt.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <Navbar
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        setView={setView}
        currentView={view}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        savedCount={savedIds.length}
        unreadMessages={chats.reduce((acc, c) => acc + c.unreadCount, 0)}
      />
      <main className="flex-grow">
        {view === 'home' && (
          <LandingPage
            onSearch={() => {
              setFilters({ ...filters, district: '', maxPrice: 5000, minRooms: 0, query: '' });
              setView('listings');
            }}
            setFilters={setFilters}
          />
        )}

        {view === 'landlord-landing' && (
          <LandlordLandingPage
            onStartListing={() => (isLoggedIn ? setView('create-listing') : setView('login'))}
          />
        )}

        {view === 'listings' && <ListingsPage />}
        {view === 'db-listings' && <DbListingsPage />}
        {view === 'analytics' && (
          <HotspotAnalytics apartments={[...MOCK_OFFERS, ...dbApartments]} />
        )}


        {view === 'details' && selectedApartment && (
          <PropertyDetails
            item={selectedApartment}
            onBack={() => setView('listings')}
            isSaved={savedIds.includes(selectedApartment.id)}
            onToggleSave={() => toggleSave(selectedApartment.id)}
            onContact={handleStartChat}
          />
        )}

        {(view === 'login' || view === 'register') && (
          <AuthPage type={view} setView={setView} onLogin={handleLogin} />
        )}

        {view === 'create-listing' && (
          <CreateListingWizard
            onSubmit={handleCreateListing}
            onCancel={() => setView('home')}
            isAdmin={isAdmin}
          />
        )}

        {view === 'legal' && <LegalPage />}

        {view === 'favorites' && (
          <FavoritesPage savedIds={savedIds} onRemove={toggleSave} onItemClick={handleDetailsClick} />
        )}

        {view === 'messages' && (
          <MessagesPage chats={chats} onSendMessage={handleSendMessage} />
        )}
      </main>
      {view !== 'listings' && view !== 'messages' && (
        <Footer setView={setView} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}
