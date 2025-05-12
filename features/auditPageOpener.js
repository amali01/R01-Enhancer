
(function () {
  'use strict';

  const baseAuditPath = 'https://learn.reboot01.com/git/root/public/src/branch/master/subjects';
  const fallbackPaths = [
    '', // default
    'mobile-dev',
    'ai',
    'cybersecurity',
    'blockchain',
    'devops',
    'gaming',
    'java/projects',
  ];

  function showError(message) {
    const msgBox = document.createElement('div');
    msgBox.textContent = message;
    msgBox.style.position = 'fixed';
    msgBox.style.top = '50%';
    msgBox.style.left = '50%';
    msgBox.style.transform = 'translate(-50%, -50%)';
    msgBox.style.background = 'red';
    msgBox.style.color = 'white';
    msgBox.style.padding = '15px 20px';
    msgBox.style.borderRadius = '10px';
    msgBox.style.fontSize = '16px';
    msgBox.style.zIndex = '10000';
    document.body.appendChild(msgBox);
    setTimeout(() => msgBox.remove(), 3000);
  }

  async function tryAuditPaths(projectName) {
    for (const path of fallbackPaths) {
      const fullPath = path ? `${baseAuditPath}/${path}/${projectName}/` : `${baseAuditPath}/${projectName}/audit`;
      try {
        const response = await fetch(fullPath, { method: 'HEAD' });
        if (response.ok) {
          return fullPath;
        }
      } catch (err) {
        console.warn(`Failed to check ${fullPath}`);
      }
    }
    return null;
  }

  async function openAuditPage() {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split('/');
    const projectName = urlParts[urlParts.length - 1].split('?')[0];

    if (!projectName) {
      showError('Could not determine the project name from the URL.');
      return;
    }

    const workingUrl = await tryAuditPaths(projectName);
    if (workingUrl) {
      window.open(workingUrl, '_blank');
    } else {
      showError(`No audit page found for project "${projectName}"`);
    }
  }

  function createAuditButton() {
    const button = document.createElement("button");
    button.id = "auditButton";
    button.textContent = "🔍 Audit Page";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.left = "20px";
    button.style.padding = "10px 15px";
    button.style.zIndex = "9999";
    button.style.backgroundColor = "#2c3e50";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    button.style.fontSize = "14px";

    button.addEventListener("click", openAuditPage);
    document.body.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      createAuditButton();
    });
  } else {
    createAuditButton();
  }
})();
