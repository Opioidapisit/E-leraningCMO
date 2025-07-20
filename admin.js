// ตรวจสอบการล็อกอิน
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // แสดงชื่อผู้ใช้
    document.getElementById('welcome-user').textContent = `ยินดีต้อนรับ, ${currentUser.name}`;
    
    // โหลดข้อมูลวิดีโอจาก localStorage
    loadVideos();
    loadUsers();
});

// ออกจากระบบ
document.getElementById('logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// โหลดวิดีโอ
function loadVideos() {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const videoLinksContainer = document.querySelector('.video-links');
    
    videoLinksContainer.innerHTML = '';
    
    videos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-link-item';
        videoItem.innerHTML = `
            <a href="${video.link}" target="_blank">คลิปที่ ${index + 1}</a>
            <button class="btn-secondary delete-video" data-index="${index}">ลบ</button>
        `;
        videoLinksContainer.appendChild(videoItem);
    });
    
    // เพิ่มเหตุการณ์ลบวิดีโอ
    document.querySelectorAll('.delete-video').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const videos = JSON.parse(localStorage.getItem('videos')) || [];
            videos.splice(index, 1);
            localStorage.setItem('videos', JSON.stringify(videos));
            loadVideos();
        });
    });
}

// เพิ่มวิดีโอใหม่
document.getElementById('add-video-btn').addEventListener('click', function() {
    const videoLink = document.getElementById('new-video-link').value.trim();
    
    if (!videoLink) {
        alert('กรุณาใส่ลิงก์วิดีโอ');
        return;
    }
    
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    videos.push({ link: videoLink });
    localStorage.setItem('videos', JSON.stringify(videos));
    
    document.getElementById('new-video-link').value = '';
    loadVideos();
});

// โหลดรายการผู้ใช้
function loadUsers() {
    const usersList = document.querySelector('.users-list');
    usersList.innerHTML = '';
    
    for (const [username, userData] of Object.entries(users)) {
        if (username === 'admin') continue;
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div>
                <strong>${userData.name}</strong>
                <span>(${userData.branch})</span>
            </div>
            <div>
                <span>ชื่อผู้ใช้: ${username}</span>
                <span>รหัสผ่าน: ${userData.password}</span>
            </div>
        `;
        usersList.appendChild(userItem);
    }
}

// ไปหน้าแก้ไขแบบทดสอบ
document.getElementById('edit-quiz-btn').addEventListener('click', function() {
    // ในที่นี้ควรเชื่อมต่อกับ Google Sheets API
    alert('ระบบจะเชื่อมต่อไปยัง Google Sheets เพื่อแก้ไขแบบทดสอบ');
    // window.open('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0');
});