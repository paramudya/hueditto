const outputArea = document.getElementById('output');
const statusDiv = document.getElementById('status');

const copyButton = document.getElementById('copyButton');
const copyIcon = copyButton.querySelector('.copy-icon');
const checkIcon = copyButton.querySelector('.check-icon');

copyButton.addEventListener('click', async () => {
    try {
        const textToCopy = outputArea.textContent;
        await navigator.clipboard.writeText(textToCopy);
        
        // Hide copy icon, show check icon
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        console.error('Copy failed:', error);
        updateStatus('Failed to copy text', true);
    }
});

// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.circular-button');
    const statusDiv = document.getElementById('status');

    const API_URL = 'http://127.0.0.1:5000/fix';

    const updateStatus = (message, isError) => {
        statusDiv.textContent = message;
        statusDiv.style.color = isError ? 'red' : 'green';
    };

    const resetButton = () => {
        button.className = 'circular-button';
    };

        // Function to send text to server
        async function processTextWithServer(text, error) {
        const response = await fetch('http://localhost:5000/fix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: text,
                error: error
            })
        });
    
        if (!response.ok) {
            throw new Error('Server processing failed');
        }
    
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Unknown error');
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
                const { text, error } = results[0].result;
                
                updateStatus('Sending to server...', false);
                
                // Process both text and error if they exist
                let contentToProcess = text || '';
                if (error) {
                    contentToProcess += '\n\nError Message:\n' + error;
                }
                
                const processedText = await processTextWithServer(contentToProcess);
                displayFormattedSQL(processedText);
    
                updateStatus('Done!', false);
                button.classList.add('success');
            } else {
                updateStatus('No content found', true);
                button.classList.add('error');
            }
        } catch (error) {
            console.error('Error:', error);
            updateStatus(error.message, true);
            button.classList.add('error');
        }
    });
});

function displayFormattedSQL(sql) {
    const codeElement = document.createElement("code");
    codeElement.className = "language-sql";
    
    // Split by newlines and preserve indentation
    const lines = sql.split('\n');
    const formattedLines = lines.map(line => {
        // Use SQLHighlighter for each line
        return SQLHighlighter.highlight(line);
    });

    // Join with actual line breaks instead of <br>
    const preElement = document.createElement("pre");
    preElement.innerHTML = formattedLines.join('\n');
    codeElement.appendChild(preElement);

    outputArea.innerHTML = '';
    outputArea.appendChild(codeElement);
}

function findTextElement() {
    // Find the text content
    const allDivs = Array.from(document.getElementsByTagName('div'));
    
    const targetDiv = allDivs.find(div => {
        const hasAceLayer = div.classList.contains('ace_layer');
        const hasTextLayer = div.classList.contains('ace_text-layer');
        const hasText = div.textContent.trim() !== '';
        
        return hasAceLayer && hasTextLayer && hasText;
    });
    
    // Find the error message
    const errorElement = document.querySelector('li[data-bind="text: message"]');
    const errorMessage = errorElement ? errorElement.textContent.trim() : null;
    
    // Return both text and error
    return {
        text: targetDiv ? Array.from(targetDiv.querySelectorAll('.ace_line'))
            .map(line => line.textContent)
            .filter(text => text !== undefined)
            .join('\n') : null,
        error: errorMessage
    };
}