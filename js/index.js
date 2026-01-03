import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { doc, setDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { log } from './logger.js';

const btns = document.querySelectorAll('.role-btn');
const title = document.getElementById('form-title');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const registerLink = document.getElementById('register-link');

let role = 'student';

function switchRole(newRole) {
    role = newRole;

    btns.forEach(btn => {
        if (btn.dataset.role === newRole) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const roleName = newRole.charAt(0).toUpperCase() + newRole.slice(1);
    title.textContent = `Login as ${roleName}`;

    const demoEmail = document.getElementById('demo-email');
    const demoPass = document.getElementById('demo-pass');

    if (newRole === 'student') {
        registerLink.style.display = 'block';
        demoEmail.textContent = 'student@gmail.com';
        demoPass.textContent = 'student';
    } else if (newRole === 'teacher') {
        registerLink.style.display = 'none';
        demoEmail.textContent = 'teacher@gmail.com';
        demoPass.textContent = 'teacher';
        if (registerForm.style.display !== 'none') {
            showLoginForm();
        }
    } else { // admin
        registerLink.style.display = 'none';
        demoEmail.textContent = 'admin@gmail.com';
        demoPass.textContent = 'admin';
        if (registerForm.style.display !== 'none') {
            showLoginForm();
        }
    }
}

function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    const demoBox = document.getElementById('demo-box');
    if (demoBox) demoBox.style.display = 'none';
}

function showLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    const demoBox = document.getElementById('demo-box');
    if (demoBox) demoBox.style.display = 'block';
}

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchRole(btn.dataset.role);
    });
});

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);

        const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await auth.signOut();
            alert('User profile not found in database. Please contact admin.');
            return;
        }

        const userData = querySnapshot.docs[0].data();

        if (userData.role !== role) {
            await auth.signOut();
            alert('Invalid role selected for this account.');
            return;
        }

        if (role === 'student' && userData.approved === false) {
            await auth.signOut();
            alert('Your account is pending admin approval.');
            return;
        }

        await log('login', userCred.user.uid, { role: role });
        window.location.href = `pages/${role}.html`;
    } catch (err) {
        alert('Login failed: ' + err.message);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value?.toLowerCase();
    const dept = document.getElementById('reg-dept').value;
    const password = document.getElementById('reg-password').value;

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
            name: name,
            email: email,
            department: dept,
            role: 'student',
            approved: false
        });

        await log('student_registered', userCred.user.uid, { name: name, department: dept });
        await auth.signOut();
        alert('Registration submitted. Please wait for admin approval.');
        e.target.reset();
        showLoginForm();
    } catch (err) {
        alert('Registration failed: ' + err.message);
    }
});

switchRole('student');

document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId = this.dataset.target;
        const input = document.getElementById(targetId);

        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});
