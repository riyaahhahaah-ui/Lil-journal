document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dateDisplay = document.getElementById('dateDisplay');
    const productivityToggle = document.getElementById('productivityToggle');
    const moodBtns = document.querySelectorAll('.mood-btn');
    const waterCount = document.getElementById('waterCount');
    const waterProgress = document.getElementById('waterProgress');
    const increaseWaterBtn = document.getElementById('increaseWater');
    const decreaseWaterBtn = document.getElementById('decreaseWater');
    const highlightInput = document.getElementById('highlightInput');
    const charCount = document.getElementById('charCount');
    const saveBtn = document.getElementById('saveBtn');
    const notification = document.getElementById('notification');

    // New Elements
    const sleepInput = document.getElementById('sleepInput');
    const meditationInput = document.getElementById('meditationInput');
    const movementInput = document.getElementById('movementInput');
    const gratitudeInput = document.getElementById('gratitudeInput');
    const energyInput = document.getElementById('energyInput');
    const energyValue = document.getElementById('energyValue');
    const screenTimeInput = document.getElementById('screenTimeInput');
    const studyInput = document.getElementById('studyInput');
    const dailyQuote = document.getElementById('dailyQuote');
    const goal1 = document.getElementById('goal1');
    const goal2 = document.getElementById('goal2');
    const goal3 = document.getElementById('goal3');

    // Analytics Elements
    const avgSleep = document.getElementById('avgSleep');
    const avgWater = document.getElementById('avgWater');
    const avgStudy = document.getElementById('avgStudy');
    const avgProductivity = document.getElementById('avgProductivity');
    const avgEnergy = document.getElementById('avgEnergy');
    const avgScreen = document.getElementById('avgScreen');
    const avgMeditate = document.getElementById('avgMeditate');
    const avgMove = document.getElementById('avgMove');

    // Sidebar Elements
    const profileBtn = document.getElementById('profileBtn');
    const sidePanel = document.getElementById('sidePanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn');

    // Add Demo Button (Programmatically)
    const historySection = document.querySelector('.history-card'); // In sidebar now
    const demoBtn = document.createElement('button');
    demoBtn.innerText = "Generate Demo History";
    demoBtn.style.cssText = "margin-top: 10px; font-size: 0.8rem; background: none; border: 1px dashed #aaa; padding: 5px; cursor: pointer; opacity: 0.6; width: 100%;";
    if (historySection) historySection.appendChild(demoBtn);

    demoBtn.addEventListener('click', generateDemoData);

    // State
    let currentState = {
        date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format for key
        productivity: false, // false = lazy, true = productive
        mood: null,
        water: 0,
        highlight: '',
        sleep: 0,
        meditation: 0,
        movement: 0,
        energy: 5,
        gratitude: '',
        screenTime: 0,
        studyHours: 0,
        goals: ['', '', '']
    };

    // Constants
    const WATER_INCREMENT = 0.25;
    const WATER_GOAL = 3.0; // Liters
    const START_HOUR = 19; // 7 PM
    const END_HOUR = 23;   // 11 PM (ends at 23:59)
    const DEBUG_MODE = false; // Set to true to bypass time check for testing

    // Multi-User State
    let CURRENT_USER = localStorage.getItem('dailyTracker_currentUser');

    // Initialize
    function init() {
        if (!CURRENT_USER) {
            showLoginScreen();
        } else {
            showAppContent();
        }
    }

    function showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appContent').classList.add('hidden');

        // Add listener for login
        document.getElementById('loginBtn').addEventListener('click', handleLogin);
    }

    function handleLogin() {
        const phone = document.getElementById('phoneInput').value.trim();
        if (phone.length < 3) {
            alert("Please enter a valid code (at least 3 characters).");
            return;
        }
        CURRENT_USER = phone;
        localStorage.setItem('dailyTracker_currentUser', CURRENT_USER);
        showAppContent();
    }

    function showAppContent() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');

        // Set User Display
        document.getElementById('userDisplay').textContent = `User: ${CURRENT_USER}`;

        // Setup Panel Toggles
        setupSidebarEvents();

        // Setup Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('dailyTracker_currentUser');
                location.reload();
            });
        }

        // Set Date Display (Indian Format)
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString('en-IN', options);

        // Check Access Window
        updateQuotes(); // Always load quotes

        if (!isTimeOpen() && !DEBUG_MODE) {
            lockApp();
        } else {
            unlockApp();
            // Load data if exists
            loadData();
            loadHistory(); // Load history on init
            calculateWeeklyStats(); // Update analytics
            updateUI();
        }
    }

    // --- Time Logic ---

    function isTimeOpen() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= START_HOUR && hour <= END_HOUR;
    }

    function lockApp() {
        // Disable inputs
        productivityToggle.disabled = true;
        moodBtns.forEach(btn => btn.disabled = true);
        increaseWaterBtn.disabled = true;
        decreaseWaterBtn.disabled = true;
        highlightInput.disabled = true;

        // New inputs
        sleepInput.disabled = true;
        meditationInput.disabled = true;
        movementInput.disabled = true;
        gratitudeInput.disabled = true;
        energyInput.disabled = true;
        screenTimeInput.disabled = true;
        studyInput.disabled = true;
        goal1.disabled = true;
        goal2.disabled = true;
        goal3.disabled = true;

        saveBtn.disabled = true;
        saveBtn.textContent = "Check-in opens at 7:00 PM";
        saveBtn.style.backgroundColor = "#b2bec3";

        // Optional: Show a message overlay or opacity
        document.querySelector('main').style.opacity = '0.6';
        document.querySelector('main').style.pointerEvents = 'none';

        // Show notification permanently
        const notification = document.getElementById('notification');
        notification.textContent = "Daily Check-in is currently closed. Come back at 7 PM!";
        notification.classList.remove('hidden');
        notification.classList.add('show');
    }

    function unlockApp() {
        document.querySelector('main').style.opacity = '1';
        document.querySelector('main').style.pointerEvents = 'auto';
        saveBtn.textContent = "Save Entry";
        saveBtn.style.backgroundColor = ""; // Reset
    }

    // --- Sidebar Logic ---
    function setupSidebarEvents() {
        profileBtn.addEventListener('click', () => {
            sidePanel.classList.add('open');
            overlay.classList.add('show');
        });

        function closePanel() {
            sidePanel.classList.remove('open');
            overlay.classList.remove('show');
        }

        closePanelBtn.addEventListener('click', closePanel);
        overlay.addEventListener('click', closePanel);
    }

    // --- Interaction Handlers ---

    // Productivity
    productivityToggle.addEventListener('change', (e) => {
        currentState.productivity = e.target.checked;
    });

    // Mood
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentState.mood = btn.dataset.mood;
            updateMoodUI();
        });
    });

    function updateMoodUI() {
        moodBtns.forEach(btn => {
            if (btn.dataset.mood === currentState.mood) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    // Water
    increaseWaterBtn.addEventListener('click', () => {
        currentState.water = Math.round((currentState.water + WATER_INCREMENT) * 100) / 100;
        updateWaterUI();
    });

    decreaseWaterBtn.addEventListener('click', () => {
        if (currentState.water > 0) {
            currentState.water = Math.round((currentState.water - WATER_INCREMENT) * 100) / 100;
            updateWaterUI();
        }
    });

    function updateWaterUI() {
        waterCount.textContent = `${currentState.water.toFixed(2)} L`;
        const percentage = Math.min((currentState.water / WATER_GOAL) * 100, 100);
        waterProgress.style.width = `${percentage}%`;
    }

    // Highlight
    highlightInput.addEventListener('input', (e) => {
        currentState.highlight = e.target.value;
        charCount.textContent = e.target.value.length;
    });

    // New Listeners
    sleepInput.addEventListener('input', (e) => currentState.sleep = e.target.value);
    meditationInput.addEventListener('input', (e) => currentState.meditation = e.target.value);
    movementInput.addEventListener('input', (e) => currentState.movement = e.target.value);
    gratitudeInput.addEventListener('input', (e) => currentState.gratitude = e.target.value);
    screenTimeInput.addEventListener('input', (e) => currentState.screenTime = e.target.value);
    studyInput.addEventListener('input', (e) => currentState.studyHours = e.target.value);

    // Goals
    goal1.addEventListener('input', (e) => currentState.goals[0] = e.target.value);
    goal2.addEventListener('input', (e) => currentState.goals[1] = e.target.value);
    goal3.addEventListener('input', (e) => currentState.goals[2] = e.target.value);

    energyInput.addEventListener('input', (e) => {
        currentState.energy = e.target.value;
        energyValue.textContent = e.target.value;
    });

    // --- Data Persistence ---

    function saveData() {
        const storageKey = `dailyTracker_${CURRENT_USER}_${currentState.date}`;
        localStorage.setItem(storageKey, JSON.stringify(currentState));
        showNotification();
        loadHistory(); // Refresh history after saving
        calculateWeeklyStats(); // Refresh stats
    }

    function loadData() {
        const storageKey = `dailyTracker_${CURRENT_USER}_${currentState.date}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Merge saved data with current state logic (keep date)
            currentState = { ...currentState, ...parsed };
        }
    }

    function updateUI() {
        // Productivity
        productivityToggle.checked = currentState.productivity;

        // Mood
        updateMoodUI();

        // Water
        updateWaterUI();

        // Highlight
        highlightInput.value = currentState.highlight;
        charCount.textContent = currentState.highlight.length;

        // New Fields
        sleepInput.value = currentState.sleep || '';
        meditationInput.value = currentState.meditation || '';
        movementInput.value = currentState.movement || '';
        gratitudeInput.value = currentState.gratitude || '';
        energyInput.value = currentState.energy || 5;
        energyValue.textContent = currentState.energy || 5;
        screenTimeInput.value = currentState.screenTime || '';
        studyInput.value = currentState.studyHours || '';

        // Goals (handle if array is undefined for old data)
        const g = currentState.goals || ['', '', ''];
        goal1.value = g[0] || '';
        goal2.value = g[1] || '';
        goal3.value = g[2] || '';
    }

    function calculateWeeklyStats() {
        const keys = Object.keys(localStorage)
            .filter(key => key.startsWith(`dailyTracker_${CURRENT_USER}_`))
            .sort()
            .reverse()
            .slice(0, 7); // Last 7 entries

        if (keys.length === 0) return;

        let totalSleep = 0, totalWater = 0, totalStudy = 0, totalEnergy = 0, totalScreen = 0, totalMeditate = 0, totalMove = 0;
        let productiveDays = 0;
        let count = keys.length;

        keys.forEach(key => {
            const entry = JSON.parse(localStorage.getItem(key));
            totalSleep += parseFloat(entry.sleep || 0);
            totalWater += parseFloat(entry.water || 0);
            totalStudy += parseFloat(entry.studyHours || 0);
            totalEnergy += parseFloat(entry.energy || 0);
            totalScreen += parseFloat(entry.screenTime || 0);
            totalMeditate += parseFloat(entry.meditation || 0);
            totalMove += parseFloat(entry.movement || 0);
            if (entry.productivity) productiveDays++;
        });

        avgSleep.textContent = (totalSleep / count).toFixed(1) + 'h';
        avgWater.textContent = (totalWater / count).toFixed(1) + 'L';
        avgStudy.textContent = (totalStudy / count).toFixed(1) + 'h';
        avgProductivity.textContent = Math.round((productiveDays / count) * 100) + '%';
        avgEnergy.textContent = (totalEnergy / count).toFixed(1);
        avgScreen.textContent = (totalScreen / count).toFixed(1) + 'h';
        avgMeditate.textContent = Math.round(totalMeditate / count) + 'm';
        avgMove.textContent = Math.round(totalMove / count) + 'm';
    }

    function updateQuotes() {
        const quotes = [
            "Be kind to yourself today. You are doing your best.",
            "Discipline is choosing what you want most over what you want now.",
            "Small steps every day add up to big results.",
            "If you get tired, learn to rest, not to quit.",
            "Don't stop when you're tired. Stop when you're done.",
            "Your future needs you. Your past doesn't.",
            "Be the energy you want to attract.",
            "Success is the sum of small efforts, repeated day in and day out.",
            "Talk to yourself like you would to someone you love.",
            "No pressure, no diamonds."
        ];

        // Simple hash of the date string to pick a quote
        const dateStr = new Date().toLocaleDateString();
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
        }

        const index = Math.abs(hash) % quotes.length;
        dailyQuote.textContent = `"${quotes[index]}"`;
    }

    function loadHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = ''; // Clear list

        const keys = Object.keys(localStorage)
            .filter(key => key.startsWith(`dailyTracker_${CURRENT_USER}_`))
            .sort()
            .reverse(); // Newest first

        if (keys.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No past records found.</p>';
            return;
        }

        keys.forEach(key => {
            try {
                const entry = JSON.parse(localStorage.getItem(key));
                // Extract date part: dailyTracker_USER_2023-10-27
                const dateKey = key.split('_').pop(); // Get last part (DATE)
                const dateObj = new Date(`${dateKey}T00:00:00`); // Fix timezone issue with simple date
                const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                const moodEmoji = getMoodEmoji(entry.mood);

                const item = document.createElement('div');
                item.className = `history-item ${entry.productivity ? 'productive' : 'lazy'}`;

                const highlightText = entry.highlight ? `"${entry.highlight}"` : 'No highlight.';
                // Default to empty if field is missing (backward compatibility)
                const sleep = entry.sleep ? `${entry.sleep}h` : '-';
                const energy = entry.energy ? `${entry.energy}/10` : '-';

                // Format Goals
                let goalsHtml = '';
                if (entry.goals && entry.goals.some(g => g)) {
                    goalsHtml = `
                    <div class="history-goals">
                        <h4>Priorities Set for Tomorrow:</h4>
                        <ul>
                            ${entry.goals.map(g => g ? `<li>🎯 ${g}</li>` : '').join('')}
                        </ul>
                    </div>`;
                }

                item.innerHTML = `
                    <div class="history-header">
                        <span class="history-date">${dateStr}</span>
                        <div class="history-data">
                            <span class="history-pill" title="Sleep">💤 ${sleep}</span>
                            <span class="history-pill" title="Energy">⚡ ${energy}</span>
                            <span class="history-pill" title="Water">💧 ${entry.water}L</span>
                            <span class="history-pill" title="Mood">${moodEmoji}</span>
                        </div>
                    </div>
                    <!-- Extra stats row -->
                    <div class="history-details" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; font-size:0.8rem; color:#666;">
                        <span>📚 Study: ${entry.studyHours || 0}h</span>
                        <span>📱 Screen: ${entry.screenTime || 0}h</span>
                        <span>🧘 ${entry.meditation || 0}m</span>
                        <span>🏃 ${entry.movement || 0}m</span>
                    </div>
                    ${entry.gratitude ? `<div class="history-highlight" style="margin-bottom:4px;font-size:0.8rem">🙏 ${entry.gratitude}</div>` : ''}
                    <div class="history-highlight">${highlightText}</div>
                    ${goalsHtml}
                `;
                historyList.appendChild(item);
            } catch (e) {
                console.error("Error loading entry", key, e);
            }
        });
    }

    function generateDemoData() {
        const moods = ['angry', 'sad', 'neutral', 'good', 'great'];
        const comments = ["Productive day!", "Tired.", "Great workout", "Relaxed", "Busy work"];
        const gratitude = ["Family", "Coffee", "Sunshine", "Health", "Friends"];
        const sampleGoals = ["Gym", "Read", "Call Mom", "Code", "Walk", "Meditate"];

        // Generate last 7 days
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD

            // Random 3 goals
            const g1 = sampleGoals[Math.floor(Math.random() * sampleGoals.length)];
            const g2 = sampleGoals[Math.floor(Math.random() * sampleGoals.length)];
            const g3 = sampleGoals[Math.floor(Math.random() * sampleGoals.length)];

            const mockEntry = {
                date: dateKey,
                productivity: Math.random() > 0.4,
                mood: moods[Math.floor(Math.random() * moods.length)],
                water: (Math.floor(Math.random() * 8) + 4) * 0.25,
                highlight: comments[Math.floor(Math.random() * comments.length)],
                sleep: (Math.floor(Math.random() * 6) + 5), // 5-10 hours
                meditation: Math.floor(Math.random() * 30),
                movement: Math.floor(Math.random() * 60),
                energy: Math.floor(Math.random() * 9) + 1,
                gratitude: gratitude[Math.floor(Math.random() * gratitude.length)],
                screenTime: (Math.floor(Math.random() * 8) + 1),
                studyHours: (Math.floor(Math.random() * 6)),
                goals: [g1, g2, g3]
            };

            localStorage.setItem(`dailyTracker_${dateKey}`, JSON.stringify(mockEntry));
        }
        loadHistory();
        calculateWeeklyStats();
        alert("Added 7 days of rich demo data!");
    }

    function getMoodEmoji(moodKey) {
        const map = {
            'angry': '😠',
            'sad': '☹️',
            'neutral': '😐',
            'good': '🙂',
            'great': '🤩'
        };
        return map[moodKey] || '❓';
    }

    // Save Button
    saveBtn.addEventListener('click', saveData);

    function showNotification() {
        notification.classList.remove('hidden');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hidden');
        }, 3000);
    }

    // Start
    init();

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker: Registered (Pages)', reg))
                .catch(err => console.log('Service Worker: Error: ', err));
        });
    }
});
