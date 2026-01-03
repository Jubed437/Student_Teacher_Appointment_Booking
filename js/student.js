import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, getDocs, addDoc, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { log } from './logger.js';

let selectedTeacherEmail = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    const q = query(collection(db, 'users'), where('email', '==', user.email));
    const userDoc = await getDocs(q);
    if (!userDoc.empty) {
        const data = userDoc.docs[0].data();
        document.getElementById('student-name').textContent = data.name;
        document.getElementById('student-dept').textContent = data.department;
    }
});

document.getElementById('logout').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '../index.html';
});

async function loadTeachers() {
    const grid = document.getElementById('teachers-grid');
    const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const snapshot = await getDocs(q);

    grid.innerHTML = '';
    snapshot.forEach(d => {
        const data = d.data();
        const card = document.createElement('div');
        card.className = 'teacher-card';
        card.innerHTML = `
            <div class="teacher-top">
                <img src="https://ui-avatars.com/api/?name=${data.name}&background=random" class="teacher-avatar">
                <div>
                    <h3 class="teacher-name">${data.name}</h3>
                    <span class="teacher-title">${data.title || 'Professor'}</span>
                </div>
            </div>
            <div class="teacher-details">
                <div class="detail-row">
                    <span class="detail-label">Dept:</span>
                    <span>${data.department}</span>
                </div>
                <div class="specialty">${data.specialty || 'General'}</div>
            </div>
            <button class="book-btn" onclick="selectTeacher('${data.email}', '${data.name}')">Book Appointment</button>
        `;
        grid.appendChild(card);
    });
}

window.selectTeacher = function (email, name) {
    selectedTeacherEmail = email;
    document.getElementById('preview-name').textContent = name;
    document.getElementById('preview-img').src = `https://ui-avatars.com/api/?name=${name}&background=random`;
};

document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedTeacherEmail) {
        alert('Please select a teacher first');
        return;
    }

    const date = document.getElementById('appt-date').value;
    const purpose = document.getElementById('appt-purpose').value;
    const timeSlot = document.querySelector('.time-slot.active');

    if (!timeSlot) {
        alert('Please select a time slot');
        return;
    }

    await addDoc(collection(db, 'appointments'), {
        studentId: auth.currentUser.uid,
        teacherId: selectedTeacherEmail,
        date: date,
        time: timeSlot.textContent,
        purpose: purpose,
        status: 'pending',
        createdAt: new Date()
    });

    await log('student_book_appointment', auth.currentUser.uid, { teacherEmail: selectedTeacherEmail });
    alert('Appointment request sent!');
    e.target.reset();
    loadAppointments();
});

async function loadAppointments() {
    const tbody = document.getElementById('appts-tbody');
    const q = query(collection(db, 'appointments'), where('studentId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);

    tbody.innerHTML = '';
    for (const d of snapshot.docs) {
        const data = d.data();

        const teacherQ = query(collection(db, 'users'), where('email', '==', data.teacherId));
        const teacherSnap = await getDocs(teacherQ);
        const teacherData = teacherSnap.empty ? { name: 'Teacher' } : teacherSnap.docs[0].data();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${teacherData.name}&background=random&size=32">
                    ${teacherData.name}
                </div>
            </td>
            <td>${data.date}</td>
            <td>${data.time}</td>
            <td><span class="status ${data.status}">${data.status}</span></td>
            <td><button class="icon-btn"><i class="fas fa-ellipsis-v"></i></button></td>
        `;
        tbody.appendChild(row);
    }
}

const slots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'];
const timeGrid = document.getElementById('time-slots');
slots.forEach(time => {
    const btn = document.createElement('button');
    btn.className = 'time-slot';
    btn.textContent = time;
    btn.type = 'button';
    btn.onclick = function () {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
        this.classList.add('active');
    };
    timeGrid.appendChild(btn);
});

loadTeachers();
loadAppointments();
