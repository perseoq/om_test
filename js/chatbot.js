/**
 * Observatorio de Movilidad — WhatsApp Chatbot Widget
 * Loads knowledge base from chatbot-data.json and matches
 * user input against wildcard patterns (* = any text).
 */
(function () {
  'use strict';

  /* ── Resolve JSON path relative to this script ─────────── */
  const scriptSrc = document.currentScript
    ? document.currentScript.src
    : document.querySelector('script[src*="chatbot"]').src;
  const base = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
  const DATA_URL = base + 'chatbot-data.json';

  let botData = null;
  fetch(DATA_URL)
    .then(r => r.json())
    .then(d => { botData = d; })
    .catch(() => { botData = null; });

  /* ── Inject CSS ─────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
/* ─── CHATBOT TOGGLE BUTTON ─────────────────────────── */
#om-chat-toggle {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 1002;
  width: 58px;
  height: 58px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(37,211,102,0.5);
  border: none;
  color: #fff;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
#om-chat-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 32px rgba(37,211,102,0.6);
}
#om-chat-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #e53935;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: om-pulse-badge 1.8s ease-in-out infinite;
  pointer-events: none;
}
@keyframes om-pulse-badge {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.25); }
}

/* ─── CHAT WINDOW ────────────────────────────────────── */
#om-chat-window {
  position: fixed;
  bottom: 5.8rem;
  right: 1.5rem;
  z-index: 1001;
  width: 340px;
  background: #ECE5DD;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: scale(0.85) translateY(20px);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
  transform-origin: bottom right;
  max-height: 80vh;
}
#om-chat-window.om-open {
  transform: scale(1) translateY(0);
  opacity: 1;
  pointer-events: auto;
}

/* Header */
#om-chat-header {
  background: #075E54;
  color: #fff;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
#om-chat-avatar {
  width: 40px;
  height: 40px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.78rem;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
#om-chat-header-info { flex: 1; min-width: 0; }
#om-chat-header-info h4 {
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0 0 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#om-chat-header-info span {
  font-size: 0.7rem;
  opacity: 0.82;
}
#om-chat-header-info span::before {
  content: '●';
  margin-right: 4px;
  color: #25D366;
  font-size: 0.6rem;
}
#om-chat-close {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  opacity: 0.75;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
#om-chat-close:hover { opacity: 1; }

/* Messages */
#om-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}
#om-chat-messages::-webkit-scrollbar { width: 4px; }
#om-chat-messages::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}
.om-msg {
  max-width: 82%;
  padding: 7px 11px;
  border-radius: 8px;
  font-size: 0.82rem;
  line-height: 1.5;
  word-wrap: break-word;
  animation: om-msg-in 0.22s ease;
}
.om-msg a { color: #075E54; font-weight: 600; }
.om-msg a:hover { text-decoration: underline; }
@keyframes om-msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.om-msg-bot {
  background: #fff;
  color: #111;
  align-self: flex-start;
  border-top-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.om-msg-user {
  background: #DCF8C6;
  color: #111;
  align-self: flex-end;
  border-top-right-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.om-msg-time {
  font-size: 0.6rem;
  color: #999;
  text-align: right;
  margin-top: 3px;
}

/* Typing indicator */
.om-typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 10px 14px;
  background: #fff;
  border-radius: 8px;
  border-top-left-radius: 2px;
  align-self: flex-start;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  animation: om-msg-in 0.22s ease;
}
.om-typing span {
  width: 7px;
  height: 7px;
  background: #aaa;
  border-radius: 50%;
  animation: om-typing-dot 1.2s ease-in-out infinite;
}
.om-typing span:nth-child(2) { animation-delay: 0.2s; }
.om-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes om-typing-dot {
  0%,80%,100% { transform: scale(0.85); opacity: 0.5; }
  40%          { transform: scale(1.2);  opacity: 1; }
}

/* Suggestions */
#om-chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px 8px 0;
  flex-shrink: 0;
}
.om-suggestion {
  font-size: 0.71rem;
  padding: 4px 10px;
  border-radius: 14px;
  background: #fff;
  border: 1.5px solid #25D366;
  color: #075E54;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
  line-height: 1.4;
}
.om-suggestion:hover {
  background: #25D366;
  color: #fff;
}

/* Input row */
#om-chat-input-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 8px;
  background: #F0F0F0;
  flex-shrink: 0;
}
#om-chat-input {
  flex: 1;
  border: none;
  border-radius: 22px;
  padding: 8px 14px;
  font-size: 0.83rem;
  background: #fff;
  outline: none;
  font-family: inherit;
  min-width: 0;
}
#om-chat-send {
  width: 40px;
  height: 40px;
  background: #25D366;
  border: none;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s;
  flex-shrink: 0;
}
#om-chat-send:hover {
  background: #1EBE58;
  transform: scale(1.06);
}

/* Mobile */
@media (max-width: 480px) {
  #om-chat-window {
    width: calc(100vw - 2rem);
    right: 1rem;
    bottom: 5.5rem;
  }
  #om-chat-toggle { right: 1rem; }
}
  `;
  document.head.appendChild(style);

  /* ── Helpers ─────────────────────────────────────────────── */
  function getTime() {
    const n = new Date();
    return String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
  }

  function addMessage(container, html, isBot) {
    const div = document.createElement('div');
    div.className = 'om-msg ' + (isBot ? 'om-msg-bot' : 'om-msg-user');
    div.innerHTML = html + '<div class="om-msg-time">' + getTime() + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping(container) {
    const div = document.createElement('div');
    div.className = 'om-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  /* ── Normalise text: lowercase + strip diacritics ─────── */
  function normalise(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿¡.,;:!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ── Convert wildcard pattern to RegExp ──────────────── */
  function toRegex(pattern) {
    const n = normalise(pattern);
    // Escape regex specials except *
    const esc = n.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // * → .*
    return new RegExp(esc.replace(/\*/g, '.*'), 'i');
  }

  /* ── Find best-matching intent ───────────────────────── */
  function findIntent(input) {
    if (!botData) return null;
    const norm = normalise(input);
    for (const intent of botData.intents) {
      for (const pattern of intent.patterns) {
        if (toRegex(pattern).test(norm)) return intent;
      }
    }
    return null;
  }

  function getResponse(input) {
    const intent = findIntent(input);
    if (intent) {
      const r = intent.responses;
      return { text: r[Math.floor(Math.random() * r.length)], suggestions: intent.suggestions };
    }
    const fb = botData ? botData.fallback : ['Escríbenos a través de la página de contacto.'];
    return { text: fb[Math.floor(Math.random() * fb.length)], suggestions: null };
  }

  /* ── Build widget DOM ────────────────────────────────── */
  function buildWidget() {
    /* Toggle button */
    const toggle = document.createElement('button');
    toggle.id = 'om-chat-toggle';
    toggle.setAttribute('aria-label', 'Abrir chat de ayuda');
    toggle.innerHTML = `
      <svg width="27" height="27" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.124.55 4.118 1.516 5.852L.058 23.29a.75.75 0 0 0 .927.94l5.583-1.443A11.944 11.944 0 0 0 12.004 24C18.63 24 24 18.627 24 12S18.63 0 12.004 0zm0 22a9.96 9.96 0 0 1-5.349-1.379l-.384-.217-3.981 1.027 1.056-3.86-.237-.394A9.963 9.963 0 0 1 2.004 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      <span id="om-chat-badge" aria-hidden="true">1</span>`;

    /* Chat window */
    const win = document.createElement('div');
    win.id = 'om-chat-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Chat de ayuda Observatorio de Movilidad');
    win.innerHTML = `
      <div id="om-chat-header">
        <div id="om-chat-avatar">OM</div>
        <div id="om-chat-header-info">
          <h4>Asistente OM</h4>
          <span>En línea</span>
        </div>
        <button id="om-chat-close" aria-label="Cerrar chat">
          <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div id="om-chat-messages" aria-live="polite" aria-atomic="false"></div>
      <div id="om-chat-suggestions"></div>
      <div id="om-chat-input-row">
        <input id="om-chat-input" type="text"
               placeholder="Escribe un mensaje..."
               autocomplete="off"
               aria-label="Escribe tu mensaje"/>
        <button id="om-chat-send" aria-label="Enviar mensaje">
          <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>`;

    document.body.appendChild(toggle);
    document.body.appendChild(win);

    return { toggle, win };
  }

  /* ── Render suggestion chips ─────────────────────────── */
  const DEFAULT_SUGGESTIONS = [
    '¿Qué es el Observatorio?',
    '¿Cómo participo?',
    'Principios',
    'Contacto'
  ];

  function renderSuggestions(el, items, inputEl) {
    el.innerHTML = '';
    (items || DEFAULT_SUGGESTIONS).slice(0, 5).forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'om-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', e => {
        e.stopPropagation(); // prevent bubbling to the outside-click-close listener
        inputEl.value = text;
        sendMessage();
      });
      el.appendChild(btn);
    });
  }

  /* ── Main init ───────────────────────────────────────── */
  const { toggle, win } = buildWidget();
  const messagesEl   = win.querySelector('#om-chat-messages');
  const inputEl      = win.querySelector('#om-chat-input');
  const sendBtn      = win.querySelector('#om-chat-send');
  const closeBtn     = win.querySelector('#om-chat-close');
  const badge        = document.getElementById('om-chat-badge');
  const suggestionsEl = win.querySelector('#om-chat-suggestions');

  let isOpen   = false;
  let greeted  = false;
  let isBusy   = false;

  function openChat() {
    isOpen = true;
    win.classList.add('om-open');
    if (badge) badge.style.display = 'none';
    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        const greeting = botData
          ? botData.greeting
          : '¡Hola! 👋 Soy el asistente del <strong>Observatorio de Movilidad</strong>. ¿En qué puedo ayudarte?';
        addMessage(messagesEl, greeting, true);
        renderSuggestions(suggestionsEl, DEFAULT_SUGGESTIONS, inputEl);
      }, 380);
    }
    setTimeout(() => inputEl.focus(), 320);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('om-open');
  }

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isBusy) return;
    isBusy = true;
    inputEl.value = '';
    suggestionsEl.innerHTML = '';
    addMessage(messagesEl, text, false);

    const typing = showTyping(messagesEl);
    const delay  = 550 + Math.random() * 500;

    setTimeout(() => {
      typing.remove();
      const { text: reply, suggestions } = getResponse(text);
      addMessage(messagesEl, reply, true);
      renderSuggestions(suggestionsEl, suggestions || DEFAULT_SUGGESTIONS, inputEl);
      isBusy = false;
    }, delay);
  }

  toggle.addEventListener('click', () => { isOpen ? closeChat() : openChat(); });
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  /* Close when clicking outside — use composedPath() so removed nodes still match */
  document.addEventListener('click', e => {
    const path = e.composedPath ? e.composedPath() : [];
    if (isOpen && !path.includes(win) && !path.includes(toggle)) closeChat();
  });

})();
