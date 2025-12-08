
export interface Apartment {
  id: number;
  title: string;
  // Costs
  price: number; // Kaltmiete
  additionalCosts: number; // Nebenkosten
  deposit: number; // Kaution
  heatingCostsIncluded: boolean;
  
  // Specs
  size: number;
  rooms: number;
  floor: number;
  bedroomCount?: number;
  bathroomCount?: number;
  
  // Location
  district: string;
  street?: string;
  zipCode?: string;
  lat: number;
  lng: number;
  
  // Meta
  date: string;
  image: string; // Main thumbnail
  gallery: string[]; // Additional images
  description: string;
  
  // Features
  amenities: string[]; // List of strings matching AMENITIES_LIST
  
  // Building Info
  buildYear?: number;
  energyLabel?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  heatingType?: string;
  isNew?: boolean;
  isVerified?: boolean;
  
  // Contact
  contactName: string;
}

export interface FilterState {
  query: string;
  maxPrice: number;
  minRooms: number;
  district: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  partnerName: string;
  apartmentTitle: string;
  lastMessage: string;
  unreadCount: number;
  messages: ChatMessage[];
  avatar?: string;
}

export type ViewState = 'home' | 'listings' | 'details' | 'login' | 'register' | 'create-listing' | 'landlord-landing' | 'landlord-dashboard' | 'legal' | 'favorites' | 'messages'| 'db-listings';

// Extended Window interface for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
