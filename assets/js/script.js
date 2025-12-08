const root = document.documentElement;
let themes = {};
let audioEl, playerEl, trackTitleEl, playPauseBtn, stopBtn, volSlider, themesToggleBtn;

document.addEventListener('DOMContentLoaded', () => {
  cachePlayerRefs();
  loadThemes();
  try { window.focus(); } catch (e) {}
  hookBackupToggle();
});

/* ---------- Load themes ---------- */
async function loadThemes() {
  try {
    const response = await fetch('themes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    themes = await response.json();
    buildMenu();
    applyTheme('dreamy'); // default
  } catch (err) {
    console.error('Failed to load themes.json:', err);
    alert('Failed to load themes.json. Check path and JSON syntax.');
  }
}

/* ---------- Player refs ---------- */
function cachePlayerRefs() {
  playerEl = document.getElementById('themePlayer');
  audioEl = document.getElementById('themeAudio');
  trackTitleEl = document.getElementById('trackTitle');
  playPauseBtn = document.getElementById('btnPlayPause');
  stopBtn = document.getElementById('btnStop');
  volSlider = document.getElementById('volSlider');
  themesToggleBtn = document.getElementById('themesToggle');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!audioEl.src) return;
      if (audioEl.paused) {
        audioEl.play().catch(err => console.warn('Audio play failed:', err));
        playPauseBtn.textContent = 'Pause';
      } else {
        audioEl.pause();
        playPauseBtn.textContent = 'Play';
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (!audioEl.src) return;
      audioEl.pause();
      audioEl.currentTime = 0;
      playPauseBtn.textContent = 'Play';
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      audioEl.volume = Number(e.target.value);
    });
  }

  if (audioEl) {
    audioEl.addEventListener('ended', () => {
      if (playPauseBtn) playPauseBtn.textContent = 'Play';
    });
  }
}

/* ---------- Apply theme (populate annotated slots below PDF) ---------- */
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;

  // Apply CSS variables from JSON
  for (const variable in theme) {
    if (variable.startsWith('--')) {
      root.style.setProperty(variable, theme[variable]);
    }
  }

  // Heading classes
  const h1 = document.querySelector('.portal h1');
  h1.classList.remove('redlightbulbawareness', 'hallwaysofpower', 'forest');
  if (themeName === 'redlightbulbawareness') h1.classList.add('redlightbulbawareness');
  if (themeName === 'hallwaysofpower') h1.classList.add('hallwaysofpower');
  if (themeName === 'forest') h1.classList.add('forest');

  // Background image
  if (theme.backgroundImage) {
    document.body.style.backgroundImage = `url(${theme.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = '';
  }

  // Clear all slots first
  const embedContainer = document.getElementById('embedContainer');
  const slotYouTube = document.querySelector('#embed-youtube .slot-content');
  const slotSoundCloud = document.querySelector('#embed-soundcloud .slot-content');
  const slotGeneral = document.querySelector('#embed-general .slot-content');

  if (slotYouTube) slotYouTube.innerHTML = '';
  if (slotSoundCloud) slotSoundCloud.innerHTML = '';
  if (slotGeneral) slotGeneral.innerHTML = '';

  embedContainer.style.display = 'none';

  // Populate slots when Hallways of Power is active
  if (themeName === 'hallwaysofpower') {
    // If theme.embeds exists, map by label to slots
    if (Array.isArray(theme.embeds) && theme.embeds.length) {
      theme.embeds.forEach(embed => {
        const label = (embed.label || '').toLowerCase();
        const code = embed.code || '';
        if (label.includes('youtube') && slotYouTube) {
          slotYouTube.innerHTML = code;
          slotYouTube.setAttribute('aria-hidden', 'false');
        } else if (label.includes('soundcloud') && slotSoundCloud) {
          slotSoundCloud.innerHTML = code;
          slotSoundCloud.setAttribute('aria-hidden', 'false');
        } else if (slotGeneral) {
          // Append to general if not matched
          slotGeneral.innerHTML += code;
          slotGeneral.setAttribute('aria-hidden', 'false');
        }
      });
      embedContainer.style.display = 'block';
      embedContainer.style.zIndex = '12000';
    }
  }

  // Persistent audio player behavior (Hallways only)
  if (themeName === 'hallwaysofpower') {
    playerEl.style.display = 'block';
    if (theme.soundtrack && !theme.soundtrack.includes('soundcloud.com')) {
      audioEl.src = theme.soundtrack;
      updateTrackTitleFromSrc(theme.soundtrack);
      if (playPauseBtn) playPauseBtn.textContent = 'Play';
    } else {
      audioEl.removeAttribute('src');
      trackTitleEl.textContent = '—';
      if (playPauseBtn) playPauseBtn.textContent = 'Play';
    }
  } else {
    playerEl.style.display = 'none';
    audioEl.pause();
    audioEl.removeAttribute('src');
    trackTitleEl.textContent = '—';
    if (playPauseBtn) playPauseBtn.textContent = 'Play';
  }

  // Center-screen notification
  showNotification(themeName);
}

/* ---------- Notification ---------- */
function showNotification(themeName) {
  const notify = document.getElementById('themeNotify');
  const emoji = {
    dreamy: '✨',
    misty: '🌫️',
    cosmic: '🌌',
    redlightbulbawareness: '💡',
    hallwaysofpower: '🏛️',
    forest: '🌲'
  }[themeName] || '';
  notify.textContent = `${emoji} ${themeName}`;
  notify.classList.remove('fade-out', 'show');
  notify.style.display = 'block';
  requestAnimationFrame(() => {
    notify.classList.add('show');
    setTimeout(() => {
      notify.classList.add('fade-out');
      setTimeout(() => {
        notify.style.display = 'none';
        notify.classList.remove('show', 'fade-out');
      }, 900);
    }, 900);
  });
}

/* ---------- Helpers ---------- */
function updateTrackTitleFromSrc(src) {
  try {
    const file = src.split('/').pop() || src;
    const title = file.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
    trackTitleEl.textContent = ` ${title} `;
  } catch {
    trackTitleEl.textContent = ' — ';
  }
}

/* ---------- Menu ---------- */
function buildMenu() {
  const menu = document.getElementById('themeMenu');
  const ul = document.createElement('ul');

  const label = document.createElement('div');
  label.textContent = 'Select Theme';
  menu.innerHTML = '';
  menu.appendChild(label);

  const order = ['dreamy', 'misty', 'cosmic', 'redlightbulbawareness', 'hallwaysofpower', 'forest'];
  const emojiMap = {
    dreamy: '1 ✨',
    misty: '2 🌫️',
    cosmic: '3 🌌',
    redlightbulbawareness: '4 💡',
    hallwaysofpower: '5 🏛️',
    forest: '6 🌲'
  };

  order.forEach(name => {
    if (themes[name]) {
      const li = document.createElement('li');
      li.textContent = `${emojiMap[name]} ${name}`;
      li.addEventListener('click', () => {
        applyTheme(name);
        hideMenu();
      });
      ul.appendChild(li);
    }
  });

  menu.appendChild(ul);
}

function showMenu() {
  const menu = document.getElementById('themeMenu');
  menu.style.display = 'block';
  menu.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  menu.tabIndex = -1;
  menu.focus();
}

function hideMenu() {
  const menu = document.getElementById('themeMenu');
  menu.style.display = 'none';
  menu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  try { window.focus(); } catch (e) {}
}

function toggleMenu() {
  const menu = document.getElementById('themeMenu');
  if (menu.style.display === 'block') hideMenu(); else showMenu();
}

/* ---------- Robust keyboard handling (capture) ---------- */
function handleShortcut(event) {
  const key = event.key || event.keyIdentifier || event.keyCode;
  const k = (typeof key === 'string') ? key : String(key);

  const isEscape = k === 'Escape' || k === 'Esc' || k === '27' || k === 27;
  if (isEscape) {
    event.preventDefault();
    event.stopPropagation();
    toggleMenu();
    return;
  }

  if (k === '1' || k === 49) { applyTheme('dreamy'); return; }
  if (k === '2' || k === 50) { applyTheme('misty'); return; }
  if (k === '3' || k === 51) { applyTheme('cosmic'); return; }
  if (k === '4' || k === 52) { applyTheme('redlightbulbawareness'); return; }
  if (k === '5' || k === 53) { applyTheme('hallwaysofpower'); return; }
  if (k === '6' || k === 54) { applyTheme('forest'); return; }
}

window.addEventListener('keydown', handleShortcut, true);
document.addEventListener('keydown', handleShortcut, true);

/* ---------- Backup toggle wiring ---------- */
function hookBackupToggle() {
  if (!themesToggleBtn) themesToggleBtn = document.getElementById('themesToggle');
  if (!themesToggleBtn) return;
  themesToggleBtn.addEventListener('click', () => {
    toggleMenu();
    const menu = document.getElementById('themeMenu');
    const expanded = menu.style.display === 'block';
    themesToggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
}