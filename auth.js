// ข้อมูลผู้ใช้ทั้งหมด
const users = {
    'admin': { password: 'admin', name: 'Admin', role: 'admin', branch: 'ระบบทั้งหมด' },
    'Ice': { password: '001-1', name: 'ไอซ์ สาขานาเมืองเพชร', role: 'user', branch: 'นาเมืองเพชร' },
    'Bowy': { password: '001-2', name: 'โบวี่ สาขานาเมืองเพชร', role: 'user', branch: 'นาเมืองเพชร' },
    'Jha': { password: '002-1', name: 'จ๋า สาขานาที่วัง', role: 'user', branch: 'นาที่วัง' },
    'Jaew': { password: '002-2', name: 'แจ๋ว สาขานาที่วัง', role: 'user', branch: 'นาที่วัง' },
    'Zeegame': { password: '003-1', name: 'ซีเกมส์ สาขาคลองเต็ง', role: 'user', branch: 'คลองเต็ง' },
    'Benz': { password: '003-2', name: 'เบนช์ สาขาคลองเต็ง', role: 'user', branch: 'คลองเต็ง' },
    'Mint': { password: '004-1', name: 'มินท์ สาขานาโยง', role: 'user', branch: 'นาโยง' },
    'Pair': { password: '004-2', name: 'แพร สาขานาโยง', role: 'user', branch: 'นาโยง' },
    'Maprang': { password: '004-3', name: 'มะปราง สาขานาโยง', role: 'user', branch: 'นาโยง' },
    'Maple': { password: '005-1', name: 'เมเปิ้ล สาขาท่ากลาง', role: 'user', branch: 'ท่ากลาง' },
    'Toey': { password: '005-2', name: 'เตย สาขาท่ากลาง', role: 'user', branch: 'ท่ากลาง' },
    'Oil': { password: '005-3', name: 'ออย สาขาท่ากลาง', role: 'user', branch: 'ท่ากลาง' },
    'Nuch': { password: '006-1', name: 'นุช สาขารัษฎา', role: 'user', branch: 'รัษฎา' },
    'Few': { password: '006-2', name: 'ฟิว สาขารัษฎา', role: 'user', branch: 'รัษฎา' },
    'Aom': { password: '007-1', name: 'อ้อม สาขารักษ์จันทน์', role: 'user', branch: 'รักษ์จันทน์' },
    'Pond': { password: '008-1', name: 'พร สาขาหน้าสภาราชินี', role: 'user', branch: 'หน้าสภาราชินี' },
    'Bow': { password: '008-2', name: 'โบว์ สาขาหน้าสภาราชินี', role: 'user', branch: 'หน้าสภาราชินี' },
    'Cream': { password: '009-1', name: 'ครีม สาขาบิ๊กซี', role: 'user', branch: 'บิ๊กซี' }
};

// ตรวจสอบการล็อกอิน
document.getElementById('login-btn').addEventListener('click', function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        // บันทึกข้อมูลผู้ใช้ใน sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
            username: username,
            name: users[username].name,
            role: users[username].role,
            branch: users[username].branch
        }));
        
        // นำทางไปยังหน้าตามบทบาท
        if (users[username].role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user.html';
        }
    } else {
        alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
});

// อนุญาตให้กด Enter เพื่อล็อกอิน
document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('login-btn').click();
    }
});