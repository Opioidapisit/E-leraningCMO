import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(
  "https://jrtpzuolfukhjxaylfyg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHB6dW9sZnVraGp4YXlsZnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTQwODEsImV4cCI6MjA2NTQzMDA4MX0.2s-epXqs7f3jCzJolNqHPDXuB1B77iNIvN-26TVswLA"
);
const user = JSON.parse(sessionStorage.getItem("user"));
if (!user) location.href = "index.html";
document.getElementById("welcome").innerText = "ยินดีต้อนรับ " + user.name;

function logout() {
  sessionStorage.clear();
  location.href = "index.html";
}

async function loadVideo() {
  const { data, error } = await supabase.from("video_links").select("*").order("id", { ascending: false }).limit(1);
  if (data && data.length > 0) {
    const link = data[0].link.replace("/view?usp=share_link", "/preview");
    document.getElementById("videoArea").innerHTML = `<iframe src="${link}" width="100%" height="300" allow="autoplay"></iframe>`;
  } else {
    document.getElementById("videoArea").innerText = "ยังไม่มีคลิปวิดีโอ";
  }
}
loadVideo();

window.logout = logout;

window.startQuiz = async () => {
  const { data: quiz } = await supabase.from("quiz").select("*");
  if (!quiz || quiz.length === 0) return alert("ยังไม่มีแบบทดสอบ");

  let score = 0;
  for (let i = 0; i < quiz.length; i++) {
    const q = quiz[i];
    const answer = prompt(`${q.question}
${q.choices.map((c, i) => i + 1 + '. ' + c).join("\n")}`);
    if (parseInt(answer) - 1 === q.answer) score++;
  }

  await supabase.from("quiz_results").insert([{ username: user.username, score }]);

  if (score >= 9) {
    alert("🎉 ผ่านการทดสอบแล้ว!");
    document.getElementById("quizStatus").innerText = "สถานะการสอบ: ผ่าน";
  } else {
    alert("❌ ไม่ผ่านการทดสอบ กรุณาทำใหม่");
    document.getElementById("quizStatus").innerText = "สถานะการสอบ: ไม่ผ่าน";
  }
};
