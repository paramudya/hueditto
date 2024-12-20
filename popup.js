
// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.circular-button');
    const statusDiv = document.getElementById('status');
    const outputArea = document.getElementById('output');

    const API_URL = 'https://your-server.com/process';  // Replace with your API endpoint

    const updateStatus = (message, isError) => {
        statusDiv.textContent = message;
        statusDiv.style.color = isError ? 'red' : 'green';
    };

    const resetButton = () => {
        button.className = 'circular-button';
    };

    // Function to send text to server
    async function processTextWithServer(text) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Processing failed');
        }

        return data.result;
    }

    button.addEventListener('click', async () => {
        resetButton();
        
        try {
            updateStatus('Getting text...', false);
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: findTextElement,
            });

            if (results && results[0] && results[0].result) {
                updateStatus('Sending to server...', false);
                const processedText = await processTextWithServer(results[0].result);
                
                outputArea.value = processedText;
                updateStatus('Done!', false);
                button.classList.add('success');
            } else {
                updateStatus('No text found', true);
                button.classList.add('error');
            }
        } catch (error) {
            console.error('Error:', error);
            updateStatus(error.message, true);
            button.classList.add('error');
        }
    });
});

function findTextElement() {
    const allDivs = Array.from(document.getElementsByTagName('div'));
    
    const targetDiv = allDivs.find(div => {
        const hasAceLayer = div.classList.contains('ace_layer');
        const hasTextLayer = div.classList.contains('ace_text-layer');
        const hasText = div.textContent.trim() !== '';
        
        return hasAceLayer && hasTextLayer && hasText;
    });
    
    if (targetDiv) {
        const lines = targetDiv.querySelectorAll('.ace_line');
        const textLines = Array.from(lines)
            .map(line => line.textContent)
            .filter(text => text !== undefined);
            
        return textLines.join('\n');
    }
    return null;
}