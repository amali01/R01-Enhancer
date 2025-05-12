(function () {
  'use strict';

  const prefixes = [
    "mobile-dev", "ai", "cybersecurity", "blockchain", "devops", "gaming", "java/projects"
  ];
  const originalFetch = window.fetch;
  let active = false;

  function getProjectNameFromURL(url) {
    const match = url.match(/\/subjects\/([^\/\?\#]+)/);
    return match ? match[1] : null;
  }

  async function tryFetchWithPrefixes(project, input, init) {
    for (const prefix of prefixes) {
      const newUrl = input.replace(`/subjects/${project}`, `/subjects/${prefix}/${project}`);
      try {
        const res = await originalFetch(newUrl, { method: 'HEAD' });
        if (res.ok) {
          console.log(`✅ Fixed audit fetch to: ${newUrl}`);
          return originalFetch(newUrl, init);
        }
      } catch (err) {
        // ignore and try next
      }
    }

    console.warn(`❌ Could not fix audit fetch for project: ${project}`);
    return originalFetch(input, init); // fallback to original
  }

  function overrideFetch() {
    window.fetch = async function (input, init) {
      let url = typeof input === 'string' ? input : input.url;

      if (active && url.includes('/subjects/') && !url.includes('/subjects/prefixes/')) {
        const project = getProjectNameFromURL(url);
        if (project) {
          return tryFetchWithPrefixes(project, url, init);
        }
      }

      return originalFetch(input, init);
    };
  }

  function addButton() {
    const existingBtn = document.getElementById('reboot-enhancer-audit-link-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    const btn = document.createElement('button');
    btn.id = 'reboot-enhancer-audit-link-btn';
    btn.textContent = '🔗';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '140px',
      left: '20px',
      width: 'auto',
      height: '50px',
      zIndex: '9999',
      padding: '0 16px',
      background: '#2980b9',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontSize: '16px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      transition: 'background-color 0.3s ease'
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '0.9';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '1';
    });

    btn.addEventListener('click', () => {
      active = !active;
      btn.innerHTML = active ? '🔗<span style="position:absolute;font-size:8px;top:80%;left:calc(100% - 25px);transform:translateY(-80%)">ON</span>' : '🔗<span style="position:absolute;font-size:8px;top:75%;left:calc(100% - 26px);transform:translateY(-50%)">OFF</span>';
      btn.style.background = active ? '#27ae60' : '#2980b9';
    });

    document.body.appendChild(btn);
  }

  // Clean up on unload
  window.addEventListener('beforeunload', () => {
    const btn = document.getElementById('reboot-enhancer-audit-link-btn');
    if (btn) {
      btn.remove();
    }
  });

  // Clean up any old button from previous session
  const oldBtn = document.getElementById('reboot-enhancer-audit-link-btn');
  if (oldBtn) {
    oldBtn.remove();
  }

  try {
    // Initialize fetch override immediately
    overrideFetch();
    // Add button when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addButton);
    } else {
      addButton();
    }
  } catch (err) {
    console.error('Failed to initialize audit link fixer:', err);
  }
})();
