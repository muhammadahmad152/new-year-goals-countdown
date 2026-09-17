document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Next Year & Countdown Timer Logic

    const nextYearEl = document.getElementById('next-year');
    const dayEl = document.getElementById('day');
    const hourEl = document.getElementById('hour');
    const minuteEl = document.getElementById('minute');
    const secondEl = document.getElementById('second');

    const currentYear = new Date().getFullYear();
    const targetYear = currentYear + 1;
    const newYearTime = new Date(`January 1, ${targetYear} 00:00:00`);

    if (nextYearEl) {
        nextYearEl.textContent = targetYear;
    }

    function updateCountdown() {
        const currentTime = new Date();
        const diff = newYearTime - currentTime;

        if (diff <= 0) {
            if (dayEl) dayEl.textContent = '00';
            if (hourEl) hourEl.textContent = '00';
            if (minuteEl) minuteEl.textContent = '00';
            if (secondEl) secondEl.textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        if (dayEl) dayEl.textContent = d < 10 ? '0' + d : d;
        if (hourEl) hourEl.textContent = h < 10 ? '0' + h : h;
        if (minuteEl) minuteEl.textContent = m < 10 ? '0' + m : m;
        if (secondEl) secondEl.textContent = s < 10 ? '0' + s : s;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Dark / Light Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        if (darkModeToggle) darkModeToggle.checked = true;
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // 3. New Year Resolutions List (Multiple Goals & Enter Key)

    const resolutionInput = document.getElementById('resolution-input');
    const saveGoalBtn = document.getElementById('save-resolution-btn');
    const savedGoalContainer = document.querySelector('.saved-goal-container');

    function getStoredGoals() {
        const goals = localStorage.getItem('ny_goals');
        return goals ? JSON.parse(goals) : [];
    }

    function displayGoals() {
        if (!savedGoalContainer) return;

        const goals = getStoredGoals();
        savedGoalContainer.innerHTML = '';

        if (goals.length === 0) {
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        ul.style.width = '100%';

        goals.forEach((goal, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.width = '100%';
            li.style.padding = '8px 12px';
            li.style.margin = '8px 0';

            li.innerHTML = `
                <span style="word-break: break-word;">🎯 ${goal}</span>
                <button class="delete-btn" onclick="deleteSingleGoal(${index})">Delete</button>
            `;
            ul.appendChild(li);
        });

        savedGoalContainer.appendChild(ul);
    }

    function addGoal() {
        const goal = resolutionInput.value.trim();
        if (goal !== '') {
            const goals = getStoredGoals();
            goals.push(goal);
            localStorage.setItem('ny_goals', JSON.stringify(goals));
            resolutionInput.value = '';
            displayGoals();
        }
    }

    window.deleteSingleGoal = function (index) {
        const goals = getStoredGoals();
        goals.splice(index, 1);
        localStorage.setItem('ny_goals', JSON.stringify(goals));
        displayGoals();
    };

    if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', addGoal);
    }

    if (resolutionInput) {
        resolutionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addGoal();
            }
        });
    }

    displayGoals();

    // Audio Control (Background Music)

    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicBtn.textContent = '⏸️ Pause Music';
                }).catch(err => {
                    console.log("Audio play error:", err);
                    alert("Music file load nahi hui. Check karein ki 'music.mp3' file same folder mein hai.");
                });
            } else {
                bgMusic.pause();
                musicBtn.textContent = '🎵 Play Music';
            }
        });
    }

    // Canvas Fireworks Effect + Web Audio Sound
    
    const themeBtn = document.getElementById('theme-btn');
    const canvas = document.getElementById('fireworks-canvas');

    // Web Audio Synthesizer for Firework Sound
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playFireworkSound() {
        if (!audioCtx) {
            audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const bufferSize = audioCtx.sampleRate * 0.3;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    }

    if (canvas && themeBtn) {
        const ctx = canvas.getContext('2d');
        let fireworksActive = false;
        let animationFrameId = null;
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.radius = Math.random() * 3 + 1;
                this.velocity = {
                    x: (Math.random() - 0.5) * 6,
                    y: (Math.random() - 0.5) * 6
                };
                this.alpha = 1;
                this.decay = Math.random() * 0.015 + 0.005;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }

            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.alpha -= this.decay;
            }
        }

        function createFirework() {
            const x = Math.random() * canvas.width;
            const y = (Math.random() * canvas.height) / 2;
            const colors = ['#ff4d4d', '#ffaf40', '#fffa65', '#32ff7e', '#18dcff', '#7d5fff'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            playFireworkSound();

            for (let i = 0; i < 40; i++) {
                particles.push(new Particle(x, y, color));
            }
        }

        function animateFireworks() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (Math.random() < 0.04) {
                createFirework();
            }

            particles.forEach((particle, index) => {
                if (particle.alpha > 0) {
                    particle.update();
                    particle.draw();
                } else {
                    particles.splice(index, 1);
                }
            });

            if (fireworksActive) {
                animationFrameId = requestAnimationFrame(animateFireworks);
            }
        }

        themeBtn.addEventListener('click', () => {
            fireworksActive = !fireworksActive;
            if (fireworksActive) {
                canvas.style.display = 'block';
                animateFireworks();
                themeBtn.textContent = '🎆 Fireworks Off';
            } else {
                canvas.style.display = 'none';
                cancelAnimationFrame(animationFrameId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles = [];
                themeBtn.textContent = '🎆 Fireworks On/Off';
            }
        });
    }
});