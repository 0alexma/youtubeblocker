let overlay = null;
let mathAnswer = 0;

// automatic hide shorts and sidebar
function hideDistractions() {
    // shorts
    const shortsShelf = document.querySelector('ytd-rich-shelf-renderer');
    if (shortsShelf && shortsShelf.textContent.includes('Shorts')) {
        shortsShelf.style.display = 'none';
    }
    
    // sidebar
    const sidebar = document.querySelector('#secondary');
    if (sidebar) {
        sidebar.style.display = 'none';
    }
    
    // shorts
    const shortsLink = document.querySelector('a[href="/shorts"]');
    if (shortsLink) {
        shortsLink.style.display = 'none';
    }
}
// math problem generator
function generateMathProblem() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    switch(operation) {
        case '+':
            mathAnswer = num1 + num2;
            break;
        case '-':
            mathAnswer = num1 - num2;
            break;
        case '*':
            mathAnswer = num1 * num2;
            break;
    }
    
    return `${num1} ${operation} ${num2}`;
}

// focus overlay
function createOverlay() {
    if (overlay) return;
    
    const mathProblem = generateMathProblem();
    
    overlay = document.createElement('div');
    overlay.innerHTML = `
        <div style="text-align: center; max-width: 400px;">
            <h1 style="margin-bottom: 30px; color: #ff4444;">🔒 FOCUS MODE ACTIVE</h1>
            <p style="font-size: 1.2rem; margin-bottom: 30px;">
                To continue browsing YouTube, solve this math problem:
            </p>
            <div style="font-size: 2.5rem; margin: 30px 0; color: #ffff44; font-weight: bold;">
                ${mathProblem} = ?
            </div>
            <input type="number" id="mathInput" style="
                padding: 15px; 
                font-size: 1.5rem; 
                width: 200px; 
                text-align: center; 
                border: 3px solid #555; 
                border-radius: 10px;
                background: #222;
                color: white;
                margin-right: 10px;
            " placeholder="Answer">
            <button id="submitAnswer" style="
                padding: 15px 25px; 
                font-size: 1.2rem; 
                background: #44ff44; 
                color: black; 
                border: none; 
                border-radius: 10px; 
                cursor: pointer;
                font-weight: bold;
            ">Submit</button>
            <div id="errorMsg" style="color: #ff4444; margin-top: 20px; font-size: 1.1rem;"></div>
        </div>
    `;
    
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        z-index: 999999;
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    const input = overlay.querySelector('#mathInput');
    const button = overlay.querySelector('#submitAnswer');
    const errorMsg = overlay.querySelector('#errorMsg');
    
    function checkAnswer() {
        const userAnswer = parseInt(input.value);
        if (userAnswer === mathAnswer) {
            chrome.storage.local.set({focusMode: false});
            overlay.remove();
            overlay = null;
            document.body.style.overflow = '';
        } else {
            errorMsg.textContent = 'Incorrect! Try again.';
            input.value = '';
            input.focus();
        }
    }
    
    button.onclick = checkAnswer;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') checkAnswer();
    };
    
    setTimeout(() => input.focus(), 100);
}


chrome.storage.local.get(['focusMode'], (result) => {
    if (result.focusMode) {
        setTimeout(createOverlay, 1000); 
    }
});

// watch for mutations
new MutationObserver(hideDistractions).observe(document.body, {
    childList: true,
    subtree: true
});


chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggle') {
        chrome.storage.local.get(['focusMode'], (result) => {
            const newState = !result.focusMode;
            chrome.storage.local.set({focusMode: newState});
            
            if (newState) {
                createOverlay();
            } else if (overlay) {
                overlay.remove();
                overlay = null;
                document.body.style.overflow = '';
            }
        });
    }
});