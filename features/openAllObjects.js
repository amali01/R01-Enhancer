(function () {
    'use strict';

    // Ensure the global namespace exists for feature registration
    window.RebootEnhancer = window.RebootEnhancer || {};
    window.RebootEnhancer.features = window.RebootEnhancer.features || {};

    // --- Self-Contained Utilities ---

    /**
     * Deep clones an object, handling circular references.
     * (Copied from utils.js for self-containment)
     * @param {object} obj - The object to clone.
     * @param {WeakMap} [seen=new WeakMap()] - Used internally to track seen objects for circular refs.
     * @returns {object} The cloned object.
     */
    function cloneObject(obj, seen = new WeakMap()) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (seen.has(obj)) {
            return seen.get(obj);
        }

        const clone = Array.isArray(obj) ? [] : {};
        seen.set(obj, clone);

        for (const key in obj) {
            // Use Object.prototype.hasOwnProperty.call for safer iteration
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clone[key] = cloneObject(obj[key], seen);
            }
        }
        return clone;
    }

    /**
     * Creates and displays a temporary notification message on the page.
     * (Copied from utils.js for self-containment)
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - 'info', 'success', 'warning', or 'error'.
     * @param {number} [duration=3000] - How long to display the message in milliseconds.
     */
    function showPageNotification(message, type = 'info', duration = 3000) {
        const notificationId = 'reboot-enhancer-notification-openall'; // Unique ID for this feature's notifications
        let existingNotification = document.getElementById(notificationId);
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.textContent = message;

        // Basic styling - assumes content_styles.css might provide base styles, but includes essentials
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px', // Adjusted position slightly if needed
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            zIndex: '2147483647', // Max z-index
            fontSize: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', // Ensure font
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'opacity 0.5s ease-in-out, bottom 0.5s ease-in-out',
            opacity: '0' // Start transparent for fade-in
        });

        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#2ecc71'; // Green
                break;
            case 'warning':
                notification.style.backgroundColor = '#f39c12'; // Orange
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c'; // Red
                break;
            case 'info':
            default:
                notification.style.backgroundColor = '#3498db'; // Blue
                break;
        }

        // Ensure body exists before appending
        if (document.body) {
             document.body.appendChild(notification);
        } else {
            // Fallback if body isn't ready (less likely for document_idle scripts)
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(notification));
        }


        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.bottom = '30px';
        }, 50);

        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.bottom = '20px';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 500); // Wait for fade out transition
        }, duration);
    }

    // Function to inject and execute code in the page context
    function injectAndExecuteCode(code) {
        const script = document.createElement('script');
        script.textContent = code;
        document.documentElement.appendChild(script);
        script.remove();
    }
    
    // Function to check if window.db exists in the page context
    function checkForWindowDb() {
        return new Promise(resolve => {
            // Create a unique callback name
            const callbackName = 'checkDbCallback_' + Math.floor(Math.random() * 1000000);
            
            // Create a listener for the response
            window.addEventListener(callbackName, function handler(event) {
                window.removeEventListener(callbackName, handler);
                resolve(event.detail);
            }, { once: true });
            
            // Inject code that checks for window.db and dispatches an event with the result
            injectAndExecuteCode(`
                (function() {
                    const hasDb = typeof window.db !== 'undefined' && 
                                 window.db !== null && 
                                 typeof window.db.object !== 'undefined' &&
                                 window.db.object !== null &&
                                 typeof window.db.object.children !== 'undefined';
                    
                    window.dispatchEvent(new CustomEvent('${callbackName}', { 
                        detail: hasDb
                    }));
                })();
            `);
        });
    }

    // Add a styled button (simplified from your working code)
    function addStyledButton() {
        // First check if button already exists
        if (document.getElementById('reboot-enhancer-openall-btn')) {
            return; // Button already exists
        }
        
        const btn = document.createElement('button');
        btn.id = 'reboot-enhancer-openall-btn';
        btn.textContent = '🚪';
        btn.title = 'Open All Projects'; // Show text on hover

        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '50px',
            height: '50px',
            zIndex: '9999',
            padding: '0',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        });

        btn.addEventListener('click', directUpdateDb);
        document.body.appendChild(btn);
        console.log("OpenAllObjects: Button added to page");
    }

    // Direct DB update using code injection to access page context
    function directUpdateDb() {
        console.log('OpenAllObjects: Direct DB update execution');
        
        // Create a unique callback name for this update
        const updateCallbackName = 'dbUpdate_' + Math.floor(Math.random() * 1000000);
        
        // Listen for the result of the update
        window.addEventListener(updateCallbackName, function handler(event) {
            window.removeEventListener(updateCallbackName, handler);
            
            if (event.detail.success) {
                console.log(`OpenAllObjects: Successfully updated ${event.detail.count} objects`);
                showPageNotification(`Unlocked ${event.detail.count} objects successfully! Refresh may be needed.`, "success", 4000);
            } else {
                console.error("OpenAllObjects: Error in direct update:", event.detail.error);
                showPageNotification("Error updating objects: " + event.detail.error, "error");
            }
        }, { once: true });
        
        // Inject code that performs the update in the page context
        injectAndExecuteCode(`
            (function() {
                try {
                    if (!window.db?.object?.children) {
                        window.dispatchEvent(new CustomEvent('${updateCallbackName}', { 
                            detail: { 
                                success: false, 
                                error: "window.db.object.children not found" 
                            }
                        }));
                        return;
                    }
                    
                    // Clone function (simplified for injection)
                    function cloneObject(obj) {
                        if (obj === null || typeof obj !== "object") return obj;
                        const clone = Array.isArray(obj) ? [] : {};
                        for (const key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                                clone[key] = (obj[key] === null || typeof obj[key] !== "object") ? 
                                    obj[key] : cloneObject(obj[key]);
                            }
                        }
                        return clone;
                    }
                    
                    // Update status
                    let updateCount = 0;
                    for (const key in window.db.object.children) {
                        if (Object.prototype.hasOwnProperty.call(window.db.object.children, key)) {
                            const child = window.db.object.children[key];
                            if (child.attrs && (child.attrs.status === "blocked" || child.attrs.status === "available")) {
                                const clonedAttrs = cloneObject(child.attrs);
                                clonedAttrs.status = "available";
                                clonedAttrs.hasStarted = true;
                                clonedAttrs.inScope = true;
                                window.db.object.children[key].attrs = clonedAttrs;
                                updateCount++;
                            }
                        }
                    }
                    
                    // Update start attribute
                    if (window.db.object.attrs) {
                        window.db.object.attrs.start = 0;
                    }
                    
                    // Report success
                    window.dispatchEvent(new CustomEvent('${updateCallbackName}', { 
                        detail: { success: true, count: updateCount }
                    }));
                } catch (error) {
                    // Report error
                    window.dispatchEvent(new CustomEvent('${updateCallbackName}', { 
                        detail: { success: false, error: error.toString() }
                    }));
                }
            })();
        `);
    }

    // Feature definition
    const feature = {
        id: 'openAllObjects',
        name: 'Open All Objects',
        checkInterval: null, // Will store interval ID

        // Check for window.db periodically and add button when found
        startChecking: async function() {
            console.log("OpenAllObjects: Starting periodic checks for window.db");
            
            // Clear any existing interval
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }
            
            // Initial check
            const hasDb = await checkForWindowDb();
            if (hasDb) {
                console.log("OpenAllObjects: window.db found immediately");
                if (document.body) addStyledButton();
                return;
            }
            
            // Create an interval to check for window.db
            this.checkInterval = setInterval(async () => {
                const hasDb = await checkForWindowDb();
                if (hasDb) {
                    console.log("OpenAllObjects: window.db found during periodic check");
                    clearInterval(this.checkInterval);
                    
                    // Add button if document.body exists
                    if (document.body) {
                        addStyledButton();
                    } else {
                        // Wait for body if needed
                        const bodyWait = setInterval(() => {
                            if (document.body) {
                                clearInterval(bodyWait);
                                addStyledButton();
                            }
                        }, 500);
                    }
                }
            }, 2000); // Check every 2 seconds
        },

        // Main run function - initialize extension
        run: async function() {
            console.log("OpenAllObjects: Feature initializing");
            
            // Try to add button immediately if body exists
            if (document.body) {
                addStyledButton();
            }
            
            // Start periodic checks for window.db
            this.startChecking();
            
            // Set up multiple load event handlers for different load stages
            document.addEventListener('DOMContentLoaded', () => {
                console.log("OpenAllObjects: DOMContentLoaded triggered");
                if (document.body) addStyledButton();
            });
            
            window.addEventListener('load', () => {
                console.log("OpenAllObjects: Window load triggered");
                if (document.body) addStyledButton();
                this.startChecking(); // Re-check after load
            });
            
            // Handle page visibility changes (useful when tab was inactive)
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && document.body) {
                    addStyledButton(); // Re-add button when page becomes visible
                    this.startChecking(); // Re-check after becoming visible
                }
            });
        }
    };

    // Register the feature
    window.RebootEnhancer.features[feature.id] = feature;
    console.log(`Reboot01 Enhancer: ${feature.name} feature loaded (Self-Contained).`);
    
    // Auto-run immediately
    feature.run();
})();
