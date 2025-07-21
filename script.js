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

    const videoLinkInput = document.getElementById('video-link-input');
    const addVideoLinkButton = document.getElementById('add-video-link-button');
    const adminVideoList = document.getElementById('admin-video-list');

    const quizLinkInput = document.getElementById('quiz-link-input');
    const addQuizLinkButton = document.getElementById('add-quiz-link-button');
    const adminQuizList = document.getElementById('admin-quiz-list');

    const viewAllResultsButton = document.getElementById('view-all-results-button');
    const logoutButtonUser = document.getElementById('logout-button-user');
    const logoutButtonAdmin = document.getElementById('logout-button-admin');

    // User data (hardcoded for demonstration)
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
        Bow: { password: '008-2', name: 'โบว์ สาขาหน้าสภาราชินี', role: 'user' },
        Cream: { password: '009-1', name: 'ครีม สาขาบิ๊กซี', role: 'user' }
    };

    let loggedInUser = null; // Store the currently logged-in user's username

    // --- Utility Functions ---

    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getFromLocalStorage(key, defaultValue = []) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    function showPage(pageId) {
        loginPage.classList.add('hidden');
        userPage.classList.add('hidden');
        adminPage.classList.add('hidden');
        document.getElementById(pageId).classList.remove('hidden');
    }

    function renderVideoLinks(targetElement, links, isAdmin = false) {
        targetElement.innerHTML = '';
        if (links.length === 0) {
            targetElement.innerHTML = '<p>ยังไม่มีคลิปวิดีโอประจำเดือนนี้</p>';
            return;
        }
        links.forEach((link, index) => {
            const div = document.createElement('div');
            div.className = 'video-item';
            const a = document.createElement('a');
            a.href = link;
            a.textContent = `คลิปวิดีโอ #${index + 1}`;
            a.target = '_blank';
            div.appendChild(a);

            if (isAdmin) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'ลบ 🗑️';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => deleteLink('videos', index);
                div.appendChild(deleteButton);
            }
            targetElement.appendChild(div);
        });
    }

    function renderQuizLinks(targetElement, links, isAdmin = false) {
        targetElement.innerHTML = '';
        if (links.length === 0) {
            targetElement.innerHTML = '<p>ยังไม่มีแบบทดสอบประจำเดือนนี้</p>';
            return;
        }
        links.forEach((link, index) => {
            const div = document.createElement('div');
            div.className = 'quiz-item';
            const a = document.createElement('a');
            a.href = link;
            a.textContent = `แบบทดสอบ #${index + 1}`;
            a.target = '_blank';
            div.appendChild(a);

            if (isAdmin) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'ลบ 🗑️';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => deleteLink('quizzes', index);
                div.appendChild(deleteButton);
            }
            targetElement.appendChild(div);
        });
    }

    function deleteLink(type, index) {
        let links = getFromLocalStorage(type);
        links.splice(index, 1);
        saveToLocalStorage(type, links);
        if (type === 'videos') {
            renderVideoLinks(adminVideoList, links, true);
            renderVideoLinks(videoList, links); // Update user view as well
        } else if (type === 'quizzes') {
            renderQuizLinks(adminQuizList, links, true);
        }
    }

    // --- Login Functionality ---

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
                adminWelcomeMessage.textContent = `ยินดีต้อนรับ ${userDisplayName} 🎉 มาจัดการเนื้อหากันได้เลย`;
                loadAdminContent();
                showPage('admin-page');
            } else {
                welcomeMessage.textContent = `ยินดีต้อนรับ ${userDisplayName} 👋 มาเรียนรู้ด้วยตัวเองประจำเดือนนี้กันได้เลย`;
                displayUserName.textContent = userDisplayName; // Set user name for score display
                loadUserContent();
                showPage('user-page');
            }
        } else {
            loginError.textContent = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
        }
    });

    // Allow Enter key to submit login form
    loginForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission if any
            loginForm.dispatchEvent(new Event('submit')); // Trigger form submission
        }
    });

    // --- User Page Functionality ---

    function loadUserContent() {
        const videos = getFromLocalStorage('videos');
        renderVideoLinks(videoList, videos);
    }

    takeQuizButton.addEventListener('click', () => {
        const quizzes = getFromLocalStorage('quizzes');
        if (quizzes.length > 0) {
            // For simplicity, we'll open the first quiz link.
            // You might want to implement a way to select multiple quizzes if needed.
            window.open(quizzes[0], '_blank', 'noopener,noreferrer');
        } else {
            alert('ยังไม่มีแบบทดสอบประจำเดือนนี้ให้ทำ กรุณารอ Admin เพิ่มลิงก์แบบทดสอบ');
        }
    });

    checkScoreButton.addEventListener('click', async () => {
        scoreError.textContent = '';
        scoreDisplay.classList.add('hidden');
        displayScore.textContent = '';
        displayStatus.textContent = '';

        if (!loggedInUser) {
            scoreError.textContent = 'เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้งาน';
            return;
        }

        const userNameForLookup = users[loggedInUser].name; // Get the full name for lookup
        console.log('User Name for Lookup:', userNameForLookup); // <-- บรรทัดนี้สำคัญมาก!

        // Google Sheets API configuration - Replace with your own API Key and Sheet ID if you go beyond simple fetch
        const SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI';
        const GID = '441233492'; // The specific sheet tab you want to read from
        const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

        try {
            const response = await fetch(GOOGLE_SHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            // Simple CSV parsing (consider a more robust library for complex CSVs)
            const rows = csvText.trim().split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '')));

            // Assuming headers are in the first row
            const headers = rows[0];
            const dataRows = rows.slice(1);

            // Find column indices
            const userColIndex = headers.indexOf('User'); // Column C, 0-indexed is 2, but CSV might reorder
            const scoreColIndex = headers.indexOf('Score'); // Column B, 0-indexed is 1
            const statusColIndex = headers.indexOf('Status'); // Column N, 0-indexed is 13

            if (userColIndex === -1 || scoreColIndex === -1 || statusColIndex === -1) {
                throw new Error("Could not find required columns (User, Score, Status) in the spreadsheet.");
            }

            let found = false;
            for (const row of dataRows) {
                if (row[userColIndex] && row[userColIndex].trim() === userNameForLookup) {
                    displayScore.textContent = row[scoreColIndex] || 'ไม่มีข้อมูล';
                    displayStatus.textContent = row[statusColIndex] || 'ไม่มีข้อมูล';
                    scoreDisplay.classList.remove('hidden');
                    found = true;
                    break;
                }
            }

            if (!found) {
                scoreError.textContent = 'ไม่พบผลคะแนนของท่าน กรุณาทำแบบทดสอบประจำเดือนก่อน 😔';
            }

        } catch (error) {
            console.error('Error fetching or parsing spreadsheet data:', error);
            scoreError.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูลคะแนน กรุณาลองอีกครั้งในภายหลัง';
        }
    });

    // --- Admin Page Functionality ---

    function loadAdminContent() {
        const videos = getFromLocalStorage('videos');
        const quizzes = getFromLocalStorage('quizzes');
        renderVideoLinks(adminVideoList, videos, true);
        renderQuizLinks(adminQuizList, quizzes, true);
    }

    addVideoLinkButton.addEventListener('click', () => {
        const link = videoLinkInput.value.trim();
        if (link) {
            const videos = getFromLocalStorage('videos');
            videos.push(link);
            saveToLocalStorage('videos', videos);
            renderVideoLinks(adminVideoList, videos, true);
            renderVideoLinks(videoList, videos); // Update user view
            videoLinkInput.value = '';
        } else {
            alert('กรุณากรอกลิงก์วิดีโอ');
        }
    });

    addQuizLinkButton.addEventListener('click', () => {
        const link = quizLinkInput.value.trim();
        if (link) {
            const quizzes = getFromLocalStorage('quizzes');
            quizzes.push(link);
            saveToLocalStorage('quizzes', quizzes);
            renderQuizLinks(adminQuizList, quizzes, true);
            quizLinkInput.value = '';
        } else {
            alert('กรุณากรอกลิงก์แบบทดสอบ');
        }
    });

    viewAllResultsButton.addEventListener('click', () => {
        const sheetLink = "https://docs.google.com/spreadsheets/d/1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI/edit?resourcekey=&gid=441233492#gid=441233492";
        window.open(sheetLink, '_blank', 'noopener,noreferrer');
    });

    // --- Logout Functionality ---

    logoutButtonUser.addEventListener('click', () => {
        loggedInUser = null;
        showPage('login-page');
    });

    logoutButtonAdmin.addEventListener('click', () => {
        loggedInUser = null;
        showPage('login-page');
    });

    // Initial page load (show login page)
    showPage('login-page');
});
