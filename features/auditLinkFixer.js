(function () {
  'use strict';

  const prefixes = [
    "mobile-dev", "ai", "cybersecurity", "blockchain", "devops", "gaming", "java/projects"
  ];
  let active = false;
  let proxyFetch = null;

  function getProjectNameFromURL(url) {
    // Main pattern for /subjects/project
    const subjectsMatch = url.match(/\/subjects\/([^\/\?\#]+)/);
    // Fallback for intra URLs if needed
    const intraMatch = url.match(/\/intra\/[^\/]+\/[^\/]+\/[^\/]+\/([^\/\?\#]+)/);
    return subjectsMatch ? subjectsMatch[1] : (intraMatch ? intraMatch[1] : null);
  }

  async function tryFetchWithPrefixes(project, input, init) {
    for (const prefix of prefixes) {
      const newUrl = input.replace(`/subjects/${project}`, `/subjects/${prefix}/${project}`);
      try {
        const res = await window.fetch(newUrl, { method: 'HEAD' });
        if (res.ok) {
          console.log(`✅ Fixed audit fetch to: ${newUrl}`);
          return window.fetch(newUrl, init);
        }
      } catch (err) {
        // ignore and try next
      }
    }

    console.warn(`❌ Could not fix audit fetch for project: ${project}`);
    return window.fetch(input, init); // fallback to original
  }

  function setupFetchProxy() {
    if (proxyFetch) return; // Already set up
    
    try {
      // Create a proxy function to handle fetch calls
      const handleFetch = async (input, init) => {
        let url = typeof input === 'string' ? input : input.url;

        if (active && url.includes('/subjects/') && !url.includes('/subjects/prefixes/')) {
          const project = getProjectNameFromURL(url);
          if (project) {
            return tryFetchWithPrefixes(project, url, init);
          }
        }

        return window.fetch(input, init);
      };

      // Try to set up XHR interception
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (active && url.includes('/subjects/') && !url.includes('/subjects/prefixes/')) {
          const project = getProjectNameFromURL(url);
          if (project) {
            for (const prefix of prefixes) {
              const newUrl = url.replace(`/subjects/${project}`, `/subjects/${prefix}/${project}`);
              // We'll try the first working URL
              fetch(newUrl, { method: 'HEAD' }).then(res => {
                if (res.ok) {
                  console.log(`✅ Fixed XHR to: ${newUrl}`);
                  originalXHROpen.call(this, method, newUrl, ...rest);
                  return;
                }
              }).catch(() => {});
            }
          }
        }
        originalXHROpen.call(this, method, url, ...rest);
      };

      proxyFetch = handleFetch;
      console.log('✅ Fetch proxy set up successfully');
    } catch (error) {
      console.error('Could not set up fetch proxy:', error);
    }
  }

  function addButton() {
    const btn = document.createElement('button');
    btn.textContent = '🔗';
    btn.title = 'Fix Audit Links';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '140px',
      left: '20px',
      width: '50px',
      height: '50px',
      zIndex: '9999',
      padding: '0',
      background: '#2980b9',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontSize: '20px',
      padding: '0'
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '0.9';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '1';
    });

    btn.addEventListener('click', () => {
      active = !active;
      if (active) {
        setupFetchProxy();
      }
      btn.style.background = active ? '#27ae60' : '#2980b9';
      btn.title = active ? 'Fix Audit Links (ON)' : 'Fix Audit Links (OFF)';
    });

    document.body.appendChild(btn);
  }

  // Only add the button, proxy setup happens on activation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
  } else {
    addButton();
  }
})();
