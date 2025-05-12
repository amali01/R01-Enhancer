
(function () {
    'use strict';

    console.log('Fixed Vanilla JS Radio Button Clicker loaded');

    // Function to click all YES radio buttons
    function clickAllYesButtons() {
        console.log('Attempting to click all YES radio buttons');
        const radioButtons = document.querySelectorAll('input[type="radio"][data-test="YES"]');
        console.log('Found ' + radioButtons.length + ' YES radio buttons');

        if (radioButtons.length > 0) {
            radioButtons.forEach(function(radio) {
                console.log('Clicking YES radio button:', radio);
                radio.click();
            });

            // Try to click the "Submit Audit" button after radio buttons are clicked
           // const submitButton = document.querySelector('button > div:contains("Submit Audit")')?.parentElement;
            const buttons = document.querySelectorAll('button');
            let submitButton = null;
            buttons.forEach(btn => {
                if (btn.textContent.trim() === 'Submit Audit') {
                    submitButton = btn;
                }
            });
            if (submitButton) {
                console.log('Found Submit Audit button. Clicking it now...');
                setTimeout(() => submitButton.click(), 100); // small delay to ensure radios are processed
            } else {
                console.log('Submit Audit button not found!');
            }

            // Visual feedback
            const clickIndicator = document.createElement('div');
            clickIndicator.style.position = 'fixed';
            clickIndicator.style.top = '50%';
            clickIndicator.style.left = '50%';
            clickIndicator.style.transform = 'translate(-50%, -50%)';
            clickIndicator.style.background = 'rgba(0, 128, 0, 0.8)';
            clickIndicator.style.color = 'white';
            clickIndicator.style.padding = '20px';
            clickIndicator.style.borderRadius = '10px';
            clickIndicator.style.zIndex = '10000';
            clickIndicator.style.fontSize = '18px';
            clickIndicator.textContent = 'Clicked ' + radioButtons.length + ' YES buttons and submitted!';

            document.body.appendChild(clickIndicator);

            setTimeout(function() {
                clickIndicator.remove();
            }, 2000);

            return true;
        } else {
            console.log('No YES radio buttons found');

            const notFoundIndicator = document.createElement('div');
            notFoundIndicator.style.position = 'fixed';
            notFoundIndicator.style.top = '50%';
            notFoundIndicator.style.left = '50%';
            notFoundIndicator.style.transform = 'translate(-50%, -50%)';
            notFoundIndicator.style.background = 'rgba(255, 0, 0, 0.8)';
            notFoundIndicator.style.color = 'white';
            notFoundIndicator.style.padding = '20px';
            notFoundIndicator.style.borderRadius = '10px';
            notFoundIndicator.style.zIndex = '10000';
            notFoundIndicator.style.fontSize = '18px';
            notFoundIndicator.textContent = 'No YES radio buttons found!';

            document.body.appendChild(notFoundIndicator);

            setTimeout(function() {
                notFoundIndicator.remove();
            }, 2000);

            return false;
        }
    }


    // Add a clickable button (always reliable even if keyboard shortcuts fail)
    function addClickableButton() {
        const button = document.createElement('button');
        button.textContent = '✅ Select All YES';
        button.style.position = 'fixed';
        button.style.bottom = '120px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px';
        button.style.background = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', function() {
            clickAllYesButtons();
        });

        document.body.appendChild(button);
    }

    // Initialize everything once the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addClickableButton();
        });
    } else {
        // DOM is already ready
        addClickableButton();
    }

    // Also try at window load
    window.addEventListener('load', function() {
        console.log('Window loaded, ensuring listeners are set up');
    });
})();