"use strict";

/* ========== Theme toggle + small UX helpers ========== */
(function(){
  const KEY = 'mietradar:theme';
  const btn = document.getElementById('themeToggle');

  function labelFor(t){ return t === 'light' ? 'Light Mode' : 'Dark Mode'; }
  function system(){ try { return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; } catch(e){ return 'dark'; } }
  function applyTheme(t){
    const v = (t === 'light') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', v);
    if (btn){ btn.textContent = labelFor(v); btn.setAttribute('aria-pressed', String(v === 'light')); }
  }

  applyTheme(localStorage.getItem(KEY) || system());
  btn?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    localStorage.setItem(KEY, next);
    applyTheme(next);
  });

  // Sidebar mobile toggle
  document.getElementById('sbToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('sb-open');
  });

  // Startseite smooth scroll
  document.getElementById('linkHome')?.addEventListener('click', (e) => {
    e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' });
  });

  // Auth Platzhalter
  document.getElementById('btnRegister')?.addEventListener('click', () => window.location.href = "/register.html");
  document.getElementById('btnLogin')?.addEventListener('click', () => window.location.href = "/login.html");
})();

/* ========== Demo-Daten (Fallback) ========== */
const demoOffers = [
  { id:1,title:"2-Zi Altbau nahe Hohenzollernplatz", price:1350, size:48, rooms:2,   district:"Schwabing-West",        lat:48.1655, lng:11.5722, date:"2025-10-08" },
  { id:2,title:"3-Zi Neubau, Balkon, U2 Josephsburg", price:1750, size:72, rooms:3,   district:"Au-Haidhausen",        lat:48.1258, lng:11.6077, date:"2025-10-09" },
  { id:3,title:"1,5-Zi Studio Maxvorstadt",           price: 990, size:30, rooms:1.5, district:"Maxvorstadt",           lat:48.1497, lng:11.5670, date:"2025-10-07" },
  { id:4,title:"Familienfreundlich am Rotkreuzplatz", price:1950, size:83, rooms:3,   district:"Neuhausen-Nymphenburg",lat:48.1560, lng:11.5325, date:"2025-10-09" },
  { id:5,title:"1-Zi Nähe Gärtnerplatz",              price:1200, size:28, rooms:1,   district:"Altstadt-Lehel",        lat:48.1340, lng:11.5796, date:"2025-10-06" },
  { id:6,title:"4-Zi Dachgeschoss Sendling",          price:2200, size:96, rooms:4,   district:"Sendling",              lat:48.1115, lng:11.5412, date:"2025-10-08" }
].map(o => ({ ...o, pricePerSqm: +(o.price / o.size).toFixed(2) }));

/* ========== Leaflet Karte ========== */
const map = L.map('map').setView([48.137154, 11.576124], 12);
map.attributionControl.setPrefix(false);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
}).addTo(map);
let markersLayer = L.layerGroup().addTo(map);
let highlightLayer = L.layerGroup().addTo(map);

/* ========== Bezirke (GeoJSON) ========== */
const LOCAL_GEOJSON = './muc_bezirke.geojson';
const WFS_URL = 'https://geoportal.muenchen.de/geoserver/gsm_wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gsm_wfs:vablock_stadtbezirke_opendata&outputFormat=application/json&srsName=EPSG:4326';

const districtCenters = {
  'altstadtlehel':[48.1374,11.5755],'ludwigsvorstadtisarvorstadt':[48.1302,11.5589],'maxvorstadt':[48.1497,11.5670],
  'schwabingwest':[48.1655,11.5700],'auhaidhausen':[48.1336,11.5937],'sendling':[48.1115,11.5412],
  'sendlingwestpark':[48.1200,11.5200],'schwanthalerhoehe':[48.1390,11.5380],'neuhausennymphenburg':[48.1550,11.5250],
  'moosach':[48.1860,11.5080],'milbertshofenamhart':[48.1960,11.5820],'schwabingfreimann':[48.1860,11.6110],
  'bogenhausen':[48.1490,11.6210],'bergamlaim':[48.1280,11.6300],'truderingriem':[48.1280,11.6900],
  'ramersdorfperlach':[48.1000,11.6200],'obergiesingfasangarten':[48.1060,11.6000],'untergiesingharlaching':[48.1010,11.5660],
  'thalkirchenobersendlingforstenriedfuerstenriedsolln':[48.0890,11.5200],'hadern':[48.1110,11.4800],
  'pasingobermenzing':[48.1500,11.4600],'aubinglochhausenlangwied':[48.1600,11.4100],'allachuntermenzing':[48.1900,11.4800],
  'feldmochinghasenbergl':[48.2100,11.5500],'laim':[48.1400,11.5100]
};

let districtIndex = new Map();
const MUC_BEZIRKE_MINI = { "type": "FeatureCollection","features": [
  { "type": "Feature","properties": { "name": "Altstadt-Lehel" },"geometry": { "type": "Polygon","coordinates": [[[11.5655,48.1474],[11.5855,48.1474],[11.5855,48.1274],[11.5655,48.1274],[11.5655,48.1474]]] } },
  { "type": "Feature","properties": { "name": "Sendling-Westpark" },"geometry": { "type": "Polygon","coordinates": [[[11.5000,48.1350],[11.5400,48.1350],[11.5400,48.1050],[11.5000,48.1050],[11.5000,48.1350]]] } },
  { "type": "Feature","properties": { "name": "Schwabing-West" },"geometry": { "type": "Polygon","coordinates": [[[11.5550,48.1780],[11.5850,48.1780],[11.5850,48.1550],[11.5550,48.1550],[11.5550,48.1780]]] } },
  { "type": "Feature","properties": { "name": "Laim" },"geometry": { "type": "Polygon","coordinates": [[[11.5000,48.1450],[11.5350,48.1450],[11.5350,48.1250],[11.5000,48.1250],[11.5000,48.1450]]] } }
]};
const normName = s => (s || '').toLowerCase()
  .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
  .normalize('NFKD').replace(/[^a-z]+/g,'');

function initDistrictIndex(geo) {
  const feats = Array.isArray(geo.features) ? geo.features : [];
  districtIndex.clear();
  feats.forEach(f => {
    const p = f.properties || {};
    const key = [p.name, p.NAME, p.bezirk, p.BEZIRK, p.GEN, p.gen, p.stadtbezirk].find(Boolean);
    if (key) districtIndex.set(normName(key), f);
  });
}
fetch(LOCAL_GEOJSON).then(r => r.ok ? r.json() : Promise.reject())
  .then(initDistrictIndex)
  .catch(() => fetch(WFS_URL).then(r => r.ok ? r.json() : Promise.reject())
    .then(initDistrictIndex)
    .catch(() => initDistrictIndex(MUC_BEZIRKE_MINI))
  );

/* ========== Angebote (MockAPI) ========== */
const API_URL = 'https://68ecad8aeff9ad3b1402cfb5.mockapi.io/topOffers';
let offers = []; // wird nach fetch gefüllt

// "€ 1.350" -> 1350
function parsePriceEUR(str){
  if (typeof str !== 'string') return Number(str) || 0;
  const cleaned = str.replace(/[^\d,\.]/g,'').replace(/\./g,'').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeOffer(x) {
  const id       = Number(x.id ?? Date.now());
  const title    = String(x.title ?? 'Ohne Titel');
  const price    = parsePriceEUR(x.price);
  const size     = Number(x.size ?? 0);
  const rooms    = Number(x.rooms ?? 0);
  const district = String(x.district ?? 'Unbekannt');
  const url      = String(x.url ?? '#');
  const image    = String(x.image ?? '');
  const dateStr  = String(x.createdAt ?? new Date().toISOString());

  // lat/lng fallback
  let lat = Number(x.lat), lng = Number(x.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const c = districtCenters[normName(district)];
    if (c) { lat = c[0]; lng = c[1]; }
  }

  const pricePerSqm = size > 0 ? +(price / size).toFixed(2) : null;
  return { id, title, price, size, rooms, district, lat, lng, url, image, date: dateStr, pricePerSqm };
}

async function fetchOffers() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.items || []);
    offers = rows.map(normalizeOffer);
  } catch (err) {
    console.error('API-Fehler:', err);
    offers = [...demoOffers];
  }
}

/* ========== Render-Helpers ========== */
const resultsEl = document.getElementById('results');
const kpiCount  = document.getElementById('kpiCount');
const kpiMedian = document.getElementById('kpiMedian');
const kpiRooms  = document.getElementById('kpiRooms');

const median = arr => { if (!arr.length) return 0; const s=[...arr].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; };

function renderList(items){
  resultsEl.innerHTML = items.map(o => {
    const bits = [
      (Number.isFinite(o.rooms) && o.rooms ? `${o.rooms} Zi` : null),
      (o.size ? `${o.size} m²` : null),
      (Number.isFinite(o.price) ? `<b>${o.price} €</b>` : null),
      (Number.isFinite(o.pricePerSqm) ? `(${o.pricePerSqm} €/m²)` : null),
      (o.district || null)
    ].filter(Boolean).join(' ');
    return `
    <article class="item" aria-label="Angebot">
      <div class="thumb">${o.district || '—'}</div>
      <div>
        <div class="meta-row" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <h3 style="margin:0; font-size:16px">
            ${o.url ? `<a href="${o.url}" target="_blank" rel="noopener">${o.title}</a>` : o.title}
          </h3>
          <div class="badge">${new Date(o.date).toLocaleDateString('de-DE')}</div>
        </div>
        <div class="meta">${bits}</div>
      </div>
    </article>`;
  }).join('');
}

function renderKpis(items){
  kpiCount.textContent = items.length;

  const sqmVals = items.map(o => o.pricePerSqm).filter(v => Number.isFinite(v) && v > 0);
  kpiMedian.textContent = sqmVals.length ? median(sqmVals).toFixed(0) : '–';

  const roomVals = items.map(o => o.rooms).filter(v => Number.isFinite(v));
  const avgRooms = roomVals.length ? (roomVals.reduce((s,v)=>s+v,0) / roomVals.length) : 0;
  kpiRooms.textContent = avgRooms ? avgRooms.toFixed(1) : '–';
}

function renderMarkers(items){
  markersLayer.clearLayers();
  items.forEach(o => {
    if (!Number.isFinite(o.lat) || !Number.isFinite(o.lng)) return;
    const m = L.marker([o.lat,o.lng]).bindPopup(
      `<b>${o.title}</b><br/>${
        [o.rooms?`${o.rooms} Zi`:null, o.size?`${o.size} m²`:null].filter(Boolean).join(' · ')
      }<br/>${
        Number.isFinite(o.price)?`<b>${o.price} €</b>`:''} ${
        Number.isFinite(o.pricePerSqm)?`(${o.pricePerSqm} €/m²)`:''
      }<br/><small>${o.district || ''}</small>`
    );
    markersLayer.addLayer(m);
  });
}

/* ========== Filtering ========== */
const q            = document.getElementById('q');
const maxRent      = document.getElementById('maxRent');
const roomsSel     = document.getElementById('rooms');
const districtSel  = document.getElementById('district');
const sortSel      = document.getElementById('sort');

maxRent.addEventListener('keydown', e => { if (['e','E','+','-'].includes(e.key)) e.preventDefault(); });
maxRent.addEventListener('input', () => { const v=parseFloat(maxRent.value); if(Number.isNaN(v)) return; if(v<0) maxRent.value=0; });
maxRent.addEventListener('blur', () => { if (maxRent.value==='') return; const v=Math.max(0, Math.floor(parseFloat(maxRent.value)||0)); maxRent.value=v; });

function highlightDistrict(name, items){
  highlightLayer.clearLayers();
  if (!name) return;
  const feat = districtIndex.get(normName(name));
  if (feat){
    const layer = L.geoJSON(feat,{style:{color:'#ff6b6b',weight:2,fillOpacity:0}}).addTo(highlightLayer);
    const b = layer.getBounds(); if (b && b.isValid()) map.fitBounds(b.pad(0.12));
    return;
  }
  const c = districtCenters[normName(name)];
  if (c){
    const circle = L.circle(c,{radius:800,color:'#ff6b6b',weight:2,fill:false}).addTo(highlightLayer);
    map.fitBounds(circle.getBounds().pad(0.2)); return;
  }
  const pts = items.filter(o => o.district===name && Number.isFinite(o.lat) && Number.isFinite(o.lng)).map(o => [o.lat,o.lng]);
  if (!pts.length) return;
  if (pts.length===1){ const p=pts[0]; L.circle(p,{radius:900,color:'#ff6b6b',weight:2,fill:false}).addTo(highlightLayer); map.setView(p,13); }
  else { const b=L.latLngBounds(pts); L.rectangle(b,{color:'#ff6b6b',weight:2,fill:false,dashArray:'6 4'}).addTo(highlightLayer); map.fitBounds(b.pad(0.2)); }
}

function applyFilters(){
  let items = (offers && offers.length) ? [...offers] : [...demoOffers];

  const qv=(q.value||'').toLowerCase();
  if (qv) items=items.filter(o => o.title.toLowerCase().includes(qv)||o.district.toLowerCase().includes(qv));

  const max=parseFloat(maxRent.value);
  if (!isNaN(max)) items=items.filter(o => Number.isFinite(o.price) && o.price<=max);

  const minRooms=parseFloat(roomsSel.value);
  if (minRooms>0) items=items.filter(o => Number.isFinite(o.rooms) && o.rooms>=minRooms);

  if (districtSel.value) items=items.filter(o => o.district===districtSel.value);

  switch (sortSel.value){
    case 'priceAsc': items.sort((a,b)=> (a.price??Infinity) - (b.price??Infinity)); break;
    case 'priceDesc': items.sort((a,b)=> (b.price??-Infinity) - (a.price??-Infinity)); break;
    case 'sqmAsc': items.sort((a,b)=> (a.pricePerSqm??Infinity) - (b.pricePerSqm??Infinity)); break;
    case 'sqmDesc': items.sort((a,b)=> (b.pricePerSqm??-Infinity) - (a.pricePerSqm??-Infinity)); break;
    default: items.sort((a,b)=> new Date(b.date) - new Date(a.date));
  }

  renderList(items);
  renderMarkers(items);
  renderKpis(items);

  const base = (offers && offers.length) ? offers : demoOffers;
  highlightDistrict(districtSel.value, base);
}

document.getElementById('applyBtn').addEventListener('click', applyFilters);
document.getElementById('resetBtn').addEventListener('click', () => {
  q.value='München'; maxRent.value=''; roomsSel.value='2'; districtSel.value=''; sortSel.value='recent';
  applyFilters(); highlightDistrict('', []);
});

/* ========== Top-Angebote (Scroller) ========== */
function renderTopOffers(items){
  const el=document.getElementById('topOffers'); if(!el) return;
  const html=(items&&items.length?items:[{title:'Keine Treffer',url:'#'}]).map(it => `
    <a class="topcard" role="listitem" ${it.url?`href="${it.url}" target="_blank" rel="noopener"`:''}>
      <div class="topthumb">${it.image ? `<img src="${it.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : 'Bild'}</div>
      <div class="topmeta"><span>${it.rooms?it.rooms+' Zi':'&nbsp;'}</span><span>${it.price||'&nbsp;'}</span></div>
      <div class="toptitle">${it.title||'Externer Eintrag'}</div>
    </a>`).join('');
  el.innerHTML=html;
}

/* ========== Initial ========== */
(async () => {
  await fetchOffers();   // MockAPI laden (Fallback: demoOffers)
  applyFilters();        // Liste, Marker, KPIs
  // Top-Leiste aus der MockAPI (neueste 12)
  const top = [...offers]
    .sort((a,b)=>new Date(b.date)-new Date(a.date))
    .slice(0,12)
    .map(o => ({ title:o.title, url:o.url, price: (Number.isFinite(o.price) ? `${o.price} €` : ''), rooms:o.rooms, image:o.image }));
  renderTopOffers(top);
})();
