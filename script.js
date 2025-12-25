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

    // Admin specific elements (some will be simplified as management moves to Google Sheet)
    const videoLinkInput = document.getElementById('video-link-input'); // These inputs will now be for user info, not link management
    const addVideoLinkButton = document.getElementById('add-video-link-button'); // This button will be removed or repurposed
    const adminVideoList = document.getElementById('admin-video-list'); // This will now just display links from sheet
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
        Maple: { password: '005-1', name: 'เมเปิ้ล สาขาท่ากลาง', 'role': 'user' },
        Toey: { password: '005-2', name: 'เตย สาขาท่ากลาง', role: 'user' },
        Oil: { password: '005-3', name: 'ออย สาขาท่ากลาง', role: 'user' },
        Nuch: { password: '006-1', name: 'นุช สาขารัษฎา', role: 'user' },
        Few: { password: '006-2', name: 'ฟิว สาขารัษฎา', role: 'user' },
        Aom: { password: '007-1', name: 'อ้อม สาขารักษ์จันทน์', role: 'user' },
        Pond: { password: '008-1', name: 'พร สาขาหน้าสภาราชินี', role: 'user' },
        Bow: { password: '009-1', name: 'โบว์ สาขาบิ๊กซี', role: 'user' },
    };

    let loggedInUser = null;

    // --- Google Sheet Configuration for Links ---
    const LINKS_SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI';
    const LINKS_GID = '1566756560'; // GID for the sheet containing video and quiz links
    const LINKS_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${LINKS_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${LINKS_GID}`;

    // --- Google Sheet Configuration for Scores ---
    const SCORES_SHEET_ID = '1zlybKBVi9sQ4NOBAXK7_0gxmDS6wS-fRytLnjHX_ZQI';
    const SCORES_GID = '441233492'; // GID for the sheet containing scores
    const SCORES_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SCORES_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SCORES_GID}`;

    // --- Utility Functions ---
    function showPage(pageId) {
        loginPage.classList.add('hidden');
        userPage.classList.add('hidden');
        adminPage.classList.add('hidden');
        document.getElementById(pageId).classList.remove('hidden');
    }

    // Improved CSV parsing function
    const parseCSV = (text) => {
        const rows = text.trim().split(/\r?\n/);
        return rows.map(row => {
            const cells = [];
            let inQuote = false;
            let currentCell = '';
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    cells.push(currentCell.replace(/^"|"$/g, ''));
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
            cells.push(currentCell.replace(/^"|"$/g, ''));
            return cells;
        });
    };

    function renderLinks(targetElement, links, type, isAdmin = false) {
        targetElement.innerHTML = '';
        if (links.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'info-text';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.innerHTML = `<i class="fa-regular fa-folder-open"></i> ยังไม่มี${type === 'video' ? 'คลิปวิดีโอ' : 'แบบทดสอบ'}ประจำเดือนนี้`;
            targetElement.appendChild(emptyMsg);
            return;
        }
        links.forEach((link, index) => {
            if (link.trim() === '') return; 
            
            const div = document.createElement('div');
            // ใช้ class เดิมเพื่อให้ CSS ทำงาน
            div.className = `${type}-item`; 
            
            const a = document.createElement('a');
            a.href = link;
            // ลบ text "คลิปวิดีโอ #" ออก แล้วใส่แค่ชื่อ หรือ icon ใน CSS แทน เพื่อความคลีน
            // หรือถ้าอยากให้มีข้อความ:
            a.textContent = `${type === 'video' ? 'คลิปบทเรียนที่' : 'แบบทดสอบชุดที่'} ${index + 1}`;
            a.target = '_blank';
            
            div.appendChild(a);
            
            // ส่วนของปุ่มลบ (สำหรับ Admin) - ถ้าอยากซ่อนในหน้า Admin แบบใหม่ก็ไม่ต้องใส่
            // แต่ถ้าจะใส่ให้ใช้ icon แทน
            if (isAdmin) {
               // ในดีไซน์ใหม่เราเน้นดูผ่าน Sheet แต่ถ้าจะคงไว้:
               // const delBtn = document.createElement('span');
               // delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
               // delBtn.className = 'delete-button';
               // div.appendChild(delBtn);
            }

            targetElement.appendChild(div);
        });
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
                displayUserName.textContent = userDisplayName;
                loadUserContent();
                showPage('user-page');
            }
        } else {
            loginError.textContent = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
        }
    });

    loginForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // --- User Page Functionality ---
    async function loadUserContent() {
        try {
            const response = await fetch(LINKS_GOOGLE_SHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            const headers = rows[0].map(header => header.trim());
            const videoColIndex = headers.indexOf('Video Link'); // Assuming column A is named "Video Link"
            const quizColIndex = headers.indexOf('Quiz Link');   // Assuming column B is named "Quiz Link"

            if (videoColIndex === -1 || quizColIndex === -1) {
                console.error("Column 'Video Link' or 'Quiz Link' not found in the links sheet.");
                videoList.innerHTML = '<p class="error-message">ไม่พบข้อมูลลิงก์วิดีโอหรือแบบทดสอบ กรุณาแจ้ง Admin</p>';
                takeQuizButton.disabled = true;
                return;
            }

            const videoLinks = [];
            const quizLinks = [];
            for (let i = 1; i < rows.length; i++) { // Start from second row (data rows)
                const row = rows[i];
                if (row[videoColIndex]) videoLinks.push(row[videoColIndex].trim());
                if (row[quizColIndex]) quizLinks.push(row[quizColIndex].trim());
            }

            renderLinks(videoList, videoLinks, 'video');

            // Store quiz links temporarily for the button
            takeQuizButton.onclick = () => {
                if (quizLinks.length > 0) {
                    window.open(quizLinks[0], '_blank', 'noopener,noreferrer');
                } else {
                    alert('ยังไม่มีแบบทดสอบประจำเดือนนี้ให้ทำ กรุณารอ Admin เพิ่มลิงก์แบบทดสอบ');
                }
            };

        } catch (error) {
            console.error('Error fetching links from Google Sheet:', error);
            videoList.innerHTML = '<p class="error-message">เกิดข้อผิดพลาดในการดึงลิงก์ กรุณาลองใหม่ในภายหลัง</p>';
            takeQuizButton.disabled = true;
        }
    }


    checkScoreButton.addEventListener('click', async () => {
        scoreError.textContent = '';
        scoreDisplay.classList.add('hidden');
        displayScore.textContent = '';
        displayStatus.textContent = '';

        if (!loggedInUser) {
            scoreError.textContent = 'เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้งาน';
            return;
        }

        const userNameForLookup = users[loggedInUser].name;
        console.log('User Name for Lookup:', userNameForLookup);

        try {
            const response = await fetch(SCORES_GOOGLE_SHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            console.log('Raw CSV Text (คะแนน):', csvText);

            const rows = parseCSV(csvText);
            console.log('Parsed Rows (คะแนน):', rows);

            const headers = rows[0].map(header => header.trim());
            const dataRows = rows.slice(1);
            console.log('Headers (คะแนน):', headers);

            const userColIndex = headers.indexOf('User');
            const scoreColIndex = headers.indexOf('คะแนน');
            const statusColIndex = headers.indexOf('Status');
            console.log('Column Indices - User:', userColIndex, 'คะแนน:', scoreColIndex, 'Status:', statusColIndex);

            if (userColIndex === -1 || scoreColIndex === -1 || statusColIndex === -1) {
                throw new Error("ไม่พบชื่อคอลัมน์ที่จำเป็น ('User', 'คะแนน', 'Status') ใน Google Sheet ผลคะแนนของคุณ กรุณาตรวจสอบว่าสะกดถูกต้องและ **ไม่มีช่องว่างด้านหน้าหรือด้านหลังชื่อคอลัมน์** ในแถวแรกของชีท");
            }

            let found = false;
            for (const row of dataRows) {
                const cellUserName = row[userColIndex] ? row[userColIndex].trim() : '';
                console.log('Checking row (คะแนน):', cellUserName, 'against', userNameForLookup);
                if (cellUserName === userNameForLookup) {
                    displayScore.textContent = row[scoreColIndex] || 'ไม่มีข้อมูล';
                    displayStatus.textContent = row[statusColIndex] || 'ไม่มีข้อมูล';
                    scoreDisplay.classList.remove('hidden');
                    found = true;
                    console.log('User found! คะแนน:', row[scoreColIndex], 'Status:', row[statusColIndex]);
                    break;
                }
            }

            if (!found) {
                scoreError.textContent = 'ไม่พบผลคะแนนของท่าน กรุณาทำแบบทดสอบประจำเดือนก่อน 😔';
            }

        } catch (error) {
            console.error('Error fetching or parsing spreadsheet data (คะแนน):', error);
            scoreError.textContent = error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลคะแนน กรุณาลองอีกครั้งในภายหลัง';
        }
    });

    // --- Admin Page Functionality ---
    async function loadAdminContent() {
        try {
            const response = await fetch(LINKS_GOOGLE_SHEET_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            const headers = rows[0].map(header => header.trim());
            const videoColIndex = headers.indexOf('Video Link');
            const quizColIndex = headers.indexOf('Quiz Link');

            if (videoColIndex === -1 || quizColIndex === -1) {
                console.error("Column 'Video Link' or 'Quiz Link' not found in the links sheet for admin view.");
                adminVideoList.innerHTML = '<p class="error-message">ไม่พบข้อมูลคอลัมน์ลิงก์วิดีโอหรือแบบทดสอบในชีท</p>';
                adminQuizList.innerHTML = '';
                return;
            }

            const videoLinks = [];
            const quizLinks = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row[videoColIndex]) videoLinks.push(row[videoColIndex].trim());
                if (row[quizColIndex]) quizLinks.push(row[quizColIndex].trim());
            }

            // For admin view, just display the links from the sheet.
            // Admin can edit the sheet directly.
            renderLinks(adminVideoList, videoLinks, 'video', true); // Pass true for isAdmin to show delete buttons (though they won't delete from sheet directly)
            renderLinks(adminQuizList, quizLinks, 'quiz', true);

            // Hide or disable local storage management UI for Admin
            videoLinkInput.style.display = 'none';
            addVideoLinkButton.style.display = 'none';
            quizLinkInput.style.display = 'none';
            addQuizLinkButton.style.display = 'none';

            // You might want to add a message for admin to edit the Google Sheet directly
            if (adminVideoList.innerHTML === '<p>ยังไม่มีคลิปวิดีโอประจำเดือนนี้</p>') {
                 adminVideoList.innerHTML += '<p><strong>ℹ️ จัดการลิงก์วิดีโอโดยตรงใน Google Sheet คอลัมน์ A (Video Link)</strong></p>';
            }
            if (adminQuizList.innerHTML === '<p>ยังไม่มีแบบทดสอบประจำเดือนนี้</p>') {
                adminQuizList.innerHTML += '<p><strong>ℹ️ จัดการลิงก์แบบทดสอบโดยตรงใน Google Sheet คอลัมน์ B (Quiz Link)</strong></p>';
            }


        } catch (error) {
            console.error('Error fetching links for admin from Google Sheet:', error);
            adminVideoList.innerHTML = '<p class="error-message">เกิดข้อผิดพลาดในการดึงลิงก์สำหรับ Admin กรุณาลองใหม่ในภายหลัง</p>';
            adminQuizList.innerHTML = '';
        }
    }


    // The Add/Delete link buttons for admin are now redundant as links are managed in Google Sheet
    // So we'll hide them via CSS or remove them in JS for clarity in admin page.
    // For now, I've added display: none in loadAdminContent().

    viewAllResultsButton.addEventListener('click', () => {
        const sheetLink = `https://docs.google.com/spreadsheets/d/${SCORES_SHEET_ID}/edit?resourcekey=&gid=${SCORES_GID}#gid=${SCORES_GID}`;
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
