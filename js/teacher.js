import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { log } from './logger.js';

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    const q = query(collection(db, 'users'), where('email', '==', user.email));
    const userDoc = await getDocs(q);
    if (!userDoc.empty) {
        const data = userDoc.docs[0].data();
        document.getElementById('teacher-name').textContent = data.name;
        document.getElementById('teacher-title').textContent = data.title || 'Teacher';
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-role').textContent = data.title || 'Teacher';
        document.getElementById('profile-dept').textContent = data.department;

        loadRequests(user.email);
        loadAppointments(user.email);
    }
});

document.getElementById('logout').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '../index.html';
});

async function loadRequests(email) {
    const grid = document.getElementById('requests-grid');
    const q = query(collection(db, 'appointments'),
        where('teacherId', '==', email),
        where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    grid.innerHTML = '';
    let count = 0;

    for (const d of snapshot.docs) {
        count++;
        const data = d.data();

        const studentDoc = await getDoc(doc(db, 'users', data.studentId));
        const studentData = studentDoc.exists() ? studentDoc.data() : { name: 'Student' };

        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <div class="student-info">
                <img src="https://ui-avatars.com/api/?name=${studentData.name}&background=random" class="student-avatar">
                <div>
                    <h3 class="student-name">${studentData.name}</h3>
                    <span class="student-dept">${studentData.department || 'Student'}</span>
                </div>
            </div>
            <div class="message-box">
                <div class="timestamp">
                    <i class="far fa-clock"></i>
                    <span>${data.date} ${data.time}</span>
                </div>
                <p class="message">"${data.purpose}"</p>
            </div>
            <div class="actions">
                <button class="action-btn reject" onclick="handleRequest('${d.id}', 'reject')">Reject</button>
                <button class="action-btn approve" onclick="handleRequest('${d.id}', 'approve')">Approve</button>
            </div>
        `;
        grid.appendChild(card);
    }

    document.getElementById('pending-badge').textContent = `${count} Pending`;
}

window.handleRequest = async function (id, action) {
    const status = action === 'approve' ? 'approved' : 'rejected';
    await updateDoc(doc(db, 'appointments', id), {
        status: status
    });
    await log('teacher_appointment_' + action, auth.currentUser.uid, { appointmentId: id });

    loadRequests(auth.currentUser.email);
    loadAppointments(auth.currentUser.email);
};

async function loadAppointments(email) {
    const tbody = document.getElementById('appts-tbody');
    const q = query(collection(db, 'appointments'),
        where('teacherId', '==', email),
        where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);

    tbody.innerHTML = '';
    for (const d of snapshot.docs) {
        const data = d.data();
        const studentDoc = await getDoc(doc(db, 'users', data.studentId));
        const studentData = studentDoc.exists() ? studentDoc.data() : { name: 'Student' };

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="name-cell">
                    <img src="https://ui-avatars.com/api/?name=${studentData.name}&background=random&size=32" class="mini-avatar">
                    ${studentData.name}
                </div>
            </td>
            <td>${data.date}</td>
            <td>${data.time}</td>
            <td><span class="status approved">Approved</span></td>
            <td><button class="icon-btn"><i class="fas fa-ellipsis-v"></i></button></td>
        `;
        tbody.appendChild(row);
    }
}
