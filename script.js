document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI'; 
    
    // *** GIDs ***
    const USERS_GID = '992216903';   // GID สำหรับรายชื่อพนักงาน (ตามที่คุณแจ้ง)
    const LINKS_GID = '1566756560';  // GID สำหรับลิงก์ Video/Quiz
    const SCORES_GID = '441233492';  // GID สำหรับผลคะแนน

    const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=`;

    // --- State ---
    let usersData = {}; 
    let loggedInUser = null;

    // --- DOM Elements ---
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    const userView = document.getElementById('user-view');
    const adminView = document.getElementById('admin-view');
    
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const loadingText = document.getElementById('loading-text');
    const headerDate = document.getElementById('header-date');

    // --- Initialization ---
    showDate();
    initSystem();

    function showDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        headerDate.textContent = now.toLocaleDateString('th-TH', options);
    }

    async function initSystem() {
        loadingText.style.display = 'block';
        const success = await loadUsers();
        loadingText.style.display = 'none';
        
        if (!success) {
            loginError.innerHTML = 'ไม่สามารถดึงข้อมูลรายชื่อพนักงานได้ <br>กรุณาตรวจสอบ GID ของแท็บ Users';
        }
    }

    // --- Helper: CSV Parser ---
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

    // --- Helper: Monthly Filter ---
    function isCurrentMonth(timestampStr) {
        if (!timestampStr) return false;
        try {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // Format Timestamp มักจะเป็น "d/m/yyyy H:M:S" หรือ "d/m/yyyy"
            const datePart = timestampStr.split(' ')[0];
            const parts = datePart.split('/');
            
            if (parts.length < 3) return false;
            
            let m = parseInt(parts[1]);
            let y = parseInt(parts[2]);
            
            // แก้ไขเรื่อง พ.ศ. (ถ้าปีมากกว่า 2400 ให้ลบ 543)
            if (y > 2400) y -= 543; 
            
            return (m === currentMonth && y === currentYear);
        } catch (e) {
            console.error("Date parse error:", e);
            return false;
        }
    }

    // --- Load Users (From Sheet 992216903) ---
    async function loadUsers() {
        try {
            const response = await fetch(BASE_URL + USERS_GID);
            const text = await response.text();
            const rows = parseCSV(text);
            
            usersData = {}; 
            // เริ่ม loop ที่ i=1 (ข้าม header)
            for (let i = 1; i < rows.length; i++) {
                // คาดหวัง Col A=Username, B=Password, C=Name, D=Role
                const [user, pass, name, role] = rows[i];
                if (user && pass) {
                    usersData[user.trim()] = {
                        password: pass.trim(),
                        name: name.trim(),
                        role: role ? role.trim().toLowerCase() : 'user'
                    };
                }
            }
            console.log("Loaded Users:", Object.keys(usersData).length);
            return true;
        } catch (error) {
            console.error("Failed to load users:", error);
            return false;
        }
    }

    // --- Login Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = usernameInput.value.trim();
        const p = passwordInput.value.trim();

        if (usersData[u] && usersData[u].password === p) {
            loggedInUser = u;
            loginError.textContent = '';
            
            // Transition
            loginPage.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            const userData = usersData[u];
            
            if (userData.role === 'admin') {
                userView.classList.add('hidden');
                adminView.classList.remove('hidden');
                document.getElementById('admin-welcome-message').textContent = `ผู้ดูแลระบบ (${userData.name})`;
                loadAdminContent();
            } else {
                adminView.classList.add('hidden');
                userView.classList.remove('hidden');
                document.getElementById('welcome-message').textContent = `สวัสดีคุณ ${userData.name}`;
                // แก้ Error เดิม: ไม่เรียก display-user-name แล้ว
                loadUserContent();
            }
            
            // โหลด Dashboard โดยส่ง Role เข้าไป
            loadDashboard(userData.role);

        } else {
            loginError.textContent = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
        }
    });

    // --- Fetch Links (Hardcode Column B & C) ---
    async function fetchLinks() {
        try {
            const response = await fetch(BASE_URL + LINKS_GID);
            const text = await response.text();
            const rows = parseCSV(text);

            const vLinks = [];
            const qLinks = [];

            // เริ่มแถวที่ 2 (index 1)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                // ดึง Col B (index 1) เป็น Video
                const videoCell = row[1]; 
                // ดึง Col C (index 2) เป็น Quiz
                const quizCell = row[2];

                if (videoCell && videoCell.includes('http')) vLinks.push(videoCell.trim());
                if (quizCell && quizCell.includes('http')) qLinks.push(quizCell.trim());
            }
            return { vLinks, qLinks };
        } catch (e) {
            console.error("Link Error:", e);
            return { vLinks: [], qLinks: [] };
        }
    }

    function renderList(container, links, type) {
        container.innerHTML = '';
        if (links.length === 0) {
            container.innerHTML = `<div class="info-text">ไม่มีข้อมูลในเดือนนี้</div>`;
            return;
        }
        links.forEach((link, idx) => {
            const div = document.createElement('div');
            div.className = type === 'video' ? 'video-item' : 'quiz-item';
            
            // --- Logic XXX Replacement สำหรับแสดงผล (ถ้าต้องการ) ---
            // ปกติเราเปลี่ยนตอนกดปุ่มใหญ่ แต่ถ้าจะเปลี่ยนในลิสต์ด้วยก็ทำได้
            let finalLink = link;
            if (type === 'quiz' && loggedInUser && link.includes('XXX')) {
                 finalLink = link.replace('XXX', encodeURIComponent(usersData[loggedInUser].name));
            }

            div.innerHTML = `
                <i class="fa-solid ${type === 'video' ? 'fa-play-circle' : 'fa-pen-to-square'}"></i>
                <a href="${finalLink}" target="_blank">${type === 'video' ? 'คลิปวิดีโอ' : 'แบบทดสอบ'} ชุดที่ ${idx + 1}</a>
            `;
            container.appendChild(div);
        });
    }

    async function loadUserContent() {
        const { vLinks, qLinks } = await fetchLinks();
        renderList(document.getElementById('video-list'), vLinks, 'video');
        
        // --- Logic ปุ่มเริ่มทำแบบทดสอบ (XXX Replacement) ---
        const btn = document.getElementById('take-quiz-button');
        btn.onclick = () => {
            if (qLinks.length > 0) {
                let link = qLinks[0];
                // ค้นหา XXX แล้วแทนที่ด้วยชื่อจริง
                if (link.includes('XXX')) {
                    link = link.replace('XXX', encodeURIComponent(usersData[loggedInUser].name));
                }
                window.open(link, '_blank');
            } else {
                alert('ยังไม่มีแบบทดสอบ');
            }
        };
    }

    async function loadAdminContent() {
        const { vLinks, qLinks } = await fetchLinks();
        renderList(document.getElementById('admin-video-list'), vLinks, 'video');
        renderList(document.getElementById('admin-quiz-list'), qLinks, 'quiz');
    }

    // --- Dashboard & Scoring (With Monthly Filter) ---
    async function loadDashboard(role) {
        try {
            const response = await fetch(BASE_URL + SCORES_GID);
            const text = await response.text();
            const rows = parseCSV(text);
            
            const headers = rows[0].map(h => h.trim());
            
            // หา Index (พยายามหาให้เจอ)
            let userCol = headers.findIndex(h => h.includes('User') || h.includes('ชื่อผู้ใช้งาน') || h.includes('ผู้ประเมิน'));
            let scoreCol = headers.findIndex(h => h.includes('คะแนน') || h.includes('Score'));
            let timeCol = headers.findIndex(h => h.includes('Timestamp') || h.includes('ประทับเวลา'));

            // Fallback
            if (userCol === -1) userCol = 3; 
            if (scoreCol === -1) scoreCol = 2; 
            if (timeCol === -1) timeCol = 0; 

            const branchScores = {};
            const submittedUsers = new Set();
            let totalScore = 0;
            let count = 0;

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const timestamp = row[timeCol];
                const uName = row[userCol];
                const score = parseFloat(row[scoreCol]);

                // *** กรองเดือนปัจจุบันตรงนี้ ***
                if (isCurrentMonth(timestamp) && uName && !isNaN(score)) {
                    if (!submittedUsers.has(uName)) {
                        submittedUsers.add(uName);
                        count++;
                        totalScore += score;

                        const parts = uName.split(' สาขา');
                        if (parts.length > 1) {
                            const branch = 'สาขา' + parts[1];
                            if (!branchScores[branch]) branchScores[branch] = [];
                            branchScores[branch].push(score);
                        }
                    }
                }
            }

            const avg = count > 0 ? (totalScore / count).toFixed(2) : 0;
            const allStaffCount = Object.values(usersData).filter(u => u.role !== 'admin').length;

            if (role === 'admin') {
                document.getElementById('stat-submitted').textContent = `${count}/${allStaffCount}`;
                document.getElementById('stat-avg-score').textContent = avg;
                document.getElementById('stat-pending').textContent = allStaffCount - count;

                const list = document.getElementById('pending-user-list');
                list.innerHTML = '';
                Object.values(usersData).forEach(u => {
                    if (u.role !== 'admin' && !submittedUsers.has(u.name)) {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:orange;"></i> ${u.name}`;
                        list.appendChild(li);
                    }
                });
                renderChart('branchChart', branchScores, avg);
            } else {
                document.getElementById('user-stat-submitted').textContent = count;
                document.getElementById('user-stat-avg').textContent = avg;
                renderChart('userBranchChart', branchScores, avg);
            }

        } catch (e) {
            console.error("Dashboard error:", e);
        }
    }

    document.getElementById('check-score-button').addEventListener('click', async () => {
        const errorDiv = document.getElementById('score-error');
        const displayDiv = document.getElementById('score-display');
        const scoreVal = document.getElementById('display-score');
        const statusVal = document.getElementById('display-status');
        
        errorDiv.textContent = '';
        displayDiv.classList.add('hidden');

        try {
            const response = await fetch(BASE_URL + SCORES_GID);
            const text = await response.text();
            const rows = parseCSV(text);
            const headers = rows[0].map(h => h.trim());
            
            let userCol = headers.findIndex(h => h.includes('User') || h.includes('ชื่อ'));
            let scoreCol = headers.findIndex(h => h.includes('คะแนน') || h.includes('Score'));
            let statusCol = headers.findIndex(h => h.includes('Status') || h.includes('สถานะ'));
            let timeCol = headers.findIndex(h => h.includes('Timestamp') || h.includes('ประทับเวลา'));
            
            if (userCol === -1) userCol = 3; 
            if (scoreCol === -1) scoreCol = 2;
            if (statusCol === -1) statusCol = rows[0].length - 1; 
            if (timeCol === -1) timeCol = 0;

            const myName = usersData[loggedInUser].name;
            let found = false;

            // ค้นหาจากล่างขึ้นบน (ล่าสุด) และต้องเป็นเดือนปัจจุบัน
            for (let i = rows.length - 1; i > 0; i--) {
                const row = rows[i];
                if (row[userCol] === myName && isCurrentMonth(row[timeCol])) {
                    scoreVal.textContent = row[scoreCol];
                    statusVal.textContent = row[statusCol] || 'ส่งแล้ว';
                    
                    if(row[statusCol] && row[statusCol].includes('ตก')) {
                         statusVal.style.background = '#fef2f2';
                         statusVal.style.color = '#dc2626';
                    } else {
                         statusVal.style.background = '#dcfce7';
                         statusVal.style.color = '#166534';
                    }

                    displayDiv.classList.remove('hidden');
                    found = true;
                    break; 
                }
            }

            if (!found) errorDiv.textContent = 'ไม่พบผลคะแนนของเดือนนี้';

        } catch (e) {
            errorDiv.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
        }
    });

    function renderChart(canvasId, dataObj, avg) {
        const ctxEl = document.getElementById(canvasId);
        if(!ctxEl) return;
        
        const labels = Object.keys(dataObj);
        const dataVals = labels.map(k => {
            const arr = dataObj[k];
            return (arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2);
        });

        const bgColors = dataVals.map(v => parseFloat(v) >= parseFloat(avg) ? '#10b981' : '#f59e0b');

        if (window[canvasId] instanceof Chart) window[canvasId].destroy();

        window[canvasId] = new Chart(ctxEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'คะแนนเฉลี่ย',
                    data: dataVals,
                    backgroundColor: bgColors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: `เกณฑ์เฉลี่ยรวม: ${avg}` }
                }
            }
        });
    }

    const logout = () => {
        loggedInUser = null;
        userView.classList.add('hidden');
        adminView.classList.add('hidden');
        mainApp.classList.add('hidden');
        loginPage.classList.remove('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
        loadUsers(); 
    };

    document.getElementById('logout-button-user').addEventListener('click', logout);
    document.getElementById('logout-button-admin').addEventListener('click', logout);
    document.getElementById('view-all-results-button').addEventListener('click', () => {
        window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${SCORES_GID}`, '_blank');
    });
});
