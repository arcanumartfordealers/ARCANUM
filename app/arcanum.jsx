"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const DARK = "#F5F0E8";
const CARD_BG = "#FFFDF8";
const ADMINS = ["louisvassy@live.fr", "tomdavidb@icloud.com"];

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
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, H / 2 - 16, W, 32);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ARCANUM · CONFIDENTIEL · NE PAS DIFFUSER", W / 2, H / 2);
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
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, H / 2 - 16, W, 32);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ARCANUM · CONFIDENTIEL · NE PAS DIFFUSER", W / 2, H / 2);
    };
    img.onerror = () => {
      canvas.width = 320; canvas.height = 220;
      ctx.fillStyle = "#EDE8DE";
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&family=DM+Sans:wght@300;400;500&family=Bebas+Neue&display=swap');`}</style>
      <div style={{ width: 400, padding: 40, background: "#FFFDF8", border: "1px solid #E0D8C8" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 34, letterSpacing: 2 }}>ARCANUM</div>
            <div style={{ width: 1, height: 30, background: "#C0B8A8", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", lineHeight: 1.3 }}>RÉSEAU</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", lineHeight: 1.3 }}>PRIVÉ</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 1, marginBottom: 24 }}>
          {[["login", "Connexion"], ["register", "Inscription"]].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, background: mode === m ? "#1a1a1a" : "none", border: "1px solid #C8C0B0", color: mode === m ? "#fff" : "#888", padding: "8px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>{l}</button>
          ))}
        </div>

        {error && <div style={{ background: "rgba(220,80,80,0.08)", border: "1px solid rgba(220,80,80,0.3)", color: "#dc5050", padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={{ background: "#fff", border: "1px solid #D0C8B8", color: "#1a1a1a", padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%" }} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <input style={{ background: "#fff", border: "1px solid #D0C8B8", color: "#1a1a1a", padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%" }} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} type="password" onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())} />
        </div>

        <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} style={{ marginTop: 20, width: "100%", background: "#1a1a1a", border: "none", color: "#fff", padding: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>

        {mode === "register" && (
          <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            L'inscription est sur invitation uniquement.<br />Votre email doit avoir été invité par un membre.
          </p>
        )}
      </div>
    </div>
  );
}

const QUESTIONS_INVENTORY = [
  { key: "availability",    label: "L'œuvre est-elle toujours disponible ?",  answers: ["Oui, disponible", "Non, vendue", "Bloquée pour une offre en cours"] },
  { key: "offer_possible",  label: "Est-il possible de faire une offre ?",     answers: ["Oui", "Non"] },
  { key: "location",        label: "Où est l'œuvre ?",                          type: "select", cities: ["Paris", "Londres", "New York", "Genève", "Zurich", "Hong Kong", "Dubaï", "Monaco", "Berlin", "Milan", "Madrid", "Tokyo", "Los Angeles", "Bruxelles", "Amsterdam"] },
  { key: "condition_report", label: "Avez-vous un condition report ?",          answers: ["Oui, je peux le partager", "Non"] },
];
const QUESTIONS_SEARCH = [
  { key: "available_match",   label: "Avez-vous trouvé une œuvre correspondante ?", answers: ["Oui", "Pas encore", "Recherche abandonnée"] },
  { key: "artwork_picker",    label: "Je voudrais vous soumettre une œuvre",         type: "artwork_picker" },
  { key: "budget_negotiable", label: "Le budget est-il négociable ?",                answers: ["Oui, dans une certaine mesure", "Non, budget fixe"] },
  { key: "search_active",     label: "La recherche est-elle toujours active ?",      answers: ["Oui, toujours active", "Non, clôturée"] },
];

function ChatPanel({ target, currentDealer, artwork, context = "inventory", myInventory = [], onClose }) {
  const [messages, setMessages] = useState([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [offerManual, setOfferManual] = useState("");
  const [locationChoice, setLocationChoice] = useState("");
  const [artworkPickerOpen, setArtworkPickerOpen] = useState(false);
  const bottomRef = useRef(null);
  const myId = currentDealer?.id;
  const theirId = target?.id;
  const fmt = ts => { const d = new Date(ts); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const tryParse = text => { try { return JSON.parse(text); } catch { return { type: "text", value: text }; } };

  useEffect(() => {
    if (!myId || !theirId) return;
    const load = async () => {
      const { data } = await supabase.from("messages").select("*")
        .or(`and(from_dealer.eq.${myId},to_dealer.eq.${theirId}),and(from_dealer.eq.${theirId},to_dealer.eq.${myId})`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data.map(r => ({ id: r.id, from: String(r.from_dealer) === String(myId) ? "me" : "them", parsed: tryParse(r.text), time: fmt(r.created_at) })));
    };
    load();
    const channel = supabase.channel(`chat-${[myId, theirId].sort().join("-")}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, ({ new: r }) => {
        const fromThem = String(r.from_dealer) === String(theirId) && String(r.to_dealer) === String(myId);
        if (fromThem) setMessages(m => [...m, { id: r.id, from: "them", parsed: tryParse(r.text), time: fmt(r.created_at) }]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myId, theirId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (payload) => {
    if (!myId || !theirId) return;
    setMessages(m => [...m, { id: `opt-${Date.now()}`, from: "me", parsed: payload, time: fmt(new Date().toISOString()) }]);
    await supabase.from("messages").insert({ from_dealer: myId, to_dealer: theirId, text: JSON.stringify(payload) });
  };

  const last = messages[messages.length - 1];
  const lp = last?.parsed;
  const parsePrice = s => { const n = parseFloat((s || "").replace(/\s/g, "").replace(",", ".").replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : n; };
  const basePrice = parsePrice(artwork?.price);
  const offerAmount = basePrice > 0 ? Math.round(basePrice * (1 - offerDiscount / 100)) : parsePrice(offerManual);
  const offerPermitted = messages.some(m => m.from === "them" && m.parsed?.type === "a" && m.parsed?.key === "offer_possible" && m.parsed?.value === "Oui");
  const pendingMyOffer = last?.from === "me" && lp?.type === "offer";

  const renderBubble = (msg, i) => {
    const isMe = msg.from === "me";
    const p = msg.parsed;
    if (p.type === "artwork_proposal") {
      return (
        <div key={msg.id || i} className="mb" style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "82%" }}>
          <div style={{ fontSize: 8, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, textAlign: isMe ? "right" : "left" }}>Proposition d'œuvre</div>
          <div style={{ background: isMe ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.03)", border: `1px solid ${isMe ? "rgba(0,0,0,0.12)" : "#E0D8C8"}`, borderRadius: isMe ? "8px 8px 2px 8px" : "8px 8px 8px 2px", overflow: "hidden" }}>
            {p.photo_url && <WatermarkedPhoto src={p.photo_url} uid={isMe ? currentDealer?.uid : target?.uid} />}
            <div style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{p.title}</div>
              {p.artist && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{p.artist}</div>}
              {p.price && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{p.price}</div>}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 3, textAlign: isMe ? "right" : "left" }}>{msg.time}</div>
        </div>
      );
    }
    let label = "", text = "", accent = null;
    if (p.type === "q") { label = "Question"; text = p.label; }
    else if (p.type === "a") { label = "Réponse"; text = p.value; }
    else if (p.type === "offer") { label = "Offre"; text = `${Number(p.amount).toLocaleString("fr-FR")} €${p.discount > 0 ? ` (−${p.discount}%)` : ""}`; accent = "#c9a96e"; }
    else if (p.type === "offer_resp") { label = p.accepted ? "Offre acceptée" : "Offre refusée"; text = p.accepted ? `Montant convenu : ${Number(p.amount).toLocaleString("fr-FR")} €` : "Offre déclinée"; accent = p.accepted ? "#6eb87a" : "#dc5050"; }
    else { text = p.value || ""; }
    return (
      <div key={msg.id || i} className="mb" style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "82%" }}>
        {label && <div style={{ fontSize: 8, color: accent || "#333", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, textAlign: isMe ? "right" : "left" }}>{label}</div>}
        <div style={{ background: accent ? `${accent}14` : isMe ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.03)", border: `1px solid ${accent ? `${accent}44` : isMe ? "rgba(0,0,0,0.12)" : "#E0D8C8"}`, padding: "10px 14px", borderRadius: isMe ? "8px 8px 2px 8px" : "8px 8px 8px 2px", fontSize: 13, lineHeight: 1.65, color: accent || (isMe ? "#1a1a1a" : "#555") }}>{text}</div>
        <div style={{ fontSize: 10, color: "#999", marginTop: 3, textAlign: isMe ? "right" : "left" }}>{msg.time}</div>
      </div>
    );
  };

  const renderBottom = () => {
    if (last?.from === "me" && (lp?.type === "q" || lp?.type === "offer")) {
      return <div style={{ padding: "16px", borderTop: "1px solid #E0D8C8", color: "#B0A898", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", flexShrink: 0 }}>En attente de réponse…</div>;
    }
    if (last?.from === "them" && lp?.type === "q") {
      const q = [...QUESTIONS_INVENTORY, ...QUESTIONS_SEARCH].find(q => q.key === lp.key);
      if (!q) return null;
      return (
        <div style={{ padding: "14px 16px", borderTop: "1px solid #E0D8C8", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: "#B0A898", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Votre réponse</div>
          {q.type === "select"
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select value={locationChoice} onChange={e => setLocationChoice(e.target.value)} style={{ background: "#fff", border: "1px solid #D0C8B8", color: locationChoice ? "#1a1a1a" : "#888", padding: "10px 14px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", width: "100%", cursor: "pointer", outline: "none" }}>
                  <option value="">Sélectionner une ville…</option>
                  {q.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn-gold" disabled={!locationChoice} onClick={() => { send({ type: "a", key: q.key, value: locationChoice }); setLocationChoice(""); }}>Envoyer</button>
              </div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.answers.map(a => <button key={a} className="btn-ghost" style={{ textAlign: "left" }} onClick={() => send({ type: "a", key: q.key, value: a })}>{a}</button>)}
              </div>}
        </div>
      );
    }
    if (last?.from === "them" && lp?.type === "offer") {
      return (
        <div style={{ padding: "14px 16px", borderTop: "1px solid #E0D8C8", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: "#c9a96e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Offre reçue : {Number(lp.amount).toLocaleString("fr-FR")} €</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-gold" style={{ flex: 1 }} onClick={() => send({ type: "offer_resp", accepted: true, amount: lp.amount })}>Accepter</button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => send({ type: "offer_resp", accepted: false, amount: lp.amount })}>Refuser</button>
          </div>
        </div>
      );
    }
    if (artworkPickerOpen) {
      return (
        <div style={{ padding: "14px 16px", borderTop: "1px solid #E0D8C8", flexShrink: 0, maxHeight: 280, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 8, color: "#B0A898", letterSpacing: 2, textTransform: "uppercase" }}>Sélectionner une œuvre</div>
            <button onClick={() => setArtworkPickerOpen(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          {myInventory.length === 0
            ? <div style={{ fontSize: 12, color: "#B0A898", textAlign: "center", padding: "12px 0" }}>Aucune œuvre dans votre inventaire</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {myInventory.map(w => (
                  <button key={w.id} className="btn-ghost" style={{ textAlign: "left", padding: "10px 14px" }}
                    onClick={() => { send({ type: "artwork_proposal", artwork_id: w.id, title: w.title, artist: w.artist || "", price: w.price || "", photo_url: w.photo_url || null }); setArtworkPickerOpen(false); }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{w.title}</div>
                    {w.artist && <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{w.artist}</div>}
                    {w.price && <div style={{ fontSize: 11, color: "#c9a96e", marginTop: 1 }}>{w.price}</div>}
                  </button>
                ))}
              </div>}
        </div>
      );
    }
    const activeQuestions = context === "search" ? QUESTIONS_SEARCH : QUESTIONS_INVENTORY;
    return (
      <div style={{ padding: "14px 16px", borderTop: "1px solid #E0D8C8", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: "#B0A898", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Questions</div>
        {activeQuestions.map(q => (
          <button key={q.key} className="btn-ghost" style={{ textAlign: "left", fontSize: 12, padding: "8px 14px" }}
            onClick={() => q.type === "artwork_picker" ? setArtworkPickerOpen(true) : send({ type: "q", key: q.key, label: q.label })}>
            {q.label}
          </button>
        ))}
        {offerPermitted && !pendingMyOffer && (
          <button className="btn-gold" style={{ marginTop: 4 }} onClick={() => setOfferOpen(true)}>Faire une offre</button>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, background: "#F8F4EE", borderLeft: "1px solid #E0D8C8", zIndex: 150, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .mb{animation:msgIn .25s ease both}`}</style>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E0D8C8", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0D8C8", border: "1px solid #D0C8B8", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontSize: 13, fontWeight: 500 }}>{target?.uid?.slice(-2) || "??"}</div>
          <div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 2.5, color: "#555", textTransform: "uppercase" }}>{target?.uid}</div>
            {artwork ? <div style={{ fontSize: 11, color: "#888" }}>re : {artwork.title}</div> : <div style={{ fontSize: 11, color: "#999" }}>Marchand</div>}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && <div style={{ textAlign: "center", marginTop: 40, color: "#B0A898", fontSize: 13 }}>Sélectionnez une question ci-dessous</div>}
        {messages.map(renderBubble)}
        <div ref={bottomRef} />
      </div>
      {renderBottom()}
      {offerOpen && (
        <div style={{ position: "absolute", inset: "0", background: "rgba(245,240,232,0.97)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, zIndex: 10 }}>
          <div style={{ background: "#FFFDF8", border: "1px solid #D0C8B8", padding: 28, width: "100%" }}>
            <div style={{ fontSize: 8, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 18 }}>Faire une offre</div>
            {artwork && <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{artwork.title}{artwork.artist ? ` — ${artwork.artist}` : ""}</div>}
            {basePrice > 0 && <div style={{ fontSize: 11, color: "#888", marginBottom: 20 }}>Prix affiché : {basePrice.toLocaleString("fr-FR")} €</div>}
            <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #E8E0D0", borderBottom: "1px solid #E8E0D0", marginBottom: 20 }}>
              <div style={{ fontSize: 8, color: "#B0A898", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Votre offre</div>
              {basePrice > 0
                ? <>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, letterSpacing: 2 }}>{offerAmount.toLocaleString("fr-FR")} €</div>
                    {offerDiscount > 0 && <div style={{ fontSize: 12, color: "#c9a96e", marginTop: 6 }}>−{offerDiscount}% par rapport au prix affiché</div>}
                    <button className="btn-ghost" style={{ marginTop: 16, width: "100%" }} disabled={offerDiscount >= 50} onClick={() => setOfferDiscount(d => Math.min(d + 5, 50))}>− 5%</button>
                  </>
                : <input className="inp" type="number" placeholder="Montant en €" value={offerManual} onChange={e => setOfferManual(e.target.value)} style={{ width: "100%", textAlign: "center", fontSize: 20 }} />}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setOfferOpen(false); setOfferDiscount(0); setOfferManual(""); }}>Annuler</button>
              <button className="btn-gold" style={{ flex: 1 }} disabled={offerAmount === 0} onClick={() => { send({ type: "offer", amount: offerAmount, discount: offerDiscount, artwork_title: artwork?.title || "" }); setOfferOpen(false); setOfferDiscount(0); setOfferManual(""); }}>Envoyer l'offre</button>
            </div>
          </div>
        </div>
      )}
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
        <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Arcanum est un réseau sur invitation uniquement.</p>
        {!sent ? <>
          <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid #E0D8C8", padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 9, color: "#B0A898", marginBottom: 6, textTransform: "uppercase", letterSpacing: 3 }}>Numéro attribué</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#1a1a1a", letterSpacing: 4 }}>{uid}</div></div>
            <div style={{ fontSize: 11, color: "#888", maxWidth: 180, textAlign: "right" }}>Identité anonyme sur le réseau</div>
          </div>
          <input style={{ ...styles.input, marginBottom: 20 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email du marchand" type="email" />
          <div style={{ display: "flex", gap: 10 }}><button onClick={onClose} style={styles.btnGhost}>Annuler</button><button onClick={send} style={styles.btnGold}>Envoyer</button></div>
        </> : <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 3, color: "#1a1a1a", marginBottom: 8 }}>Invitation envoyée</div>
          <div style={{ fontSize: 13, color: "#888" }}>{uid} réservé</div>
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
          {TYPES.map(ct => <div key={ct.key} onClick={() => setType(ct.key)} style={{ background: "rgba(0,0,0,0.02)", border: "1px solid #E0D8C8", padding: 20, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1a1a"} onMouseLeave={e => e.currentTarget.style.borderColor = "#E0D8C8"}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{ct.icon}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 6 }}>{ct.label}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{ct.desc}</div>
          </div>)}
        </div>}
        {type && !generated && <div>
          <div style={{ cursor: "pointer", marginBottom: 24, color: "#888", fontSize: 13 }} onClick={() => setType(null)}>← Retour</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["party1", "Partie 1"], ["party2", "Partie 2"], ["artwork", "Œuvre / objet"], ["price", "Prix / budget"], ["duration", "Durée"], ["commission", "Commission %"]].map(([k, ph]) => (
              <div key={k}><div style={{ fontSize: 9, color: "#B0A898", marginBottom: 6, textTransform: "uppercase", letterSpacing: 3 }}>{ph}</div>
                <input style={styles.input} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
          </div>
          <button onClick={generate} style={{ ...styles.btnGold, width: "100%", marginTop: 24, padding: "14px" }} disabled={loading}>{loading ? "Génération en cours…" : "Générer le document"}</button>
        </div>}
        {generated && <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "#1a1a1a", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Document généré</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(contractText)} style={styles.btnGhost}>Copier</button>
              <button onClick={() => { setGenerated(false); setContractText(""); }} style={styles.btnGhost}>Nouveau</button>
            </div>
          </div>
          <div style={{ background: "#F0EBE0", border: "1px solid #E0D8C8", padding: 24, fontSize: 13, lineHeight: 1.8, color: "#555", whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto", fontFamily: "Georgia,serif" }}>{contractText}</div>
          <div style={{ marginTop: 12, padding: "10px 16px", background: "rgba(0,0,0,0.03)", border: "1px solid #E0D8C8", fontSize: 11, color: "#888" }}>⚠️ Document indicatif. Faites valider par un juriste avant signature.</div>
        </div>}
      </div>
    </div>
  );
}

const styles = {
  modalBg: { position: "fixed", inset: 0, background: "rgba(180,170,158,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" },
  modal: { background: "#FFFDF8", border: "1px solid #E0D8C8", padding: "36px", width: "90%", borderRadius: 0 },
  modalTitle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, fontWeight: 400, letterSpacing: 3, color: "#1a1a1a", marginBottom: 24 },
  sectionLabel: { fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 4, color: "#B0A898", marginBottom: 10, textTransform: "uppercase" },
  closeBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 },
  input: { background: "#fff", border: "1px solid #D0C8B8", color: "#1a1a1a", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", fontFamily: "'DM Sans',sans-serif" },
  btnGold: { background: "#1a1a1a", border: "1px solid #1a1a1a", color: "#fff", padding: "9px 22px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", transition: "all 0.2s" },
  btnGhost: { background: "none", border: "1px solid #C8C0B0", color: "#888", padding: "9px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", transition: "all 0.2s" },
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
  const [chatArtwork, setChatArtwork] = useState(null);
  const [chatContext, setChatContext] = useState("inventory");
  const openChat = (target, artwork = null, ctx = "inventory") => { setChatTarget(target); setChatArtwork(artwork); setChatContext(ctx); setChatOpen(true); };
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
  const [selectedWork, setSelectedWork] = useState(null);

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

  if (loading) return <div style={{ background: DARK, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#B0A898", fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Chargement…</div>;
  if (!user) return <AuthScreen onLogin={u => { setUser(u); loadDealer(u); }} />;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: DARK, minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&family=DM+Sans:wght@200;300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:#C8C0B0;}
        input,textarea{font-family:'DM Sans',sans-serif!important;}
        .nav-btn{background:none;border:none;color:#888;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:1.5px;padding:10px 14px;transition:color .2s;position:relative;text-transform:uppercase;}
        .nav-btn:hover{color:#1a1a1a;} .nav-btn.active{color:#1a1a1a;}
        .nav-btn.active::after{content:'';position:absolute;bottom:-1px;left:14px;right:14px;height:1px;background:#1a1a1a;}
        .card{background:${CARD_BG};border:1px solid #E0D8C8;transition:border-color .2s,box-shadow .2s;}
        .card:hover{border-color:#888;box-shadow:0 4px 20px rgba(0,0,0,.08);}
        .btn-gold{background:#1a1a1a;border:1px solid #1a1a1a;color:#fff;padding:9px 20px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;transition:all .2s;text-transform:uppercase;}
        .btn-gold:hover{background:transparent;color:#1a1a1a;}
        .btn-ghost{background:none;border:1px solid #C8C0B0;color:#888;padding:7px 14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:1.5px;transition:all .2s;text-transform:uppercase;}
        .btn-ghost:hover{border-color:#1a1a1a;color:#1a1a1a;}
        .btn-danger{background:none;border:1px solid rgba(220,80,80,.2);color:rgba(220,80,80,.5);padding:5px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;transition:all .2s;text-transform:uppercase;}
        .btn-danger:hover{border-color:rgba(220,80,80,.8);color:rgb(220,80,80);}
        .inp{background:#fff;border:1px solid #D0C8B8;color:#1a1a1a;padding:10px 14px;font-size:14px;width:100%;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#1a1a1a;}
        .tag{display:inline-block;background:transparent;border:1px solid #D8D0C0;color:#888;padding:2px 10px;font-size:10px;letter-spacing:1.5px;margin:2px;cursor:pointer;transition:all .2s;text-transform:uppercase;}
        .tag:hover,.tag.active{background:rgba(0,0,0,.06);color:#1a1a1a;border-color:#888;}
        .uid-badge{font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:2.5px;color:#999;background:rgba(0,0,0,.03);border:1px solid #D8D0C0;padding:2px 8px;text-transform:uppercase;}
        .direct-badge{font-family:'DM Sans',sans-serif;font-size:8px;letter-spacing:1.5px;color:#6eb87a;background:rgba(110,184,122,.05);border:1px solid rgba(110,184,122,.2);padding:2px 8px;text-transform:uppercase;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .35s ease both;}
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid #E8E0D0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 34, letterSpacing: 2 }}>ARCANUM</div>
            <div style={{ width: 1, height: 30, background: "#C0B8A8", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", lineHeight: 1.3 }}>RÉSEAU</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", lineHeight: 1.3 }}>PRIVÉ</div>
            </div>
          </div>

          <nav style={{ display: "flex" }}>
            {[["feed", "Inventaires"], ["searches", "Recherches"], ["match", "Matching"], ["messages", "Messages"], ["docs", "Documents"]].map(([k, l]) => (
              <button key={k} className={`nav-btn ${view === k ? "active" : ""}`} onClick={() => setView(k)}>{l}</button>
            ))}
            {ADMINS.includes(user?.email) && (
              <button className={`nav-btn ${view === "dealers" ? "active" : ""}`} onClick={() => setView("dealers")}>Marchands</button>
            )}
            {ADMINS.includes(user?.email) && (
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

      <div style={{ background: "#EDE8DE", borderBottom: "1px solid #E0D8C8", padding: "9px 32px", position: "sticky", top: 60, zIndex: 90 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 16, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div onClick={() => setDirectOnly(!directOnly)} style={{ width: 34, height: 18, background: directOnly ? "rgba(0,0,0,.15)" : "rgba(0,0,0,.05)", border: `1px solid ${directOnly ? "#1a1a1a" : "#C8C0B0"}`, borderRadius: 9, position: "relative", cursor: "pointer", transition: "all .25s" }}>
              <div style={{ position: "absolute", top: 2, left: directOnly ? 17 : 2, width: 12, height: 12, background: directOnly ? "#1a1a1a" : "#C8C0B0", borderRadius: "50%", transition: "left .25s" }} />
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2.5, color: directOnly ? "#1a1a1a" : "#888", textTransform: "uppercase" }}>Pièces directes uniquement</span>
          </label>
          <div style={{ width: 1, height: 14, background: "#D0C8B8" }} />
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
              return <div key={w.id} className="card fade-up" style={{ animationDelay: `${i * 60}ms`, cursor: "pointer" }} onClick={() => setSelectedWork({ w, d, isOwn })}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                  {isOwn
                    ? (w.photo_url
                        ? <WatermarkedPhoto src={w.photo_url} uid={currentDealer?.uid} />
                        : <WatermarkedImage color="#6a5545" uid={currentDealer?.uid} />)
                    : w.photo_url && w.photo_visibility === "public"
                      ? <WatermarkedPhoto src={w.photo_url} uid={d?.uid || "ARC"} />
                      : w.photo_url && w.photo_visibility === "privee"
                        ? <div style={{ width: "100%", aspectRatio: "4/3", background: "#EDE8DE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#B0A898" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#B0A898" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#B0A898"/></svg>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: "#B0A898", textTransform: "uppercase" }}>Photo privée</span>
                          </div>
                        : <div style={{ width: "100%", aspectRatio: "4/3", background: "#EDE8DE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#C8C0B0" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#C8C0B0" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#C8C0B0"/></svg>
                            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: "#B0A898", textTransform: "uppercase" }}>Photos sur demande</span>
                            <button onClick={() => openChat(d, w)}
                              style={{ marginTop: 4, background: "none", border: "1px solid #C8C0B0", color: "#888", padding: "6px 16px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#1a1a1a"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "#C8C0B0"; e.currentTarget.style.color = "#888"; }}>Demander l'accès</button>
                          </div>}
                  {w.direct && <div style={{ position: "absolute", top: 10, left: 10 }}><span className="direct-badge">Directe</span></div>}
                  {isOwn && <div style={{ position: "absolute", top: 10, right: 10 }}><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", background: "rgba(201,169,110,.12)", border: "1px solid rgba(201,169,110,.4)", color: "#c9a96e", textTransform: "uppercase" }}>Mon œuvre</span></div>}
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div><div style={{ fontSize: 16, color: "#1a1a1a" }}>{w.title}</div><div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{w.artist}{w.year ? `, ${w.year}` : ""}</div></div>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "3px 7px", border: `1px solid ${w.status === "available" ? "#1a1a1a" : w.status === "reserved" ? "#6e8ec9" : "#dc5050"}`, color: w.status === "available" ? "#1a1a1a" : w.status === "reserved" ? "#6e8ec9" : "#dc5050", height: "fit-content", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                      {w.status === "available" ? "Disponible" : w.status === "reserved" ? "Réservé" : "Vendu"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{w.medium}</div>
                  {(w.dimensions || w.weight) && <div style={{ display: "flex", gap: 14, marginBottom: 6 }}>
                    {w.dimensions && <span style={{ fontSize: 11, color: "#555" }}>{w.dimensions}</span>}
                    {w.weight && <span style={{ fontSize: 11, color: "#555" }}>{w.weight}</span>}
                  </div>}
                  {(w.condition || w.certificate) && <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {w.condition && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", border: `1px solid ${w.condition === "Excellent" ? "rgba(110,184,122,.4)" : w.condition === "Bon" ? "rgba(0,0,0,.12)" : "rgba(201,169,110,.4)"}`, color: w.condition === "Excellent" ? "#6eb87a" : w.condition === "Bon" ? "#888" : "#c9a96e", textTransform: "uppercase" }}>{w.condition}</span>}
                    {w.certificate && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", border: "1px solid rgba(0,0,0,.12)", color: "#888", textTransform: "uppercase" }}>Certificat</span>}
                  </div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 500 }}>{w.price}</span>
                    <span className="uid-badge">{d?.uid || "—"}</span>
                  </div>
                  <div style={{ borderTop: "1px solid #E8E0D0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>{(w.tags || []).slice(0, 2).map(t => <span key={t} className="tag" style={{ cursor: "default" }}>{t}</span>)}</div>
                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      {isOwn
                        ? <button className="btn-danger" title="Supprimer" onClick={() => deleteItem(w.id, "inventory")}>🗑</button>
                        : <><button className="btn-danger" onClick={() => { setReportTarget(w); setReportType("inventory"); }}>⚑</button><button className="btn-ghost" onClick={() => openChat(d, w)}>Contacter</button></>}
                    </div>
                  </div>
                </div>
              </div>;
            })}
            {filteredInv.length === 0 && <div style={{ color: "#B0A898", gridColumn: "1/-1", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune œuvre pour l'instant — ajoutez la première !</div>}
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
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#E0D8C8", border: "1px solid #D0C8B8", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{d?.uid?.slice(-2) || "??"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div><div style={{ fontSize: 16, color: "#1a1a1a", marginBottom: 4 }}>{s.title}</div>
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
                    {s.budget && <div><span style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Budget </span><span style={{ fontSize: 14, color: "#1a1a1a" }}>{s.budget}</span></div>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>{(s.tags || []).map(t => <span key={t} className="tag" style={{ cursor: "default" }}>{t}</span>)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isOwnSearch
                        ? <button className="btn-danger" title="Supprimer" onClick={() => deleteItem(s.id, "searches")}>🗑</button>
                        : <><button className="btn-danger" onClick={() => { setReportTarget(s); setReportType("search"); }}>⚑</button><button className="btn-ghost" onClick={() => openChat(d, null, "search")}>Je peux aider</button></>}
                    </div>
                  </div>
                </div>
              </div>;
            })}
            {filteredSearches.length === 0 && <div style={{ color: "#B0A898", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune recherche active pour l'instant</div>}
          </div>
        </div>}

        {view === "match" && (() => {
          const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, " ").trim();
          const STOP = new Set(["les", "des", "une", "par", "sur", "son", "ses", "aux", "est", "que", "qui", "pas", "plus", "pour", "dans", "avec", "mais", "tout", "bien", "tres"]);
          const tokenize = s => norm(s).split(/\s+/).filter(t => t.length >= 3 && !STOP.has(t));

          const allMatches = [];
          for (const s of searches) {
            for (const w of inventory) {
              const signals = new Set();
              const sTags = (s.tags || []).map(norm).filter(Boolean);
              const wTags = (w.tags || []).map(norm).filter(Boolean);
              sTags.forEach(t => { if (wTags.includes(t)) signals.add(`#${t}`); });
              const sTokens = tokenize(s.title || "");
              const wCorpus = norm([w.title, w.artist, ...(w.tags || [])].join(" "));
              sTokens.forEach(t => { if (wCorpus.includes(t)) signals.add(t); });
              const wTokens = tokenize([w.title, w.artist].join(" "));
              const sCorpus = norm([s.title, ...(s.tags || [])].join(" "));
              wTokens.forEach(t => { if (sCorpus.includes(t)) signals.add(t); });
              if (signals.size > 0) allMatches.push({ s, w, signals: [...signals], score: signals.size });
            }
          }
          allMatches.sort((a, b) => b.score - a.score);

          return <div className="fade-up">
            <div style={styles.sectionLabel}>Matching automatique</div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 6 }}>Offres & Demandes</h1>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>{allMatches.length > 0 ? `${allMatches.length} correspondance${allMatches.length > 1 ? "s" : ""} détectée${allMatches.length > 1 ? "s" : ""}` : "Correspondances détectées entre inventaires et recherches"}</p>
            {allMatches.length === 0 && <div style={{ color: "#B0A898", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune correspondance détectée pour l'instant</div>}
            {allMatches.map(({ s, w, signals, score }, i) => (
              <div key={i} className="card fade-up" style={{ padding: 28, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2 }}>Match</div>
                  <div style={{ flex: 1, height: 1, background: "#E0D8C8" }} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {signals.map(sig => (
                      <span key={sig} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, color: sig.startsWith("#") ? "#c9a96e" : "#6eb87a", border: `1px solid ${sig.startsWith("#") ? "rgba(201,169,110,.3)" : "rgba(110,184,122,.3)"}`, padding: "2px 8px", textTransform: "uppercase" }}>{sig}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 12, alignItems: "center" }}>
                  <div style={{ background: "rgba(0,0,0,.02)", border: "1px solid #E0D8C8", padding: 16 }}>
                    <div style={{ fontSize: 9, color: "#B0A898", marginBottom: 8, textTransform: "uppercase", letterSpacing: 3 }}>Recherche</div>
                    <div style={{ fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>{s.title}</div>
                    {s.budget && <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Budget : {s.budget}</div>}
                    <span className="uid-badge">{dealer(s.dealer_id)?.uid}</span>
                  </div>
                  <div style={{ textAlign: "center", color: "#C8C0B0", fontSize: 18 }}>⟷</div>
                  <div style={{ background: "rgba(110,184,122,.04)", border: "1px solid rgba(110,184,122,.15)", padding: 16 }}>
                    <div style={{ fontSize: 9, color: "#B0A898", marginBottom: 8, textTransform: "uppercase", letterSpacing: 3 }}>Inventaire</div>
                    <div style={{ fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>{w.artist}{w.year ? `, ${w.year}` : ""}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span className="uid-badge">{dealer(w.dealer_id)?.uid}</span>{w.price && <span style={{ fontSize: 13, fontWeight: 500 }}>{w.price}</span>}</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E8E0D0", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  {dealer(s.dealer_id)?.id !== currentDealer?.id && <button className="btn-ghost" onClick={() => openChat(dealer(s.dealer_id), null, "search")}>Contacter le chercheur</button>}
                  {dealer(w.dealer_id)?.id !== currentDealer?.id && <button className="btn-gold" onClick={() => openChat(dealer(w.dealer_id), w)}>Contacter le vendeur</button>}
                </div>
              </div>
            ))}
          </div>;
        })()}

        {view === "dealers" && <div className="fade-up">
          <div style={styles.sectionLabel}>Réseau</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 32 }}>Membres Arcanum</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
            {dealers.map((d, i) => (
              <div key={d.id} className="card fade-up" style={{ padding: 28, textAlign: "center", animationDelay: `${i * 60}ms` }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#E0D8C8", border: "1px solid #D0C8B8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, margin: "0 auto 14px" }}>{d.uid?.slice(-2)}</div>
                <div style={{ marginBottom: 8 }}><span className="uid-badge">{d.uid}</span></div>
                {d.city && <div style={{ fontSize: 13, color: "#888", marginBottom: 3 }}>{d.city}</div>}
                {d.specialty && <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>{d.specialty}</div>}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
                  {d.verified && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", border: "1px solid #1a1a1a", color: "#1a1a1a", textTransform: "uppercase" }}>Vérifié</span>}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>{inventory.filter(w => w.dealer_id === d.id).length} œuvres · {searches.filter(s => s.dealer_id === d.id).length} recherches</div>
                {d.id !== currentDealer?.id ? <button className="btn-ghost" style={{ width: "100%" }} onClick={() => openChat(d)}>Message</button>
                  : <div style={{ fontSize: 11, color: "#B0A898", textTransform: "uppercase", letterSpacing: 2 }}>Vous</div>}
              </div>
            ))}
            {dealers.length === 0 && <div style={{ color: "#B0A898", gridColumn: "1/-1", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Invitez des marchands pour constituer le réseau</div>}
          </div>
        </div>}

        {view === "messages" && <div className="fade-up">
          <div style={styles.sectionLabel}>Correspondances</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 28 }}>Messages</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {dealers.filter(d => d.id !== currentDealer?.id).map(d => (
              <div key={d.id} style={{ background: CARD_BG, border: "1px solid #E0D8C8", padding: "18px 22px", cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "border-color .2s" }}
                onClick={() => openChat(d)}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#C8C0B0"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E0D8C8"}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0D8C8", border: "1px solid #D0C8B8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500 }}>{d.uid?.slice(-2)}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: 2.5, color: "#999", textTransform: "uppercase" }}>{d.uid}</span>
                  <div style={{ fontSize: 14, color: "#B0A898", marginTop: 3 }}>Cliquer pour ouvrir la conversation</div>
                </div>
              </div>
            ))}
            {dealers.filter(d => d.id !== currentDealer?.id).length === 0 && <div style={{ color: "#B0A898", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Invitez des marchands pour commencer à échanger</div>}
          </div>
        </div>}

        {view === "docs" && <div className="fade-up">
          <div style={styles.sectionLabel}>Documents juridiques</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>Contrats & Accords</h1>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 36 }}>Générez vos documents juridiques en quelques secondes grâce à l'IA</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {[{ icon: "📋", label: "Contrat de Consignment", desc: "Dépôt d'une œuvre en vue de vente." }, { icon: "🔒", label: "NDA — Confidentialité", desc: "Protégez les informations échangées." }, { icon: "🔍", label: "Mandat de Recherche", desc: "Mandatez un confrère pour trouver une pièce." }, { icon: "⏳", label: "Accord de Réservation", desc: "Réservez une œuvre avec acompte." }].map((doc, i) => (
              <div key={i} className="card fade-up" style={{ padding: 28, cursor: "pointer", animationDelay: `${i * 60}ms` }} onClick={() => setShowContracts(true)}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{doc.icon}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{doc.label}</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 18 }}>{doc.desc}</div>
                <button className="btn-gold" style={{ width: "100%" }}>Générer →</button>
              </div>
            ))}
          </div>
        </div>}

        {view === "admin" && ADMINS.includes(user?.email) && <div className="fade-up">
          <div style={styles.sectionLabel}>Administration</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>Invitations</h1>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>{invitations.filter(i => i.status === "pending").length} en attente · {invitations.filter(i => i.status === "approved").length} approuvées · {invitations.filter(i => i.status === "refused").length} refusées</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {invitations.length === 0 && <div style={{ color: "#B0A898", textAlign: "center", padding: "60px 0", fontSize: 14 }}>Aucune invitation</div>}
            {invitations.map(inv => (
              <div key={inv.id} style={{ background: CARD_BG, border: `1px solid ${inv.status === "pending" ? "#1a1a1a" : inv.status === "approved" ? "rgba(110,184,122,.2)" : "rgba(220,80,80,.15)"}`, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#1a1a1a" }}>{inv.email}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                    {inv.uid && <span className="uid-badge">{inv.uid}</span>}
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", textTransform: "uppercase", border: `1px solid ${inv.status === "pending" ? "#333" : inv.status === "approved" ? "rgba(110,184,122,.4)" : "rgba(220,80,80,.4)"}`, color: inv.status === "pending" ? "#666" : inv.status === "approved" ? "#6eb87a" : "#dc5050" }}>{inv.status || "pending"}</span>
                    {inv.created_at && <span style={{ fontSize: 11, color: "#999" }}>{new Date(inv.created_at).toLocaleDateString("fr-FR")}</span>}
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

      {chatOpen && chatTarget && <ChatPanel target={chatTarget} currentDealer={currentDealer} artwork={chatArtwork} context={chatContext} myInventory={inventory.filter(w => String(w.dealer_id) === String(currentDealer?.id))} onClose={() => { setChatOpen(false); setChatArtwork(null); setChatContext("inventory"); }} />}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} currentDealer={currentDealer} onSent={uid => toast(`Invitation envoyée · ${uid} réservé`)} />}
      {showContracts && <ContractModal onClose={() => setShowContracts(false)} />}

      {reportTarget && <div style={styles.modalBg} onClick={e => e.target === e.currentTarget && setReportTarget(null)}>
        <div style={{ ...styles.modal, maxWidth: 400 }}>
          <div style={styles.sectionLabel}>Signalement</div>
          <h2 style={{ ...styles.modalTitle, marginBottom: 8 }}>Signaler ce contenu</h2>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>« {reportTarget?.title} »</p>
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
                  <button key={v} type="button" onClick={() => setNewItem({ ...newItem, photo_visibility: v })} style={{ flex: 1, background: newItem.photo_visibility === v ? "#1a1a1a" : "none", border: "1px solid #C8C0B0", color: newItem.photo_visibility === v ? "#fff" : "#888", padding: "9px 4px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", transition: "all .15s" }}>{l}</button>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "#888", lineHeight: 1.5 }}>
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
                    <button key={l} onClick={() => setNewItem({ ...newItem, certificate: v })} style={{ flex: 1, background: newItem.certificate === v ? "#1a1a1a" : "none", border: "1px solid #C8C0B0", color: newItem.certificate === v ? "#fff" : "#888", padding: "10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
              <div onClick={() => setNewItem({ ...newItem, direct: !newItem.direct })} style={{ width: 32, height: 18, background: newItem.direct ? "rgba(0,0,0,.15)" : "rgba(0,0,0,.05)", border: `1px solid ${newItem.direct ? "#1a1a1a" : "#C8C0B0"}`, borderRadius: 9, position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 2, left: newItem.direct ? 15 : 2, width: 12, height: 12, background: newItem.direct ? "#1a1a1a" : "#C8C0B0", borderRadius: "50%", transition: "left .25s" }} />
              </div>
              <span style={{ fontSize: 9, letterSpacing: 2, color: newItem.direct ? "#1a1a1a" : "#888", textTransform: "uppercase" }}>Pièce directe</span>
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
              <div onClick={() => setNewSearch({ ...newSearch, direct: !newSearch.direct })} style={{ width: 32, height: 18, background: newSearch.direct ? "rgba(0,0,0,.15)" : "rgba(0,0,0,.05)", border: `1px solid ${newSearch.direct ? "#1a1a1a" : "#C8C0B0"}`, borderRadius: 9, position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 2, left: newSearch.direct ? 15 : 2, width: 12, height: 12, background: newSearch.direct ? "#1a1a1a" : "#C8C0B0", borderRadius: "50%", transition: "left .25s" }} />
              </div>
              <span style={{ fontSize: 9, letterSpacing: 2, color: newSearch.direct ? "#1a1a1a" : "#888", textTransform: "uppercase" }}>Recherche directe</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => setAddSearch(false)} style={styles.btnGhost}>Annuler</button>
            <button onClick={submitSearch} style={styles.btnGold}>Publier</button>
          </div>
        </div>
      </div>}

      {notif && <div style={{ position: "fixed", bottom: 28, right: 28, background: "#1a1a1a", color: "#fff", padding: "12px 22px", fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", zIndex: 300, fontWeight: 500 }}>{notif}</div>}

      {selectedWork && (() => {
        const { w, d, isOwn } = selectedWork;
        const condColor = w.condition === "Excellent" ? "#6eb87a" : w.condition === "Bon" ? "#888" : "#c9a96e";
        const condBorder = w.condition === "Excellent" ? "rgba(110,184,122,.4)" : w.condition === "Bon" ? "rgba(0,0,0,.12)" : "rgba(201,169,110,.4)";
        const statusLabel = w.status === "available" ? "Disponible" : w.status === "reserved" ? "Réservé" : "Vendu";
        const statusColor = w.status === "available" ? "#1a1a1a" : w.status === "reserved" ? "#6e8ec9" : "#dc5050";
        return (
          <div onClick={() => setSelectedWork(null)} style={{ position: "fixed", inset: "0", background: "rgba(180,170,158,0.85)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#FFFDF8", border: "1px solid #E0D8C8", width: "100%", maxWidth: 780, maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* Photo */}
              <div style={{ position: "relative", background: "#EDE8DE" }}>
                {isOwn
                  ? (w.photo_url
                      ? <WatermarkedPhoto src={w.photo_url} uid={currentDealer?.uid} />
                      : <WatermarkedImage color="#6a5545" uid={currentDealer?.uid} />)
                  : w.photo_url && w.photo_visibility === "public"
                    ? <WatermarkedPhoto src={w.photo_url} uid={d?.uid || "ARC"} />
                    : w.photo_url && w.photo_visibility === "privee"
                      ? <div style={{ width: "100%", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#B0A898" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#B0A898" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#B0A898"/></svg>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: "#B0A898", textTransform: "uppercase" }}>Photo privée</span>
                        </div>
                      : <div style={{ width: "100%", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#C8C0B0" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#C8C0B0" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#C8C0B0"/></svg>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: "#B0A898", textTransform: "uppercase" }}>Photos sur demande</span>
                        </div>}
                {w.direct && <div style={{ position: "absolute", top: 14, left: 14 }}><span className="direct-badge">Directe</span></div>}
                {isOwn && <div style={{ position: "absolute", top: 14, right: 14 }}><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "2px 8px", background: "rgba(201,169,110,.12)", border: "1px solid rgba(201,169,110,.4)", color: "#c9a96e", textTransform: "uppercase" }}>Mon œuvre</span></div>}
              </div>

              {/* Body */}
              <div style={{ padding: "32px 36px 36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: 2, color: "#1a1a1a", lineHeight: 1 }}>{w.title}</h2>
                    <div style={{ fontSize: 15, color: "#666", marginTop: 6 }}>{w.artist}{w.year ? `, ${w.year}` : ""}</div>
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: 1.5, padding: "4px 10px", border: `1px solid ${statusColor}`, color: statusColor, textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 4 }}>{statusLabel}</span>
                </div>

                <div style={{ height: 1, background: "#E0D8C8", margin: "20px 0" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px", marginBottom: 20 }}>
                  {w.medium && <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 4 }}>Technique</div><div style={{ fontSize: 14, color: "#555" }}>{w.medium}</div></div>}
                  {w.dimensions && <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 4 }}>Dimensions</div><div style={{ fontSize: 14, color: "#555" }}>{w.dimensions}</div></div>}
                  {w.weight && <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 4 }}>Poids</div><div style={{ fontSize: 14, color: "#555" }}>{w.weight}</div></div>}
                  {w.condition && <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 4 }}>État</div><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 1.5, padding: "3px 9px", border: `1px solid ${condBorder}`, color: condColor, textTransform: "uppercase" }}>{w.condition}</span></div>}
                  {w.certificate != null && <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 4 }}>Certificat d'authenticité</div><div style={{ fontSize: 14, color: "#555" }}>{w.certificate ? "Oui" : "Non"}</div></div>}
                  <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 4 }}>Marchand</div><span className="uid-badge">{d?.uid || "—"}</span></div>
                </div>

                {(w.tags || []).length > 0 && <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: 2, color: "#B0A898", textTransform: "uppercase", marginBottom: 8 }}>Tags</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{(w.tags || []).map(t => <span key={t} className="tag" style={{ cursor: "default" }}>{t}</span>)}</div>
                </div>}

                <div style={{ height: 1, background: "#E0D8C8", margin: "20px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 500, color: "#1a1a1a" }}>{w.price}</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    {!isOwn && <button className="btn-gold" onClick={() => { setSelectedWork(null); openChat(d, w); }}>Contacter</button>}
                    <button className="btn-ghost" onClick={() => setSelectedWork(null)}>Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
