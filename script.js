document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginPage = document.getElementById('login-page');
    const userPage = document.getElementById('user-page');
    const adminPage = document.getElementById('admin-page');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    const welcomeMessage = document.getElementById('welcome-message');
    const adminWelcomeMessage = document.getElementById('admin-welcome-message');
    const displayUserName = document.getElementById('display-user-name');
    const displayScore = document.getElementById('display-score');
    const displayStatus = document.getElementById('display-status');
    const scoreError = document.getElementById('score-error');
    const scoreDisplay = document.getElementById('score-display');

    const videoList = document.getElementById('video-list');
    const takeQuizButton = document.getElementById('take-quiz-button');
    const checkScoreButton = document.getElementById('check-score-button');

    const adminVideoList = document.getElementById('admin-video-list');
    const adminQuizList = document.getElementById('admin-quiz-list');
    const viewAllResultsButton = document.getElementById('view-all-results-button');
    const logoutButtonUser = document.getElementById('logout-button-user');
    const logoutButtonAdmin = document.getElementById('logout-button-admin');

    // Users Data
    const users = {
        admin: { password: 'admin', name: 'Admin', role: 'admin' },
        Ice: { password: '001-1', name: 'ไอซ์ สาขานาเมืองเพชร', role: 'user' },
        Bowy: { password: '001-2', name: 'โบวี่ สาขานาเมืองเพชร', role: 'user' },
        Jha: { password: '002-1', name: 'จ๋า สาขานาที่วัง', role: 'user' },
        Jaew: { password: '002-2', name: 'แจ๋ว สาขานาที่วัง', role: 'user' },
        Zeegame: { password: '003-1', name: 'ซีเกมส์ สาขาคลองเต็ง', role: 'user' },
        Benz: { password: '003-2', name: 'เบนช์ สาขาคลองเต็ง', role: 'user' },
        Mint: { password: '004-1', name: 'มินท์ สาขานาโยง', role: 'user' },
        Pair: { password: '004-2', name: 'แพร สาขานาโยง', role: 'user' },
        Maprang: { password: '004-3', name: 'มะปราง สาขานาโยง', role: 'user' },
        Maple: { password: '005-1', name: 'เมเปิ้ล สาขาท่ากลาง', role: 'user' },
        Toey: { password: '005-2', name: 'เตย สาขาท่ากลาง', role: 'user' },
        Oil: { password: '005-3', name: 'ออย สาขาท่ากลาง', role: 'user' },
        Nuch: { password: '006-1', name: 'นุช สาขารัษฎา', role: 'user' },
        Few: { password: '006-2', name: 'ฟิว สาขารัษฎา', role: 'user' },
        Aom: { password: '007-1', name: 'อ้อม สาขารักษ์จันทน์', role: 'user' },
        Pond: { password: '008-1', name: 'พร สาขาหน้าสภาราชินี', role: 'user' },
        Bow: { password: '009-1', name: 'โบว์ สาขาบิ๊กซี', role: 'user' },
    };

    let loggedInUser = null;

    // Google Sheet Config
    const LINKS_SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI';
    const LINKS_GID = '1566756560'; 
    const LINKS_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${LINKS_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${LINKS_GID}`;

    const SCORES_SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI';
    const SCORES_GID = '441233492';
    const SCORES_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SCORES_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SCORES_GID}`;

    // Helper Functions
    function showPage(pageId) {
        loginPage.classList.add('hidden');
        userPage.classList.add('hidden');
        adminPage.classList.add('hidden');
        document.getElementById(pageId).classList.remove('hidden');
    }

    const parseCSV = (text) => {
        const rows = text.trim().split(/\r?\n/);
        return rows.map(row => {
            const cells = [];
            let inQuote = false;
            let currentCell = '';
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') { inQuote = !inQuote; }
                else if (char === ',' && !inQuote) { cells.push(currentCell.replace(/^"|"$/g, '')); currentCell = ''; }
                else { currentCell += char; }
            }
            cells.push(currentCell.replace(/^"|"$/g, ''));
            return cells;
        });
    };

    function renderLinks(targetElement, links, type) {
        targetElement.innerHTML = '';
        if (links.length === 0) {
            targetElement.innerHTML = `<div class="info-text" style="text-align:center;"><i class="fa-regular fa-folder-open"></i> ยังไม่มี${type === 'video' ? 'คลิป' : 'แบบทดสอบ'}</div>`;
            return;
        }
        links.forEach((link, index) => {
            if (link.trim() === '') return;
            const div = document.createElement('div');
            div.className = `${type}-item`;
            const a = document.createElement('a');
            a.href = link;
            a.textContent = `${type === 'video' ? 'คลิปบทเรียนที่' : 'แบบทดสอบชุดที่'} ${index + 1}`;
            a.target = '_blank';
            div.appendChild(a);
            targetElement.appendChild(div);
        });
    }

    // --- DASHBOARD LOGIC (NEW) ---
    async function loadDashboard(role) {
        try {
            const response = await fetch(SCORES_GOOGLE_SHEET_URL);
            if (!response.ok) throw new Error('Network error');
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            const headers = rows[0].map(h => h.trim());
            const userColIndex = headers.indexOf('User');
            const scoreColIndex = headers.indexOf('คะแนน');

            // Get total staff count (exclude admin)
            const allStaff = Object.values(users).filter(u => u.role !== 'admin');
            const totalStaff = allStaff.length;

            let submittedCount = 0;
            let totalScore = 0;
            const submittedNames = new Set();
            const branchScores = {};

            // Calculate scores
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const userName = row[userColIndex]?.trim();
                let score = parseFloat(row[scoreColIndex]);

                if (userName && !isNaN(score)) {
                    if (!submittedNames.has(userName)) {
                        submittedNames.add(userName);
                        submittedCount++;
                        totalScore += score;

                        // Branch Logic
                        const parts = userName.split(' สาขา');
                        if (parts.length > 1) {
                            const branchName = 'สาขา' + parts[1];
                            if (!branchScores[branchName]) branchScores[branchName] = [];
                            branchScores[branchName].push(score);
                        }
                    }
                }
            }

            const avgScore = submittedCount > 0 ? (totalScore / submittedCount).toFixed(2) : 0;

            if (role === 'admin') {
                const pendingCount = totalStaff - submittedCount;
                document.getElementById('stat-submitted').textContent = `${submittedCount}/${totalStaff}`;
                document.getElementById('stat-avg-score').textContent = avgScore;
                document.getElementById('stat-pending').textContent = pendingCount;

                // Pending List
                const pendingListEl = document.getElementById('pending-user-list');
                pendingListEl.innerHTML = '';
                allStaff.forEach(staff => {
                    if (!submittedNames.has(staff.name)) {
                        const li = document.createElement('li');
                        li.textContent = staff.name;
                        pendingListEl.appendChild(li);
                    }
                });
                if (pendingCount === 0) pendingListEl.innerHTML = '<li style="color:var(--success)">🎉 ครบทุกคนแล้ว!</li>';

                renderChart('branchChart', branchScores, avgScore);

            } else {
                // User Dashboard
                document.getElementById('user-stat-submitted').textContent = submittedCount;
                document.getElementById('user-stat-avg').textContent = avgScore;
                renderChart('userBranchChart', branchScores, avgScore);
            }

        } catch (error) {
            console.error('Dashboard Error:', error);
        }
    }

    function renderChart(canvasId, branchScores, globalAvg) {
        const ctxElement = document.getElementById(canvasId);
        if (!ctxElement) return;

        const ctx = ctxElement.getContext('2d');
        const labels = Object.keys(branchScores);
        const data = labels.map(branch => {
            const scores = branchScores[branch];
            const sum = scores.reduce((a, b) => a + b, 0);
            return (sum / scores.length).toFixed(2);
        });

        // Color Logic: Green if >= Avg, Orange if < Avg
        const bgColors = data.map(score => parseFloat(score) >= parseFloat(globalAvg) ? 'rgba(34, 197, 94, 0.7)' : 'rgba(249, 115, 22, 0.7)');
        const borderColors = data.map(score => parseFloat(score) >= parseFloat(globalAvg) ? 'rgba(34, 197, 94, 1)' : 'rgba(249, 115, 22, 1)');

        if (window[canvasId] instanceof Chart) {
            window[canvasId].destroy();
        }

        window[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'คะแนนเฉลี่ย',
                    data: data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (ctx) => `สาขานี้: ${ctx.parsed.y} (เฉลี่ยรวม: ${globalAvg})` }
                    },
                    title: {
                        display: true,
                        text: `เกณฑ์คะแนนเฉลี่ยส่วนกลาง: ${globalAvg}`,
                        color: '#64748b',
                        padding: { bottom: 10 }
                    }
                }
            }
        });
    }

    // --- LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (users[username] && users[username].password === password) {
            loggedInUser = username;
            loginError.textContent = '';
            usernameInput.value = '';
            passwordInput.value = '';

            const userDisplayName = users[loggedInUser].name;

            if (users[loggedInUser].role === 'admin') {
                adminWelcomeMessage.textContent = `ยินดีต้อนรับ ${userDisplayName}`;
                loadAdminContent();
                loadDashboard('admin'); // Load Admin Dashboard
                showPage('admin-page');
            } else {
                welcomeMessage.textContent = `ยินดีต้อนรับ ${userDisplayName}`;
                displayUserName.textContent = userDisplayName;
                loadUserContent();
                loadDashboard('user'); // Load User Dashboard
                showPage('user-page');
            }
        } else {
            loginError.textContent = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
        }
    });

    // --- CONTENT LOADERS ---
    async function loadUserContent() {
        try {
            const response = await fetch(LINKS_GOOGLE_SHEET_URL);
            const csvText = await response.text();
            const rows = parseCSV(csvText);
            const headers = rows[0].map(h => h.trim());
            const videoCol = headers.indexOf('Video Link');
            const quizCol = headers.indexOf('Quiz Link');

            const videoLinks = [];
            const quizLinks = [];
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][videoCol]) videoLinks.push(rows[i][videoCol].trim());
                if (rows[i][quizCol]) quizLinks.push(rows[i][quizCol].trim());
            }

            renderLinks(videoList, videoLinks, 'video');
            takeQuizButton.onclick = () => {
                if (quizLinks.length > 0) window.open(quizLinks[0], '_blank');
                else alert('ยังไม่มีแบบทดสอบประจำเดือนนี้');
            };
        } catch (error) { console.error(error); }
    }

    async function loadAdminContent() {
        try {
            const response = await fetch(LINKS_GOOGLE_SHEET_URL);
            const csvText = await response.text();
            const rows = parseCSV(csvText);
            const headers = rows[0].map(h => h.trim());
            const videoCol = headers.indexOf('Video Link');
            const quizCol = headers.indexOf('Quiz Link');

            const videoLinks = [];
            const quizLinks = [];
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][videoCol]) videoLinks.push(rows[i][videoCol].trim());
                if (rows[i][quizCol]) quizLinks.push(rows[i][quizCol].trim());
            }

            renderLinks(adminVideoList, videoLinks, 'video');
            renderLinks(adminQuizList, quizLinks, 'quiz');
        } catch (error) { console.error(error); }
    }

    checkScoreButton.addEventListener('click', async () => {
        scoreError.textContent = '';
        scoreDisplay.classList.add('hidden');
        if (!loggedInUser) return;

        const userNameForLookup = users[loggedInUser].name;
        try {
            const response = await fetch(SCORES_GOOGLE_SHEET_URL);
            const csvText = await response.text();
            const rows = parseCSV(csvText);
            const headers = rows[0].map(h => h.trim());
            const userCol = headers.indexOf('User');
            const scoreCol = headers.indexOf('คะแนน');
            const statusCol = headers.indexOf('Status');

            let found = false;
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][userCol]?.trim() === userNameForLookup) {
                    displayScore.textContent = rows[i][scoreCol] || '-';
                    displayStatus.textContent = rows[i][statusCol] || '-';
                    scoreDisplay.classList.remove('hidden');
                    found = true;
                    break;
                }
            }
            if (!found) scoreError.textContent = 'ไม่พบผลคะแนนของท่าน กรุณาทำแบบทดสอบก่อน';
        } catch (error) { scoreError.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูล'; }
    });

    viewAllResultsButton.addEventListener('click', () => {
        window.open(`https://docs.google.com/spreadsheets/d/${SCORES_SHEET_ID}/edit#gid=${SCORES_GID}`, '_blank');
    });

    logoutButtonUser.addEventListener('click', () => { loggedInUser = null; showPage('login-page'); });
    logoutButtonAdmin.addEventListener('click', () => { loggedInUser = null; showPage('login-page'); });

    // Initial Load
    showPage('login-page');
});
