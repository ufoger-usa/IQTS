// Alpaca Modal Fix Script
// This script fixes the missing modal issue by dynamically creating it if it doesn't exist

document.addEventListener('DOMContentLoaded', function() {
    // Check if the alpaca modal already exists
    if (!document.getElementById('alpaca-modal')) {
        console.log('Alpaca modal not found, creating dynamically...');
        
        // Create the modal structure
        const modalHtml = `
        <div id="alpaca-modal" class="modal-wrapper" style="display: none;">
            <div class="modal-content" style="max-width: 500px; padding: 20px;">
                <div class="modal-header">
                    <h2>Connect to Alpaca</h2>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-tabs">
                    <div class="modal-tab active" data-tab="paper">Paper Trading</div>
                    <div class="modal-tab" data-tab="live">Live Trading</div>
                </div>
                <div class="modal-tab-content active" id="paper-tab">
                    <div class="form-group">
                        <label for="paper-key">API Key ID</label>
                        <input type="text" id="paper-key" placeholder="Enter your paper trading API key">
                    </div>
                    <div class="form-group">
                        <label for="paper-secret">Secret Key</label>
                        <input type="password" id="paper-secret" placeholder="Enter your paper trading secret key">
                    </div>
                    <button id="connect-paper" class="btn" style="width: 100%; background-color: #3498db;">Connect Paper Account</button>
                </div>
                <div class="modal-tab-content" id="live-tab">
                    <div class="form-group">
                        <label for="live-key">API Key ID</label>
                        <input type="text" id="live-key" placeholder="Enter your live trading API key">
                    </div>
                    <div class="form-group">
                        <label for="live-secret">Secret Key</label>
                        <input type="password" id="live-secret" placeholder="Enter your live trading secret key">
                    </div>
                    <div class="warning-box" style="background-color: #ffdddd; border-left: 5px solid #e74c3c; padding: 10px; margin: 15px 0;">
                        <strong>Warning:</strong> Live trading uses real money. Only proceed if you understand the risks.
                    </div>
                    <button id="connect-live" class="btn" style="width: 100%; background-color: #e74c3c; color: white;">Connect Live Account</button>
                </div>
            </div>
        </div>`;
        
        // Add the modal to the body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add event listeners for the modal
        const alpacaModal = document.getElementById('alpaca-modal');
        
        // Close button
        const closeBtn = alpacaModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                alpacaModal.style.display = 'none';
            });
        }
        
        // Close on background click
        window.addEventListener('click', function(e) {
            if (e.target === alpacaModal) {
                alpacaModal.style.display = 'none';
            }
        });
        
        // Tab switching
        const modalTabs = alpacaModal.querySelectorAll('.modal-tab');
        modalTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                modalTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Update content visibility
                const allContent = alpacaModal.querySelectorAll('.modal-tab-content');
                allContent.forEach(c => c.classList.remove('active'));
                
                // Show the relevant content
                const tabContentId = `${tab.getAttribute('data-tab')}-tab`;
                document.getElementById(tabContentId).classList.add('active');
            });
        });
        
        // Connect buttons
        const connectPaperBtn = document.getElementById('connect-paper');
        const connectLiveBtn = document.getElementById('connect-live');
        
        if (connectPaperBtn) {
            connectPaperBtn.addEventListener('click', function() {
                const key = document.getElementById('paper-key').value.trim();
                const secret = document.getElementById('paper-secret').value.trim();
                
                if (key && secret && typeof window.connectAlpaca === 'function') {
                    window.connectAlpaca('paper', key, secret);
                } else {
                    alert('Please enter valid API keys');
                }
            });
        }
        
        if (connectLiveBtn) {
            connectLiveBtn.addEventListener('click', function() {
                const key = document.getElementById('live-key').value.trim();
                const secret = document.getElementById('live-secret').value.trim();
                
                if (!confirm('WARNING: You are about to connect LIVE trading with REAL money. Are you absolutely sure?')) {
                    return;
                }
                
                if (key && secret && typeof window.connectAlpaca === 'function') {
                    window.connectAlpaca('live', key, secret);
                } else {
                    alert('Please enter valid API keys');
                }
            });
        }
        
        console.log('Alpaca modal created successfully');
    }
});
