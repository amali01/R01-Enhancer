const browser = window?.browser || window?.chrome;

async function main() {
    var activeTab = null;
    /**
     * The active URL retrieved from the browser tabs.
     * @type {URL}
     */
    var activeUrl = null;

    /**
     * @type {HTMLButtonElement}
     */
    const btn = document.getElementById("acceptAll");

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    activeTab = tabs[0];
    activeUrl = new URL(activeTab.url);
    if (activeTab === null) {
        console.error("No active tab found, click to reload");
        btn.textContent = "No active tab found";
        return;
    }

    if (activeUrl.hostname !== "learn.reboot01.com") {
        console.error("Not on Reboot01");
        btn.textContent = "Not on Reboot01, click to reload";
        return;
    }

    if (!activeUrl.pathname.startsWith('/intra/bahrain/bh-module/')) {
        console.error("Not on a project page");
        btn.textContent = "Not on a project page, click to reload";
        return;
    }
    if (!activeUrl.searchParams.has('audit')) {
        console.error("No audit parameter found");
        btn.textContent = "No audit parameter found, click to reload";
        return;
    }


    btn.textContent = "Accept all";
    btn.onclick = async () => {
        browser.scripting.executeScript({
            target: { tabId: activeTab.id, allFrames: true },
            func: () => {
                const radioButtons = document.querySelectorAll("input[type=radio][id$='yes']");
                radioButtons.forEach(i => i.click());
                // Try to click the 'Submit Audit' button after clicking all YES radio buttons
                const buttons = document.querySelectorAll('button');
                let submitButton = null;
                buttons.forEach(btn => {
                    if (btn.textContent.trim() === 'Submit Audit') {
                        submitButton = btn;
                    }
                });
                if (submitButton) {
                    setTimeout(() => submitButton.click(), 100);
                }
                // Visual feedback
                const feedback = document.createElement('div');
                feedback.style.position = 'fixed';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.background = 'rgba(0, 128, 0, 0.8)';
                feedback.style.color = 'white';
                feedback.style.padding = '20px';
                feedback.style.borderRadius = '10px';
                feedback.style.zIndex = '10000';
                feedback.style.fontSize = '18px';
                feedback.textContent = 'Clicked ' + radioButtons.length + ' YES buttons and submitted!';
                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 2000);
            }
        });
    }

    // Inject a button into the web page
    browser.scripting.executeScript({
        target: { tabId: activeTab.id, allFrames: true },
        func: () => {
            const pageButton = document.createElement('button');
            pageButton.textContent = "Accept All";
            pageButton.style.position = 'fixed';
            pageButton.style.bottom = '20px';
            pageButton.style.right = '20px';
            pageButton.style.zIndex = '10000';
            pageButton.style.padding = '10px';
            pageButton.style.background = '#4CAF50';
            pageButton.style.color = 'white';
            pageButton.style.border = 'none';
            pageButton.style.borderRadius = '5px';
            pageButton.style.cursor = 'pointer';
            pageButton.onclick = () => {
                const radioButtons = document.querySelectorAll("input[type=radio][id$='yes']");
                radioButtons.forEach(i => i.click());
                // Try to click the 'Submit Audit' button after clicking all YES radio buttons
                const buttons = document.querySelectorAll('button');
                let submitButton = null;
                buttons.forEach(btn => {
                    if (btn.textContent.trim() === 'Submit Audit') {
                        submitButton = btn;
                    }
                });
                if (submitButton) {
                    setTimeout(() => submitButton.click(), 100);
                }
                // Visual feedback
                const feedback = document.createElement('div');
                feedback.style.position = 'fixed';
                feedback.style.top = '50%';
                feedback.style.left = '50%';
                feedback.style.transform = 'translate(-50%, -50%)';
                feedback.style.background = 'rgba(0, 128, 0, 0.8)';
                feedback.style.color = 'white';
                feedback.style.padding = '20px';
                feedback.style.borderRadius = '10px';
                feedback.style.zIndex = '10000';
                feedback.style.fontSize = '18px';
                feedback.textContent = 'Clicked ' + radioButtons.length + ' YES buttons and submitted!';
                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 2000);
            };
            document.body.appendChild(pageButton);
        }
    });
}

main();
