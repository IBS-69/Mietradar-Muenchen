:root{
  --bg:#0b0d12; --panel:#141822; --muted:#8b94a7; --text:#e6eaf2;
  --accent:#5de4c7; --accent2:#7aa2f7;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;
  color:var(--text); background:linear-gradient(180deg,#0b0d12 0%,#0e111a 100%);
}

/* Header */
header{
  position:sticky; top:0; z-index:50;
  backdrop-filter:saturate(140%) blur(8px);
  background:rgba(11,13,18,.7); border-bottom:1px solid #1f2533;
}
.wrap{max-width:1100px;margin:0 auto;padding:16px}
.header-row{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.2px}
.brand .dot{width:10px;height:10px;border-radius:999px;background:var(--accent)}
.main-nav{display:flex;gap:12px;align-items:center}
.main-nav a{color:var(--muted);text-decoration:none}

/* Layout */
.main-wrap{margin-top:18px}
.grid{display:grid;grid-template-columns:360px 1fr;gap:16px}
@media (max-width:900px){.grid{grid-template-columns:1fr}}

/* Cards / Basics */
.card{
  background:var(--panel); border:1px solid #1f2533; border-radius:14px;
  padding:14px; box-shadow:0 6px 24px rgba(0,0,0,.25);
}
h2{font-size:16px;margin:0 0 10px;color:#c9d3ea}
label{display:block;font-size:12px;color:var(--muted);margin:10px 0 6px}
input,select{
  width:100%; padding:10px 12px; border-radius:10px; border:1px solid #273043;
  background:#0f1320; color:var(--text);
  appearance:textfield;           /* Standard */
}
input{-moz-appearance:textfield}  /* Firefox */

/* Number Spinner ausblenden (WebKit) */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}

.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  background:linear-gradient(135deg,var(--accent2),var(--accent));
  color:#0a0f1a;border:none;padding:10px 14px;border-radius:10px;font-weight:700;cursor:pointer
}
.btn.secondary{background:#0f1320;color:var(--text);border:1px solid #273043}
.btn-row{display:flex;gap:10px;margin-top:12px}
.muted{color:var(--muted)}
.methodik{margin-top:16px}

/* KPIs */
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
@media (max-width:900px){.kpis{grid-template-columns:1fr 1fr}}
.kpi{padding:12px;border-radius:12px;background:#0f1320;border:1px dashed #273043}
.kpi .lbl{font-size:12px;color:var(--muted)}
.kpi .val{font-weight:800;font-size:20px}

/* Map */
.map{height:420px;border-radius:14px;overflow:hidden}

/* Ergebnisliste */
.list{display:grid;gap:10px;margin-top:10px}
.item{
  display:grid;grid-template-columns:110px 1fr;gap:12px;
  background:#0f1320;border:1px solid #273043;border-radius:12px;padding:10px
}
.thumb{
  background:#111524;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:12px;color:#65708a
}
.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#aab3c7}
.item a{color:inherit;text-decoration:none}
.item a:hover{text-decoration:underline}

/* Top-Angebote */
.topbar{margin-top:14px}
.tophead{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.topscroller{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x mandatory}
.topcard{
  flex:0 0 240px;background:var(--panel);border:1px solid #1f2533;border-radius:14px;
  padding:10px;scroll-snap-align:start
}
.topthumb{
  width:100%;height:140px;border-radius:10px;background:#0f1320;border:1px dashed #273043;
  display:flex;align-items:center;justify-content:center;font-size:12px;color:#65708a;overflow:hidden
}
.topmeta{margin-top:8px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#aab3c7}
.toptitle{margin:6px 0 0;font-size:14px;font-weight:700;color:var(--text);line-height:1.2;min-height:34px}

/* Footer */
footer{padding:30px 16px;color:#8b94a7;font-size:12px;text-align:center}
