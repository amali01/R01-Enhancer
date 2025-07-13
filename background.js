// Browser API polyfill
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Extension information
const extensionInfo = {
  version: browserAPI.runtime.getManifest().version,
  shortcuts: {
    'acceptAll': '✓ Click to accept all audit answers',
    'imageFixer': '🖼️ Click to fix broken images',
    'openObjects': '🚪 Click to unlock all projects',
    'auditLinkFixer': '🔧 Click to fix audit links',
    'auditPageOpener': '🔍 Click to open audit page'
  }
};

// Listen for messages from popup
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getInfo') {
    sendResponse(extensionInfo);
    return true;
  }
});
