chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'processText') {
        // Save to temp.txt
        const textEncoder = new TextEncoder();
        const encodedText = textEncoder.encode(request.text);
        
        // Use FileSystem API to write file
        chrome.runtime.getPackageDirectoryEntry(async (root) => {
            root.getFile('temp.txt', { create: true }, async (fileEntry) => {
                const writer = await fileEntry.createWriter();
                writer.write(new Blob([encodedText]));
                
                // Run Python script through native messaging
                chrome.runtime.sendNativeMessage(
                    'com.text_processor',
                    { command: 'process' },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            sendResponse({ success: false, error: chrome.runtime.lastError });
                            return;
                        }
                        
                        // Read processed file
                        fileEntry.file((file) => {
                            const reader = new FileReader();
                            reader.onloadend = function(e) {
                                sendResponse({ 
                                    success: true, 
                                    processedText: this.result 
                                });
                            };
                            reader.readAsText(file);
                        });
                    }
                );
            });
        });
        return true; // Will respond asynchronously
    }
});