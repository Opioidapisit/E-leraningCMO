import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient("https://jrtpzuolfukhjxaylfyg.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

const user = JSON.parse(sessionStorage.getItem("user"));
if (!user || user.role !== "admin") location.href = "index.html";

function logout() {
  sessionStorage.clear();
  location.href = "index.html";
}
window.logout = logout;

document.getElementById("videoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const link = document.getElementById("videoLink").value;
  await supabase.from("video_links").insert([{ link }]);
  alert("เพิ่มคลิปเรียบร้อยแล้ว!");
  location.reload();
});