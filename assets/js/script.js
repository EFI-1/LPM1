const root = document.documentElement;
let themes = {};
let audioPlayer;

async function loadThemes() {
  try {
    const response = await fetch('themes.json');
    themes = await response.json();
    buildMenu();
    applyTheme('dreamy');
  } catch (err) {
    alert('Failed to load themes.json: ' + err.message);
  }
}

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;

  // Apply CSS variables
  for (const variable in theme) {
    if (variable.startsWith('--')) {
      root.style.setProperty(variable, theme[variable]);
    }
  }

  // Handle heading classes
  const h1 = document.querySelector('.portal h1');
  h1.classList.remove('redlightbulbawareness', 'hallwaysofpower', 'forest');
  if (themeName === 'redlightbulbawareness') h1.classList.add('redlightbulbawareness');
  if (themeName === 'hallwaysofpower') h1.classList.add('hallwaysofpower');
  if (themeName === 'forest') h1.classList.add('forest');

  // Handle soundtrack only for Hallways of Power
  if (themeName === 'hallwaysofpower' && theme.soundtrack) {
    audioPlayer = document.getElementById('themeAudio');
    audioPlayer.src = theme.soundtrack;
    audioPlayer.style.display = 'block'; // show controls if desired
    audioPlayer.play().catch(err => {
      console.warn('Audio playback failed:', err.message);
    });
  } else {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.style.display = 'none';
    }
  }
}

function buildMenu() {
  const menu = document.getElementById('themeMenu');
  const ul = document.createElement('ul');

  const label = document.createElement('div');
  label.textContent = 'Select Theme';
  menu.innerHTML = '';
  menu.appendChild(label);

  const emojiMap = {
    dreamy: '1 ✨',
    misty: '2 🌫️',
    cosmic: '3 🌌',
    redlightbulbawareness: '4 💡',
    hallwaysofpower: '5 🏛️',
    forest: '6 🌲'
  };

  Object.keys(themes).forEach(name => {
    const li = document.createElement('li');
    li.textContent = `${emojiMap[name] || ''} ${name}`;
    li.addEventListener('click', () => {
      applyTheme(name);
      menu.style.display = 'none';
    });
    ul.appendChild(li);
  });

  menu.appendChild(ul);
}

function toggleMenu() {
  const menu = document.getElementById('themeMenu');
  if (menu.style.display === 'block') {
    menu.style.display = 'none';
  } else {
    buildMenu();
    menu.style.display = 'block';
  }
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case '1': applyTheme('dreamy'); break;
    case '2': applyTheme('misty'); break;
    case '3': applyTheme('cosmic'); break;
    case '4': applyTheme('redlightbulbawareness'); break;
    case '5': applyTheme('hallwaysofpower'); break;
    case '6': applyTheme('forest'); break;
    case 'Escape': toggleMenu(); break;
  }
});

document.addEventListener('DOMContentLoaded', loadThemes);