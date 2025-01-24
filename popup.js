// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const cvFileInput = document.getElementById('cvFile');
    const fileInfo = document.getElementById('fileInfo');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fillBtn = document.getElementById('fillBtn');
    const status = document.getElementById('status');

    // Handle file upload via click
    uploadArea.addEventListener('click', () => {
        cvFileInput.click();
    });

    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-500', 'bg-blue-50');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
        
        const file = e.dataTransfer.files[0];
        if (isValidFile(file)) {
            handleFile(file);
        }
    });

    // Handle file selection
    cvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (isValidFile(file)) {
            handleFile(file);
        }
    });

    // Handle analyze button click
    analyzeBtn.addEventListener('click', async () => {
        setStatus('Analyzing page...', 'info');
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });
            
            if (response.success) {
                setStatus('Page analyzed successfully!', 'success');
                fillBtn.disabled = false;
                fillBtn.classList.remove('bg-gray-300');
                fillBtn.classList.add('bg-green-600');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            setStatus('Failed to analyze page: ' + error.message, 'error');
        }
    });

    // Handle fill button click
    fillBtn.addEventListener('click', async () => {
        setStatus('Filling form...', 'info');
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
            
            if (response.success) {
                setStatus('Form filled successfully!', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            setStatus('Failed to fill form: ' + error.message, 'error');
        }
    });

    // Helper functions
    function isValidFile(file) {
        const validTypes = ['.pdf', '.doc', '.docx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            setStatus('Please upload a PDF or Word document', 'error');
            return false;
        }
        return true;
    }

    function handleFile(file) {
        // Update UI
        fileInfo.classList.remove('hidden');
        fileInfo.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>${file.name}</span>
            </div>
        `;
        
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('bg-gray-300');
        analyzeBtn.classList.add('bg-blue-600');
        
        // Store file in extension storage
        const reader = new FileReader();
        reader.onload = (e) => {
            chrome.storage.local.set({
                cvFile: {
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                }
            }, () => {
                setStatus('CV uploaded successfully!', 'success');
            });
        };
        reader.readAsDataURL(file);
    }

    function setStatus(message, type) {
        status.classList.remove('hidden');
        
        // Remove all possible status classes
        status.classList.remove(
            'bg-blue-100', 'text-blue-800',
            'bg-green-100', 'text-green-800',
            'bg-red-100', 'text-red-800'
        );
        
        // Add appropriate classes based on type
        switch(type) {
            case 'info':
                status.classList.add('bg-blue-100', 'text-blue-800');
                break;
            case 'success':
                status.classList.add('bg-green-100', 'text-green-800');
                break;
            case 'error':
                status.classList.add('bg-red-100', 'text-red-800');
                break;
        }
        
        status.textContent = message;
        
        if (type !== 'info') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
        }
    }
});