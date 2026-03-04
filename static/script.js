// DOM Elements
const textInput = document.getElementById('text-input');
const qrColorInput = document.getElementById('qr-color');
const bgColorInput = document.getElementById('bg-color');
const errorCorrectionSelect = document.getElementById('error-correction');
const boxSizeSlider = document.getElementById('box-size');
const borderSlider = document.getElementById('border');
const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const previewContainer = document.getElementById('preview-container');
const downloadSection = document.getElementById('download-section');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const toast = document.getElementById('toast');
const charCount = document.getElementById('char-count');

// Color value displays
const qrColorValue = document.getElementById('qr-color-value');
const bgColorValue = document.getElementById('bg-color-value');
const boxSizeValue = document.getElementById('box-size-value');
const borderValue = document.getElementById('border-value');
const previewInfoText = document.getElementById('preview-info-text');

let currentQRImage = null;
let selectedFormat = 'png';

// Update character count
textInput.addEventListener('input', (e) => {
    charCount.textContent = e.target.value.length;
});

// Update color value displays
qrColorInput.addEventListener('change', (e) => {
    qrColorValue.textContent = e.target.value.toUpperCase();
});

bgColorInput.addEventListener('change', (e) => {
    bgColorValue.textContent = e.target.value.toUpperCase();
});

// Update slider value displays
boxSizeSlider.addEventListener('input', (e) => {
    boxSizeValue.textContent = e.target.value;
});

borderSlider.addEventListener('input', (e) => {
    borderValue.textContent = e.target.value;
});

// Format selection
document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('.format-btn').classList.add('active');
        selectedFormat = e.target.closest('.format-btn').dataset.format;
    });
});

// Generate QR Code
generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();

    if (!text) {
        showToast('Please enter text or URL', 'error');
        return;
    }

    if (text.length > 2953) {
        showToast('Text is too long (max 2953 characters)', 'error');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                qr_color: qrColorInput.value,
                bg_color: bgColorInput.value,
                error_correction: errorCorrectionSelect.value,
                box_size: boxSizeSlider.value,
                border: borderSlider.value,
            }),
        });

        const data = await response.json();

        if (data.success) {
            currentQRImage = data.image;
            displayQRPreview(data.image);
            downloadSection.style.display = 'block';
            copyBtn.style.display = 'flex';
            saveBtn.style.display = 'flex';
            showToast('QR Code generated successfully!');
            previewInfoText.textContent = `Generated for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
        } else {
            showToast('Error generating QR code: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generate QR Code';
    }
});

// Display QR Preview
function displayQRPreview(imageSrc) {
    previewContainer.innerHTML = `<img src="${imageSrc}" alt="Generated QR Code" />`;
}

// Download QR Code
downloadBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();

    if (!text) {
        showToast('Please generate a QR code first', 'error');
        return;
    }

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span class="btn-icon">⏳</span> Downloading...';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                qr_color: qrColorInput.value,
                bg_color: bgColorInput.value,
                error_correction: errorCorrectionSelect.value,
                box_size: boxSizeSlider.value,
                border: borderSlider.value,
                format: selectedFormat,
            }),
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr_code_${Date.now()}.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast(`QR Code downloaded as ${selectedFormat.toUpperCase()}!`);
    } catch (error) {
        showToast('Error downloading QR code: ' + error.message, 'error');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<span class="btn-icon">⬇️</span> Download';
    }
});

// Copy to Clipboard
copyBtn.addEventListener('click', async () => {
    if (!currentQRImage) {
        showToast('Please generate a QR code first', 'error');
        return;
    }

    try {
        const blob = await fetch(currentQRImage).then(r => r.blob());
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('QR Code copied to clipboard!');
    } catch (error) {
        showToast('Error copying to clipboard', 'error');
    }
});

// Save Locally (browser storage)
saveBtn.addEventListener('click', () => {
    if (!currentQRImage) {
        showToast('Please generate a QR code first', 'error');
        return;
    }

    try {
        const saved = JSON.parse(localStorage.getItem('savedQRCodes') || '[]');
        saved.push({
            id: Date.now(),
            text: textInput.value,
            image: currentQRImage,
            timestamp: new Date().toLocaleString(),
            settings: {
                qrColor: qrColorInput.value,
                bgColor: bgColorInput.value,
                errorCorrection: errorCorrectionSelect.value,
                boxSize: boxSizeSlider.value,
                border: borderSlider.value,
            }
        });

        if (saved.length > 20) {
            saved.shift(); // Keep only last 20
        }

        localStorage.setItem('savedQRCodes', JSON.stringify(saved));
        showToast('QR Code saved locally!');
    } catch (error) {
        showToast('Error saving QR code', 'error');
    }
});

// Reset Form
resetBtn.addEventListener('click', () => {
    textInput.value = '';
    qrColorInput.value = '#000000';
    bgColorInput.value = '#FFFFFF';
    errorCorrectionSelect.value = 'M';
    boxSizeSlider.value = 10;
    borderSlider.value = 5;
    
    charCount.textContent = '0';
    qrColorValue.textContent = '#000000';
    bgColorValue.textContent = '#FFFFFF';
    boxSizeValue.textContent = '10';
    borderValue.textContent = '5';
    
    previewContainer.innerHTML = `
        <div class="preview-placeholder">
            <span class="placeholder-icon">📱</span>
            <p>Your QR code will appear here</p>
        </div>
    `;
    
    downloadSection.style.display = 'none';
    copyBtn.style.display = 'none';
    saveBtn.style.display = 'none';
    currentQRImage = null;
    previewInfoText.textContent = 'Enter text and click Generate';
    
    showToast('Form cleared!');
    textInput.focus();
});

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateBtn.click();
    }
});

// Auto-update on color/setting changes
qrColorInput.addEventListener('input', (e) => {
    qrColorValue.textContent = e.target.value.toUpperCase();
});

bgColorInput.addEventListener('input', (e) => {
    bgColorValue.textContent = e.target.value.toUpperCase();
});

// Focus on text input on load
window.addEventListener('load', () => {
    textInput.focus();
});

// Prevent form submission
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
});
