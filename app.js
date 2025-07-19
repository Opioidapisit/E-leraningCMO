const users = {
  "admin": { password: "admin", name: "Admin", role: "admin" },
  "Ice": { password: "001-1", name: "ไอซ์ สาขานาเมืองเพชร", role: "user" },
  "Bowy": { password: "001-2", name: "โบวี่ สาขานาเมืองเพชร", role: "user" }
};

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const user = users[username];
  if (user && user.password === password) {
    sessionStorage.setItem("user", JSON.stringify({ username, name: user.name, role: user.role }));
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง ❌";
  }
});