chrome.storage.local.get(['focusMode'], (result) => {
    const button = document.getElementById('focusBtn');
    button.textContent = result.focusMode ? 'Disable Focus' : 'Enable Focus';
});

document.getElementById('focusBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle'});
    });
    
    window.close();
});