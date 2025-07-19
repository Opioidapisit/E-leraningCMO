import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient("https://jrtpzuolfukhjxaylfyg.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const quiz = JSON.parse(document.getElementById("quizJson").value);
    await supabase.from("quiz").delete().neq("id", 0); // clear old
    for (const q of quiz) {
      await supabase.from("quiz").insert([q]);
    }
    alert("บันทึกข้อสอบเรียบร้อย!");
  } catch (err) {
    alert("❌ ข้อมูลไม่ถูกต้อง: " + err.message);
  }
});