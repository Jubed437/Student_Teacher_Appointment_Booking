import { auth, db } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { log } from './logger.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '../index.html';
    }
});

document.getElementById('logout').addEventListener('click', async () => {
    await log('admin_logout', auth.currentUser.uid);
    await signOut(auth);
    window.location.href = '../index.html';
});

async function loadPendingStudents() {
    const list = document.getElementById('reg-list');
    const q = query(collection(db, 'users'), where('role', '==', 'student'), where('approved', '==', false));
    const snapshot = await getDocs(q);

    list.innerHTML = '';
    let count = 0;

    snapshot.forEach(d => {
        count++;
        const data = d.data();
        const card = document.createElement('div');
        card.className = 'reg-card';
        card.innerHTML = `
            <div class="reg-info">
                <div class="reg-profile">
                    <img src="https://ui-avatars.com/api/?name=${data.name}&background=random" class="reg-avatar">
                    <div>
                        <h4 class="reg-name">${data.name}</h4>
                        <span class="reg-dept">${data.department}</span>
                    </div>
                </div>
                <div class="reg-email">${data.email}</div>
            </div>
            <div class="reg-actions">
                <button class="btn-reg reject" onclick="handleStudent('${d.id}', 'reject')">Reject</button>
                <button class="btn-reg approve" onclick="handleStudent('${d.id}', 'approve')">Approve</button>
            </div>
        `;
        list.appendChild(card);
    });

    document.querySelector('.badge').textContent = `${count} Pending`;

    if (count === 0) {
        list.innerHTML = '<p style="color: #6b7280; padding: 20px; text-align: center; width: 100%;">No pending student registrations</p>';
    }
}

window.handleStudent = async function (uid, action) {
    if (action === 'approve') {
        await updateDoc(doc(db, 'users', uid), {
            approved: true
        });
        await log('admin_approve_student', auth.currentUser.uid, { studentId: uid });
        alert('Student approved!');
    } else {
        if (confirm('Delete this student account?')) {
            await deleteDoc(doc(db, 'users', uid));
            await log('admin_reject_student', auth.currentUser.uid, { studentId: uid });
        }
    }
    loadPendingStudents();
    loadStats();
};

async function loadTeachers() {
    const tbody = document.getElementById('faculty-tbody');
    const snapshot = await getDocs(collection(db, 'users'));

    tbody.innerHTML = '';
    snapshot.forEach(d => {
        const data = d.data();
        if (data.role === 'teacher') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="profile-cell">
                        <img src="https://ui-avatars.com/api/?name=${data.name}&background=random&size=32">
                        ${data.name}
                    </div>
                </td>
                <td>${data.department}</td>
                <td><span class="status active">Active</span></td>
                <td>
                    <button class="icon-btn delete" onclick="deleteTeacher('${d.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        }
    });
}

document.getElementById('add-teacher').addEventListener('click', async () => {
    const name = prompt('Enter Teacher Name:');
    const email = prompt('Enter Teacher Email:');
    const dept = prompt('Enter Department:');

    if (name && email && dept) {
        await addDoc(collection(db, 'users'), {
            name: name,
            email: email.toLowerCase(),
            department: dept,
            role: 'teacher',
            approved: true
        });
        await log('admin_add_teacher', auth.currentUser.uid, { name: name });
        alert('Teacher profile added! Now create their login in Firebase Console manually.');
        loadTeachers();
        loadStats();
    }
});

window.deleteTeacher = async function (id) {
    if (confirm('Remove this teacher?')) {
        await deleteDoc(doc(db, 'users', id));
        await log('admin_delete_teacher', auth.currentUser.uid, { teacherId: id });
        loadTeachers();
        loadStats();
    }
};

async function loadStats() {
    const users = await getDocs(collection(db, 'users'));
    const appts = await getDocs(collection(db, 'appointments'));

    let students = 0, teachers = 0, pending = 0;
    users.forEach(d => {
        const data = d.data();
        if (data.role === 'student' && data.approved === true) students++;
        if (data.role === 'student' && data.approved === false) pending++;
        if (data.role === 'teacher') teachers++;
    });

    document.getElementById('total-students').textContent = students;
    document.getElementById('total-teachers').textContent = teachers;
    document.getElementById('total-appts').textContent = appts.size;
    document.getElementById('pending-count').textContent = pending;
}

loadPendingStudents();
loadTeachers();
loadStats();
