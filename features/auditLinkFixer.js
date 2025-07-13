(function () {
  'use strict';

  function getProjectNameFromURL() {
    // Try to get project name from current URL
    const urlMatch = window.location.pathname.match(/\/subjects\/([^\/\?\#]+)/);
    if (urlMatch) return urlMatch[1];

    // Try to get from page content if URL doesn't contain it
    const pageTitle = document.querySelector('h1')?.textContent || '';
    const titleMatch = pageTitle.match(/^([\w-]+)/i);
    if (titleMatch) return titleMatch[1];
    
    return null;
  }

  function injectConsoleCommand(projectName) {
    if (!projectName) {
      console.error('❌ Could not detect project name');
      return false;
    }
    
    const command = `db.campus.value.children["bh-module"].children["${projectName}"].attrs.validations[0].form = '/api/content/root/01-edu_module/content/${projectName}/audit/README.md';`;
    
    // Log the command to console
    console.log('%c✅ Audit Fix Command:', 'color: green; font-weight: bold');
    console.log(command);
    
    // Copy to clipboard
    navigator.clipboard.writeText(command)
      .then(() => console.log('📋 Command copied to clipboard!'))
      .catch(err => console.warn('Could not copy to clipboard:', err));
    
    // Execute in console
    try {
      // Using eval carefully just for console injection
      eval(command);
      return true;
    } catch (err) {
      console.error('❌ Failed to execute command:', err);
      return false;
    }
  }

  function addButton() {
    const existingBtn = document.getElementById('reboot-enhancer-audit-link-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Create button
    const btn = document.createElement('button');
    btn.id = 'reboot-enhancer-audit-link-btn';
    btn.innerHTML = '🔧';
    btn.title = 'Fix Audit Link';
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
      borderRadius: '50%',  // Make it circular
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontSize: '20px',  // Slightly larger icon
      transition: 'all 0.3s ease'
    });
    
    // Create tooltip element
    const tooltip = document.createElement('span');
    tooltip.textContent = 'Fix Audit';
    Object.assign(tooltip.style, {
      position: 'absolute',
      left: '60px',  // Position to the right of the button
      background: '#333',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      opacity: '0',
      visibility: 'hidden',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap'
    });
    btn.appendChild(tooltip);

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      // Show tooltip
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      // Hide tooltip
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });

    btn.addEventListener('click', () => {
      const projectName = getProjectNameFromURL();
      const success = injectConsoleCommand(projectName);
      
      // Visual feedback
      btn.innerHTML = success ? '✅' : '❌';
      
      // Update tooltip text
      const tooltip = btn.querySelector('span');
      if (tooltip) {
        tooltip.textContent = success ? 'Injected' : 'Failed';
      }
      
      // Reset button after 3 seconds
      setTimeout(() => {
        btn.style.background = '#2980b9';
        btn.innerHTML = '🔧';
        
        // Recreate tooltip
        const newTooltip = document.createElement('span');
        newTooltip.textContent = 'Fix Audit';
        Object.assign(newTooltip.style, {
          position: 'absolute',
          left: '60px',
          background: '#333',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          opacity: '0',
          visibility: 'hidden',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap'
        });
        btn.appendChild(newTooltip);
      }, 3000);
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
