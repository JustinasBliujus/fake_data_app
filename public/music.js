document.addEventListener("DOMContentLoaded", () => {
    let synth = null;
    let part = null;
    let musicData = null;
    let totalDuration = 0;
    let timerInterval = null;
    let activeIndex = null;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2,'0')}`;
    }

    function scheduleMusic(music) {
        const { melody, noteDuration } = music;
        totalDuration = melody.length * noteDuration;

        if (part) part.dispose();
        if (!synth) synth = new Tone.Synth().toDestination();

        const events = melody.map((midi, i) => [i * noteDuration, midi]);
        part = new Tone.Part((time, midi) => {
            synth.triggerAttackRelease(Tone.Frequency(midi, "midi"), noteDuration, time);
        }, events).start(0);

        Tone.Transport.stop();
        Tone.Transport.position = 0;
    }

    function startTimer(index) {
        const display = document.getElementById(`timer-${index}`);
        const progressBar = document.getElementById(`range-${index}`);

        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            const elapsed = Tone.Transport.seconds;

            if (elapsed >= totalDuration) {
                Tone.Transport.stop();
                clearInterval(timerInterval);
            }

            display.textContent = `${formatTime(elapsed)} / ${formatTime(totalDuration)}`;
            progressBar.value = (elapsed / totalDuration) * 100;
        }, 100);
    }

    window.playSeedMelody = async function(index, music) {
        await Tone.start();

        if (typeof music === "string") music = JSON.parse(music);

        if (activeIndex !== null && activeIndex !== index) {
            const prevRange = document.getElementById(`range-${activeIndex}`);
            prevRange.disabled = true;
            Tone.Transport.stop();
            clearInterval(timerInterval);
        }

        activeIndex = index;
        musicData = music;

        const progressBar = document.getElementById(`range-${index}`);
        progressBar.disabled = false;

        scheduleMusic(musicData);
        Tone.Transport.start();
        startTimer(index);
    };

    window.pauseMelody = function() {
        if (!musicData || activeIndex === null) return;

        const progressBar = document.getElementById(`range-${activeIndex}`);

        if (Tone.Transport.state === "started") {
            Tone.Transport.pause();
            progressBar.disabled = true;
        } else {
            Tone.Transport.start();
            progressBar.disabled = false;
        }
    };

    document.querySelectorAll('.form-range').forEach(input => {
        input.addEventListener('input', () => {
            if (activeIndex === null) return;
            const progressBar = document.getElementById(`range-${activeIndex}`);
            if (input.id !== progressBar.id) return;

            const newTime = (input.value / 100) * totalDuration;
            Tone.Transport.seconds = newTime;
        });
    });

    document.querySelectorAll('.accordion-collapse').forEach(collapseEl => {
        collapseEl.addEventListener('hidden.bs.collapse', () => {
            const index = collapseEl.id.replace('collapse','');
            
            if (activeIndex == index) {
                Tone.Transport.stop();
                clearInterval(timerInterval);

                const range = document.getElementById(`range-${index}`);
                const timer = document.getElementById(`timer-${index}`);
                if(range) { range.value = 0; range.disabled = true; }
                if(timer) { timer.textContent = `0:00 / 0:00`; }

                activeIndex = null;
                musicData = null;
            }
        });
    });

});