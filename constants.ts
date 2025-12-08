
import { Apartment, ChatSession } from './types';

export const HERO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
    alt: "München Hotel / Luxus"
  },
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
    alt: "Modernes Wohnzimmer Interior"
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
    alt: "Haus Fassade Modern"
  },
  {
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
    alt: "Küche Modern"
  }
];

export const AMENITIES_LIST = [
  "Einbauküche",
  "Balkon / Terrasse",
  "Garten / -mitbenutzung",
  "Keller",
  "Aufzug",
  "Stufenloser Zugang",
  "Gäste-WC",
  "Fußbodenheizung",
  "Garage / Stellplatz",
  "Möbliert / Teilmöbliert"
];

export const HEATING_TYPES = [
  "Zentralheizung",
  "Etagenheizung",
  "Fernwärme",
  "Fußbodenheizung",
  "Wärmepumpe"
];

// A curated list of high-quality architectural and interior design images
// These use direct IDs to avoid broken redirects
const REAL_ESTATE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-3ad19e6f67e9?auto=format&fit=crop&w=800&q=80", // Modern House
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", // Living Room with view
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", // Modern Kitchen
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", // Bright Kitchen
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", // Grey Bedroom
  "https://images.unsplash.com/photo-1600566752355-35792bedcfe1?auto=format&fit=crop&w=800&q=80", // Bathroom
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", // Modern Home Exterior
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80", // Driveway
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80", // Apartment Interior
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", // Apartment Room
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80", // Clean Bedroom
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80", // Living Room Blue
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80", // Living Room White
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80", // Living Room Plant
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", // Loft
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80", // White Room
  "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80", // Kitchen
  "https://images.unsplash.com/photo-1513584681774-9e412fdd5201?auto=format&fit=crop&w=800&q=80", // Cozy Room
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", // Apartment Building
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"  // Kids Room / Bedroom
];

const MANUAL_OFFERS: Apartment[] = [
  { 
    id: 1,
    title: "Lichtdurchfluteter Altbau nahe Hohenzollernplatz", 
    price: 1350,
    additionalCosts: 200,
    deposit: 4050,
    heatingCostsIncluded: false,
    size: 48, 
    rooms: 2,
    floor: 3,
    bedroomCount: 1,
    bathroomCount: 1,
    district: "Schwabing-West", 
    street: "Tengstraße 12",
    zipCode: "80798",       
    lat: 48.161, 
    lng: 11.570, 
    date: "2025-10-08",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Diese wunderschöne Altbauwohnung besticht durch hohe Decken, originalen Fischgrätparkett und große Fenster. Die Lage in Schwabing-West ist exzellent.",
    amenities: ["Balkon / Terrasse", "Einbauküche", "Keller", "Aufzug"],
    buildYear: 1910,
    energyLabel: "C",
    heatingType: "Fernwärme",
    contactName: "Anna Müller",
    isVerified: true
  },
  { 
    id: 2,
    title: "Modernes 3-Zi Loft, Balkon, U2 Josephsburg", 
    price: 1750, 
    additionalCosts: 250,
    deposit: 5250,
    heatingCostsIncluded: true,
    size: 72, 
    rooms: 3,
    floor: 1,
    bedroomCount: 2,
    bathroomCount: 1,
    district: "Au-Haidhausen",        
    lat: 48.128, 
    lng: 11.600, 
    date: "2025-10-09",
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Erstbezug nach Sanierung! Dieses Loft bietet urbanes Wohnen pur.",
    amenities: ["Balkon / Terrasse", "Fußbodenheizung", "Stufenloser Zugang", "Garage / Stellplatz"],
    buildYear: 2018,
    energyLabel: "A",
    heatingType: "Wärmepumpe",
    contactName: "Immobilien Schmidt",
    isNew: true
  },
  { 
    id: 3,
    title: "Exklusives Studio in der Maxvorstadt",           
    price: 990, 
    additionalCosts: 150,
    deposit: 2970,
    heatingCostsIncluded: true,
    size: 30, 
    rooms: 1.5,
    floor: 4,
    district: "Maxvorstadt",           
    lat: 48.149, 
    lng: 11.560, 
    date: "2025-10-07",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Perfekt für Studenten oder Young Professionals. Mitten im Universitätsviertel gelegen.",
    amenities: ["Möbliert / Teilmöbliert", "Einbauküche"],
    buildYear: 1970,
    energyLabel: "D",
    heatingType: "Zentralheizung",
    contactName: "Markus Weber"
  },
  { 
    id: 4,
    title: "Penthouse mit Alpenblick in Sendling",          
    price: 2200, 
    additionalCosts: 350,
    deposit: 6600,
    heatingCostsIncluded: false,
    size: 96, 
    rooms: 4,
    floor: 6,
    bathroomCount: 2,
    district: "Sendling",              
    lat: 48.115, 
    lng: 11.545, 
    date: "2025-10-08",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Einmalige Gelegenheit: Penthouse über den Dächern von Sendling.",
    amenities: ["Balkon / Terrasse", "Aufzug", "Gäste-WC", "Garage / Stellplatz"],
    buildYear: 2021,
    energyLabel: "A+",
    heatingType: "Wärmepumpe",
    contactName: "Dr. Peters",
    isNew: true,
    isVerified: true
  },
  { 
    id: 7,
    title: "Luxus pur: Altbau im Lehel",          
    price: 2800, 
    additionalCosts: 300,
    deposit: 8400,
    heatingCostsIncluded: false,
    size: 110, 
    rooms: 3,
    floor: 2,
    district: "Altstadt-Lehel",              
    lat: 48.140, 
    lng: 11.585, 
    date: "2025-10-11",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Repräsentative Altbauwohnung in bester Lage. Stuckverzierungen, Flügeltüren und modernes Bad.",
    amenities: ["Balkon / Terrasse", "Gäste-WC", "Keller"],
    buildYear: 1905,
    energyLabel: "D",
    contactName: "Premium Estate Munich",
    isVerified: true
  }
];

export const DISTRICT_CENTERS: Record<string, {lat: number, lng: number}> = {
  "Allach-Untermenzing": { lat: 48.185, lng: 11.465 },
  "Altstadt-Lehel": { lat: 48.140, lng: 11.585 },
  "Aubing-Lochhausen-Langwied": { lat: 48.150, lng: 11.420 },
  "Au-Haidhausen": { lat: 48.128, lng: 11.600 },
  "Berg am Laim": { lat: 48.130, lng: 11.635 },
  "Bogenhausen": { lat: 48.155, lng: 11.620 },
  "Feldmoching-Hasenbergl": { lat: 48.210, lng: 11.550 },
  "Hadern": { lat: 48.115, lng: 11.485 },
  "Laim": { lat: 48.140, lng: 11.505 },
  "Ludwigsvorstadt-Isarvorstadt": { lat: 48.130, lng: 11.560 },
  "Maxvorstadt": { lat: 48.149, lng: 11.560 },
  "Milbertshofen-Am Hart": { lat: 48.190, lng: 11.570 },
  "Moosach": { lat: 48.180, lng: 11.510 },
  "Neuhausen-Nymphenburg": { lat: 48.158, lng: 11.525 },
  "Obergiesing": { lat: 48.115, lng: 11.595 },
  "Pasing-Obermenzing": { lat: 48.150, lng: 11.460 },
  "Ramersdorf-Perlach": { lat: 48.110, lng: 11.620 },
  "Schwabing-Freimann": { lat: 48.175, lng: 11.600 },
  "Schwabing-West": { lat: 48.165, lng: 11.570 },
  "Schwanthalerhöhe": { lat: 48.136, lng: 11.540 },
  "Sendling": { lat: 48.115, lng: 11.545 },
  "Sendling-Westpark": { lat: 48.120, lng: 11.520 },
  "Thalkirchen-Obersendling": { lat: 48.100, lng: 11.540 },
  "Trudering-Riem": { lat: 48.125, lng: 11.670 },
  "Untergiesing-Harlaching": { lat: 48.100, lng: 11.570 }
};

export const DISTRICTS = Object.keys(DISTRICT_CENTERS).sort();

// Helper to get unique random images for a listing
const getUniqueImages = (count: number): string[] => {
  // Shuffle a copy of the array
  const shuffled = [...REAL_ESTATE_IMAGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to generate listings for districts that don't have one yet
const generateAllOffers = (): Apartment[] => {
  let offers = [...MANUAL_OFFERS];
  let idCounter = 100;

  DISTRICTS.forEach(district => {
    // Check if district already has an offer
    const hasOffer = offers.some(o => o.district.includes(district) || (district === "Au-Haidhausen" && o.district.includes("Au")));
    
    if (!hasOffer) {
      const center = DISTRICT_CENTERS[district];
      const isExpensive = ["Bogenhausen", "Altstadt-Lehel", "Schwabing"].some(d => district.includes(d));
      const basePrice = isExpensive ? 1800 : 1100;
      const rooms = Math.floor(Math.random() * 3) + 2; // 2 to 4
      const size = rooms * 25 + Math.floor(Math.random() * 20);
      
      // Get 5 unique images (1 main + 4 gallery)
      const uniqueImgs = getUniqueImages(5);
      const mainImage = uniqueImgs[0];
      const galleryImages = uniqueImgs.slice(1);

      offers.push({
        id: idCounter++,
        title: `${rooms}-Zimmer Wohnung in ${district}`,
        price: basePrice + Math.floor(Math.random() * 500),
        additionalCosts: 200,
        deposit: (basePrice + 500) * 3,
        heatingCostsIncluded: Math.random() > 0.5,
        size: size,
        rooms: rooms,
        floor: Math.floor(Math.random() * 5),
        district: district,
        street: "Musterstraße",
        zipCode: "80000",
        lat: center.lat + (Math.random() - 0.5) * 0.01,
        lng: center.lng + (Math.random() - 0.5) * 0.01,
        date: "2025-10-12",
        image: mainImage,
        gallery: galleryImages,
        description: `Schöne, helle Wohnung in ruhiger Lage von ${district}. Gute Anbindung an den ÖPNV. Ideal für Singles oder Paare.`,
        amenities: ["Keller", "Einbauküche"],
        buildYear: 1990 + Math.floor(Math.random() * 30),
        energyLabel: Math.random() > 0.5 ? "C" : "B",
        contactName: "MietRadar Agentur"
      });
    }
  });

  return offers;
};

export const MOCK_OFFERS = generateAllOffers();

export const MOCK_CHATS: ChatSession[] = [
  {
    id: '1',
    partnerName: 'Anna Müller',
    apartmentTitle: 'Lichtdurchfluteter Altbau nahe Hohenzollernplatz',
    lastMessage: 'Der Besichtigungstermin am Dienstag passt mir gut.',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'me', text: 'Guten Tag, ist die Wohnung noch verfügbar?', timestamp: new Date(Date.now() - 86400000) },
      { id: 'm2', sender: 'other', text: 'Ja, sie ist noch frei. Wann hätten Sie Zeit?', timestamp: new Date(Date.now() - 82000000) },
      { id: 'm3', sender: 'other', text: 'Der Besichtigungstermin am Dienstag passt mir gut.', timestamp: new Date(Date.now() - 3600000) }
    ]
  },
  {
    id: '2',
    partnerName: 'Immobilien Schmidt',
    apartmentTitle: 'Modernes 3-Zi Loft',
    lastMessage: 'Bitte bringen Sie die Schufa-Auskunft mit.',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'me', text: 'Ich habe großes Interesse an dem Loft.', timestamp: new Date(Date.now() - 172800000) },
      { id: 'm2', sender: 'other', text: 'Gerne. Bitte bringen Sie die Schufa-Auskunft mit.', timestamp: new Date(Date.now() - 170000000) }
    ]
  }
];
