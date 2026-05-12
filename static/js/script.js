document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const placeholder = document.getElementById('placeholder');
    const imageWrapper = document.getElementById('image-wrapper');
    const generatedImage = document.getElementById('generated-image');
    const downloadBtn = document.getElementById('download-btn');
    const suggestions = document.querySelectorAll('.suggestion');

    // Handle suggestion clicks
    suggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            promptInput.value = btn.textContent;
            promptInput.focus();
        });
    });

    // Main generation function
    const generateImage = async () => {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt first!');
            return;
        }

        // Set loading state
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        
        // Show placeholder while loading if no image yet
        if (generatedImage.src === "") {
            placeholder.classList.remove('hidden');
            imageWrapper.classList.add('hidden');
        }

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (data.success) {
                // Update image source
                generatedImage.src = `data:image/png;base64,${data.image}`;
                
                // Switch views
                placeholder.classList.add('hidden');
                imageWrapper.classList.remove('hidden');
                
                // Scroll to result on mobile
                if (window.innerWidth < 768) {
                    imageWrapper.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            // Restore button state
            generateBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    };

    // Event listeners
    generateBtn.addEventListener('click', generateImage);

    // Enter key to generate
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateImage();
        }
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = generatedImage.src;
        link.download = `visionary-ai-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Share functionality (simulated)
    document.getElementById('share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check out my AI generation!',
                text: `Generated using Visionary AI: "${promptInput.value}"`,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert('Sharing is not supported on this browser, but you can download the image!');
        }
    });
});
