document.getElementById('generateSeedBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/seed');
        if (!response.ok) throw new Error('Failed to fetch seed');

        const data = await response.json();

        const seedInput = document.getElementById('seedInput');
        seedInput.value = data.seed;
        seedInput.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) {
        console.error('Error generating seed:', err);
    }
});