"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const DARK = "#080808";
const CARD_BG = "rgba(12,12,12,0.97)";

function shadeColor(hex, pct) {
  hex = hex.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + pct));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
  const b = Math.min(255, Math.max(0, (num & 0xff) + pct));
  return `rgb(${r},${g},${b})`;
}

function WatermarkedImage({ color = "#5a4535", uid = "ARC-0041" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, shadeColor(color, -40));
    grad.addColorStop(0.5, shadeColor(color, -20));
    grad.addColorStop(1, shadeColor(color, -50));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.textAlign = "center";
    for (let row = -2; row <= 2; row++)
      for (let col = -2; col <= 2; col++)
        ctx.fillText(`ARCANUM · ${uid} · CONFIDENTIEL`, col * 160, row * 50);
    ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, H - 28, W, 28);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`© ARCANUM RÉSEAU PRIVÉ · ${uid} · NE PAS DIFFUSER`, W / 2, H - 10);
  }, [color, uid]);
  return <canvas ref={canvasRef} width={320} height={220} style={{ width: "100%", height: "auto", display: "block", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }} />;
}

function WatermarkedPhoto({ src, uid = "ARC-0041" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      canvas.width = 640;
      canvas.height = Math.round(640 * ratio);
      const W = canvas.width, H = canvas.height;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.font = `bold ${Math.max(10, Math.floor(W / 32))}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.textAlign = "center";
      for (let row = -4; row <= 4; row++)
        for (let col = -3; col <= 3; col++)
          ctx.fillText(`ARCANUM · ${uid} · CONFIDENTIEL`, col * 240, row * 56);
      ctx.restore();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, H - 28, W, 28);
      ctx.fillStyle = "rgba(255,255,255,0.38)";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`© ARCANUM RÉSEAU PRIVÉ · ${uid} · NE PAS DIFFUSER`, W / 2, H - 10);
    };
    img.onerror = () => {
      canvas.width = 320; canvas.height = 220;
      ctx.fillStyle = "#0e0e0e";
      ctx.fillRect(0, 0, 320, 220);
    };
    img.src = src;
  }, [src, uid]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }} />;
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin(data.user);
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    const { data: inv } = await supabase.from("invitations").select("email, status").eq("email", email.trim().toLowerCase()).eq("status", "approved").maybeSingle();
    if (!inv) {
      setError("Votre invitation n'a pas encore été approuvée, ou cette adresse n'est pas invitée.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    onLogin(data.user);
    setLoading(false);
  };
  return (
    <div style={{ background: DARK, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>
      <div style={{ width: 400, padding: 40, background: "#0c0c0c", border: "1px solid #1a1a1a" }}>
        <div style={{ marginBottom: 32 }}>
          <svg width="160" height="44" viewBox="0 0 180 52" fill="none">
            <path d="M6 40 L16 7 L26 40" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 27 L22 26.5" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
            <path d="M30 40 L30 18 C30 16 31 14 33 13 C35 12 37 13 37 15" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 16 C46 13 40 14 39 21 C38 28 41 35 46 36 C49 37 52 35 53 32" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M68 17 C64 13 57 15 56 22 C55 29 58 36 63 36 C67 37 70 34 70 29 L70 17 L70 38" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M74 38 L74 16 C77 11 82 12 83 17 L83 38" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M88 16 L88 30 C88 35 91 38 95 36 C98 34 99 29 99 16" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M99 30 L99 39" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M103 38 L103 16 C106 11 110 12 111 18 L111 24 C113 11 118 11 119 18 L119 38" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 45 C30 43 60 46 100 44 C130 43 155 45 172 43" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.28"/>
          </svg>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#333", textTransform: "uppercase", marginTop: 4 }}>Réseau Privé</div>
        </div>

        <div style={{ display: "flex", gap: 1, marginBottom: 24 }}>
          {[["login", "Connexion"], ["register", "Inscription"]].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, background: mode === m ? "#fff" : "none", border: "1px solid #1a1a1a", color: mode === m ? "#080808" : "#444", padding: "8px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>{l}</button>
          ))}
        </div>

        {error && <div style={{ background: "rgba(220,80,80,0.1)", border: "1px solid rgba(220,80,80,0.3)", color: "#dc5050", padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", color: "#fff", padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%" }} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <input style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", color: "#fff", padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%" }} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} type="password" onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())} />
        </div>

        <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ marginTop: 20, width: "100%", background: "#fff", border: "none", color: "#080808", padding: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>

        {mode === "register" && (
          <p style={{ fontSize: 11, color: "#333", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            L'inscription est sur invitation uniquement.<br />Votre email doit avoir été invité par un membre.
          </p>
        )}
      </div>
    </div>
  );
}

const AUTO_REPLIES = [
  "Très intéressant, pouvez-vous m'en dire plus sur la provenance ?",
  "Je vais vérifier dans mon inventaire et vous reviens rapidement.",
  "Le prix est-il négociable ?",
  "J'ai justement un client qui cherche ce type d'œuvre.",
  "La pièce est disponible. Souhaitez-vous le certificat d'authenticité ?",
];

function ChatPanel({ target, onClose }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const now = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };

  useEffect(() => {
    const t = setTimeout(() => {
      if (window.__arcanum_prefill__) { setInput(window.__arcanum_prefill__); window.__arcanum_prefill__ = null; inputRef.current?.focus(); }
    }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = { from: "Moi", text: input.trim(), time: now() };
    setMessages(m => [...m, msg]);
    if (target?.id) await supabase.from("messages").insert({ to_dealer: target.id, text: input.trim() });
    setInput("");
    if (target?.online) {
      setIsTyping(true);
      setTimeout(() => { setIsTyping(false); setMessages(m => [...m, { from: "them", text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], time: now() }]); }, 1400 + Math.random() * 1800);
    }
  };

  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 400, background: "#0a0a0a", borderLeft: "1px solid #141414", zIndex: 150, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}} @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .mb{animation:msgIn .25s ease both}`}</style>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#111", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 500 }}>{target?.uid?.slice(-2) || "??"}</div>
          <div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 2.5, color: "#bbb", textTransform: "uppercase" }}>{target?.uid}</div>
            <div style={{ fontSize: 11, color: target?.online ? "#6eb87a" : "#333" }}>{target?.online ? "En ligne" : "Hors ligne"} · {target?.specialty}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && <div style={{ textAlign: "center", marginTop: 40, color: "#1a1a1a", fontSize: 13 }}>Début de la conversation</div>}
        {messages.map((msg, i) => {
          const isMe = msg.from === "Moi";
          return <div key={i} className="mb" style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "78%" }}>
            <div style={{ background: isMe ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)", border: `1px solid ${isMe ? "rgba(255,255,255,0.14)" : "#141414"}`, padding: "10px 14px", borderRadius: isMe ? "8px 8px 2px 8px" : "8px 8px 8px 2px", fontSize: 14, lineHeight: 1.65, color: isMe ? "#fff" : "#999" }}>{msg.text}</div>
            <div style={{ fontSize: 10, color: "#1a1a1a", marginTop: 3, textAlign: isMe ? "right" : "left" }}>{msg.time}</div>
          </div>;
        })}
        {isTyping && <div className="mb" style={{ alignSelf: "flex-start" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #141414", padding: "12px 18px", borderRadius: "8px 8px 8px 2px", display: "flex", gap: 5 }}>
            {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "#444", animation: `typingDot 1.2s ease ${j * .2}s infinite` }} />)}
          </div>
        </div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "14px 16px", borderTop: "1px solid #111", display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea ref={inputRef} rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid #1a1a1a", color: "#fff", padding: "10px 14px", fontSize: 14, outline: "none", borderRadius: 4, resize: "none", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, maxHeight: 100, overflowY: "auto" }}
          placeholder="Votre message…" value={input}
          onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
          onFocus={e => e.target.style.borderColor = "#fff"} onBlur={e => e.target.style.borderColor = "#1a1a1a"}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button onClick={send} style={{ background: input.trim() ? "#fff" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 4, color: input.trim() ? "#080808" : "#222", cursor: input.trim() ? "pointer" : "default", padding: "10px 14px", fontSize: 14, fontWeight: "bold" }}>↑</button>
      </div>
    </div>
  );
}

function InviteModal({ onClose, currentDealer, onSent }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [uid] = useState(`ARC-${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}`);

  const send = async () => {
    if (!email.trim()) return;
    await supabase.from("invitations").insert({ email, uid, invited_by: currentDealer?.id || null, status: "pending" });
    setSent(true);
    setTimeout(() => { onSent(uid); onClose(); }, 1800);
  };

  return (
    <div style={styles.modalBg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 460 }}>
        <div style={styles.sectionLabel}>Invitation privée</div>
        <h2 style={{ ...styles.modalTitle, marginBottom: 8 }}>Inviter un marchand</h2>
        <p style={{ fontSize: 13, color: "#333", marginBottom: 24 }}>Arcanum est un réseau sur invitation uniquement.</p>
        {!sent ? <>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1a1a1a", padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 9, color: "#333", marginBottom: 6, textTransform: "uppercase", letterSpacing: 3 }}>Numéro attribué</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", letterSpacing: 4 }}>{uid}</div></div>
            <div style={{ fontSize: 11, color: "#333", maxWidth: 180, textAlign: "right" }}>Identité anonyme sur le réseau</div>
          </div>
          <input style={{ ...styles.input, marginBottom: 20 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email du marchand" type="email" />
          <div style={{ display: "flex", gap: 10 }}><button onClick={onClose} style={styles.btnGhost}>Annuler</button><button onClick={send} style={styles.btnGold}>Envoyer</button></div>
        </> : <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 3, color: "#fff", marginBottom: 8 }}>Invitation envoyée</div>
          <div style={{ fontSize: 13, color: "#444" }}>{uid} réservé</div>
        </div>}
      </div>
    </div>
  );
}

function ContractModal({ onClose }) {
  const [type, setType] = useState(null);
  const [form, setForm] = useState({ party1: "", party2: "", artwork: "", price: "", duration: "6 mois", commission: "15", date: new Date().toLocaleDateString("fr-FR") });
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contractText, setContractText] = useState("");

  const TYPES = [
    { key: "consignment", label: "Contrat de Consignment", icon: "📋", desc: "Dépôt d'une œuvre en vue de vente" },
    { key: "nda", label: "NDA — Confidentialité", icon: "🔒", desc: "Protection des informations échangées" },
    { key: "mandate", label: "Mandat de Recherche", icon: "🔍", desc: "Mandater un marchand pour une recherche" },
    { key: "reservation", label: "Accord de Réservation", icon: "⏳", desc: "Réserver une œuvre avec acompte" },
  ];

  const generate = async () => {
    setLoading(true);
    const prompts = {
      consignment: `Génère un contrat de consignment professionnel en français entre "${form.party1}" et "${form.party2}" pour "${form.artwork}" à ${form.price}. Durée: ${form.duration}. Commission: ${form.commission}%. Date: ${form.date}. Style notarial français.`,
      nda: `Génère un NDA en français entre "${form.party1}" et "${form.party2}" pour des transactions sur le marché de l'art. Date: ${form.date}. Style juridique français.`,
      mandate: `Génère un mandat de recherche en français. Mandant: "${form.party1}". Mandataire: "${form.party2}". Œuvre: "${form.artwork}". Budget: ${form.price}. Commission: ${form.commission}%. Date: ${form.date}.`,
      reservation: `Génère un accord de réservation en français. Vendeur: "${form.party1}". Acheteur: "${form.party2}". Œuvre: "${form.artwork}" à ${form.price}. Acompte: ${form.commission}%. Date: ${form.date}.`,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompts[type] }] }) });
      const data = await res.json();
      setContractText(data.content?.map(b => b.text || "").join("\n") || "Erreur.");
    } catch { setContractText("Erreur lors de la génération."); }
    setGenerated(true); setLoading(false);
  };

  return (
    <div style={styles.modalBg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
          <div><div style={styles.sectionLabel}>Documents juridiques</div><h2 style={styles.modalTitle}>Générer un document</h2></div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        {!type && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {TYPES.map(ct => <div key={ct.key} onClick={() => setType(ct.key)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a1a", padding: 20, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#fff"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{ct.icon}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 6 }}>{ct.label}</div>
            <div style={{ fontSize: 13, color: "#333" }}>{ct.desc}</div>
          </div>)}
        </div>}
        {type && !generated && <div>
          <div style={{ cursor: "pointer", marginBottom: 24, color: "#444", fontSize: 13 }} onClick={() => setType(null)}>← Retour</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["party1", "Partie 1"], ["party2", "Partie 2"], ["artwork", "Œuvre / objet"], ["price", "Prix / budget"], ["duration", "Durée"], ["commission", "Commission %"]].map(([k, ph]) => (
              <div key={k}><div style={{ fontSize: 9, color: "#333", marginBottom: 6, textTransform: "uppercase", letterSpacing: 3 }}>{ph}</div>
                <input style={styles.input} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
          </div>
          <button onClick={generate} style={{ ...styles.btnGold, width: "100%", marginTop: 24, padding: "14px" }} disabled={loading}>{loading ? "Génération en cours…" : "Générer le document"}</button>
        </div>}
        {generated && <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#fff", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Document généré</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(contractText)} style={styles.btnGhost}>Copier</button>
              <button onClick={() => { setGenerated(false); setContractText(""); }} style={styles.btnGhost}>Nouveau</button>
            </div>
          </div>
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: 24, fontSize: 13, lineHeight: 1.8, color: "#888", whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto", fontFamily: "Georgia,serif" }}>{contractText}</div>
          <div style={{ marginTop: 12, padding: "10px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid #111", fontSize: 11, color: "#333" }}>⚠️ Document indicatif. Faites valider par un juriste avant signature.</div>
        </div>}
      </div>
    </div>
  );
}

const styles = {
  modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" },
  modal: { background: "#0c0c0c", border: "1px solid #1a1a1a", padding: "36px", width: "90%", borderRadius: 0 },
  modalTitle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, fontWeight: 400, letterSpacing: 3, color: "#fff", marginBottom: 24 },
  sectionLabel: { fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 4, color: "#2a2a2a", marginBottom: 10, textTransform: "uppercase" },
  closeBtn: { background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 18 },
  input: { background: "#0f0f0f", border: "1px solid #1a1a1a", color: "#fff", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", fontFamily: "'DM Sans',sans-serif" },
  btnGold: { background: "#fff", border: "1px solid #fff", color: "#080808", padding: "9px 22px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", transition: "all 0.2s" },
  btnGhost: { background: "none", border: "1px solid #1a1a1a", color: "#444", padding: "9px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", transition: "all 0.2s" },
};

export default function Arcanum() {
  const [user, setUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("feed");
  const [inventory, setInventory] = useState([]);
  const [searches, setSearches] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [directOnly, setDirectOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [addItem, setAddItem] = useState(false);
  const [addSearch, setAddSearch] = useState(false);
  const [notif, setNotif] = useState(null);
  const [newItem, setNewItem] = useState({ title: "", artist: "", year: "", medium: "", price: "", tags: "", direct: true, dimensions: "", weight: "", condition: "Excellent", certificate: false, photoFile: null, photo_visibility: "sur_demande" });
  const [newSearch, setNewSearch] = useState({ title: "", period: "", budget: "", tags: "", direct: true });
  const [invitations, setInvitations] = useState([]);

  const toast = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3200); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadDealer(session.user); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) { setUser(session.user); loadDealer(session.user); }
      else { setUser(null); setCurrentDealer(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadDealer = async (u) => {
    const { data } = await supabase.from("dealers").select("*").eq("email", u.email).maybeSingle();
    if (data) {
      setCurrentDealer(data);
    } else {
      const uid = `ARC-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const { data: created, error } = await supabase
        .from("dealers")
        .insert({ email: u.email, uid })
        .select()
        .single();
      if (created) setCurrentDealer(created);
      else console.error("Erreur création profil dealer :", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadInventory(); loadSearches(); loadDealers();
  }, [user]);

  const loadInventory = async () => {
    const { data } = await supabase.from("inventory").select("*").order("created_at", { ascending: false });
    if (data) setInventory(data);
  };

  const loadSearches = async () => {
    const { data } = await supabase.from("searches").select("*").order("created_at", { ascending: false });
    if (data) setSearches(data);
  };

  const loadDealers = async () => {
    const { data } = await supabase.from("dealers").select("*");
    if (data) setDealers(data);
  };

  const uploadPhoto = async (file) => {
    const ext = file.name.split(".").pop();
    const path = `${currentDealer?.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("artwork-images").upload(path, file, { upsert: true });
    if (error) { toast("Erreur upload photo"); return null; }
    return supabase.storage.from("artwork-images").getPublicUrl(path).data.publicUrl;
  };

  const submitItem = async () => {
    if (!newItem.title || !newItem.artist) return;
    let photo_url = null;
    if (newItem.photoFile) photo_url = await uploadPhoto(newItem.photoFile);
    await supabase.from("inventory").insert({ title: newItem.title, artist: newItem.artist, year: parseInt(newItem.year) || new Date().getFullYear(), medium: newItem.medium, price: newItem.price, dealer_id: currentDealer?.id, direct: newItem.direct, tags: newItem.tags.split(",").map(t => t.trim()).filter(Boolean), status: "available", dimensions: newItem.dimensions || null, weight: newItem.weight || null, condition: newItem.condition || null, certificate: newItem.certificate, photo_url, photo_visibility: newItem.photoFile ? newItem.photo_visibility : null });
    loadInventory(); setNewItem({ title: "", artist: "", year: "", medium: "", price: "", tags: "", direct: true, dimensions: "", weight: "", condition: "Excellent", certificate: false, photoFile: null, photo_visibility: "sur_demande" }); setAddItem(false); toast("Œuvre ajoutée");
  };

  const loadInvitations = async () => {
    const { data } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
    if (data) setInvitations(data);
  };

  const updateInvitationStatus = async (id, status) => {
    await supabase.from("invitations").update({ status }).eq("id", id);
    loadInvitations();
    toast(status === "approved" ? "Invitation approuvée" : "Invitation refusée");
  };

  const deleteItem = async (id, table) => {
    await supabase.from(table).delete().eq("id", id);
    table === "inventory" ? loadInventory() : loadSearches();
    toast("Supprimé");
  };

  const submitSearch = async () => {
    if (!newSearch.title) return;
    await supabase.from("searches").insert({ title: newSearch.title, dealer_id: currentDealer?.id, period: newSearch.period, budget: newSearch.budget, direct: newSearch.direct, tags: newSearch.tags.split(",").map(t => t.trim()).filter(Boolean) });
    loadSearches(); setNewSearch({ title: "", period: "", budget: "", tags: "", direct: true }); setAddSearch(false); toast("Recherche publiée");
  };

  const reportItem = async (item, type) => {
    const table = type === "inventory" ? "inventory" : "searches";
    await supabase.from(table).update({ reports: (item.reports || 0) + 1 }).eq("id", item.id);
    type === "inventory" ? loadInventory() : loadSearches();
    setReportTarget(null); toast("Signalement envoyé");
  };

  const dealer = (id) => dealers.find(d => d.id === id);
  const allTags = [...new Set(inventory.flatMap(w => w.tags || []))];
  const filteredInv = inventory.filter(w => {
    if ((w.reports || 0) >= 3) return false;
    if (directOnly && !w.direct) return false;
    if (searchTerm && !w.title?.toLowerCase().includes(searchTerm.toLowerCase()) && !w.artist?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterTag && !(w.tags || []).includes(filterTag)) return false;
    return true;
  });
  const filteredSearches = searches.filter(s => (s.reports || 0) < 3 && (!directOnly || s.direct));

  if (loading) return <div style={{ background: DARK, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Chargement…</div>;
  if (!user) return <AuthScreen onLogin={u => { setUser(u); loadDealer(u); }} />;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: DARK, minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:#111;}
        input,textarea{font-family:'DM Sans',sans-serif!important;}
        .nav-btn{background:none;border:none;color:#888;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:1.5px;padding:10px 14px;transition:color .2s;position:relative;text-transform:uppercase;}
        .nav-btn:hover{color:#fff;} .nav-btn.active{color:#fff;}
        .nav-btn.active::after{content:'';position:absolute;bottom:-1px;left:14px;right:14px;height:1px;background:#fff;}
        .card{background:${CARD_BG};border:1px solid #111;transition:border-color .2s,box-shadow .2s;}
        .card:hover{border-color:#1a1a1a;box-shadow:0 2px 20px rgba(0,0,0,.6);}
        .btn-gold{background:#fff;border:1px solid #fff;color:#080808;padding:9px 20px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;transition:all .2s;text-transform:uppercase;}
        .btn-gold:hover{background:transparent;color:#fff;}
        .btn-ghost{background:none;border:1px solid #111;color:#333;padding:7px 14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:1.5px;transition:all .2s;text-transform:uppercase;}
        .btn-ghost:hover{border-color:#fff;color:#fff;}
        .btn-danger{background:none;border:1px solid rgba(220,80,80,.2);color:rgba(220,80,80,.5);padding:5px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;transition:all .2s;text-transform:uppercase;}
        .btn-danger:hover{border-color:rgba(220,80,80,.8);color:rgb(220,80,80);}
        .inp{background:#0f0f0f;border:1px solid #111;color:#fff;padding:10px 14px;font-size:14px;width:100%;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#fff;}
        .tag{display:inline-block;background:rgba(255,255,255,.03);border:1px solid #111;color:#444;padding:2px 10px;font-size:10px;letter-spacing:1.5px;margin:2px;cursor:pointer;transition:all .2s;text-transform:uppercase;}
        .tag:hover,.tag.active{background:rgba(255,255,255,.08);color:#fff;border-color:#333;}
        .uid-badge{font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:2.5px;color:#2a2a2a;background:rgba(255,255,255,.02);border:1px solid #111;padding:2px 8px;text-transform:uppercase;}
        .direct-badge{font-family:'DM Sans',sans-serif;font-size:8px;letter-spacing:1.5px;color:#6eb87a;background:rgba(110,184,122,.05);border:1px solid rgba(110,184,122,.2);padding:2px 8px;text-transform:uppercase;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .35s ease both;}
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,8,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #0f0f0f" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <svg width="160" height="44" viewBox="0 0 180 52" fill="none">
              <path d="M6 40 L16 7 L26 40" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 27 L22 26.5" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
              <path d="M30 40 L30 18 C30 16 31 14 33 13 C35 12 37 13 37 15" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M50 16 C46 13 40 14 39 21 C38 28 41 35 46 36 C49 37 52 35 53 32" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M68 17 C64 13 57 15 56 22 C55 29 58 36 63 36 C67 37 70 34 70 29 L70 17 L70 38" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M74 38 L74 16 C77 11 82 12 83 17 L83 38" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M88 16 L88 30 C88 35 91 38 95 36 C98 34 99 29 99 16" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M99 30 L99 39" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M103 38 L103 16 C106 11 110 12 111 18 L111 24 C113 11 118 11 119 18 L119 38" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 45 C30 43 60 46 100 44 C130 43 155 45 172 43" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.28"/>
            </svg>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 7.5, letterSpacing: 3, color: "#555", textTransform: "uppercase" }}>Réseau Privé · {currentDealer?.uid || "..."}</div>
          </div>

          <nav style={{ display: "flex" }}>
            {[["feed", "Inventaires"], ["searches", "Recherches"], ["match", "Matching"], ["dealers", "Marchands"], ["messages", "Messages"], ["docs", "Documents"]].map(([k, l]) => (
              <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>{l}</button>
            ))}
            {user?.email === "louisvassy@live.fr" && (
              <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => { setView("admin"); loadInvitations(); }} style={{ color: view === "admin" ? "#fff" : "#c9a96e" }}>Admin</button>
            )}
          </nav>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn-ghost" style={{ color: "#888" }} onClick={() => setShowContracts(true)}>Contrats</button>
            <button className="btn-gold" onClick={() => setShowInvite(true)}>+ Inviter</button>
            <button className="btn-ghost" style={{ color: "#888" }} onClick={() => supabase.auth.signOut()}>Déco</button>
          </div>
        </div>
      </header>

      <div style={{ background: "#060606", borderBottom: "1px solid #0a0a0a", padding: "9px 32px", position: "sticky", top: 60, zIndex: 90 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 16, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div onClick={() => setDirectOnly(!directOnly)} style={{ width: 34, height: 18, background: directOnly ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.04)", border: `1px solid ${directOnly ? "#fff" : "#111"}`, borderRadius: 9, position: "relative", cursor: "pointer", transition: "all .25s" }}>
              <div style={{ position: "absolute", top: 2, left: directOnly ? 17 : 2, width: 12, height: 12, background: directOnly ? "#fff" : "#1a1a1a", borderRadius: "50%", transition: "left .25s" }} />
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2.5, color: directOnly ? "#fff" : "#888", textTransform: "uppercase" }}>Pièces directes uniquement</span>
          </label>
          <div style={{ width: 1, height: 14, background: "#0f0f0f" }} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#888" }}>Détenues en propre par le marchand ou par ses clients directs</span>
        </div>
      </div>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 32px" }}>

        {view === "feed" && <div className="fade-up">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div><div style={styles.sectionLabel}>Inventaires partagés</div><h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3 }}>{filteredInv.length} œuvre{filteredInv.length > 1 ? "s" : ""}</h1></div>
            <button className="btn-gold" onClick={() => setAddItem(true)}>+ Ajouter une œuvre</button>
          </div>
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            <input className="inp" style={{ maxWidth: 280 }} placeholder="Artiste, titre…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <span className={`tag ${!filterTag ? "active" : ""}`} onClick={() => setFilterTag(null)}>Tout</span>
              {allTags.map(t => <span key={t} className={`tag ${filterTag === t ? "active" : ""}`} onClick={() => setFilterTag(filterTag === t ? null : t)}>{t}</span>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 18 }}>
            {filteredInv.map((w, i) => {
              const d = dealer(w.dealer_id);
              const isOwn = currentDealer && String(w.dealer_id) === String(currentDealer.id);
              return <div key={w.id} className="card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                  {isOwn
                    ? (w.photo_url
                        ? <WatermarkedPhoto src={w.photo_url} uid={currentDealer?.uid} />
                        : <WatermarkedImage color="#6a5545" uid={currentDealer?.uid} />)
                    : w.photo_url && w.photo_visibility === "public"
                      ? <WatermarkedPhoto src={w.photo_url} uid={d?.uid || "ARC"} />
                      : w.photo_url && w.photo_visibility === "privee"
                        ? <div style={{ width: "100%", aspectRatio: "4/3", background: "#0e0e0e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#333" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#333" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#333"/></svg>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: "#333", textTransform: "uppercase" }}>Photo privée</span>
                          </div>
                        : <div style={{ width: "100%", aspectRatio: "4/3", background: "#0e0e0e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#1a1a1a" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#1a1a1a" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#1a1a1a"/></svg>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: "#1a1a1a", textTransform: "uppercase" }}>Photos sur demande</span>
                            <button onClick={() => { setChatTarget(d); setChatOpen(true); setTimeout(() => { window.__arcanum_prefill__ = `Bonjour, je souhaite accéder aux photos de « ${w.title} » (${w.artist}, ${w.year}).`; }, 100); }}
                              style={{ marginTop: 4, background: "none", border: "1px solid #111", color: "#2a2a2a", padding: "6px 16px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#2a2a2a"; }}>Demander l'accès</button>
                          </div>}
                  {w.direct && <div style={{ position: "absolute", top: 10, left: 10 }}><span className="direct-badge">Directe</span></div>}
                  {isOwn && <div style={{ position: "absolute", top: 10, right: 10 }}><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", background: "rgba(201,169,110,.12)", border: "1px solid rgba(201,169,110,.4)", color: "#c9a96e", textTransform: "uppercase" }}>Mon œuvre</span></div>}
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div><div style={{ fontSize: 16, color: "#ccc" }}>{w.title}</div><div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{w.artist}{w.year ? `, ${w.year}` : ""}</div></div>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "3px 7px", border: `1px solid ${w.status === "available" ? "#fff" : w.status === "reserved" ? "#6e8ec9" : "#dc5050"}`, color: w.status === "available" ? "#fff" : w.status === "reserved" ? "#6e8ec9" : "#dc5050", height: "fit-content", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                      {w.status === "available" ? "Disponible" : w.status === "reserved" ? "Réservé" : "Vendu"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{w.medium}</div>
                  {(w.dimensions || w.weight) && <div style={{ display: "flex", gap: 14, marginBottom: 6 }}>
                    {w.dimensions && <span style={{ fontSize: 11, color: "#555" }}>{w.dimensions}</span>}
                    {w.weight && <span style={{ fontSize: 11, color: "#555" }}>{w.weight}</span>}
                  </div>}
                  {(w.condition || w.certificate) && <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {w.condition && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", border: `1px solid ${w.condition === "Excellent" ? "rgba(110,184,122,.4)" : w.condition === "Bon" ? "rgba(255,255,255,.15)" : "rgba(201,169,110,.4)"}`, color: w.condition === "Excellent" ? "#6eb87a" : w.condition === "Bon" ? "#888" : "#c9a96e", textTransform: "uppercase" }}>{w.condition}</span>}
                    {w.certificate && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", border: "1px solid rgba(255,255,255,.15)", color: "#888", textTransform: "uppercase" }}>Certificat</span>}
                  </div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 500 }}>{w.price}</span>
                    <span className="uid-badge">{d?.uid || "—"}</span>
                  </div>
                  <div style={{ borderTop: "1px solid #0a0a0a", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>{(w.tags || []).slice(0, 2).map(t => <span key={t} className="tag" style={{ cursor: "default" }}>{t}</span>)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isOwn
                        ? <button className="btn-danger" title="Supprimer" onClick={() => deleteItem(w.id, "inventory")}>🗑</button>
                        : <><button className="btn-danger" onClick={() => { setReportTarget(w); setReportType("inventory"); }}>⚑</button><button className="btn-ghost" onClick={() => { setChatTarget(d); setChatOpen(true); }}>Contacter</button></>}
                    </div>
                  </div>
                </div>
              </div>;
            })}
            {filteredInv.length === 0 && <div style={{ color: "#222", gridColumn: "1/-1", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune œuvre pour l'instant — ajoutez la première !</div>}
          </div>
        </div>}

        {view === "searches" && <div className="fade-up">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div><div style={styles.sectionLabel}>Recherches actives</div><h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3 }}>Ce que le réseau cherche</h1></div>
            <button className="btn-gold" onClick={() => setAddSearch(true)}>+ Publier une recherche</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredSearches.map((s, i) => {
              const d = dealer(s.dealer_id);
              const isOwnSearch = currentDealer && String(s.dealer_id) === String(currentDealer.id);
              return <div key={s.id} className="card fade-up" style={{ padding: "22px 26px", animationDelay: `${i * 60}ms`, display: "flex", gap: 22, alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#111", border: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{d?.uid?.slice(-2) || "??"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div><div style={{ fontSize: 16, color: "#ccc", marginBottom: 4 }}>{s.title}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span className="uid-badge">{d?.uid || "—"}</span>
                        {isOwnSearch && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", background: "rgba(201,169,110,.12)", border: "1px solid rgba(201,169,110,.4)", color: "#c9a96e", textTransform: "uppercase" }}>Ma recherche</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {s.direct && <span className="direct-badge">Directe</span>}
                      {s.urgent && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, padding: "2px 8px", border: "1px solid rgba(220,80,80,.5)", color: "#dc5050", textTransform: "uppercase" }}>Urgent</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 28, marginBottom: 12 }}>
                    {s.period && <div><span style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Période </span><span style={{ fontSize: 14, color: "#888" }}>{s.period}</span></div>}
                    {s.budget && <div><span style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Budget </span><span style={{ fontSize: 14, color: "#fff" }}>{s.budget}</span></div>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>{(s.tags || []).map(t => <span key={t} className="tag" style={{ cursor: "default" }}>{t}</span>)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isOwnSearch
                        ? <button className="btn-danger" title="Supprimer" onClick={() => deleteItem(s.id, "searches")}>🗑</button>
                        : <><button className="btn-danger" onClick={() => { setReportTarget(s); setReportType("search"); }}>⚑</button><button className="btn-ghost" onClick={() => { setChatTarget(d); setChatOpen(true); }}>Je peux aider</button></>}
                    </div>
                  </div>
                </div>
              </div>;
            })}
            {filteredSearches.length === 0 && <div style={{ color: "#222", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune recherche active pour l'instant</div>}
          </div>
        </div>}

        {view === "match" && <div className="fade-up">
          <div style={styles.sectionLabel}>Matching automatique</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 6 }}>Offres & Demandes</h1>
          <p style={{ color: "#1a1a1a", fontSize: 14, marginBottom: 32 }}>Correspondances détectées entre inventaires et recherches</p>
          {searches.map((s, i) => {
            const match = inventory.find(w => (w.tags || []).some(t => (s.tags || []).includes(t)));
            if (!match) return null;
            return <div key={i} className="card fade-up" style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2 }}>Match</div>
                <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 2, color: "#6eb87a", border: "1px solid rgba(110,184,122,.3)", padding: "3px 10px", textTransform: "uppercase" }}>Correspondance</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid #111", padding: 16 }}>
                  <div style={{ fontSize: 9, color: "#1a1a1a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 3 }}>Recherche</div>
                  <div style={{ fontSize: 15, color: "#bbb", marginBottom: 6 }}>{s.title}</div>
                  <span className="uid-badge">{dealer(s.dealer_id)?.uid}</span>
                </div>
                <div style={{ textAlign: "center", color: "#111", fontSize: 16 }}>⟷</div>
                <div style={{ background: "rgba(110,184,122,.03)", border: "1px solid rgba(110,184,122,.1)", padding: 16 }}>
                  <div style={{ fontSize: 9, color: "#1a1a1a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 3 }}>Inventaire</div>
                  <div style={{ fontSize: 15, color: "#bbb", marginBottom: 6 }}>{match.title} — {match.artist}</div>
                  <div style={{ display: "flex", gap: 8 }}><span className="uid-badge">{dealer(match.dealer_id)?.uid}</span><span style={{ fontSize: 13, fontWeight: 500 }}>{match.price}</span></div>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #0a0a0a", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn-gold" onClick={() => { setChatTarget(dealer(s.dealer_id)); setChatOpen(true); }}>Mettre en contact</button>
              </div>
            </div>;
          }).filter(Boolean)}
          {!searches.some(s => inventory.find(w => (w.tags || []).some(t => (s.tags || []).includes(t)))) && <div style={{ color: "#222", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune correspondance détectée pour l'instant</div>}
        </div>}

        {view === "dealers" && <div className="fade-up">
          <div style={styles.sectionLabel}>Réseau</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 32 }}>Membres Arcanum</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
            {dealers.map((d, i) => (
              <div key={d.id} className="card fade-up" style={{ padding: 28, textAlign: "center", animationDelay: `${i * 60}ms` }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#111", border: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, margin: "0 auto 14px" }}>{d.uid?.slice(-2)}</div>
                <div style={{ marginBottom: 8 }}><span className="uid-badge">{d.uid}</span></div>
                {d.city && <div style={{ fontSize: 13, color: "#333", marginBottom: 3 }}>{d.city}</div>}
                {d.specialty && <div style={{ fontSize: 13, color: "#444", marginBottom: 14 }}>{d.specialty}</div>}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
                  {d.verified && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", border: "1px solid #fff", color: "#fff", textTransform: "uppercase" }}>Vérifié</span>}
                </div>
                <div style={{ fontSize: 12, color: "#1a1a1a", marginBottom: 14 }}>{inventory.filter(w => w.dealer_id === d.id).length} œuvres · {searches.filter(s => s.dealer_id === d.id).length} recherches</div>
                {d.id !== currentDealer?.id ? <button className="btn-ghost" style={{ width: "100%" }} onClick={() => { setChatTarget(d); setChatOpen(true); }}>Message</button>
                  : <div style={{ fontSize: 11, color: "#222", textTransform: "uppercase", letterSpacing: 2 }}>Vous</div>}
              </div>
            ))}
            {dealers.length === 0 && <div style={{ color: "#222", gridColumn: "1/-1", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Invitez des marchands pour constituer le réseau</div>}
          </div>
        </div>}

        {view === "messages" && <div className="fade-up">
          <div style={styles.sectionLabel}>Correspondances</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 28 }}>Messages</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {dealers.filter(d => d.id !== currentDealer?.id).map(d => (
              <div key={d.id} style={{ background: CARD_BG, border: "1px solid #0f0f0f", padding: "18px 22px", cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "border-color .2s" }}
                onClick={() => { setChatTarget(d); setChatOpen(true); }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#0f0f0f"}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#111", border: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500 }}>{d.uid?.slice(-2)}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 2.5, color: "#999", textTransform: "uppercase" }}>{d.uid}</span>
                  <div style={{ fontSize: 14, color: "#222", marginTop: 3 }}>Cliquer pour ouvrir la conversation</div>
                </div>
              </div>
            ))}
            {dealers.filter(d => d.id !== currentDealer?.id).length === 0 && <div style={{ color: "#222", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Invitez des marchands pour commencer à échanger</div>}
          </div>
        </div>}

        {view === "docs" && <div className="fade-up">
          <div style={styles.sectionLabel}>Documents juridiques</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>Contrats & Accords</h1>
          <p style={{ color: "#1a1a1a", fontSize: 14, marginBottom: 36 }}>Générez vos documents juridiques en quelques secondes grâce à l'IA</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {[{ icon: "📋", label: "Contrat de Consignment", desc: "Dépôt d'une œuvre en vue de vente." }, { icon: "🔒", label: "NDA — Confidentialité", desc: "Protégez les informations échangées." }, { icon: "🔍", label: "Mandat de Recherche", desc: "Mandatez un confrère pour trouver une pièce." }, { icon: "⏳", label: "Accord de Réservation", desc: "Réservez une œuvre avec acompte." }].map((doc, i) => (
              <div key={i} className="card fade-up" style={{ padding: 28, cursor: "pointer", animationDelay: `${i * 60}ms` }} onClick={() => setShowContracts(true)}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{doc.icon}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{doc.label}</div>
                <div style={{ fontSize: 13, color: "#222", lineHeight: 1.6, marginBottom: 18 }}>{doc.desc}</div>
                <button className="btn-gold" style={{ width: "100%" }}>Générer →</button>
              </div>
            ))}
          </div>
        </div>}

        {view === "admin" && user?.email === "louisvassy@live.fr" && <div className="fade-up">
          <div style={styles.sectionLabel}>Administration</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>Invitations</h1>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>{invitations.filter(i => i.status === "pending").length} en attente · {invitations.filter(i => i.status === "approved").length} approuvées · {invitations.filter(i => i.status === "refused").length} refusées</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {invitations.length === 0 && <div style={{ color: "#333", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune invitation</div>}
            {invitations.map(inv => (
              <div key={inv.id} style={{ background: CARD_BG, border: `1px solid ${inv.status === "pending" ? "#1a1a1a" : inv.status === "approved" ? "rgba(110,184,122,.2)" : "rgba(220,80,80,.15)"}`, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#ccc" }}>{inv.email}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                    {inv.uid && <span className="uid-badge">{inv.uid}</span>}
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", textTransform: "uppercase", border: `1px solid ${inv.status === "pending" ? "#333" : inv.status === "approved" ? "rgba(110,184,122,.4)" : "rgba(220,80,80,.4)"}`, color: inv.status === "pending" ? "#666" : inv.status === "approved" ? "#6eb87a" : "#dc5050" }}>{inv.status || "pending"}</span>
                    {inv.created_at && <span style={{ fontSize: 11, color: "#333" }}>{new Date(inv.created_at).toLocaleDateString("fr-FR")}</span>}
                  </div>
                </div>
                {inv.status === "pending" && <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => updateInvitationStatus(inv.id, "approved")} style={{ background: "rgba(110,184,122,.1)", border: "1px solid rgba(110,184,122,.4)", color: "#6eb87a", padding: "7px 16px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Approuver</button>
                  <button onClick={() => updateInvitationStatus(inv.id, "refused")} style={{ background: "none", border: "1px solid rgba(220,80,80,.3)", color: "#dc5050", padding: "7px 16px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Refuser</button>
                </div>}
              </div>
            ))}
          </div>
        </div>}
      </main>

      {chatOpen && chatTarget && <ChatPanel target={chatTarget} onClose={() => setChatOpen(false)} />}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} currentDealer={currentDealer} onSent={uid => toast(`Invitation envoyée · ${uid} réservé`)} />}
      {showContracts && <ContractModal onClose={() => setShowContracts(false)} />}

      {reportTarget && <div style={styles.modalBg} onClick={e => e.target === e.currentTarget && setReportTarget(null)}>
        <div style={{ ...styles.modal, maxWidth: 400 }}>
          <div style={styles.sectionLabel}>Signalement</div>
          <h2 style={{ ...styles.modalTitle, marginBottom: 8 }}>Signaler ce contenu</h2>
          <p style={{ fontSize: 13, color: "#333", marginBottom: 24 }}>« {reportTarget?.title} »</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setReportTarget(null)} style={styles.btnGhost}>Annuler</button>
            <button onClick={() => reportItem(reportTarget, reportType)} style={styles.btnGold}>Confirmer</button>
          </div>
        </div>
      </div>}

      {addItem && <div style={styles.modalBg} onClick={e => e.target === e.currentTarget && setAddItem(false)}>
        <div style={{ ...styles.modal, maxWidth: 480 }}>
          <div style={styles.sectionLabel}>Inventaire</div>
          <h2 style={styles.modalTitle}>Ajouter une œuvre</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["title", "Titre *"], ["artist", "Artiste *"], ["year", "Année"], ["medium", "Technique / support"], ["price", "Prix"], ["tags", "Tags (séparés par virgule)"]].map(([k, ph]) => <input key={k} className="inp" placeholder={ph} value={newItem[k]} onChange={e => setNewItem({ ...newItem, [k]: e.target.value })} />)}
            <div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Photo de l'œuvre</div>
              <input type="file" accept="image/*" style={{ ...styles.input, cursor: "pointer", color: "#888" }} onChange={e => setNewItem({ ...newItem, photoFile: e.target.files?.[0] || null })} />
            </div>
            {newItem.photoFile && <div>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Visibilité</div>
              <div style={{ display: "flex", gap: 1 }}>
                {[["Publique", "public"], ["Sur demande", "sur_demande"], ["Privée", "privee"]].map(([l, v]) => (
                  <button key={v} type="button" onClick={() => setNewItem({ ...newItem, photo_visibility: v })} style={{ flex: 1, background: newItem.photo_visibility === v ? "#fff" : "none", border: "1px solid #1a1a1a", color: newItem.photo_visibility === v ? "#080808" : "#555", padding: "9px 4px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", transition: "all .15s" }}>{l}</button>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "#444", lineHeight: 1.5 }}>
                {newItem.photo_visibility === "public" && "Visible par tous les membres avec filigrane ARCANUM."}
                {newItem.photo_visibility === "sur_demande" && "Les autres voient un bouton pour demander l'accès via chat."}
                {newItem.photo_visibility === "privee" && "Photo invisible pour les autres membres."}
              </div>
            </div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input className="inp" placeholder="Dimensions (ex: 120 × 80 cm)" value={newItem.dimensions} onChange={e => setNewItem({ ...newItem, dimensions: e.target.value })} />
              <input className="inp" placeholder="Poids (ex: 3,2 kg)" value={newItem.weight} onChange={e => setNewItem({ ...newItem, weight: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>État de conservation</div>
                <select className="inp" style={{ cursor: "pointer" }} value={newItem.condition} onChange={e => setNewItem({ ...newItem, condition: e.target.value })}>
                  {["Excellent", "Bon", "Moyen"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Certificat d'authenticité</div>
                <div style={{ display: "flex", gap: 1 }}>
                  {[["Oui", true], ["Non", false]].map(([l, v]) => (
                    <button key={l} onClick={() => setNewItem({ ...newItem, certificate: v })} style={{ flex: 1, background: newItem.certificate === v ? "#fff" : "none", border: "1px solid #1a1a1a", color: newItem.certificate === v ? "#080808" : "#555", padding: "10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
              <div onClick={() => setNewItem({ ...newItem, direct: !newItem.direct })} style={{ width: 32, height: 18, background: newItem.direct ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.04)", border: `1px solid ${newItem.direct ? "#fff" : "#111"}`, borderRadius: 9, position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 2, left: newItem.direct ? 15 : 2, width: 12, height: 12, background: newItem.direct ? "#fff" : "#1a1a1a", borderRadius: "50%", transition: "left .25s" }} />
              </div>
              <span style={{ fontSize: 9, letterSpacing: 2, color: newItem.direct ? "#fff" : "#555", textTransform: "uppercase" }}>Pièce directe</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => setAddItem(false)} style={styles.btnGhost}>Annuler</button>
            <button onClick={submitItem} style={styles.btnGold}>Publier</button>
          </div>
        </div>
      </div>}

      {addSearch && <div style={styles.modalBg} onClick={e => e.target === e.currentTarget && setAddSearch(false)}>
        <div style={{ ...styles.modal, maxWidth: 480 }}>
          <div style={styles.sectionLabel}>Recherche</div>
          <h2 style={styles.modalTitle}>Publier une recherche</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["title", "Description *"], ["period", "Période"], ["budget", "Budget"], ["tags", "Tags (séparés par virgule)"]].map(([k, ph]) => <input key={k} className="inp" placeholder={ph} value={newSearch[k]} onChange={e => setNewSearch({ ...newSearch, [k]: e.target.value })} />)}
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
              <div onClick={() => setNewSearch({ ...newSearch, direct: !newSearch.direct })} style={{ width: 32, height: 18, background: newSearch.direct ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.04)", border: `1px solid ${newSearch.direct ? "#fff" : "#111"}`, borderRadius: 9, position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 2, left: newSearch.direct ? 15 : 2, width: 12, height: 12, background: newSearch.direct ? "#fff" : "#1a1a1a", borderRadius: "50%", transition: "left .25s" }} />
              </div>
              <span style={{ fontSize: 9, letterSpacing: 2, color: newSearch.direct ? "#fff" : "#222", textTransform: "uppercase" }}>Recherche directe</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => setAddSearch(false)} style={styles.btnGhost}>Annuler</button>
            <button onClick={submitSearch} style={styles.btnGold}>Publier</button>
          </div>
        </div>
      </div>}

      {notif && <div style={{ position: "fixed", bottom: 28, right: 28, background: "#fff", color: "#080808", padding: "12px 22px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", zIndex: 300, fontWeight: 500 }}>{notif}</div>}
    </div>
  );
}
