
(function() {
  'use strict';

  const baseAuditPath = "https://learn.reboot01.com/git/root/public/media/branch/master/subjects";
  const prefixes = [
    "mobile-dev","ai","cybersecurity","blockchain","devops","gaming","java/projects"
    // Add "piscine-*" paths if needed for image lookup, though project name extraction should handle URL part
    // e.g., "piscine-go", "piscine-flutter" if images are sometimes stored under these paths
  ];
  const fallback = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/640px-No-Image-Placeholder.svg.png";

  let observer = null;
  let active = false;

  function getProjectName() {
    // Get the path part of the URL (e.g., "/intra/bahrain/bh-module/piscine-flutter/quizz-app/")
    const pathname = window.location.pathname;
    // Split the path into segments
    const segments = pathname.split('/');
    // Filter out any empty segments (like from leading/trailing slashes)
    const actualSegments = segments.filter(segment => segment.length > 0);
    // The project name should be the last non-empty segment
    const projectName = actualSegments.pop() || null; // Return the last segment, or null if none found
    // console.log("Detected project name:", projectName); // Optional: for debugging
    return projectName;
  }

  async function urlExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- MODIFIED FUNCTION ---
  async function fixImage(img) {
    // Prevent re-fixing an image that is already being processed or successfully fixed by src change
    if (img.dataset.fixing || img.dataset.fixed) return;
    img.dataset.fixing = "true"; // Mark as being processed

    const originalSrc = img.src; // Store original src for comparison later if needed
    const [urlNoQ, query] = img.src.split('?');
    const q = query ? '?' + query : '';
    let folder, filename;

    // Try to extract folder and filename from the broken image source
    // Matches /media/folder/filename OR /media/filename
    const mediaMatch = urlNoQ.match(/\/media\/(?:([^\/]+)\/)?([^\/?]+)$/);
    if (mediaMatch) {
        // mediaMatch[1] is the folder (optional, so could be undefined)
        // mediaMatch[2] is the filename
        folder = mediaMatch[1] || null; // Assign null if folder part wasn't captured
        filename = mediaMatch[2];
    } else {
         // If the source doesn't match /media/, try extracting the last part of the path as filename
         const pathParts = urlNoQ.split('/');
         const potentialFilename = pathParts.pop();
         // Basic check if it looks like a filename (contains a dot, doesn't look like a UUID maybe)
         if (potentialFilename && potentialFilename.includes('.') && potentialFilename.length < 50) {
             filename = potentialFilename;
             folder = null; // Assume no folder if only filename is detected this way
             // console.log(`Guessed filename: ${filename} from ${urlNoQ}`);
         } else {
             console.warn(`❌ Couldn't extract filename from ${urlNoQ}. Using fallback.`);
             img.src = fallback;
             delete img.dataset.fixing;
             img.dataset.fixed = "fallback";
             img.onerror = null; // Prevent loops on fallback
             return;
         }
    }

    const project = getProjectName();
    if (!project || !filename) {
      console.warn(`❌ Missing project (${project}) or filename (${filename}). Using fallback for ${originalSrc}.`);
      // Only set fallback if not already set
      if (img.src !== fallback) img.src = fallback;
      delete img.dataset.fixing;
      img.dataset.fixed = "fallback";
      img.onerror = null; // Prevent loops on fallback
      return;
    }

    // Keep track of URLs checked for this specific image attempt
    const checkedURLs = new Set();

    for (const p of prefixes) {
      const baseProjectPath = `${baseAuditPath}/${p}/${project}`;

      // Define potential locations relative to the project path
      const potentialRelativePaths = [
          `${filename}`,
          `pictures/${filename}`,
          `resources/${filename}`
      ];

      // Add the original folder path ONLY if a folder was extracted from the original URL
      if (folder) {
          potentialRelativePaths.push(`${folder}/${filename}`);
      }


      // Check each potential path combined with the base project path
      for (const relativePath of potentialRelativePaths) {
        const candidate = `${baseProjectPath}/${relativePath}${q}`;

        // Avoid re-checking the exact same constructed URL within this attempt
        if (checkedURLs.has(candidate)) {
            continue;
        }
        checkedURLs.add(candidate);

        // console.log(`🔍 Checking: ${candidate}`); // Verbose debugging

        if (await urlExists(candidate)) {
          // Double check if the image src changed while we were checking existence
          if (img.src !== originalSrc && img.src !== fallback && !img.dataset.fixed) {
              console.log(`🤔 Image src changed during check for ${filename}. Skipping fix.`);
              delete img.dataset.fixing;
              return; // Assume another process fixed it or it's no longer relevant
          }
          // Ensure we are not overwriting an already fixed state just in case
          if (img.dataset.fixed) {
              delete img.dataset.fixing;
              return;
          }

          img.src = candidate;
          img.dataset.fixed = "true"; // Mark as successfully fixed
          console.log(`✅ Fixed image: ${candidate}`);
          img.onerror = null; // Prevent loops if the *fixed* image somehow fails later
          delete img.dataset.fixing;
          return; // Success! Exit the function.
        }
      }
    }

    // If loop completes without finding a working candidate across all prefixes and paths
    // Only set fallback if it wasn't fixed by another means and isn't already fallback
    if (img.src !== fallback && !img.dataset.fixed) {
        console.warn(`❌ Couldn’t fix ${filename} in project ${project} across all paths; using fallback.`);
        img.src = fallback;
        img.dataset.fixed = "fallback";
    } else if (!img.dataset.fixed) {
         // If src is already fallback, just mark it as such
         img.dataset.fixed = "fallback";
    }

    img.onerror = null; // Prevent loops on the fallback image
    delete img.dataset.fixing;
  }
  // --- END MODIFIED FUNCTION ---


  function attachFixer(img) {
    if (!active) return;
    // Check if already attached or fixed
    if (img.dataset.autoFixAttached || img.dataset.fixed) return;
    img.dataset.autoFixAttached = "true"; // Mark that listener is attached

    // Add the onerror handler
    img.onerror = () => {
        // Small delay to prevent potential race conditions with React/DOM updates
        setTimeout(() => fixImage(img), 50);
    };

    // Trigger check immediately for images that might already be broken or not yet loaded
    // Check .complete and naturalWidth. naturalWidth is 0 for broken images.
    // Also check if src is empty or placeholder which might bypass onerror in some browsers
     if (img.complete) {
         if (img.naturalWidth === 0 && img.src && !img.src.startsWith('data:') && !img.src.startsWith('blob:')) { // Check if broken and not a data/blob URI
            // console.log(`Image already broken, fixing: ${img.src}`); // Debugging
            fixImage(img);
         }
     } else {
         // For images not yet complete, the onerror handler will catch issues.
     }
  }


  function startObserver() {
    if (observer) return;
    console.log("Starting Image Fixer Observer");
    observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) { // Check if it's an element node
                        if (node.tagName === 'IMG') {
                            // console.log("Observed new IMG:", node.src); // Debugging
                            attachFixer(node);
                        } else if (node.querySelectorAll) {
                            // Check descendants if a container node was added
                            node.querySelectorAll('img').forEach(img => {
                                // console.log("Observed new IMG (descendant):", img.src); // Debugging
                                attachFixer(img);
                            });
                        }
                    }
                });
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial pass on existing images
    // console.log("Running initial image scan..."); // Debugging
    document.querySelectorAll('img').forEach(attachFixer);
  }

  function stopObserver() {
    if (!observer) return;
    console.log("Stopping Image Fixer Observer");
    observer.disconnect();
    observer = null;
    // Optional: Clean up dataset attributes if needed when stopping
    // document.querySelectorAll('img[data-auto-fix-attached]').forEach(img => {
    //    img.onerror = null; // Remove error handler
    //    delete img.dataset.autoFixAttached;
    //    delete img.dataset.fixing;
    // });
  }

  async function toggleActive(btn) {
    active = !active;
    if (active) {
      btn.textContent = '🖼️';
      btn.style.background = '#2ecc71'; // Green when ON
      startObserver();
    } else {
      btn.textContent = '🖼️';
      btn.style.background = '#e67e22'; // Orange when OFF
      stopObserver();
    }
  }

  function addButton() {
    const btn = document.createElement('button');
    btn.textContent = '🖼️';
    btn.title = 'Fix Broken Images';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '80px',
      left: '20px',
      width: '50px',
      height: '50px',
      zIndex: 10000,
      padding: '0',
      background: '#e67e22', // Initial state OFF color
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s ease, opacity 0.3s ease' // Smooth transition
    });
    btn.addEventListener('mouseenter', () => {btn.style.opacity = '0.9';});
    btn.addEventListener('mouseleave', () => {btn.style.opacity = '1';});
    btn.addEventListener('click', () => toggleActive(btn));
    document.body.appendChild(btn);
  }

  // Ensure DOM is ready before adding the button and potentially starting observer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
  } else {
    addButton();
  }
})();
