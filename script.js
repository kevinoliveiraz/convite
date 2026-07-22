/* ======================================================================
   CONVITE DIGITAL — 20 ANOS — script.js
   Organização:
   1. Configuração (URL do Google Apps Script)
   2. Menu (drawer)
   3. Scroll reveal (fade in + slide up)
   4. Partículas douradas discretas (canvas)
   5. Modal de confirmação (abrir/fechar)
   6. Envio do formulário -> Google Sheets
   ====================================================================== */

/* ----------------------------------------------------------------------
   1. CONFIGURAÇÃO
   ----------------------------------------------------------------------
   TROCAR: cole aqui a URL do seu Google Apps Script publicado como
   Web App (termina em "/exec"). Até lá, o formulário funciona
   normalmente mas mostra um aviso no console e simula sucesso local.

   COMO CRIAR O GOOGLE APPS SCRIPT (passo a passo rápido):
   1. Crie uma Google Planilha nova. Na primeira linha, adicione as
      colunas: Data | Nome | Telefone | Acompanhantes
   2. Menu Extensões > Apps Script.
   3. Apague o conteúdo e cole o código abaixo (Code.gs):

      function doPost(e) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var dados = JSON.parse(e.postData.contents);
        sheet.appendRow([
          new Date(),
          dados.nome,
          dados.telefone,
          dados.acompanhantes
        ]);
        return ContentService
          .createTextOutput(JSON.stringify({ status: "ok" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

   4. Clique em "Implantar" > "Nova implantação".
   5. Tipo: "App da Web". Executar como: "Eu". Quem pode acessar: "Qualquer pessoa".
   6. Copie a URL gerada (termina em /exec) e cole abaixo em SHEET_ENDPOINT.
   ---------------------------------------------------------------------- */

const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwte2fzj0YuGFG30PnTxDJqUQ67qH7yD62VKZSJBco7bpe4DpGTE3fy-hY5n-fWGTSaJQ/exec"; // TROCAR: cole a URL do Apps Script aqui (ex: "https://script.google.com/macros/s/XXXXX/exec")

/* ----------------------------------------------------------------------
   1.b VÉU DE ABERTURA — abre como cortina revelando o convite
   ---------------------------------------------------------------------- */

(function initVeil() {
  const veil = document.getElementById("veil");
  if (!veil) return;

  // Trava o scroll enquanto a cortina está fechada
  document.body.classList.add("veil-lock");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const holdTime = reduceMotion ? 150 : 900; // pequena pausa de suspense antes de abrir

  function openVeil() {
    veil.classList.add("is-open");
    document.body.classList.remove("veil-lock");

    // Remove a cortina do fluxo após a transição terminar
    veil.addEventListener(
      "transitionend",
      () => {
        veil.classList.add("is-removed");
      },
      { once: true }
    );

    // Fallback caso transitionend não dispare (ex: reduced motion)
    setTimeout(() => veil.classList.add("is-removed"), 1600);
  }

  // Abre a cortina assim que a página estiver pronta (ou pelo menos após holdTime)
  window.addEventListener("load", () => setTimeout(openVeil, holdTime));
  // Fallback: se "load" demorar demais, abre mesmo assim
  setTimeout(openVeil, 3500);
})();

/* ----------------------------------------------------------------------
   3. SCROLL REVEAL — fade in + slide up ao entrar na viewport
   ---------------------------------------------------------------------- */

const revealItems = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

/* ----------------------------------------------------------------------
   4. FUNDO PREMIUM CINEMATOGRÁFICO (CENÁRIO DE LUXO EM 7 CAMADAS)
   ---------------------------------------------------------------------- */
(function initPremiumBackground() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let rafId = null;
  let time = 0;

  // Controle de Interação (Paralaxe suave do mouse no desktop)
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

  // Arrays de Elementos das Camadas
  let layerMicroDust = [];     // Camada 4: Poeira microscópica de fundo
  let layerMediumParticles = [];// Camada 3: Partículas principais com cintilação
  let layerHeroGlows = [];      // Camada 5 + 6: Partículas macro e pontos de Glow Volumétrico
  let layerNebulae = [];        // Camada 2: Manchas de luz orgânicas que respiram
  let layerWaves = [];          // Camada 7: Ondas de luz acetinadas nos cantos

  // Paleta de cores oficial de luxo em formato RGB para manipulação de opacidade
  const COLORS = [
    "201, 162, 77",  // #C9A24D (Dourado Principal)
    "216, 179, 106", // #D8B36A (Dourado Médio)
    "228, 201, 138", // #E4C98A (Dourado Claro)
    "217, 168, 156"  // #D9A89C (Rose Gold)
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Determina se é mobile para balanceamento de performance/densidade
    const isMobile = width < 768;
    
    // 1. Configuração das Nebulosas (Camada 2) e Glows de Destaque (Camada 6)
    const baseDimension = Math.max(width, height);
    layerNebulae = [
      { x: width * 0.2, y: height * 0.2, r: baseDimension * 0.4, color: COLORS[0], maxAlpha: 0.04, speed: 0.00015, phase: 0 },
      { x: width * 0.8, y: height * 0.8, r: baseDimension * 0.45, color: COLORS[3], maxAlpha: 0.035, speed: 0.0001, phase: 2 },
      { x: width * 0.5, y: height * 0.5, r: baseDimension * 0.35, color: COLORS[2], maxAlpha: 0.02, speed: 0.00012, phase: 4 } // Atrás do "20"
    ];

    // 2. Geração da Poeira Iluminada de Fundo (Camada 4 - Micro partículas)
    const microCount = isMobile ? 30 : 60;
    layerMicroDust = Array.from({ length: microCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 0.6 + 0.2,
      speedY: Math.random() * 0.05 + 0.01,
      speedX: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.2 + 0.05,
      parallaxFactor: 0.2 // Mal reage ao mouse, dando sensação de distância
    }));

    // 3. Geração das Partículas Principais de Gala (Camada 3)
    const mainCount = isMobile ? 25 : 45;
    layerMediumParticles = Array.from({ length: mainCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.6,
      speedY: Math.random() * 0.08 + 0.02,
      speedX: (Math.random() - 0.5) * 0.04,
      baseAlpha: Math.random() * 0.4 + 0.1,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      parallaxFactor: 0.5
    }));

    // 4. Geração de Partículas Grandes e Raras de Brilho Intenso (Camada 5)
    const macroCount = isMobile ? 4 : 8;
    layerHeroGlows = Array.from({ length: macroCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 1.4,
      speedY: Math.random() * 0.04 + 0.01,
      speedX: (Math.random() - 0.5) * 0.01,
      baseAlpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.008 + 0.003, // Piscada extremamente lenta e sofisticada
      pulsePhase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * 2)], // Foca nos tons mais dourados
      parallaxFactor: 0.9 // Se move mais com o mouse, salta para a frente do layout
    }));

    // 5. Configuração das Ondas de Seda Luminosa (Camada 7)
    layerWaves = [
      { side: 1, baseY: height * 0.9, color: COLORS[0], phase: 0, waveLength: 0.002 },
      { side: -1, baseY: height * 0.94, color: COLORS[3], phase: Math.PI / 2, waveLength: 0.0015 }
    ];
  }

  // Interação de movimento fluído do mouse (Paralaxe suave)
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      mouse.active = true;
      // Normaliza a posição do mouse a partir do centro da tela (-0.5 a 0.5)
      mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
    });
    
    window.addEventListener("mouseleave", () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    });
  }

  function updateElements() {
    time += 16; // Incremento baseado em ~60fps para cadência das animações

    // Suaviza a transição do efeito de paralaxe (Linear Interpolation)
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    const updater = (p) => {
      p.y -= p.speedY;
      p.x += p.speedX;

      // Loop infinito das partículas ao saírem do topo ou laterais da tela
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
    };

    layerMicroDust.forEach(updater);
    layerMediumParticles.forEach(updater);
    layerHeroGlows.forEach(updater);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // --- CAMADA 1: O gradiente de fundo preto fosco já é controlado perfeitamente via CSS ---

    // --- CAMADA 2 & 6: Nebulosas fluidas + Glow Volumétrico ---
    layerNebulae.forEach((n) => {
      const currentAlpha = n.maxAlpha + Math.sin(time * n.speed + n.phase) * 0.008;
      
      // Aplica o deslocamento do mouse de forma sutil baseada no tamanho da nebulosa
      const offsetX = mouse.x * 30;
      const offsetY = mouse.y * 30;

      const grad = ctx.createRadialGradient(n.x + offsetX, n.y + offsetY, 0, n.x + offsetX, n.y + offsetY, n.r);
      grad.addColorStop(0, `rgba(${n.color}, ${currentAlpha})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });

    // --- CAMADA 4: Micro partículas (Poeira Fina Ambientação) ---
    layerMicroDust.forEach((p) => {
      const renderX = p.x + (mouse.x * 15 * p.parallaxFactor);
      const renderY = p.y + (mouse.y * 15 * p.parallaxFactor);

      ctx.beginPath();
      ctx.arc(renderX, renderY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLORS[1]}, ${p.alpha})`;
      ctx.fill();
    });

    // --- CAMADA 3: Partículas Principais com Cintilação Orgânica ---
    layerMediumParticles.forEach((p) => {
      const flicker = (Math.sin(time * p.pulseSpeed + p.pulsePhase) + 1) / 2;
      const currentAlpha = p.baseAlpha * (0.4 + flicker * 0.6);
      
      const renderX = p.x + (mouse.x * 40 * p.parallaxFactor);
      const renderY = p.y + (mouse.y * 40 * p.parallaxFactor);

      ctx.beginPath();
      ctx.arc(renderX, renderY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
      ctx.fill();
    });

    // --- CAMADA 5: Partículas Grandes Nobres com Glow próprio ---
    layerHeroGlows.forEach((p) => {
      const pulse = (Math.sin(time * p.pulseSpeed + p.pulsePhase) + 1) / 2;
      const currentAlpha = p.baseAlpha * (0.3 + pulse * 0.7);

      const renderX = p.x + (mouse.x * 70 * p.parallaxFactor);
      const renderY = p.y + (mouse.y * 70 * p.parallaxFactor);

      // Desenha aura de brilho desfocada ao redor da macro partícula
      const aura = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, p.r * 4);
      aura.addColorStop(0, `rgba(${p.color}, ${currentAlpha * 0.4})`);
      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(renderX, renderY, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Centro sólido da partícula
      ctx.beginPath();
      ctx.arc(renderX, renderY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
      ctx.fill();
    });

    // --- CAMADA 7: Ondas de Seda de Luz Tênues (Cantos Inferiores) ---
    layerWaves.forEach((w) => {
      const startX = w.side > 0 ? -100 : width + 100;
      const endX = w.side > 0 ? width * 0.7 : width * 0.3;
      const cpX = (startX + endX) / 2 + (mouse.x * 25);
      
      // Oscilação vertical contínua imitando flacidez de tecido ou fumaça densa
      const waveMotion = Math.sin(time * 0.0004 + w.phase) * 20;
      const cpY = w.baseY - 90 * w.side * 0.5 + waveMotion + (mouse.y * 25);

      const grad = ctx.createLinearGradient(startX, w.baseY, endX, w.baseY);
      grad.addColorStop(0, `rgba(${w.color}, 0)`);
      grad.addColorStop(0.5, `rgba(${w.color}, 0.12)`); // Opacidade extremamente contida (gala)
      grad.addColorStop(1, `rgba(${w.color}, 0)`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(startX, w.baseY + 20);
      ctx.quadraticCurveTo(cpX, cpY, endX, w.baseY - 40);
      ctx.stroke();
      ctx.restore();
    });

    updateElements();
    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(draw);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Monitor de Performance Inteligente (Economia de Bateria/Recursos)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  // Inicializa o ambiente e reconstrói sob redimensionamento
  resize();
  start();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });
})();
/* ----------------------------------------------------------------------
   5. MODAL DE CONFIRMAÇÃO
   ---------------------------------------------------------------------- */

const openModalBtn = document.getElementById("openModalBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalDone = document.getElementById("modalDone");
const rsvpForm = document.getElementById("rsvpForm");
const modalSuccess = document.getElementById("modalSuccess");

function openModal() {
  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("nome")?.focus(), 300);
}

function closeModal() {
  modalOverlay.classList.remove("is-open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function resetModalToForm() {
  rsvpForm.style.display = "";
  rsvpForm.reset();
  modalSuccess.classList.remove("is-visible");
  modalSuccess.setAttribute("aria-hidden", "true");
  document.getElementById("modalError").textContent = "";
}

openModalBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", () => {
  closeModal();
  setTimeout(resetModalToForm, 400);
});
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
    setTimeout(resetModalToForm, 400);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) {
    closeModal();
    setTimeout(resetModalToForm, 400);
  }
});

modalDone.addEventListener("click", () => {
  closeModal();
  setTimeout(resetModalToForm, 400);
});

/* ----------------------------------------------------------------------
   6. ENVIO DO FORMULÁRIO -> GOOGLE SHEETS
   ---------------------------------------------------------------------- */

const submitBtn = document.getElementById("submitBtn");
const submitLabel = document.getElementById("submitLabel");
const modalError = document.getElementById("modalError");

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalError.textContent = "";

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const acompanhantes = document.getElementById("acompanhantes").value;

  if (!nome || !telefone) {
    modalError.textContent = "Preencha nome e telefone para continuar.";
    return;
  }

  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;
  submitLabel.textContent = "ENVIANDO...";

  try {
    if (SHEET_ENDPOINT) {
      // Google Apps Script Web Apps geralmente exigem "no-cors" quando
      // chamados via fetch simples de outro domínio (ex: Netlify).
      // Isso significa que não conseguimos ler a resposta, mas o dado
      // é gravado normalmente na planilha.
      await fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ nome, telefone, acompanhantes }),
      });
    } else {
      console.warn(
        "[Convite] SHEET_ENDPOINT ainda não configurado em script.js. " +
        "A confirmação não está sendo salva em nenhum lugar — configure o Google Apps Script."
      );
      await new Promise((resolve) => setTimeout(resolve, 700)); // simula latência
    }

    showSuccess();
  } catch (err) {
    console.error("[Convite] Erro ao enviar confirmação:", err);
    modalError.textContent = "Não foi possível enviar agora. Tente novamente.";
  } finally {
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
    submitLabel.textContent = "CONFIRMAR";
  }
});

function showSuccess() {
  rsvpForm.style.display = "none";
  modalSuccess.classList.add("is-visible");
  modalSuccess.setAttribute("aria-hidden", "false");

  // Reinicia a animação do check (caso o usuário confirme mais de uma vez)
  const circle = document.querySelector(".modal__success-circle");
  const path = document.querySelector(".modal__success-path");
  [circle, path].forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth; // força reflow
    el.style.animation = "";
  });
}