import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(
  "https://jrtpzuolfukhjxaylfyg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHB6dW9sZnVraGp4YXlsZnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTQwODEsImV4cCI6MjA2NTQzMDA4MX0.2s-epXqs7f3jCzJolNqHPDXuB1B77iNIvN-26TVswLA"
);

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
