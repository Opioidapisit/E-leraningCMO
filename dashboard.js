import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jrtpzuolfukhjxaylfyg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHB6dW9sZnVraGp4YXlsZnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTQwODEsImV4cCI6MjA2NTQzMDA4MX0.2s-epXqs7f3jCzJolNqHPDXuB1B77iNIvN-26TVswLA"
);

// ดึงข้อมูลผู้ใช้
const user = JSON.parse(sessionStorage.getItem("user"));
if (!user) location.href = "index.html";
document.getElementById("welcome").innerText = "ยินดีต้อนรับ " + user.name;

// ปุ่มออกจากระบบ
function logout() {
  sessionStorage.clear();
  location.href = "index.html";
}
window.logout = logout;

// โหลดวิดีโอล่าสุดจาก Supabase
async function loadVideo() {
  const { data, error } = await supabase
    .from("video_links")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

  console.log("video_links data:", data, "error:", error);

  if (data && data.length > 0) {
    const rawLink = data[0].link;
    let embedLink = rawLink;
    if (rawLink.includes("/view")) {
      embedLink = rawLink.replace("/view", "/preview");
    }
    document.getElementById("videoArea").innerHTML = `<iframe src="${embedLink}" width="100%" height="300" allow="autoplay"></iframe>`;
  } else {
    document.getElementById("videoArea").innerText = "ยังไม่มีคลิปวิดีโอ";
  }
}

// ตรวจสอบสถานะการสอบ
async function checkQuizStatus() {
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
}

// ฟังก์ชันเริ่มทำแบบทดสอบ
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
      `ข้อ ${i + 1}/${quiz.length}:\n${q.question}\n\n${q.choices
        .map((c, idx) => `${idx + 1}. ${c}`)
        .join("\n")}`
    );
    if (parseInt(answer) - 1 === q.answer) score++;
  }

  await supabase.from("quiz_results").insert([
    { username: user.username, score }
  ]);

  if (score >= 9) {
    alert("🎉 ผ่านการทดสอบแล้ว!");
    document.getElementById("quizStatus").innerText = "สถานะการสอบ: ผ่าน";
  } else {
    alert("❌ ไม่ผ่านการทดสอบ กรุณาทำใหม่");
    document.getElementById("quizStatus").innerText = "สถานะการสอบ: ไม่ผ่าน";
  }
};

// โหลดหน้า: วิดีโอ + เช็คสถานะการสอบ
loadVideo();
checkQuizStatus();
console.log("User:", user);
