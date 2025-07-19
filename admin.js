import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(
  "https://jrtpzuolfukhjxaylfyg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHB6dW9sZnVraGp4YXlsZnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTQwODEsImV4cCI6MjA2NTQzMDA4MX0.2s-epXqs7f3jCzJolNqHPDXuB1B77iNIvN-26TVswLA"
);

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
