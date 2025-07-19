const SHEET_ID = "1C1_T3n_rBNv4fv3Hhea13AmUESLM36qnZtnB1Ocr-Do";
const SHEET_QUIZ_RANGE = "quiz!A2:C";
const SHEET_VIDEO_RANGE = "videos!A2:A";
const API_KEY = "AIzaSyCpgHhBgWP_g1bAq5LcgMkRTzKwcVJZGAo";

const user = JSON.parse(sessionStorage.getItem("user"));
if (!user) location.href = "index.html";
document.getElementById("welcome").innerText = "ยินดีต้อนรับ " + user.name;

function logout() {
  sessionStorage.clear();
  location.href = "index.html";
}
window.logout = logout;

async function loadVideo() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_VIDEO_RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.values && data.values.length > 0) {
    document.getElementById("videoArea").innerHTML =
      `<a href="${data.values[0][0]}" target="_blank">🎬 คลิกเพื่อชมวิดีโอ</a>`;
  } else {
    document.getElementById("videoArea").innerText = "ยังไม่มีวิดีโอ";
  }
}

async function startQuiz() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_QUIZ_RANGE}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("FETCH QUIZ RAW:", data);

  if (!data.values) return alert("ไม่มีแบบทดสอบ");

  let score = 0;

  for (let i = 0; i < data.values.length; i++) {
    const row = data.values[i];
    console.log("ROW", i, row);
    const [question, choiceStr, answer] = row;
    let choices;
    try {
      choices = JSON.parse(choiceStr);
    } catch (e) {
      return alert("❌ JSON ตัวเลือกผิดในแถว " + (i + 2) + ": " + e.message);
    }

    const reply = prompt(`ข้อ ${i+1}: ${question}

${choices.map((c, j) => (j+1)+". "+c).join("\n")}`);
    if (parseInt(reply) - 1 === parseInt(answer)) score++;
  }

  alert("คุณได้คะแนน: " + score + "/" + data.values.length);
  document.getElementById("quizStatus").innerText = score >= 9 ? "ผ่าน" : "ไม่ผ่าน";
}

loadVideo();