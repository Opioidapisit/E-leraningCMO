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
window.logout = logout;

const loadVideo = async () => {
  const { data, error } = await supabase
    .from("video_links")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

  console.log("video_links data:", data, "error:", error);

  const videoArea = document.getElementById("videoArea");

  if (data && data.length > 0) {
    const link = data[0].link;
    videoArea.innerHTML = `<a href="${link}" target="_blank" style="font-size: 18px;">🎥 คลิกเพื่อดูวิดีโอ</a>`;
  } else {
    videoArea.innerText = "ยังไม่มีคลิปวิดีโอ";
  }
};

const checkQuizStatus = async () => {
  const { data: results } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("username", user.username)
    .order("id", { ascending: false })
    .limit(1);

  const statusEl = document.getElementById("quizStatus");

  if (!results || results.length === 0) {
    statusEl.innerText = "สถานะการสอบ: ยังไม่ทำแบบทดสอบ";
    return "ยังไม่ทำ";
  }

  const lastScore = results[0].score;
  if (lastScore >= 9) {
    statusEl.innerText = "สถานะการสอบ: ผ่าน";
    return "ผ่าน";
  } else {
    statusEl.innerText = "สถานะการสอบ: ไม่ผ่าน";
    return "ไม่ผ่าน";
  }
};

window.startQuiz = async () => {
  const status = await checkQuizStatus();
  if (status === "ผ่าน") {
    alert("คุณได้ผ่านการทดสอบแล้ว ไม่สามารถทำซ้ำได้จนกว่าจะมีแบบทดสอบใหม่ ❗");
    return;
  }

  const { data: quiz } = await supabase.from("quiz").select("*");
  if (!quiz || quiz.length === 0) {
    alert("ยังไม่มีแบบทดสอบ ❌");
    return;
  }

  let score = 0;
  for (let i = 0; i < quiz.length; i++) {
    const q = quiz[i];
    const answer = prompt(
      `ข้อ ${i + 1}/${quiz.length}:
${q.question}

${q.choices
        .map((c, idx) => `${idx + 1}. ${c}`)
        .join("\n")}`
    );
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

loadVideo();
checkQuizStatus();
console.log("User:", user);