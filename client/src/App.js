import React, { useState, useEffect } from "react";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

/*
  Smart Hospital Queue Management System
  Frontend: React.js
  Backend:  Node.js + Express
  Database: MongoDB
  Notifications: Twilio WhatsApp API
  Author: T Aditya Prasad, Sheerin , Sweety
 
*/

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
document.head.appendChild(link);

const globalCSS = document.createElement("style");
globalCSS.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #eef0f8;
    --surface:     #ffffff;
    --surface2:    #f4f6fc;
    --teal:        #2dd4bf;
    --teal-dark:   #0f9e8e;
    --teal-soft:   rgba(45,212,191,0.12);
    --indigo:      #6366f1;
    --indigo-soft: rgba(99,102,241,0.10);
    --text:        #1e2340;
    --text-mid:    #4b5270;
    --text-soft:   #8b91ae;
    --border:      #e0e4f0;
    --shadow:      0 2px 16px rgba(99,102,241,0.08);
    --shadow-md:   0 8px 32px rgba(99,102,241,0.13);
  }

  html, body, #root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text);
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--teal); border-radius: 4px; }

  input, button, select { font-family: 'Plus Jakarta Sans', sans-serif; }
  input:focus, select:focus { outline: none; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn   { from { opacity:0; transform:scale(0.88); }      to { opacity:1; transform:scale(1);    } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes shimmer { 0%,100% { box-shadow:0 0 0 0 rgba(45,212,191,0.35); } 50% { box-shadow:0 0 0 12px rgba(45,212,191,0); } }

  .fade-up { animation: fadeUp 0.42s ease both; }
  .pop-in  { animation: popIn 0.38s cubic-bezier(.34,1.56,.64,1) both; }

  .navbar {
    position:fixed; top:0; left:0; right:0; height:62px;
    background:var(--surface); border-bottom:1px solid var(--border);
    display:flex; align-items:center; padding:0 32px;
    justify-content:space-between; z-index:200;
    box-shadow:0 1px 8px rgba(99,102,241,0.06);
  }

  .card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:20px; padding:44px 42px;
    width:100%; max-width:560px;
    box-shadow:var(--shadow-md);
  }

  .doctor-btn {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; padding:28px 12px;
    border-radius:18px; border:1.5px solid var(--border);
    background:var(--surface); cursor:pointer;
    transition:all 0.2s ease; box-shadow:var(--shadow); text-align:center;
  }
  .doctor-btn:hover {
    border-color:var(--teal); transform:translateY(-4px);
    box-shadow:0 12px 32px rgba(45,212,191,0.2);
  }

  .input-field {
    width:100%; padding:13px 16px;
    background:var(--surface2); border:1.5px solid var(--border);
    border-radius:11px; color:var(--text); font-size:14px;
    transition:border-color 0.2s, box-shadow 0.2s;
    margin-bottom:14px; display:block;
    -webkit-appearance:none; appearance:none;
  }
  .input-field:focus {
    border-color:var(--teal);
    box-shadow:0 0 0 3px rgba(45,212,191,0.15);
    background:#fff;
  }
  .input-field::placeholder { color:var(--text-soft); }

  .select-wrap { position:relative; margin-bottom:14px; }
  .select-wrap::after {
    content:"▾"; position:absolute; right:14px; top:50%;
    transform:translateY(-50%); color:var(--text-soft);
    pointer-events:none; font-size:14px;
  }
  .select-wrap select { margin-bottom:0; cursor:pointer; padding-right:36px; }

  .btn-primary {
    width:100%; padding:14px 0;
    background:linear-gradient(135deg,#2dd4bf 0%,#06b6a4 100%);
    border:none; border-radius:12px;
    color:#fff; font-size:15px; font-weight:700;
    cursor:pointer; margin-top:8px;
    transition:opacity 0.18s, transform 0.15s, box-shadow 0.2s;
    box-shadow:0 4px 18px rgba(45,212,191,0.38);
  }
  .btn-primary:hover:not(:disabled) {
    opacity:0.91; transform:translateY(-1px);
    box-shadow:0 8px 26px rgba(45,212,191,0.42);
  }
  .btn-primary:disabled { opacity:0.55; cursor:not-allowed; }

  .btn-outline {
    width:100%; padding:13px 0; background:transparent;
    border:1.5px solid var(--border); border-radius:12px;
    color:var(--text-mid); font-size:14px; font-weight:600;
    cursor:pointer; margin-top:10px;
    transition:border-color 0.2s, color 0.2s, transform 0.15s;
  }
  .btn-outline:hover { border-color:var(--teal); color:var(--teal-dark); transform:translateY(-1px); }

  .token-box {
    border-radius:20px; padding:40px 36px; text-align:center; color:#fff;
    animation:shimmer 2.5s ease-in-out infinite, popIn 0.5s cubic-bezier(.34,1.56,.64,1) both;
    margin-bottom:24px;
  }

  .stat-widget {
    flex:1; background:var(--surface); border:1px solid var(--border);
    border-radius:14px; padding:18px 14px; text-align:center;
    box-shadow:var(--shadow);
  }

  .queue-item {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 16px; border-radius:12px;
    background:var(--surface2); border:1px solid var(--border);
    margin-bottom:9px; transition:border-color 0.2s, background 0.2s;
    animation:fadeUp 0.3s ease both;
  }
  .queue-item:hover { border-color:var(--teal); background:#fff; }

  .serve-btn {
    padding:8px 16px; border-radius:9px;
    border:1.5px solid var(--border); background:transparent;
    color:var(--text-soft); font-size:12px; font-weight:600;
    cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
    transition:all 0.18s ease; white-space:nowrap;
  }
  .serve-btn:hover { border-color:#2dd4bf; color:#0f9e8e; background:rgba(45,212,191,0.08); }

  .divider { height:1px; background:var(--border); margin:20px 0; }

  .back-btn {
    background:none; border:none; color:var(--text-soft);
    font-size:13px; cursor:pointer; margin-bottom:22px;
    display:inline-flex; align-items:center; gap:5px;
    font-family:'Plus Jakarta Sans',sans-serif; font-weight:600;
    padding:0; transition:color 0.18s;
  }
  .back-btn:hover { color:var(--text); }

  .spinner {
    width:15px; height:15px; border:2px solid rgba(255,255,255,0.35);
    border-top-color:#fff; border-radius:50%;
    display:inline-block; animation:spin 0.7s linear infinite;
    margin-right:8px; vertical-align:middle;
  }

  .steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:32px; }
  .step-dot {
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:700; transition:all 0.2s;
  }
  .step-line { flex:1; height:2px; max-width:60px; background:var(--border); transition:background 0.3s; }
  .step-line.done { background:var(--teal); }

  .tab-group {
    display:flex; gap:5px; margin-bottom:16px;
    background:var(--surface2); padding:5px; border-radius:12px;
    border:1px solid var(--border); flex-wrap:wrap;
  }
  .tab-btn {
    flex:1; min-width:55px; padding:8px 4px; border-radius:9px;
    border:none; background:transparent; font-size:11px; font-weight:600;
    cursor:pointer; color:var(--text-soft); transition:all 0.18s;
    font-family:'Plus Jakarta Sans',sans-serif; white-space:nowrap;
  }
  .tab-btn.active { background:var(--surface); color:var(--teal-dark); box-shadow:var(--shadow); }

  .pri-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:20px;
    font-size:11px; font-weight:700;
  }
`;
document.head.appendChild(globalCSS);

// ── Constants ────────────────────────────────────────────────────────────────

const DOCTORS = [
  { id:"cardio",  label:"Cardiologist",     icon:"❤️",  prefix:"CD" },
  { id:"neuro",   label:"Neurologist",      icon:"🧠",  prefix:"N"  },
  { id:"ortho",   label:"Orthopedist",      icon:"🦴",  prefix:"O"  },
  { id:"derma",   label:"Dermatologist",    icon:"🩺",  prefix:"D"  },
  { id:"pedia",   label:"Pediatrician",     icon:"👶",  prefix:"P"  },
  { id:"general", label:"General Physician",icon:"🏥",  prefix:"GS" },
];

const PRIORITIES = [
  { value:1, label:"Emergency", color:"#ef4444", bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.3)",  icon:"🚨" },
  { value:2, label:"Monthly",   color:"#f59e0b", bg:"rgba(245,158,11,0.10)", border:"rgba(245,158,11,0.3)", icon:"📅" },
  { value:3, label:"General",   color:"#10b981", bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.3)", icon:"🩹" },
];

const getPriority = (val) => PRIORITIES.find(p => p.value === Number(val)) || PRIORITIES[2];

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ view, setView, queue }) {
  const emergency = queue.filter(q => q.priority === 1).length;
  const isPatient = ["home","doctors","form","token"].includes(view);
  const isAdmin   = ["adminlogin","admin"].includes(view);

  return (
    <div className="navbar">
      {/* Brand — no system name shown */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:"linear-gradient(135deg,#2dd4bf,#06b6a4)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, color:"#fff", fontWeight:800,
        }}>+</div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:"var(--text)", lineHeight:1.1 }}>Real Time Smart Queue Management System </div>
          
        </div>
      </div>

      <div style={{ display:"flex", gap:6 }}>
        <button onClick={()=>setView("home")} style={{
          padding:"7px 16px", borderRadius:10, border:"none",
          background: isPatient ? "var(--teal-soft)" : "transparent",
          color: isPatient ? "var(--teal-dark)" : "var(--text-mid)",
          fontWeight:700, fontSize:13, cursor:"pointer",
          fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.18s",
        }}>Patient</button>
        <button onClick={()=>setView("adminlogin")} style={{
          padding:"7px 16px", borderRadius:10, border:"none",
          background: isAdmin ? "var(--indigo-soft)" : "transparent",
          color: isAdmin ? "var(--indigo)" : "var(--text-mid)",
          fontWeight:700, fontSize:13, cursor:"pointer",
          fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.18s",
        }}>Admin</button>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {emergency > 0 && (
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            padding:"5px 12px", borderRadius:20,
            fontSize:12, color:"#dc2626", fontWeight:700,
            animation:"pulse 1.5s ease infinite",
          }}>🚨 {emergency} Emergency</div>
        )}
        <div style={{
          display:"flex", alignItems:"center", gap:7,
          fontSize:12, color:"var(--text-mid)",
          background:"var(--surface2)", border:"1px solid var(--border)",
          padding:"6px 14px", borderRadius:20,
        }}>
          <span style={{
            width:7, height:7, borderRadius:"50%", background:"#2dd4bf",
            display:"inline-block", animation:"pulse 2s ease infinite",
          }}/>
          {queue.length} waiting
        </div>
      </div>
    </div>
  );
}

// ── Progress steps ────────────────────────────────────────────────────────────
function ProgressSteps({ current }) {
  const steps = ["Choose Doctor","Your Details","Token"];
  return (
    <div className="steps">
      {steps.map((s, i) => {
        const num = i + 1;
        const done = current > num;
        const active = current === num;
        return (
          <React.Fragment key={s}>
            {i > 0 && <div className={`step-line ${current > i ? "done" : ""}`}/>}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div className="step-dot" style={{
                background:(done||active) ? "var(--teal)" : "var(--border)",
                color:(done||active) ? "#fff" : "var(--text-soft)",
              }}>
                {done ? "✓" : num}
              </div>
              <div style={{ fontSize:10, fontWeight:600, whiteSpace:"nowrap",
                color:active ? "var(--teal-dark)" : "var(--text-soft)" }}>{s}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{
      fontSize:12, color:"var(--text-mid)", fontWeight:700,
      display:"block", marginBottom:5, letterSpacing:"0.02em",
    }}>{children}</label>
  );
}

function PriBadge({ priority }) {
  const pri = getPriority(priority);
  return (
    <span className="pri-badge" style={{
      background:pri.bg, color:pri.color, border:`1px solid ${pri.border}`,
    }}>
      {pri.icon} {pri.label}
    </span>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view,      setView]      = useState("home");
  const [doctor,    setDoctor]    = useState(null);
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [priority,  setPriority]  = useState(3);
  const [queue,     setQueue]     = useState([]);
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [adminTab,  setAdminTab]  = useState("all");

  const loadQueue = async () => {
    try {
      const res = await axios.get(`${API_URL}/queue`);
      setQueue(res.data);
    } catch (err) {
      console.error("Queue fetch error:", err.message);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const joinQueue = async () => {
    if (!name || !email || !phone) return alert("Please fill in all fields.");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/join`,  {
        name, email, phone,
        queueType: doctor.label,
        priority: Number(priority),
      });
      await loadQueue();
      setTokenInfo({
        displayToken: res.data.displayToken,
        priority:     Number(priority),
        doctor:       doctor,
      });
      setView("token");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not join. Make sure the server is running.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const serveNext = async () => {
    try {
      const queueType = adminTab === "all" ? null : DOCTORS.find(d => d.id === adminTab)?.label;
      await axios.post(`${API_URL}/serve-next`, { queueType });
      loadQueue();
    } catch (err) {
      alert("Failed to serve next.");
    }
  };

  const serveUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      loadQueue();
    } catch (err) {
      alert("Failed to serve user.");
    }
  };

  const sortQueue = (arr) => [...arr].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  const filteredQueue = adminTab === "all"
    ? sortQueue(queue)
    : sortQueue(queue.filter(q => q.queueType === DOCTORS.find(d => d.id === adminTab)?.label));

  const myQueue    = sortQueue(queue.filter(q => q.queueType === doctor?.label));
  const myIndex    = myQueue.findIndex(q => q.email === email);
  const myPosition = myIndex + 1;

  //const avatarColors = ["#2dd4bf","#6366f1","#f59e0b","#10b981","#f43f5e","#8b5cf6"];

  return (
    <>
      <Navbar view={view} setView={setView} queue={queue}/>

      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"86px 20px 48px",
      }}>

        {/* ── HOME ───────────────────────────────── */}
        {view === "home" && (
          <div className="card fade-up" style={{ textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🏥</div>
            <h1 style={{ fontSize:28, fontWeight:800, color:"var(--text)", marginBottom:8 }}>
              Welcome to Real Time Smart Queue Management System 
            </h1>
            <p style={{ fontSize:14, color:"var(--text-soft)", marginBottom:28, lineHeight:1.7 }}>
              Book your spot in the queue and get notified on WhatsApp when it's your turn.
            </p>
            <button className="btn-primary" onClick={()=>setView("doctors")}>
              Book an Appointment →
            </button>
            <div style={{ marginTop:16, fontSize:12, color:"var(--text-soft)" }}>
              Staff?{" "}
              <span style={{ color:"var(--teal-dark)", fontWeight:700, cursor:"pointer" }}
                onClick={()=>setView("adminlogin")}>Admin Login</span>
            </div>
          </div>
        )}

        {/* ── DOCTOR SELECTION ───────────────────── */}
        {view === "doctors" && (
          <div style={{ width:"100%", maxWidth:620 }} className="fade-up">
            <ProgressSteps current={1}/>
            <div style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:20, padding:"36px", boxShadow:"var(--shadow-md)",
            }}>
              <button className="back-btn" onClick={()=>setView("home")}>← Back</button>
              <h2 style={{ fontSize:22, fontWeight:800, color:"var(--text)", marginBottom:4 }}>
                Select a Doctor
              </h2>
              <p style={{ fontSize:13, color:"var(--text-soft)", marginBottom:28 }}>
                Choose the specialist you'd like to visit today.
              </p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                {DOCTORS.map((doc) => {
                  const docQueue    = queue.filter(q => q.queueType === doc.label);
                  const hasEmergency = docQueue.some(q => q.priority === 1);
                  return (
                    <button key={doc.id} className="doctor-btn"
                      onClick={()=>{ setDoctor(doc); setView("form"); }}>
                      <div style={{ fontSize:36 }}>{doc.icon}</div>
                      {/* Doctor name only — no token prefix, no description */}
                      <div style={{ fontWeight:700, fontSize:13, color:"var(--text)", lineHeight:1.3 }}>
                        {doc.label}
                      </div>
                      {/* Waiting count + emergency indicator */}
                      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                        <div style={{
                          padding:"3px 12px", borderRadius:20,
                          background:"var(--teal-soft)", color:"var(--teal-dark)",
                          fontSize:10, fontWeight:700,
                        }}>
                          {docQueue.length} waiting
                        </div>
                        {hasEmergency && (
                          <div style={{
                            padding:"2px 8px", borderRadius:20,
                            background:"rgba(239,68,68,0.1)", color:"#dc2626",
                            fontSize:10, fontWeight:700,
                          }}>🚨</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── FORM ───────────────────────────────── */}
        {view === "form" && (
          <div style={{ width:"100%", maxWidth:520 }} className="fade-up">
            <ProgressSteps current={2}/>
            <div style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:20, padding:"36px 38px", boxShadow:"var(--shadow-md)",
            }}>
              <button className="back-btn" onClick={()=>setView("doctors")}>← Back</button>

              {/* Selected doctor pill — NO "Tokens: 1,2,3" */}
              <div style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"12px 16px", borderRadius:14,
                background:"var(--teal-soft)", border:"1px solid rgba(45,212,191,0.25)",
                marginBottom:24,
              }}>
                <span style={{ fontSize:28 }}>{doctor?.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"var(--teal-dark)" }}>
                    {doctor?.label}
                  </div>
                </div>
                <div style={{
                  background:"var(--teal)", color:"#fff",
                  padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:700,
                }}>
                  {queue.filter(q => q.queueType === doctor?.label).length} ahead
                </div>
              </div>

              <h2 style={{ fontSize:20, fontWeight:800, color:"var(--text)", marginBottom:4 }}>
                Your Details
              </h2>
              <p style={{ fontSize:13, color:"var(--text-soft)", marginBottom:24 }}>
                Your token will be sent to WhatsApp.
              </p>

              <FieldLabel>Full Name</FieldLabel>
              <input className="input-field" onChange={e=>setName(e.target.value)}/>

              <FieldLabel>Email Address</FieldLabel>
              <input className="input-field" type="email" onChange={e=>setEmail(e.target.value)}/>

              <FieldLabel>WhatsApp Number</FieldLabel>
              <input className="input-field" onChange={e=>setPhone(e.target.value)}/>

              {/* ── Priority dropdown — label only, no description ── */}
              <FieldLabel>Appointment Type</FieldLabel>
              <div className="select-wrap">
                <select
                  className="input-field"
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                >
                  <option value={1}>Emergency</option>
                  <option value={2}>Monthly</option>
                  <option value={3}>General</option>
                </select>
              </div>
              {/* No yellow info bar below dropdown */}

              <button className="btn-primary" onClick={joinQueue} disabled={loading}>
                {loading ? <><span className="spinner"/>Booking...</> : "Confirm Appointment →"}
              </button>
            </div>
          </div>
        )}

        {/* ── TOKEN ──────────────────────────────── */}
        {view === "token" && tokenInfo && (
          <div style={{ width:"100%", maxWidth:460 }} className="fade-up">
            <ProgressSteps current={3}/>
            <div style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:20, padding:"36px 38px", boxShadow:"var(--shadow-md)",
            }}>
              {/* Token box — colour by priority */}
              {(() => {
                const pri = getPriority(tokenInfo.priority);
                const gradients = {
                  1:"linear-gradient(135deg,#dc2626,#ef4444)",
                  2:"linear-gradient(135deg,#d97706,#f59e0b)",
                  3:"linear-gradient(135deg,#0f9e8e,#2dd4bf)",
                };
                return (
                  <div className="token-box" style={{ background:gradients[tokenInfo.priority] }}>
                    <div style={{ fontSize:12, fontWeight:700, opacity:0.85, letterSpacing:"0.14em", marginBottom:6 }}>
                      YOUR TOKEN NUMBER
                    </div>
                    {/* Big display token e.g. CD3, N1, GS2 */}
                    <div style={{
                      fontSize:80, fontWeight:800, lineHeight:1,
                      letterSpacing:"-1px", marginBottom:10,
                    }}>
                      {tokenInfo.displayToken}
                    </div>
                    <div style={{ marginBottom:6 }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:6,
                        background:"rgba(255,255,255,0.22)", padding:"5px 14px",
                        borderRadius:20, fontSize:13, fontWeight:700,
                      }}>
                        {pri.icon} {pri.label}
                      </span>
                    </div>
                    <div style={{ fontSize:14, opacity:0.9, fontWeight:600 }}>
                      {tokenInfo.doctor?.icon} {tokenInfo.doctor?.label}
                    </div>
                  </div>
                );
              })()}

              {/* Stats */}
              <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                <div className="stat-widget">
                  <div style={{ fontSize:10, color:"var(--text-soft)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
                    Position
                  </div>
                  <div style={{ fontSize:32, fontWeight:800, color:"var(--teal-dark)" }}>
                    #{myPosition < 1 ? "—" : myPosition}
                  </div>
                </div>
                <div className="stat-widget">
                  <div style={{ fontSize:10, color:"var(--text-soft)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
                    Est. Wait
                  </div>
                  <div style={{ fontSize:32, fontWeight:800, color:"var(--indigo)" }}>
                    {myPosition < 1 ? "—" : `${myPosition * 3}m`}
                  </div>
                </div>
                <div className="stat-widget">
                  <div style={{ fontSize:10, color:"var(--text-soft)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
                    Priority
                  </div>
                  <div style={{ fontSize:24 }}>{getPriority(tokenInfo.priority).icon}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:getPriority(tokenInfo.priority).color }}>
                    P{tokenInfo.priority}
                  </div>
                </div>
              </div>

              {/* WhatsApp notice */}
              <div style={{
                padding:"12px 16px", borderRadius:12,
                background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.22)",
                display:"flex", alignItems:"center", gap:10,
                fontSize:13, color:"#15803d", fontWeight:600, marginBottom:4,
              }}>
                <span style={{ fontSize:20 }}>💬</span>
                WhatsApp confirmation sent! You'll be notified when it's your turn.
              </div>

              <div className="divider"/>
              <button className="btn-outline"
                onClick={()=>{ setView("home"); setDoctor(null); setTokenInfo(null); }}>
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* ── ADMIN LOGIN ─────────────────────────── */}
        {view === "adminlogin" && (
          <div className="card fade-up">
            <button className="back-btn" onClick={()=>setView("home")}>← Back</button>
            <div style={{ fontSize:36, marginBottom:12 }}>🔐</div>
            <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Admin Login</h2>
            <p style={{ fontSize:13, color:"var(--text-soft)", marginBottom:28 }}>
              Access the queue management dashboard.
            </p>
            <FieldLabel>Password</FieldLabel>
            <input className="input-field" type="password"
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") password==="cvr123" ? setView("admin") : alert("Wrong password."); }}
            />
            <button className="btn-primary"
              onClick={()=>{ password==="cvr123" ? setView("admin") : alert("Wrong password."); }}>
              Login
            </button>
          </div>
        )}

        {/* ── ADMIN DASHBOARD ─────────────────────── */}
        {view === "admin" && (
          <div style={{ width:"100%", maxWidth:680 }} className="fade-up">

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <h1 style={{ fontSize:26, fontWeight:800, color:"var(--text)" }}>Queue Dashboard</h1>
               
              </div>
              <button onClick={serveNext} style={{
                padding:"10px 22px", borderRadius:12,
                background:"linear-gradient(135deg,#2dd4bf,#06b6a4)",
                border:"none", color:"#fff", fontWeight:700, fontSize:14,
                cursor:"pointer", boxShadow:"0 4px 14px rgba(45,212,191,0.35)",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                transition:"opacity 0.18s, transform 0.15s",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="none"; }}>
                ▶ Serve Next
              </button>
            </div>

            {/* Priority summary */}
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              {PRIORITIES.map(pri => {
                const src = adminTab === "all" ? queue : queue.filter(q => q.queueType === DOCTORS.find(d=>d.id===adminTab)?.label);
                const count = src.filter(q => q.priority === pri.value).length;
                return (
                  <div key={pri.value} style={{
                    flex:1, background:"var(--surface)", border:`1px solid ${pri.border}`,
                    borderRadius:14, padding:"14px 12px", textAlign:"center",
                    boxShadow:"var(--shadow)",
                  }}>
                    <div style={{ fontSize:22 }}>{pri.icon}</div>
                    <div style={{ fontSize:26, fontWeight:800, color:pri.color }}>{count}</div>
                    <div style={{ fontSize:10, color:"var(--text-soft)", fontWeight:600 }}>{pri.label}</div>
                  </div>
                );
              })}
              <div style={{
                flex:1, background:"var(--surface)", border:"1px solid var(--border)",
                borderRadius:14, padding:"14px 12px", textAlign:"center",
                boxShadow:"var(--shadow)",
              }}>
                <div style={{ fontSize:22 }}>👥</div>
                <div style={{ fontSize:26, fontWeight:800, color:"var(--text)" }}>
                  {adminTab === "all"
                    ? queue.length
                    : queue.filter(q => q.queueType === DOCTORS.find(d=>d.id===adminTab)?.label).length}
                </div>
                <div style={{ fontSize:10, color:"var(--text-soft)", fontWeight:600 }}>Total</div>
              </div>
            </div>

            {/* Doctor tabs */}
            <div className="tab-group">
              <button className={`tab-btn ${adminTab==="all"?"active":""}`} onClick={()=>setAdminTab("all")}>
                All
              </button>
              {DOCTORS.map(doc => {
                const count = queue.filter(q=>q.queueType===doc.label).length;
                const hasEmg = queue.filter(q=>q.queueType===doc.label).some(q=>q.priority===1);
                return (
                  <button key={doc.id}
                    className={`tab-btn ${adminTab===doc.id?"active":""}`}
                    onClick={()=>setAdminTab(doc.id)}>
                    {hasEmg ? "🚨" : doc.icon} {doc.prefix} ({count})
                  </button>
                );
              })}
            </div>

            {/* Queue list */}
            <div style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:18, padding:"20px", boxShadow:"var(--shadow-md)",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>
                  {adminTab === "all" ? "All Patients" : DOCTORS.find(d=>d.id===adminTab)?.label}
                </span>
                <div style={{
                  display:"flex", alignItems:"center", gap:5,
                  background:"var(--teal-soft)", padding:"4px 12px", borderRadius:20,
                  fontSize:11, fontWeight:700, color:"var(--teal-dark)",
                }}>
                  <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--teal)",display:"inline-block",animation:"pulse 2s infinite" }}/>
                  Live
                </div>
              </div>

              {filteredQueue.length === 0 ? (
                <div style={{ padding:"40px 0", textAlign:"center", color:"var(--text-soft)", fontSize:14 }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🎉</div>
                  No patients in this queue!
                </div>
              ) : (
                <div style={{ maxHeight:440, overflowY:"auto" }}>
                  {filteredQueue.map((q, i) => {
                    const doc    = DOCTORS.find(d => d.label === q.queueType);
                    const pri    = getPriority(q.priority);
                    const isFirst = i === 0;
                    return (
                      <div key={q._id} className="queue-item"
                        style={{
                          animationDelay:`${i*0.04}s`,
                          borderLeft:`4px solid ${pri.color}`,
                          background: isFirst ? pri.bg : "var(--surface2)",
                        }}>
                        {/* Position number */}
                        <div style={{
                          width:32, height:32, borderRadius:8, flexShrink:0,
                          background: isFirst ? pri.color : "var(--border)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontWeight:800, fontSize:13,
                          color: isFirst ? "#fff" : "var(--text-mid)",
                          marginRight:10,
                        }}>{i+1}</div>

                        {/* Patient info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                            <span style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{q.name}</span>
                            <span style={{
                              fontSize:11, padding:"2px 8px", borderRadius:6,
                              background:"var(--teal-soft)", color:"var(--teal-dark)",
                              fontWeight:800, letterSpacing:"0.04em",
                            }}>{q.displayToken}</span>
                            {isFirst && (
                              <span style={{
                                fontSize:10, padding:"2px 8px", borderRadius:6,
                                background:pri.color, color:"#fff", fontWeight:700,
                              }}>NEXT UP</span>
                            )}
                          </div>
                          <div style={{ fontSize:11, color:"var(--text-soft)" }}>
                            {doc?.icon} {q.queueType} · {q.email}
                          </div>
                        </div>

                        {/* Priority badge */}
                        <div style={{ marginRight:12, flexShrink:0 }}>
                          <PriBadge priority={q.priority}/>
                        </div>

                        {/* Serve button */}
                        <button className="serve-btn" onClick={()=>serveUser(q._id)}>
                          Serve ✓
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button className="btn-outline" style={{ marginTop:14 }} onClick={()=>setView("home")}>
              Logout
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        textAlign:"center", padding:"14px",
        fontSize:11, color:"var(--text-soft)", letterSpacing:"0.04em",
      }}>
        Smart Queue System · Built with React, Node.js &amp; MongoDB
      </div>
    </>
  );
}