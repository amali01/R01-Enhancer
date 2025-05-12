const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Feature information - no more settings, just info
const features = {
  acceptAll: {
    id: 'acceptAll',
    name: 'Accept All Audits',
    description: 'Click the button at the bottom of the page to accept all audit questions',
    icon: '✓'
  },
  openObjects: {
    id: 'openObjects',
    name: 'Open All Objects',
    description: 'Click the button at the bottom of the page to unlock all projects',
    icon: '🚪'
  },
  imageFixer: {
    id: 'imageFixer',
    name: 'Image Fixer',
    description: 'Click the button at the bottom of the page to fix broken images',
    icon: '🖼️'
  },
  auditLinkFixer: {
    id: 'auditLinkFixer',
    name: 'Audit Link Fixer',
    description: 'Click the button at the bottom of the page to fix broken audit links',
    icon: '🔗'
  },
  auditPageOpener: {
    id: 'auditPageOpener',
    name: 'Audit Page Opener',
    description: 'Click the button at the bottom of the page to open the audit page',
    icon: '🔍'
  }
};

// Create feature info element
function createFeatureElement(id, feature) {
  const div = document.createElement('div');
  div.className = 'feature-item';
  div.innerHTML = `
    <div class="feature-icon">${feature.icon}</div>
    <div class="feature-info">
      <div class="feature-name">${feature.name}</div>
      <div class="feature-desc">${feature.description}</div>
    </div>
  `;
  return div;
}

document.addEventListener('DOMContentLoaded', async () => {
  const featureList = document.querySelector('.feature-list');
  
  // Get extension info
  browserAPI.runtime.sendMessage({ type: 'getInfo' }, (info) => {
    // Update version
    const credits = document.querySelector('.credits');
    credits.innerHTML = credits.innerHTML.replace('v1.0.0', `v${info.version}`);
    
    // Populate features
    Object.entries(features).forEach(([id, feature]) => {
      const featureEl = createFeatureElement(id, feature);
      featureList.appendChild(featureEl);
    });
  });
});
