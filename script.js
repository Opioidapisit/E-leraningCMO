document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration (ต้องแก้ตรงนี้) ---
    const SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI'; // ID เดิม
    const LINKS_GID = '1566756560'; 
    const SCORES_GID = '441233492';
    
    // *** สำคัญ: ต้องสร้าง Tab ใหม่ชื่อ Users และเอา GID มาใส่ตรงนี้ ***
    const USERS_GID = '992216903'; // <--- เปลี่ยนเลขนี้เป็น GID ของ Tab "Users" ที่สร้างใหม่ (ถ้าเป็น Tab แรกสุดมักจะเป็น 0)

    const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=`;

    // --- State ---
    let usersData = {}; // จะถูกเติมข้อมูลจาก Sheet
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
        // แปลงปี ค.ศ. เป็น พ.ศ. แบบง่ายๆ
        const dateStr = now.toLocaleDateString('th-TH', options);
        headerDate.textContent = dateStr;
    }

    async function initSystem() {
        // โหลดข้อมูล User ก่อนอนุญาตให้ล็อกอิน
        loadingText.style.display = 'block';
        const success = await loadUsers();
        loadingText.style.display = 'none';
        
        if (!success) {
            loginError.textContent = 'ไม่สามารถเชื่อมต่อฐานข้อมูลผู้ใช้งานได้ กรุณาติดต่อ Admin';
            document.querySelector('button[type="submit"]').disabled = true;
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

    // --- Helper: Date Filter (Month Logic) ---
    function isCurrentMonth(timestampStr) {
        if (!timestampStr) return false;
        
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();   // 2026
        
        // รูปแบบวันที่ Google Sheet: d/M/yyyy H:m:s (เช่น 2/1/2026 10:00:00) 
        // หรืออาจจะส่งมาเป็น 2/1/2569 (พ.ศ.)
        
        // วิธีที่ง่ายที่สุดและปลอดภัยคือเช็ค String Match (เพราะ Format ค่อนข้างตายตัวจาก Forms)
        // สร้าง String ที่จะค้นหา เช่น "/1/2026" หรือ "/01/2026"
        
        // แต่เพื่อความชัวร์ เราจะ Parse ตัวเลขออกมา
        try {
            const datePart = timestampStr.split(' ')[0]; // เอาเฉพาะวันที่ ตัดเวลาทิ้ง
            const parts = datePart.split('/'); // [d, M, yyyy]
            
            if (parts.length < 3) return false;
            
            let m = parseInt(parts[1]);
            let y = parseInt(parts[2]);
            
            // แปลง พ.ศ. เป็น ค.ศ. ถ้าปีมากกว่า 2400
            if (y > 2400) y -= 543;
            
            return (m === currentMonth && y === currentYear);
        } catch (e) {
            console.error("Date parse error:", timestampStr, e);
            return false;
        }
    }

    // --- Core: Load Users from Sheet ---
    async function loadUsers() {
        try {
            const response = await fetch(BASE_URL + USERS_GID);
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            const rows = parseCSV(text);
            
            // สมมติ Row 1 คือ Header: Username, Password, Name, Role
            // เริ่ม loop ที่ i=1
            usersData = {}; // Reset
            for (let i = 1; i < rows.length; i++) {
                const [user, pass, name, role] = rows[i];
                if (user && pass) {
                    usersData[user.trim()] = {
                        password: pass.trim(),
                        name: name.trim(),
                        role: role.trim().toLowerCase()
                    };
                }
            }
            console.log("Users loaded:", Object.keys(usersData).length);
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
            
            // UI Transition
            loginPage.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            const userData = usersData[u];
            
            if (userData.role === 'admin') {
                userView.classList.add('hidden');
                adminView.classList.remove('hidden');
                document.getElementById('admin-welcome-message').textContent = `ยินดีต้อนรับ, ${userData.name}`;
                loadAdminContent(); // Function เดิม แต่เรียก Dashboard ด้วย
            } else {
                adminView.classList.add('hidden');
                userView.classList.remove('hidden');
                document.getElementById('welcome-message').textContent = `สวัสดีคุณ ${userData.name}`;
                document.getElementById('display-user-name').textContent = userData.name;
                loadUserContent();
            }
            
            // Load Dashboard (Shared Logic)
            loadDashboard(userData.role);

        } else {
            loginError.textContent = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
        }
    });

    // --- Content Loading (Links) ---
    async function fetchLinks() {
        const response = await fetch(BASE_URL + LINKS_GID);
        const text = await response.text();
        const rows = parseCSV(text);
        // Headers: Timestamp, Video Link, Quiz Link
        // สมมติ Col 1 = Video, Col 2 = Quiz
        const vLinks = [];
        const qLinks = [];
        // อ่านจากแถวที่ 1 (ไม่ใช่ 0 เพราะ 0 คือ header)
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][1]) vLinks.push(rows[i][1]); // Col B
            if (rows[i][2]) qLinks.push(rows[i][2]); // Col C
        }
        return { vLinks, qLinks };
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
            
            // Replace XXX Logic
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
        
        // Setup Big Button
        const btn = document.getElementById('take-quiz-button');
        btn.onclick = () => {
            if (qLinks.length > 0) {
                let link = qLinks[0];
                if (link.includes('XXX')) link = link.replace('XXX', encodeURIComponent(usersData[loggedInUser].name));
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

    // --- Dashboard & Scoring Logic (With Month Filter) ---
    async function loadDashboard(role) {
        try {
            const response = await fetch(BASE_URL + SCORES_GID);
            const text = await response.text();
            const rows = parseCSV(text);
            
            const headers = rows[0].map(h => h.trim());
            const userCol = headers.indexOf('User');   // ต้องตรงกับใน Sheet
            const scoreCol = headers.indexOf('คะแนน'); // ต้องตรงกับใน Sheet
            const timeCol = headers.indexOf('Timestamp'); // หรือ 'ประทับเวลา'

            // Data Containers
            const branchScores = {};
            const submittedUsers = new Set();
            let totalScore = 0;
            let count = 0;

            // Loop Data Rows
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const timestamp = row[timeCol];
                const uName = row[userCol];
                const score = parseFloat(row[scoreCol]);

                // *** CRITICAL: Filter by Current Month ***
                if (isCurrentMonth(timestamp) && uName && !isNaN(score)) {
                    // Check duplicate (เอาคะแนนล่าสุด หรือนับครั้งแรก แล้วแต่นโยบาย)
                    // ในที่นี้เรานับหมด แต่ถ้าจะเอารายคน ต้องเช็ค Set
                    if (!submittedUsers.has(uName)) {
                        submittedUsers.add(uName);
                        count++;
                        totalScore += score;

                        // Branch Logic (จากชื่อ "Name สาขาBranch")
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
                // Update Admin Stats
                document.getElementById('stat-submitted').textContent = `${count}/${allStaffCount}`;
                document.getElementById('stat-avg-score').textContent = avg;
                document.getElementById('stat-pending').textContent = allStaffCount - count;

                // Pending List
                const list = document.getElementById('pending-user-list');
                list.innerHTML = '';
                Object.values(usersData).forEach(u => {
                    if (u.role !== 'admin' && !submittedUsers.has(u.name)) {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:orange; margin-right:5px;"></i> ${u.name}`;
                        list.appendChild(li);
                    }
                });
                renderChart('branchChart', branchScores, avg);
            } else {
                // Update User Stats
                document.getElementById('user-stat-submitted').textContent = count;
                document.getElementById('user-stat-avg').textContent = avg;
                renderChart('userBranchChart', branchScores, avg);
            }

        } catch (e) {
            console.error("Dashboard error:", e);
        }
    }

    // --- Check Personal Score (Month Filtered) ---
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
            
            const userCol = headers.indexOf('User');
            const scoreCol = headers.indexOf('คะแนน');
            const statusCol = headers.indexOf('Status'); // หรือ 'สถานะ'
            const timeCol = headers.indexOf('Timestamp');

            const myName = usersData[loggedInUser].name;
            let found = false;

            // ค้นหาจากล่างขึ้นบน (คะแนนล่าสุด)
            for (let i = rows.length - 1; i > 0; i--) {
                const row = rows[i];
                if (row[userCol] === myName && isCurrentMonth(row[timeCol])) {
                    scoreVal.textContent = row[scoreCol];
                    statusVal.textContent = row[statusCol] || 'ตรวจแล้ว';
                    
                    // Style status badge
                    if(row[statusCol] && row[statusCol].includes('ตก')) {
                         statusVal.style.background = '#f8d7da';
                         statusVal.style.color = '#721c24';
                    } else {
                         statusVal.style.background = '#d1e7dd';
                         statusVal.style.color = '#0f5132';
                    }

                    displayDiv.classList.remove('hidden');
                    found = true;
                    break; 
                }
            }

            if (!found) {
                errorDiv.textContent = 'ไม่พบผลคะแนนของเดือนนี้ กรุณาทำแบบทดสอบก่อน';
            }

        } catch (e) {
            errorDiv.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
        }
    });

    // --- Chart Renderer ---
    function renderChart(canvasId, dataObj, avg) {
        const ctxEl = document.getElementById(canvasId);
        if(!ctxEl) return;
        
        const labels = Object.keys(dataObj);
        const dataVals = labels.map(k => {
            const arr = dataObj[k];
            return (arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2);
        });

        // Colors
        const bgColors = dataVals.map(v => parseFloat(v) >= parseFloat(avg) ? '#198754' : '#fd7e14'); // Green / Orange

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
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: `เกณฑ์เฉลี่ยรวม: ${avg}` }
                }
            }
        });
    }

    // --- Logout ---
    const logout = () => {
        loggedInUser = null;
        userView.classList.add('hidden');
        adminView.classList.add('hidden');
        mainApp.classList.add('hidden');
        loginPage.classList.remove('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
        // Reload users in case sheet changed
        loadUsers(); 
    };

    document.getElementById('logout-button-user').addEventListener('click', logout);
    document.getElementById('logout-button-admin').addEventListener('click', logout);
    document.getElementById('view-all-results-button').addEventListener('click', () => {
        window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${SCORES_GID}`, '_blank');
    });
});
