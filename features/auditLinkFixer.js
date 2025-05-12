
(function () {
  'use strict';

  const prefixes = [
    "mobile-dev", "ai", "cybersecurity", "blockchain", "devops", "gaming", "java/projects"
  ];
  const originalFetch = window.fetch;
  let active = false;

  function getProjectNameFromURL(url) {
    // Match both project paths: /subjects/[prefix/]project and intra/.../project
    const subjectsMatch = url.match(/\/subjects\/(?:[^\/]+\/)?([^\/\?\#]+)/);
    const intraMatch = url.match(/\/intra\/[^\/]+\/[^\/]+\/[^\/]+\/([^\/\?\#]+)/);
    return subjectsMatch ? subjectsMatch[1] : (intraMatch ? intraMatch[1] : null);
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

      if (active && (url.includes('/subjects/') || url.includes('/intra/')) && !url.includes('/subjects/prefixes/')) {
        const project = getProjectNameFromURL(url);
        if (project) {
          return tryFetchWithPrefixes(project, url, init);
        }
      }

      return originalFetch(input, init);
    };
  }

  function addButton() {
    const btn = document.createElement('button');
    btn.textContent = '🛠️ Fix Audit Links: OFF';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '120px',
      left: '20px',
      zIndex: 10000,
      padding: '10px 16px',
      background: '#2980b9',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '14px',
      fontWeight: 'bold',
    });

    btn.addEventListener('mouseenter', () => (btn.style.opacity = '0.9'));
    btn.addEventListener('mouseleave', () => (btn.style.opacity = '1'));

    btn.addEventListener('click', () => {
      active = !active;
      btn.textContent = active ? '🛠️ Fix Audit Links: ON' : '🛠️ Fix Audit Links: OFF';
    });

    document.body.appendChild(btn);
  }

  overrideFetch();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
  } else {
    addButton();
  }
})();
