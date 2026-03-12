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

let currentQRImage = null;

generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();

    if (!text) {
        alert('Please enter text or URL');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

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
            previewContainer.innerHTML = `<img src="${data.image}" alt="QR Code" style="max-width: 100%;" />`;
            downloadSection.style.display = 'block';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate QR Code';
    }
});

resetBtn.addEventListener('click', () => {
    textInput.value = '';
    qrColorInput.value = '#000000';
    bgColorInput.value = '#FFFFFF';
    errorCorrectionSelect.value = 'M';
    boxSizeSlider.value = 10;
    borderSlider.value = 4;
    previewContainer.innerHTML = '<p>Your QR code will appear here</p>';
    downloadSection.style.display = 'none';
    currentQRImage = null;
});

downloadBtn.addEventListener('click', () => {
    if (!currentQRImage) return;
    const link = document.createElement('a');
    link.href = currentQRImage;
    link.download = 'qr_code.png';
    link.click();
});
