// ข้อมูลแบบทดสอบ (ควรดึงจาก Google Sheets ในสภาพแวดล้อมจริง)
const quizData = [
    {
        question: "1. ข้อใดคือขั้นตอนแรกในการให้บริการยาที่ถูกต้อง?",
        options: [
            "ตรวจสอบชื่อผู้ป่วย",
            "อ่านฉลากยา",
            "ล้างมือให้สะอาด",
            "เตรียมอุปกรณ์ให้พร้อม"
        ],
        answer: 0
    },
    {
        question: "2. เมื่อพบยาหมดอายุควรทำอย่างไร?",
        options: [
            "ใช้ต่อไปเพราะยังดูดีอยู่",
            "ทิ้งลงถังขยะทั่วไป",
            "แยกเก็บและทำเครื่องหมายว่าหมดอายุ",
            "ส่งคืนห้องยาเพื่อทำลาย"
        ],
        answer: 3
    },
    // เพิ่มข้อสอบอีก 8 ข้อ (รวมเป็น 10 ข้อ)
    {
        question: "3. ข้อใดไม่ใช่อาการข้างเคียงที่พบบ่อยของยา Paracetamol?",
        options: [
            "คลื่นไส้",
            "วิงเวียน",
            "ผิวหนังลอก",
            "ไม่มีอาการข้างเคียง"
        ],
        answer: 2
    },
    {
        question: "4. ยาใดที่ควรระวังเป็นพิเศษในผู้ป่วยโรคไต?",
        options: [
            "Paracetamol",
            "Ibuprofen",
            "Chlorpheniramine",
            "Omeprazole"
        ],
        answer: 1
    },
    {
        question: "5. ควรเก็บยาแก้แพ้ Chlorpheniramine ที่อุณหภูมิใด?",
        options: [
            "ตู้เย็น",
            "ที่อุณหภูมิห้อง",
            "ในที่ร้อน",
            "ทุกข้อถูก"
        ],
        answer: 1
    },
    {
        question: "6. ข้อใดคืออาการที่บ่งชี้ว่าผู้ป่วยอาจมีอาการแพ้ยา?",
        options: [
            "ผื่นคัน",
            "หน้าบวม",
            "หายใจลำบาก",
            "ทั้งหมดถูก"
        ],
        answer: 3
    },
    {
        question: "7. ควรให้คำแนะนำอะไรกับผู้ป่วยที่ได้รับยา Metformin?",
        options: [
            "รับประทานพร้อมอาหาร",
            "หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์",
            "สังเกตอาการ hypoglycemia",
            "ทั้งหมดถูก"
        ],
        answer: 3
    },
    {
        question: "8. ยาชนิดใดที่ห้ามใช้ในเด็กอายุต่ำกว่า 12 ปี?",
        options: [
            "Paracetamol",
            "Aspirin",
            "Ibuprofen",
            "Chlorpheniramine"
        ],
        answer: 1
    },
    {
        question: "9. ข้อใดคือวิธีการเก็บรักษายาที่ถูกต้อง?",
        options: [
            "เก็บในที่แห้งและเย็น",
            "หลีกเลี่ยงแสงแดด",
            "เก็บให้พ้นมือเด็ก",
            "ทั้งหมดถูก"
        ],
        answer: 3
    },
    {
        question: "10. เมื่อผู้ป่วยถามเกี่ยวกับยาที่ไม่แน่ใจควรทำอย่างไร?",
        options: [
            "ตอบไปตามที่คิดว่าใช่",
            "บอกให้ถามเภสัชกร",
            "มองหาข้อมูลในอินเทอร์เน็ต",
            "บอกว่าไม่ทราบ"
        ],
        answer: 1
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // สร้างแบบทดสอบ
    renderQuiz();
    
    // กลับไปหน้าหลัก
    document.getElementById('back-btn').addEventListener('click', function() {
        window.location.href = 'user.html';
    });
});

function renderQuiz() {
    const quizContainer = document.getElementById('quiz-questions');
    
    quizData.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'quiz-question';
        questionElement.innerHTML = `
            <h4>${question.question}</h4>
            <div class="quiz-options">
                ${question.options.map((option, i) => `
                    <div class="quiz-option">
                        <input type="radio" name="question-${index}" id="q${index}-option${i}" value="${i}">
                        <label for="q${index}-option${i}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
        quizContainer.appendChild(questionElement);
    });
    
    // ส่งคำตอบ
    document.getElementById('submit-quiz').addEventListener('click', submitQuiz);
}

function submitQuiz() {
    // ตรวจสอบคำตอบ
    let score = 0;
    const results = [];
    
    quizData.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
        
        if (selectedOption) {
            const userAnswer = parseInt(selectedOption.value);
            results.push({
                question: question.question,
                userAnswer: question.options[userAnswer],
                correctAnswer: question.options[question.answer],
                isCorrect: userAnswer === question.answer
            });
            
            if (userAnswer === question.answer) {
                score++;
            }
        } else {
            results.push({
                question: question.question,
                userAnswer: 'ไม่ได้ตอบ',
                correctAnswer: question.options[question.answer],
                isCorrect: false
            });
        }
    });
    
    // แสดงผลลัพธ์
    showResults(score, results);
}

function showResults(score, results) {
    const quizPage = document.getElementById('quiz-page');
    const resultPage = document.getElementById('result-page');
    const resultTitle = document.getElementById('result-title');
    const resultScore = document.getElementById('score');
    const resultMessage = document.getElementById('result-message');
    
    quizPage.style.display = 'none';
    resultPage.style.display = 'block';
    
    resultScore.textContent = score;
    
    if (score >= 9) {
        resultTitle.textContent = '🎉 ผ่านการทดสอบ 🎉';
        resultTitle.className = 'passed';
        resultMessage.textContent = 'ยินดีด้วย! คุณมีความรู้ดีมาก สามารถปฏิบัติงานได้อย่างปลอดภัย';
        
        // บันทึกผลลัพธ์
        localStorage.setItem('quizStatus', 'passed');
        localStorage.setItem('quizScore', score);
    } else {
        resultTitle.textContent = '❌ ไม่ผ่านการทดสอบ ❌';
        resultTitle.className = 'failed';
        resultMessage.textContent = 'คุณต้องได้คะแนนอย่างน้อย 9/10 ถึงจะผ่าน กรุณาศึกษาเพิ่มเติมและลองทำอีกครั้ง';
        
        // บันทึกผลลัพธ์
        localStorage.setItem('quizStatus', 'failed');
        localStorage.setItem('quizScore', score);
    }
    
    // ปุ่มตกลง
    document.getElementById('result-btn').addEventListener('click', function() {
        window.location.href = 'user.html';
    });
    
    // ในสภาพแวดล้อมจริงควรส่งผลลัพธ์ไปยัง Google Sheets ด้วย
    console.log('ผลลัพธ์แบบทดสอบ:', results);
}