// Supabase init
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = 'https://jrtpzuolfukhjxaylfyg.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHB6dW9sZnVraGp4YXlsZnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTQwODEsImV4cCI6MjA2NTQzMDA4MX0.2s-epXqs7f3jCzJolNqHPDXuB1B77iNIvN-26TVswLA';
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const users = {
  "admin": { password: "admin", name: "Admin", role: "admin" },
  "Ice": { password: "001-1", name: "ไอซ์ สาขานาเมืองเพชร", role: "user" },
  "Bowy": { password: "001-2", name: "โบวี่ สาขานาเมืองเพชร", role: "user" },
  "Jha": { password: "002-1", name: "จ๋า สาขานาที่วัง", role: "user" },
  "Jaew": { password: "002-2", name: "แจ๋ว สาขานาที่วัง", role: "user" },
  "Zeegame": { password: "003-1", name: "ซีเกมส์ สาขาคลองเต็ง", role: "user" },
  "Benz": { password: "003-2", name: "เบนช์ สาขาคลองเต็ง", role: "user" },
  "Mint": { password: "004-1", name: "มินท์ สาขานาโยง", role: "user" },
  "Pair": { password: "004-2", name: "แพร สาขานาโยง", role: "user" },
  "Maprang": { password: "004-3", name: "มะปราง สาขานาโยง", role: "user" },
  "Maple": { password: "005-1", name: "เมเปิ้ล สาขาท่ากลาง", role: "user" },
  "Toey": { password: "005-2", name: "เตย สาขาท่ากลาง", role: "user" },
  "Oil": { password: "005-3", name: "ออย สาขาท่ากลาง", role: "user" },
  "Nuch": { password: "006-1", name: "นุช สาขารัษฎา", role: "user" },
  "Few": { password: "006-2", name: "ฟิว สาขารัษฎา", role: "user" },
  "Aom": { password: "007-1", name: "อ้อม สาขารักษ์จันทน์", role: "user" },
  "Pond": { password: "008-1", name: "พร สาขาหน้าสภาราชินี", role: "user" },
  "Bow": { password: "008-2", name: "โบว์ สาขาหน้าสภาราชินี", role: "user" },
  "Cream": { password: "009-1", name: "ครีม สาขาบิ๊กซี", role: "user" }
};

document.getElementById("loginForm").addEventListener("submit", async function(e) {
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