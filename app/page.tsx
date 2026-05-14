"use client"; import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const GOLD = "#c9a96e";
const DARK = "#080808";
const CARD_BG = "rgba(12,12,12,0.97)";

const DEALERS = [
  { id: 1, uid: "ARC-0041", name: "Galerie Vernet", city: "Paris", avatar: "GV", specialty: "Impressionnisme", online: true, verified: true, reports: 0, direct: true },
  { id: 2, uid: "ARC-0078", name: "Maison Delacourt", city: "Lyon", avatar: "MD", specialty: "Art contemporain", online: true, verified: true, reports: 0, direct: true },
  { id: 3, uid: "ARC-0112", name: "Studio Ferrara", city: "Milan", avatar: "SF", specialty: "Sculpture moderne", online: false, verified: true, reports: 0, direct: false },
  { id: 4, uid: "ARC-0155", name: "Atelier Blanc", city: "Genève", avatar: "AB", specialty: "Photographie", online: true, verified: false, reports: 1, direct: true },
  { id: 5, uid: "ARC-0203", name: "Cabinet Rossi", city: "Rome", avatar: "CR", specialty: "Maîtres anciens", online: false, verified: true, reports: 0, direct: false },
];

const INIT_INVENTORY = [
  { id: 1, title: "Étude de Lumière IV", artist: "Marc Delacroix", year: 1923, medium: "Huile sur toile", price: "85 000 €", dealerId: 1, status: "available", direct: true, tags: ["impressionnisme", "paysage"], reports: 0, reported: false, color: "#8a7060" },
  { id: 2, title: "Composition No. 7", artist: "Elena Voss", year: 1971, medium: "Acrylique", price: "42 000 €", dealerId: 2, status: "available", direct: true, tags: ["abstrait", "contemporain"], reports: 0, reported: false, color: "#607080" },
  { id: 3, title: "La Dormeuse", artist: "André Moreau", year: 1948, medium: "Bronze patiné", price: "120 000 €", dealerId: 3, status: "reserved", direct: false, tags: ["sculpture", "figuratif"], reports: 0, reported: false, color: "#706050" },
  { id: 4, title: "Paris, 4h du matin", artist: "Sophie Klein", year: 2003, medium: "Tirage argentique", price: "8 500 €", dealerId: 4, status: "available", direct: true, tags: ["photographie", "urbain"], reports: 0, reported: false, color: "#505060" },
  { id: 5, title: "Nu au Jardin", artist: "Paul Chevalier", year: 1932, medium: "Sanguine sur papier", price: "18 000 €", dealerId: 1, status: "available", direct: true, tags: ["dessin", "figuratif"], reports: 0, reported: false, color: "#806858" },
];

const INIT_SEARCHES = [
  { id: 1, title: "Recherche Monet ou école impressionniste", dealerId: 2, period: "1890–1920", budget: "< 500 000 €", date: "Il y a 2j", urgent: true, direct: true, tags: ["impressionnisme"], reports: 0, reported: false },
  { id: 2, title: "Céramiques japonaises Edo", dealerId: 4, period: "XVIIIe siècle", budget: "< 30 000 €", date: "Il y a 5j", urgent: false, direct: true, tags: ["asiatique", "céramique"], reports: 0, reported: false },
  { id: 3, title: "Sculpture animalière XIXe", dealerId: 3, period: "1850–1900", budget: "20 000–80 000 €", date: "Il y a 1 sem", urgent: false, direct: false, tags: ["sculpture", "animalier"], reports: 0, reported: false },
];

const ME = { id: 1, uid: "ARC-0041", name: "Galerie Vernet", avatar: "GV" };

function shadeColor(hex: string, pct: number) {
  hex = hex.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + pct));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
  const b = Math.min(255, Math.max(0, (num & 0xff) + pct));
  return `rgb(${r},${g},${b})`;
}

function WatermarkedImage({ color = "#5a4535", uid = "ARC-0041" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, W - 24, H - 24);
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

const AUTO_REPLIES = [
  "Très intéressant, pouvez-vous m'en dire plus sur la provenance ?",
  "Je vais vérifier dans mon inventaire et vous reviens rapidement.",
  "Nous avons quelques pièces dans cette période. Je vous envoie les détails.",
  "Le prix est-il négociable ? Nous pourrions envisager un échange partiel.",
  "J'ai justement un client qui cherche ce type d'œuvre.",
  "La pièce est disponible. Souhaitez-vous le certificat d'authenticité ?",
  "Merci. Je transmets à mon associé spécialiste de cette période.",
];

function ChatPanel({ target, onClose, history, initialMsgs, onSend }: any) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([...initialMsgs.map((m: any) => ({ ...m, from: "them", read: true })), ...history]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachHint, setAttachHint] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const now = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`; };

  useEffect(() => {
    const t = setTimeout(() => {
      if ((window as any).__arcanum_prefill__) { setInput((window as any).__arcanum_prefill__); (window as any).__arcanum_prefill__ = null; inputRef.current?.focus(); }
    }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const send = () => {
    if (!input.trim()) return;
    const msg = { from: "Moi", text: input.trim(), time: now(), read: false };
    setMessages(m => [...m, msg]);
    onSend(msg);
    setInput("");
    setShowEmoji(false);
    if (target.online) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(m => [...m, { from: "them", text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], time: now(), read: true }]);
      }, 1400 + Math.random() * 1800);
    }
  };

  const EMOJIS = ["👍","🎨","✅","🔍","💼","🏛️","🤝","📋","⏳","🖼️"];

  return (
    <div style={{ position:"fixed", right:0, top:0, bottom:0, width:400, background:"#0a0a0a", borderLeft:"1px solid #141414", zIndex:150, display:"flex", flexDirection:"column", animation:"slideRight 0.3s ease" }}>
      <style>{`@keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}} @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .mb{animation:msgIn .25s ease both}`}</style>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #111", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"#111", border:"1px solid #1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:"#fff" }}>{target.avatar}</div>
            <div style={{ width:9, height:9, borderRadius:"50%", background:target.online?"#6eb87a":"#1a1a1a", border:"2px solid #0a0a0a", position:"absolute", bottom:0, right:0 }} />
          </div>
          <div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:2.5, color:"#bbb", textTransform:"uppercase" }}>{target.uid}</div>
            <div style={{ fontSize:11, color:target.online?"#6eb87a":"#333" }}>{target.online?"En ligne":"Hors ligne"} · {target.specialty}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => { setAttachHint(true); setTimeout(()=>setAttachHint(false),2500); }} style={{ background:"none", border:"1px solid #1a1a1a", color:"#333", cursor:"pointer", padding:"5px 8px", fontSize:13 }}>📎</button>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
      </div>
      {attachHint && <div style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid #111", padding:"8px 20px", fontSize:11, color:"#444" }}>Pièces jointes disponibles dans la version complète</div>}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px", display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 8px" }}>
          <div style={{ flex:1, height:1, background:"#111" }} />
          <span style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#1a1a1a", textTransform:"uppercase" }}>Aujourd'hui</span>
          <div style={{ flex:1, height:1, background:"#111" }} />
        </div>
        {messages.length === 0 && <div style={{ textAlign:"center", marginTop:40, color:"#1a1a1a", fontSize:13 }}>Début de la conversation</div>}
        {messages.map((msg, i) => {
          const isMe = msg.from === "Moi";
          const showTime = i === messages.length-1 || messages[i+1]?.from !== msg.from;
          return (
            <div key={i} className="mb" style={{ alignSelf:isMe?"flex-end":"flex-start", maxWidth:"78%", display:"flex", flexDirection:"column", gap:3 }}>
              <div style={{ background:isMe?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.04)", border:`1px solid ${isMe?"rgba(255,255,255,0.14)":"#141414"}`, padding:"10px 14px", borderRadius:isMe?"8px 8px 2px 8px":"8px 8px 8px 2px", fontSize:14, lineHeight:1.65, color:isMe?"#fff":"#999", wordBreak:"break-word" }}>{msg.text}</div>
              {showTime && <div style={{ display:"flex", alignItems:"center", gap:5, alignSelf:isMe?"flex-end":"flex-start" }}>
                <span style={{ fontSize:10, color:"#1a1a1a" }}>{msg.time}</span>
                {isMe && <span style={{ fontSize:10, color:msg.read?"#6eb87a":"#222" }}>{msg.read?"✓✓":"✓"}</span>}
              </div>}
            </div>
          );
        })}
        {isTyping && <div className="mb" style={{ alignSelf:"flex-start" }}>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #141414", padding:"12px 18px", borderRadius:"8px 8px 8px 2px", display:"flex", gap:5, alignItems:"center" }}>
            {[0,1,2].map(j=><div key={j} style={{ width:6, height:6, borderRadius:"50%", background:"#444", animation:`typingDot 1.2s ease ${j*.2}s infinite` }}/>)}
          </div>
          <div style={{ fontSize:10, color:"#1a1a1a", marginTop:3 }}>en train d'écrire…</div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      {showEmoji && <div style={{ padding:"10px 18px", borderTop:"1px solid #111", display:"flex", gap:4, flexWrap:"wrap", background:"#0a0a0a" }}>
        {EMOJIS.map(e=><button key={e} onClick={()=>{setInput(i=>i+e);setShowEmoji(false);inputRef.current?.focus();}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:4 }}>{e}</button>)}
      </div>}
      <div style={{ padding:"14px 16px", borderTop:"1px solid #111", background:"#0a0a0a", display:"flex", gap:8, alignItems:"flex-end" }}>
        <button onClick={()=>setShowEmoji(s=>!s)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:showEmoji?"#fff":"#2a2a2a", padding:"8px 4px", flexShrink:0, transition:"color 0.2s" }}>☺</button>
        <textarea ref={inputRef} rows={1}
          style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid #1a1a1a", color:"#fff", padding:"10px 14px", fontSize:14, outline:"none", borderRadius:4, resize:"none", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5, transition:"border-color 0.2s", maxHeight:100, overflowY:"auto" }}
          placeholder="Votre message…" value={input}
          onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
          onFocus={e=>e.target.style.borderColor="#fff"} onBlur={e=>e.target.style.borderColor="#1a1a1a"}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}/>
        <button onClick={send} style={{ background:input.trim()?"#fff":"rgba(255,255,255,0.06)", border:"none", borderRadius:4, color:input.trim()?"#080808":"#222", cursor:input.trim()?"pointer":"default", padding:"10px 14px", fontSize:14, flexShrink:0, transition:"all 0.2s", fontWeight:"bold" }}>↑</button>
      </div>
    </div>
  );
}

function ContractModal({ onClose }: any) {
  const [type, setType] = useState<string|null>(null);
  const [form, setForm] = useState({ party1:"Galerie Vernet (ARC-0041)", party2:"", artwork:"", price:"", duration:"6 mois", commission:"15", date:new Date().toLocaleDateString("fr-FR") });
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contractText, setContractText] = useState("");

  const TYPES = [
    { key:"consignment", label:"Contrat de Consignment", icon:"📋", desc:"Dépôt d'une œuvre en vue de vente" },
    { key:"nda", label:"NDA — Confidentialité", icon:"🔒", desc:"Protection des informations échangées" },
    { key:"mandate", label:"Mandat de Recherche", icon:"🔍", desc:"Mandater un marchand pour une recherche" },
    { key:"reservation", label:"Accord de Réservation", icon:"⏳", desc:"Réserver une œuvre avec acompte" },
  ];

  const generate = async () => {
    setLoading(true);
    const prompts = {
      consignment:`Génère un contrat de consignment professionnel en français entre "${form.party1}" (déposant) et "${form.party2}" (dépositaire) pour "${form.artwork}" estimée à ${form.price}. Durée: ${form.duration}. Commission: ${form.commission}%. Date: ${form.date}. Style notarial français, articles numérotés.`,
      nda:`Génère un NDA professionnel en français entre "${form.party1}" et "${form.party2}" pour des transactions sur le marché de l'art. Date: ${form.date}. Durée 3 ans. Style juridique français, articles numérotés.`,
      mandate:`Génère un mandat de recherche d'œuvre en français. Mandant: "${form.party1}". Mandataire: "${form.party2}". Recherche: "${form.artwork}". Budget: ${form.price}. Durée: ${form.duration}. Commission: ${form.commission}%. Date: ${form.date}. Style juridique français.`,
      reservation:`Génère un accord de réservation d'œuvre en français. Vendeur: "${form.party1}". Acheteur: "${form.party2}". Œuvre: "${form.artwork}" au prix de ${form.price}. Durée: ${form.duration}. Acompte: ${form.commission}%. Date: ${form.date}. Style notarial français.`,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:(prompts as any)[type as string]}] }) });
      const data = await res.json();
      setContractText(data.content?.map((b:any)=>b.text||"").join("\n") || "Erreur.");
    } catch { setContractText("Erreur lors de la génération."); }
    setGenerated(true);
    setLoading(false);
  };

  return (
    <div style={styles.modalBg} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ ...styles.modal, maxWidth:680, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div><div style={styles.sectionLabel}>Documents juridiques</div><h2 style={styles.modalTitle}>Générer un document</h2></div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        {!type && <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {TYPES.map(ct=><div key={ct.key} onClick={()=>setType(ct.key)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid #1a1a1a", padding:20, cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#fff";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#1a1a1a";}}>
            <div style={{ fontSize:24, marginBottom:10 }}>{ct.icon}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:"#fff", marginBottom:6 }}>{ct.label}</div>
            <div style={{ fontSize:13, color:"#333" }}>{ct.desc}</div>
          </div>)}
        </div>}
        {type && !generated && <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24, cursor:"pointer" }} onClick={()=>setType(null)}>
            <span style={{ color:"#444", fontSize:13 }}>← Retour</span>
            <span style={{ color:"#fff", fontSize:13 }}>{TYPES.find(c=>c.key===type)?.label}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["party1","Partie 1"],["party2","Partie 2 (UID ou nom)"],["artwork","Œuvre / objet"],["price","Prix / budget"],["duration","Durée"],["commission","Commission %"]].map(([k,ph])=>(
              <div key={k}><div style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#333", marginBottom:6, textTransform:"uppercase" }}>{ph}</div>
              <input className="inp" style={styles.input} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
          </div>
          <button onClick={generate} style={{ ...styles.btnGold, width:"100%", marginTop:24, padding:"14px" }} disabled={loading}>{loading?"Génération en cours…":"Générer le document"}</button>
        </div>}
        {generated && <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#fff", letterSpacing:2, textTransform:"uppercase" }}>Document généré</span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>navigator.clipboard.writeText(contractText)} style={styles.btnGhost}>Copier</button>
              <button onClick={()=>{setGenerated(false);setContractText("");}} style={styles.btnGhost}>Nouveau</button>
            </div>
          </div>
          <div style={{ background:"#0a0a0a", border:"1px solid #1a1a1a", padding:24, fontSize:13, lineHeight:1.8, color:"#888", whiteSpace:"pre-wrap", maxHeight:400, overflowY:"auto", fontFamily:"Georgia,serif" }}>{contractText}</div>
          <div style={{ marginTop:12, padding:"10px 16px", background:"rgba(255,255,255,0.02)", border:"1px solid #111" }}><span style={{ fontSize:11, color:"#333" }}>⚠️ Document indicatif. Faites valider par un juriste avant signature.</span></div>
        </div>}
      </div>
    </div>
  );
}

function ReportModal({ target, onClose, onConfirm }: any) {
  const [reason, setReason] = useState("");
  const reasons = ["Prix manifestement erroné","Œuvre introuvable / inexistante","Informations trompeuses","Doublon","Contenu inapproprié","Autre"];
  return (
    <div style={styles.modalBg} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ ...styles.modal, maxWidth:400 }}>
        <div style={styles.sectionLabel}>Signalement</div>
        <h2 style={{ ...styles.modalTitle, marginBottom:8 }}>Signaler ce contenu</h2>
        <p style={{ fontSize:13, color:"#333", marginBottom:24 }}>« {target?.title} »</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {reasons.map(r=><label key={r} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", border:`1px solid ${reason===r?"#fff":"#111"}`, transition:"all 0.2s", background:reason===r?"rgba(255,255,255,0.04)":"transparent" }}>
            <input type="radio" name="reason" value={r} checked={reason===r} onChange={()=>setReason(r)} style={{ accentColor:"#fff" }}/>
            <span style={{ fontSize:14, color:reason===r?"#fff":"#444" }}>{r}</span>
          </label>)}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={styles.btnGhost}>Annuler</button>
          <button onClick={()=>reason&&onConfirm(reason)} style={{ ...styles.btnGold, opacity:reason?1:0.4 }}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose, onSent }: any) {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [uid] = useState(`ARC-${String(Math.floor(Math.random()*900)+100).padStart(4,"0")}`);
  const send = () => { if(!email.trim()) return; setSent(true); setTimeout(()=>{onSent(uid);onClose();},1800); };
  return (
    <div style={styles.modalBg} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ ...styles.modal, maxWidth:460 }}>
        <div style={styles.sectionLabel}>Invitation privée</div>
        <h2 style={{ ...styles.modalTitle, marginBottom:8 }}>Inviter un marchand</h2>
        <p style={{ fontSize:13, color:"#333", marginBottom:24 }}>Arcanum est un réseau sur invitation uniquement. Chaque membre est garant de ses invités.</p>
        {!sent ? <>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid #1a1a1a", padding:"14px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#333", marginBottom:6, textTransform:"uppercase" }}>Numéro attribué</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"#fff", letterSpacing:4 }}>{uid}</div></div>
            <div style={{ fontSize:11, color:"#333", maxWidth:180, textAlign:"right" }}>Ce numéro sera l'identité anonyme du marchand sur le réseau</div>
          </div>
          <div style={{ marginBottom:12 }}><div style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#333", marginBottom:6, textTransform:"uppercase" }}>Adresse e-mail</div><input style={styles.input} value={email} onChange={e=>setEmail(e.target.value)} placeholder="marchand@galerie.com"/></div>
          <div style={{ marginBottom:20 }}><div style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#333", marginBottom:6, textTransform:"uppercase" }}>Message (optionnel)</div><textarea style={{ ...styles.input, resize:"vertical", minHeight:80 }} value={note} onChange={e=>setNote(e.target.value)} placeholder="Je vous invite à rejoindre Arcanum…"/></div>
          <div style={{ display:"flex", gap:10 }}><button onClick={onClose} style={styles.btnGhost}>Annuler</button><button onClick={send} style={styles.btnGold}>Envoyer l'invitation</button></div>
        </> : <div style={{ textAlign:"center", padding:"32px 0" }}>
          <div style={{ fontSize:32, color:"#fff", marginBottom:12, opacity:0.2 }}>○</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:3, color:"#fff", marginBottom:8 }}>Invitation envoyée</div>
          <div style={{ fontSize:13, color:"#333" }}>Identifiant {uid} réservé</div>
        </div>}
      </div>
    </div>
  );
}

const styles = {
  modalBg:{ position:"fixed" as const, inset:"0", background:"rgba(0,0,0,0.88)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" },
  modal:{ background:"#0c0c0c", border:"1px solid #1a1a1a", padding:"36px", width:"90%", borderRadius:0 },
  modalTitle:{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, fontWeight:400, letterSpacing:3, color:"#fff", marginBottom:24 },
  sectionLabel:{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:4, color:"#2a2a2a", marginBottom:10, textTransform:"uppercase" },
  closeBtn:{ background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:18, lineHeight:1 },
  input:{ background:"#0f0f0f", border:"1px solid #1a1a1a", color:"#fff", padding:"10px 14px", fontSize:14, width:"100%", outline:"none", borderRadius:0, fontFamily:"'DM Sans',sans-serif" },
  btnGold:{ background:"#fff", border:"1px solid #fff", color:"#080808", padding:"9px 22px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:10, letterSpacing:2, textTransform:"uppercase", borderRadius:0, transition:"all 0.2s" },
  btnGhost:{ background:"none", border:"1px solid #1a1a1a", color:"#444", padding:"9px 18px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:10, letterSpacing:1.5, textTransform:"uppercase", borderRadius:0, transition:"all 0.2s" },
};

function Arcanum() {
  const [view, setView] = useState("feed");
  const [inventory, setInventory] = useState(INIT_INVENTORY);
  const [searches, setSearches] = useState(INIT_SEARCHES);
  const [directOnly, setDirectOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string|null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<Record<number,any[]>>({});
  const [showInvite, setShowInvite] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [reportTarget, setReportTarget] = useState<any>(null);
  const [reportType, setReportType] = useState<string|null>(null);
  const [addItem, setAddItem] = useState(false);
  const [addSearch, setAddSearch] = useState(false);
  const [notif, setNotif] = useState<string|null>(null);
  const [newItem, setNewItem] = useState({ title:"", artist:"", year:"", medium:"", price:"", tags:"", direct:true });
  const [newSearch, setNewSearch] = useState({ title:"", period:"", budget:"", tags:"", direct:true });
  const [invitedUids, setInvitedUids] = useState<string[]>([]);

  const toast = (msg: string) => { setNotif(msg); setTimeout(()=>setNotif(null),3200); };
  const dealer = (id: number) => DEALERS.find(d=>d.id===id);
  const allTags = [...new Set(inventory.flatMap(w=>w.tags))];

  const filteredInv = inventory.filter(w => {
    if (w.reports >= 3) return false;
    if (directOnly && !w.direct) return false;
    if (searchTerm && !w.title.toLowerCase().includes(searchTerm.toLowerCase()) && !w.artist.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterTag && !w.tags.includes(filterTag)) return false;
    return true;
  });
  const filteredSearches = searches.filter(s => s.reports < 3 && (!directOnly || s.direct));

  const MOCK_MSGS = [
    { fromId:2, text:"Avez-vous des nouvelles du Modigliani ?", time:"10:32", read:false },
    { fromId:3, text:"Je peux vous proposer un Maillol.", time:"Hier", read:true },
  ];
  const unread = MOCK_MSGS.filter(m=>!m.read).length;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:DARK, minHeight:"100vh", color:"#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:#111;}
        input,textarea,select{font-family:'DM Sans',sans-serif!important;}
        .nav-btn{background:none;border:none;color:#2a2a2a;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:400;letter-spacing:1.5px;padding:10px 14px;transition:color .2s;position:relative;text-transform:uppercase;}
        .nav-btn:hover{color:#fff;} .nav-btn.active{color:#fff;}
        .nav-btn.active::after{content:'';position:absolute;bottom:-1px;left:14px;right:14px;height:1px;background:#fff;}
        .card{background:${CARD_BG};border:1px solid #111;transition:border-color .2s,box-shadow .2s;}
        .card:hover{border-color:#1a1a1a;box-shadow:0 2px 20px rgba(0,0,0,.6);}
        .btn-gold{background:#fff;border:1px solid #fff;color:#080808;padding:9px 20px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;transition:all .2s;text-transform:uppercase;}
        .btn-gold:hover{background:transparent;color:#fff;}
        .btn-ghost{background:none;border:1px solid #111;color:#333;padding:7px 14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:1.5px;transition:all .2s;text-transform:uppercase;}
        .btn-ghost:hover{border-color:#fff;color:#fff;}
        .btn-danger{background:none;border:1px solid rgba(220,80,80,.2);color:rgba(220,80,80,.5);padding:5px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:1px;transition:all .2s;text-transform:uppercase;}
        .btn-danger:hover{border-color:rgba(220,80,80,.8);color:rgb(220,80,80);}
        .inp{background:#0f0f0f;border:1px solid #111;color:#fff;padding:10px 14px;font-size:14px;width:100%;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#fff;}
        .tag{display:inline-block;background:rgba(255,255,255,.03);border:1px solid #111;color:#444;padding:2px 10px;font-size:10px;font-family:'DM Sans',sans-serif;letter-spacing:1.5px;margin:2px;cursor:pointer;transition:all .2s;text-transform:uppercase;}
        .tag:hover,.tag.active{background:rgba(255,255,255,.08);color:#fff;border-color:#333;}
        .uid-badge{font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:2.5px;color:#2a2a2a;background:rgba(255,255,255,.02);border:1px solid #111;padding:2px 8px;text-transform:uppercase;}
        .direct-badge{font-family:'DM Sans',sans-serif;font-size:8px;letter-spacing:1.5px;color:#6eb87a;background:rgba(110,184,122,.05);border:1px solid rgba(110,184,122,.2);padding:2px 8px;text-transform:uppercase;}
        .reported-badge{font-family:'DM Sans',sans-serif;font-size:8px;letter-spacing:1.5px;color:#dc5050;border:1px solid rgba(220,80,80,.3);padding:2px 8px;text-transform:uppercase;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .35s ease both;}
        @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
      `}</style>

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,8,8,0.98)", backdropFilter:"blur(20px)", borderBottom:"1px solid #0f0f0f" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <svg width="180" height="52" viewBox="0 0 180 52" fill="none">
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
              <path d="M115 8 C116 7 117 7.5 116 9" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.35"/>
            </svg>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:7.5, letterSpacing:3, color:"#1a1a1a", textTransform:"uppercase", paddingLeft:2 }}>Réseau Privé · {ME.uid}</div>
          </div>

          <nav style={{ display:"flex" }}>
            {[["feed","Inventaires"],["searches","Recherches"],["match","Matching"],["dealers","Marchands"],["messages","Messages"],["docs","Documents"]].map(([k,l])=>(
              <button key={k} className={`nav-btn ${view===k?"active":""}`} onClick={()=>setView(k)}>
                {l}{k==="messages"&&unread>0&&<span style={{ marginLeft:5, background:"#fff", color:"#080808", borderRadius:"50%", width:13, height:13, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:7, fontWeight:600, verticalAlign:"middle" }}>{unread}</span>}
              </button>
            ))}
          </nav>

          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button className="btn-ghost" onClick={()=>setShowContracts(true)}>Contrats</button>
            <button className="btn-gold" onClick={()=>setShowInvite(true)}>+ Inviter</button>
          </div>
        </div>
      </header>

      {/* DIRECT TOGGLE */}
      <div style={{ background:"#060606", borderBottom:"1px solid #0a0a0a", padding:"9px 32px", position:"sticky", top:60, zIndex:90 }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", gap:16, alignItems:"center" }}>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none" }}>
            <div onClick={()=>setDirectOnly(!directOnly)} style={{ width:34, height:18, background:directOnly?"rgba(255,255,255,.15)":"rgba(255,255,255,.04)", border:`1px solid ${directOnly?"#fff":"#111"}`, borderRadius:9, position:"relative", transition:"all .25s", cursor:"pointer" }}>
              <div style={{ position:"absolute", top:2, left:directOnly?17:2, width:12, height:12, background:directOnly?"#fff":"#1a1a1a", borderRadius:"50%", transition:"left .25s" }}/>
            </div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:2.5, color:directOnly?"#fff":"#222", textTransform:"uppercase" }}>Pièces directes uniquement</span>
          </label>
          <div style={{ width:1, height:14, background:"#0f0f0f" }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#1a1a1a" }}>Détenues en propre par le marchand ou par ses clients directs</span>
        </div>
      </div>

      <main style={{ maxWidth:1280, margin:"0 auto", padding:"36px 32px" }}>

        {/* FEED */}
        {view==="feed" && <div className="fade-up">
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
            <div><div style={styles.sectionLabel}>Inventaires partagés</div><h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff" }}>{filteredInv.length} œuvre{filteredInv.length>1?"s":""}</h1></div>
            <button className="btn-gold" onClick={()=>setAddItem(true)}>+ Ajouter une œuvre</button>
          </div>
          <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
            <input className="inp" style={{ maxWidth:280 }} placeholder="Artiste, titre…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              <span className={`tag ${!filterTag?"active":""}`} onClick={()=>setFilterTag(null)}>Tout</span>
              {allTags.map(t=><span key={t} className={`tag ${filterTag===t?"active":""}`} onClick={()=>setFilterTag(filterTag===t?null:t)}>{t}</span>)}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:18 }}>
            {filteredInv.map((w,i)=>{
              const d=dealer(w.dealerId); const isOwn=w.dealerId===ME.id;
              return <div key={w.id} className="card fade-up" style={{ animationDelay:`${i*60}ms` }}>
                <div style={{ position:"relative", overflow:"hidden" }}>
                  {isOwn ? <WatermarkedImage color={w.color} uid={ME.uid}/> :
                    <div style={{ width:"100%", aspectRatio:"4/3", background:"#0e0e0e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, position:"relative" }}>
                      <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${w.color}14,#0e0e0e)` }}/>
                      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="11" width="20" height="14" rx="1" stroke="#1a1a1a" strokeWidth="1.2"/><path d="M9 11V8a5 5 0 0110 0v3" stroke="#1a1a1a" strokeWidth="1.2"/><circle cx="14" cy="18" r="2" fill="#1a1a1a"/></svg>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:3, color:"#1a1a1a", textTransform:"uppercase" }}>Photos sur demande</span>
                        <button onClick={()=>{setChatTarget(d);setChatOpen(true);setTimeout(()=>{(window as any).__arcanum_prefill__=`Bonjour, je souhaite accéder aux photos de « ${w.title} » (${w.artist}, ${w.year}). Pouvez-vous me les transmettre ?`;},100);}}
                          style={{ marginTop:4, background:"none", border:"1px solid #111", color:"#2a2a2a", padding:"6px 16px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:2, textTransform:"uppercase", transition:"all .2s" }}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor="#fff";e.currentTarget.style.color="#fff";}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor="#111";e.currentTarget.style.color="#2a2a2a";}}>Demander l'accès</button>
                      </div>
                    </div>
                  }
                  {w.direct&&<div style={{ position:"absolute", top:10, left:10 }}><span className="direct-badge">Directe</span></div>}
                  {w.reported&&<div style={{ position:"absolute", top:10, right:10 }}><span className="reported-badge">Signalé ({w.reports})</span></div>}
                </div>
                <div style={{ padding:"18px 20px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <div><div style={{ fontSize:16, color:"#ccc", fontWeight:400 }}>{w.title}</div><div style={{ fontSize:13, color:"#333", marginTop:2 }}>{w.artist}, {w.year}</div></div>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:1.5, padding:"3px 7px", border:`1px solid ${w.status==="available"?"#fff":w.status==="reserved"?"#6e8ec9":"#dc5050"}`, color:w.status==="available"?"#fff":w.status==="reserved"?"#6e8ec9":"#dc5050", height:"fit-content", whiteSpace:"nowrap", textTransform:"uppercase" }}>
                      {w.status==="available"?"Disponible":w.status==="reserved"?"Réservé":"Vendu"}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:"#1a1a1a", marginBottom:10 }}>{w.medium}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:500, color:"#fff" }}>{w.price}</span>
                    <span className="uid-badge">{d?.uid||"—"}</span>
                  </div>
                  <div style={{ borderTop:"1px solid #0a0a0a", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>{w.tags.slice(0,2).map(t=><span key={t} className="tag" style={{ cursor:"default" }}>{t}</span>)}</div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn-danger" onClick={()=>{setReportTarget(w);setReportType("inventory");}}>⚑</button>
                      <button className="btn-ghost" onClick={()=>{setChatTarget(d);setChatOpen(true);}}>Contacter</button>
                    </div>
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* SEARCHES */}
        {view==="searches" && <div className="fade-up">
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:28 }}>
            <div><div style={styles.sectionLabel}>Recherches actives</div><h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff" }}>Ce que le réseau cherche</h1></div>
            <button className="btn-gold" onClick={()=>setAddSearch(true)}>+ Publier une recherche</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {filteredSearches.map((s,i)=>{
              const d=dealer(s.dealerId);
              return <div key={s.id} className="card fade-up" style={{ padding:"22px 26px", animationDelay:`${i*60}ms`, display:"flex", gap:22, alignItems:"flex-start" }}>
                <div style={{ width:42, height:42, borderRadius:"50%", background:"#111", border:"1px solid #111", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:"#fff", flexShrink:0 }}>{d?.avatar||"??"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div><div style={{ fontSize:16, color:"#ccc", marginBottom:4 }}>{s.title}</div><div style={{ fontSize:11, color:"#1a1a1a" }}><span className="uid-badge">{d?.uid||"—"}</span> · {s.date}</div></div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      {s.direct&&<span className="direct-badge">Directe</span>}
                      {s.urgent&&<span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:1.5, padding:"2px 8px", border:"1px solid rgba(220,80,80,.5)", color:"#dc5050", textTransform:"uppercase" }}>Urgent</span>}
                      {s.reported&&<span className="reported-badge">Signalé ({s.reports})</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:28, marginBottom:12 }}>
                    {s.period&&<div><span style={{ fontSize:9, color:"#1a1a1a", fontFamily:"'DM Sans',sans-serif", letterSpacing:2, textTransform:"uppercase" }}>Période </span><span style={{ fontSize:14, color:"#666" }}>{s.period}</span></div>}
                    {s.budget&&<div><span style={{ fontSize:9, color:"#1a1a1a", fontFamily:"'DM Sans',sans-serif", letterSpacing:2, textTransform:"uppercase" }}>Budget </span><span style={{ fontSize:14, color:"#fff" }}>{s.budget}</span></div>}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>{s.tags.map(t=><span key={t} className="tag" style={{ cursor:"default" }}>{t}</span>)}</div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn-danger" onClick={()=>{setReportTarget(s);setReportType("search");}}>⚑ Signaler</button>
                      <button className="btn-ghost" onClick={()=>{setChatTarget(d);setChatOpen(true);}}>Je peux aider</button>
                    </div>
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* MATCHING */}
        {view==="match" && <div className="fade-up">
          <div style={styles.sectionLabel}>Matching automatique</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff", marginBottom:6 }}>Offres & Demandes</h1>
          <p style={{ color:"#1a1a1a", fontSize:14, marginBottom:32 }}>Correspondances détectées entre inventaires et recherches</p>
          {[{score:94,s:searches[0],w:inventory[0],reason:"Même période impressionniste, budget compatible"},{score:76,s:searches[2],w:inventory[2],reason:"Sculpture XIXe — catégorie et période correspondantes"}].map((m,i)=>(
            <div key={i} className="card fade-up" style={{ padding:28, marginBottom:16, animationDelay:`${i*80}ms` }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:"#fff" }}>{m.score}%</div>
                <div style={{ flex:1, height:1, background:`linear-gradient(to right,#fff ${m.score}%,#0f0f0f ${m.score}%)` }}/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:2, color:"#6eb87a", border:"1px solid rgba(110,184,122,.3)", padding:"3px 10px", textTransform:"uppercase" }}>Correspondance</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 32px 1fr", gap:12, alignItems:"center" }}>
                <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid #111", padding:16 }}>
                  <div style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#1a1a1a", marginBottom:8, textTransform:"uppercase" }}>Recherche</div>
                  <div style={{ fontSize:15, color:"#bbb", marginBottom:6 }}>{m.s.title}</div>
                  <span className="uid-badge">{dealer(m.s.dealerId)?.uid}</span>
                </div>
                <div style={{ textAlign:"center", color:"#111", fontSize:16 }}>⟷</div>
                <div style={{ background:"rgba(110,184,122,.03)", border:"1px solid rgba(110,184,122,.1)", padding:16 }}>
                  <div style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#1a1a1a", marginBottom:8, textTransform:"uppercase" }}>Inventaire</div>
                  <div style={{ fontSize:15, color:"#bbb", marginBottom:6 }}>{m.w.title} — {m.w.artist}</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}><span className="uid-badge">{dealer(m.w.dealerId)?.uid}</span><span style={{ fontSize:13, color:"#fff", fontWeight:500 }}>{m.w.price}</span></div>
                </div>
              </div>
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #0a0a0a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#2a2a2a" }}>{m.reason}</span>
                <div style={{ display:"flex", gap:8 }}><button className="btn-ghost">Ignorer</button><button className="btn-gold" onClick={()=>{setChatTarget(dealer(m.s.dealerId));setChatOpen(true);}}>Mettre en contact</button></div>
              </div>
            </div>
          ))}
        </div>}

        {/* DEALERS */}
        {view==="dealers" && <div className="fade-up">
          <div style={styles.sectionLabel}>Réseau</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff", marginBottom:32 }}>Membres Arcanum</h1>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:16 }}>
            {DEALERS.map((d,i)=>(
              <div key={d.id} className="card fade-up" style={{ padding:28, textAlign:"center", animationDelay:`${i*60}ms` }}>
                <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:"#111", border:"1px solid #111", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:"#fff", letterSpacing:1 }}>{d.avatar}</div>
                  {d.online&&<div style={{ width:9, height:9, borderRadius:"50%", background:"#6eb87a", border:"2px solid #080808", position:"absolute", bottom:0, right:0 }}/>}
                </div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, letterSpacing:2, color:"#444", marginBottom:6, textTransform:"uppercase" }}>{d.id===ME.id?"Vous":"Marchand"}</div>
                <div style={{ marginBottom:8 }}><span className="uid-badge">{d.uid}</span></div>
                <div style={{ fontSize:13, color:"#222", marginBottom:3 }}>{d.city}</div>
                <div style={{ fontSize:13, color:"#444", marginBottom:14 }}>{d.specialty}</div>
                <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14, flexWrap:"wrap" }}>
                  {d.verified&&<span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:1.5, padding:"2px 8px", border:"1px solid #fff", color:"#fff", textTransform:"uppercase" }}>Vérifié</span>}
                  {d.direct&&<span className="direct-badge">Directe</span>}
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:1.5, padding:"2px 8px", border:`1px solid ${d.online?"rgba(110,184,122,.4)":"#0f0f0f"}`, color:d.online?"#6eb87a":"#0f0f0f", textTransform:"uppercase" }}>{d.online?"En ligne":"Hors ligne"}</span>
                </div>
                <div style={{ fontSize:12, color:"#111", marginBottom:14 }}>{inventory.filter(w=>w.dealerId===d.id).length} œuvres · {searches.filter(s=>s.dealerId===d.id).length} recherches</div>
                {d.id!==ME.id&&<button className="btn-ghost" style={{ width:"100%" }} onClick={()=>{setChatTarget(d);setChatOpen(true);}}>Message</button>}
              </div>
            ))}
            {invitedUids.map(uid=>(
              <div key={uid} className="card" style={{ padding:28, textAlign:"center", borderStyle:"dashed", borderColor:"#0f0f0f" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", border:"1px dashed #111", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:"#111", fontSize:20 }}>?</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:3, color:"#111", marginBottom:8, textTransform:"uppercase" }}>En attente</div>
                <span className="uid-badge">{uid}</span>
                <div style={{ fontSize:12, color:"#111", marginTop:10 }}>Invitation envoyée</div>
              </div>
            ))}
          </div>
        </div>}

        {/* MESSAGES */}
        {view==="messages" && <div className="fade-up">
          <div style={styles.sectionLabel}>Correspondances</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff", marginBottom:28 }}>Messages</h1>
          <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
            {DEALERS.filter(d=>d.id!==ME.id).map(d=>{
              const msgs=[...MOCK_MSGS.filter(m=>m.fromId===d.id),...(chatHistory[d.id]||[])];
              const last=msgs[msgs.length-1];
              const hasUnread=MOCK_MSGS.filter(m=>m.fromId===d.id&&!m.read).length>0;
              return <div key={d.id} style={{ background:CARD_BG, border:"1px solid #0f0f0f", padding:"18px 22px", cursor:"pointer", display:"flex", gap:16, alignItems:"center", transition:"border-color .2s" }}
                onClick={()=>{setChatTarget(d);setChatOpen(true);}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#111"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#0f0f0f"}>
                <div style={{ position:"relative" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"#111", border:"1px solid #111", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:"#fff" }}>{d.avatar}</div>
                  {d.online&&<div style={{ width:8, height:8, borderRadius:"50%", background:"#6eb87a", border:"2px solid #080808", position:"absolute", bottom:0, right:0 }}/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:2.5, color:"#999", textTransform:"uppercase" }}>{d.uid}</span>
                    <span style={{ fontSize:11, color:"#1a1a1a" }}>{last?.time||"—"}</span>
                  </div>
                  <div style={{ fontSize:14, color:"#222", marginTop:3 }}>{last?.text?.substring(0,55)||"Aucun message"}…</div>
                </div>
                {hasUnread&&<div style={{ width:7, height:7, borderRadius:"50%", background:"#fff", flexShrink:0 }}/>}
              </div>;
            })}
          </div>
        </div>}

        {/* DOCS */}
        {view==="docs" && <div className="fade-up">
          <div style={styles.sectionLabel}>Documents juridiques</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:3, color:"#fff", marginBottom:8 }}>Contrats & Accords</h1>
          <p style={{ color:"#1a1a1a", fontSize:14, marginBottom:36 }}>Générez vos documents juridiques en quelques secondes grâce à l'IA</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
            {[{icon:"📋",label:"Contrat de Consignment",desc:"Dépôt d'une œuvre en vue de vente — commissions, durée, obligations."},{icon:"🔒",label:"NDA — Confidentialité",desc:"Protégez les informations échangées lors de vos négociations."},{icon:"🔍",label:"Mandat de Recherche",desc:"Mandatez un confrère pour trouver une pièce spécifique."},{icon:"⏳",label:"Accord de Réservation",desc:"Réservez une œuvre avec acompte et délai de levée d'option."}].map((doc,i)=>(
              <div key={i} className="card fade-up" style={{ padding:28, cursor:"pointer", animationDelay:`${i*60}ms` }} onClick={()=>setShowContracts(true)}>
                <div style={{ fontSize:28, marginBottom:16 }}>{doc.icon}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:"#fff", marginBottom:8 }}>{doc.label}</div>
                <div style={{ fontSize:13, color:"#222", lineHeight:1.6, marginBottom:18 }}>{doc.desc}</div>
                <button className="btn-gold" style={{ width:"100%" }}>Générer →</button>
              </div>
            ))}
          </div>
        </div>}
      </main>

      {chatOpen&&chatTarget&&<ChatPanel target={chatTarget} onClose={()=>setChatOpen(false)} history={chatHistory[chatTarget.id]||[]} initialMsgs={MOCK_MSGS.filter(m=>m.fromId===chatTarget.id)} onSend={(msg:any)=>{const k=chatTarget.id;setChatHistory(h=>({...h,[k]:[...(h[k]||[]),msg]}));}}/>}
      {showInvite&&<InviteModal onClose={()=>setShowInvite(false)} onSent={(uid:string)=>{setInvitedUids(u=>[...u,uid]);toast(`Invitation envoyée · ${uid} réservé`);}}/>}
      {showContracts&&<ContractModal onClose={()=>setShowContracts(false)}/>}
      {reportTarget&&<ReportModal target={reportTarget} onClose={()=>setReportTarget(null)} onConfirm={(reason:string)=>{if(reportType==="inventory")setInventory(inv=>inv.map(i=>i.id===reportTarget.id?{...i,reports:i.reports+1,reported:true}:i));else setSearches(s=>s.map(i=>i.id===reportTarget.id?{...i,reports:i.reports+1,reported:true}:i));setReportTarget(null);toast("Signalement envoyé");}}/>}

      {addItem&&<div style={styles.modalBg} onClick={e=>e.target===e.currentTarget&&setAddItem(false)}>
        <div style={{ ...styles.modal, maxWidth:480 }}>
          <div style={styles.sectionLabel}>Inventaire</div>
          <h2 style={styles.modalTitle}>Ajouter une œuvre</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["title","Titre *"],["artist","Artiste *"],["year","Année"],["medium","Technique / support"],["price","Prix"],["tags","Tags (séparés par virgule)"]].map(([k,ph])=><input key={k} className="inp" placeholder={ph} value={(newItem as any)[k]} onChange={e=>setNewItem({...newItem,[k]:e.target.value})}/>)}
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 0" }}>
              <div onClick={()=>setNewItem({...newItem,direct:!newItem.direct})} style={{ width:32, height:18, background:newItem.direct?"rgba(255,255,255,.15)":"rgba(255,255,255,.04)", border:`1px solid ${newItem.direct?"#fff":"#111"}`, borderRadius:9, position:"relative", cursor:"pointer", transition:"all .25s" }}>
                <div style={{ position:"absolute", top:2, left:newItem.direct?15:2, width:12, height:12, background:newItem.direct?"#fff":"#1a1a1a", borderRadius:"50%", transition:"left .25s" }}/>
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:2, color:newItem.direct?"#fff":"#222", textTransform:"uppercase" }}>Pièce directe</span>
            </label>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={()=>setAddItem(false)} style={styles.btnGhost}>Annuler</button>
            <button onClick={()=>{if(!newItem.title||!newItem.artist)return;setInventory(inv=>[{...newItem,id:Date.now(),dealerId:1,status:"available",tags:newItem.tags.split(",").map(t=>t.trim()).filter(Boolean),year:parseInt(newItem.year)||2024,reports:0,reported:false,color:"#6a5545"},...inv]);setNewItem({title:"",artist:"",year:"",medium:"",price:"",tags:"",direct:true});setAddItem(false);toast("Œuvre ajoutée");}} style={styles.btnGold}>Publier</button>
          </div>
        </div>
      </div>}

      {addSearch&&<div style={styles.modalBg} onClick={e=>e.target===e.currentTarget&&setAddSearch(false)}>
        <div style={{ ...styles.modal, maxWidth:480 }}>
          <div style={styles.sectionLabel}>Recherche</div>
          <h2 style={styles.modalTitle}>Publier une recherche</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["title","Description *"],["period","Période"],["budget","Budget"],["tags","Tags (séparés par virgule)"]].map(([k,ph])=><input key={k} className="inp" placeholder={ph} value={(newSearch as any)[k]} onChange={e=>setNewSearch({...newSearch,[k]:e.target.value})}/>)}
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 0" }}>
              <div onClick={()=>setNewSearch({...newSearch,direct:!newSearch.direct})} style={{ width:32, height:18, background:newSearch.direct?"rgba(255,255,255,.15)":"rgba(255,255,255,.04)", border:`1px solid ${newSearch.direct?"#fff":"#111"}`, borderRadius:9, position:"relative", cursor:"pointer", transition:"all .25s" }}>
                <div style={{ position:"absolute", top:2, left:newSearch.direct?15:2, width:12, height:12, background:newSearch.direct?"#fff":"#1a1a1a", borderRadius:"50%", transition:"left .25s" }}/>
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:2, color:newSearch.direct?"#fff":"#222", textTransform:"uppercase" }}>Recherche directe</span>
            </label>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={()=>setAddSearch(false)} style={styles.btnGhost}>Annuler</button>
            <button onClick={()=>{if(!newSearch.title)return;setSearches(s=>[{...newSearch,id:Date.now(),dealerId:1,date:"À l'instant",urgent:false,tags:newSearch.tags.split(",").map(t=>t.trim()).filter(Boolean),reports:0,reported:false},...s]);setNewSearch({title:"",period:"",budget:"",tags:"",direct:true});setAddSearch(false);toast("Recherche publiée");}} style={styles.btnGold}>Publier</button>
          </div>
        </div>
      </div>}

      {notif&&<div style={{ position:"fixed", bottom:28, right:28, background:"#fff", color:"#080808", padding:"12px 22px", fontFamily:"'DM Sans',sans-serif", fontSize:10, letterSpacing:2, textTransform:"uppercase", zIndex:300, animation:"fadeUp .3s ease", fontWeight:500 }}>{notif}</div>}
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [authView, setAuthView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignup = async () => {
    if (!email.trim() || !password) return;
    setAuthLoading(true);
    setAuthError("");
    const { data, error } = await supabase
      .from("invitations")
      .select("email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (error || !data) {
      setAuthError("Cette adresse n'est pas sur la liste d'invitations. Arcanum est un réseau fermé sur invitation uniquement.");
      setAuthLoading(false);
      return;
    }
    const { error: signupError } = await supabase.auth.signUp({ email, password });
    if (signupError) setAuthError(signupError.message);
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("Identifiants incorrects.");
    setAuthLoading(false);
  };

  if (checking) return (
    <div style={{ background:"#080808", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:4, color:"#111", textTransform:"uppercase" }}>Vérification…</div>
    </div>
  );

  if (session) return <Arcanum />;

  return (
    <div style={{ background:"#080808", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500&family=Bebas+Neue&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input::placeholder{color:#222;}`}</style>
      <div style={{ background:"rgba(12,12,12,0.97)", border:"1px solid #1a1a1a", padding:"52px 48px", width:"90%", maxWidth:420 }}>
        <div style={{ marginBottom:40, textAlign:"center" }}>
          <svg width="140" height="40" viewBox="0 0 180 52" fill="none" style={{ marginBottom:14 }}>
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
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:4, color:"#1a1a1a", textTransform:"uppercase" }}>Réseau Privé</div>
        </div>

        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:8, letterSpacing:4, color:"#2a2a2a", textTransform:"uppercase", marginBottom:8 }}>
          {authView==="login" ? "Connexion" : "Créer un accès"}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:3, color:"#fff", marginBottom:28 }}>
          {authView==="login" ? "Accès membres" : "Inscription"}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          <div>
            <div style={{ fontSize:8, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#333", marginBottom:6, textTransform:"uppercase" }}>Adresse e-mail</div>
            <input
              style={{ background:"#0f0f0f", border:"1px solid #1a1a1a", color:"#fff", padding:"11px 14px", fontSize:14, width:"100%", outline:"none", borderRadius:0, fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s" }}
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              onFocus={e=>e.target.style.borderColor="#fff"} onBlur={e=>e.target.style.borderColor="#1a1a1a"}
              placeholder="marchand@galerie.com"
              onKeyDown={e=>e.key==="Enter"&&(authView==="login"?handleLogin():handleSignup())}
            />
          </div>
          <div>
            <div style={{ fontSize:8, fontFamily:"'DM Sans',sans-serif", letterSpacing:3, color:"#333", marginBottom:6, textTransform:"uppercase" }}>Mot de passe</div>
            <input
              style={{ background:"#0f0f0f", border:"1px solid #1a1a1a", color:"#fff", padding:"11px 14px", fontSize:14, width:"100%", outline:"none", borderRadius:0, fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s" }}
              type="password" value={password} onChange={e=>setPassword(e.target.value)}
              onFocus={e=>e.target.style.borderColor="#fff"} onBlur={e=>e.target.style.borderColor="#1a1a1a"}
              placeholder="••••••••"
              onKeyDown={e=>e.key==="Enter"&&(authView==="login"?handleLogin():handleSignup())}
            />
          </div>
        </div>

        {authError&&(
          <div style={{ background:"rgba(220,80,80,.06)", border:"1px solid rgba(220,80,80,.2)", padding:"10px 14px", marginBottom:16, fontSize:12, color:"#dc5050", lineHeight:1.5 }}>
            {authError}
          </div>
        )}

        <button
          onClick={authView==="login"?handleLogin:handleSignup}
          disabled={authLoading}
          style={{ background:"#fff", border:"1px solid #fff", color:"#080808", padding:"12px", cursor:authLoading?"default":"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:10, letterSpacing:2, textTransform:"uppercase", borderRadius:0, width:"100%", opacity:authLoading?0.6:1, transition:"all 0.2s", fontWeight:500 }}
        >
          {authLoading?"…":authView==="login"?"Se connecter":"Créer mon accès"}
        </button>

        <div style={{ marginTop:20, textAlign:"center" }}>
          <button
            onClick={()=>{setAuthView(authView==="login"?"signup":"login");setAuthError("");}}
            style={{ background:"none", border:"none", color:"#2a2a2a", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:1 }}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#2a2a2a"}
          >
            {authView==="login"?"Première connexion ? Créer un accès →":"← Déjà membre ? Se connecter"}
          </button>
        </div>

        {authView==="signup"&&(
          <div style={{ marginTop:24, padding:"12px 16px", background:"rgba(255,255,255,0.02)", border:"1px solid #111", fontSize:11, color:"#222", lineHeight:1.6 }}>
            Arcanum est un réseau fermé. L'inscription nécessite d'avoir reçu une invitation préalable.
          </div>
        )}
      </div>
    </div>
  );
}
