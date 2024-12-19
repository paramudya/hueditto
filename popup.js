
document.getElementById('readText').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: findTextElement
    });

    if (result[0].result) {
        document.getElementById('output').value = result[0].result;
    } else {
        document.getElementById('output').value = 'No matching text element found';
    }
});

function findTextElement() {
    const allDivs = Array.from(document.getElementsByTagName('div'));
    
    const targetDiv = allDivs.find(div => 
        div.classList.contains('ace_layer') && 
        div.classList.contains('ace_text-layer') && 
        div.textContent.trim() !== ''
    );
    
    if (targetDiv) {
        const lines = targetDiv.querySelectorAll('.ace_line');
        const textLines = Array.from(lines)
            .map(line => line.textContent.trim())
            .filter(text => text !== '');
        return textLines.join('\n');
    }
    return null;
}