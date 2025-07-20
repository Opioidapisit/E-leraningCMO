// ตรวจสอบการล็อกอิน
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // แสดงชื่อผู้ใช้
    document.getElementById('welcome-user').textContent = `ยินดีต้อนรับ, ${currentUser.name}`;
    document.getElementById('user-greeting').textContent = `ยินดีต้อนรับ ${currentUser.name}`;
    
    // โหลดข้อมูลวิดีโอ
    loadVideos();
    
    // โหลดสถานะแบบทดสอบ
    loadQuizStatus();
});

// ออกจากระบบ
document.getElementById('logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// โหลดวิดีโอ
function loadVideos() {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const videoContainer = document.querySelector('.video-container');
    
    videoContainer.innerHTML = '';
    
    if (videos.length === 0) {
        videoContainer.innerHTML = '<p>ยังไม่มีคลิปวิดีโอในระบบ</p>';
        return;
    }
    
    videos.forEach((video, index) => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <h5>คลิปที่ ${index + 1}</h5>
            <a href="${video.link}" target="_blank" class="btn-primary">ดูวิดีโอ</a>
            <div class="video-progress">
                <label>ความคืบหน้า:</label>
                <input type="range" min="0" max="100" value="0" class="progress-slider">
            </div>
        `;
        videoContainer.appendChild(videoCard);
    });
    
    // อัพเดตความคืบหน้าเมื่อเลื่อน slider
    document.querySelectorAll('.progress-slider').forEach(slider => {
        slider.addEventListener('input', updateProgress);
    });
}

// อัพเดตความคืบหน้า
function updateProgress() {
    const sliders = document.querySelectorAll('.progress-slider');
    let totalProgress = 0;
    
    sliders.forEach(slider => {
        totalProgress += parseInt(slider.value);
    });
    
    const avgProgress = totalProgress / sliders.length;
    document.getElementById('learning-progress').value = avgProgress;
    document.getElementById('progress-percentage').textContent = `${avgProgress}%`;
}

// โหลดสถานะแบบทดสอบ
function loadQuizStatus() {
    const quizStatus = localStorage.getItem('quizStatus') || 'not-attempted';
    const quizScore = localStorage.getItem('quizScore') || '-';
    
    document.getElementById('quiz-status-text').textContent = 
        quizStatus === 'passed' ? 'ผ่านการทดสอบ' : 
        quizStatus === 'failed' ? 'ไม่ผ่านการทดสอบ' : 'ยังไม่ทำแบบทดสอบ';
    
    document.getElementById('quiz-score').textContent = quizScore;
    
    if (quizStatus === 'passed') {
        document.getElementById('take-quiz-btn').disabled = true;
        document.getElementById('take-quiz-btn').textContent = 'ผ่านการทดสอบแล้ว';
    }
}

// ทำแบบทดสอบ
document.getElementById('take-quiz-btn').addEventListener('click', function() {
    window.location.href = 'quiz.html';
});