// js/login.js
import { users } from './users.js';

document.querySelector("button[onclick='login()']").addEventListener("click", login);

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!users[username]) {
    alert("ชื่อผู้ใช้ไม่ถูกต้อง");
    return;
  }

  if (users[username].password !== password) {
    alert("รหัสผ่านไม่ถูกต้อง");
    return;
  }

  // Save user to localStorage
  localStorage.setItem("currentUser", JSON.stringify(users[username]));

  // Show dashboard
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("welcome").innerText = `ยินดีต้อนรับคุณ ${users[username].name}`;

  if (users[username].role === "admin") {
    document.getElementById("adminPanel").style.display = "block";
  } else {
    document.getElementById("userPanel").style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

window.logout = logout;

window.onload = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("welcome").innerText = `ยินดีต้อนรับคุณ ${currentUser.name}`;

    if (currentUser.role === "admin") {
      document.getElementById("adminPanel").style.display = "block";
    } else {
      document.getElementById("userPanel").style.display = "block";
    }
  }
};
