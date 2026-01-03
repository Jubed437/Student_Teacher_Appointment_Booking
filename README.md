# Student-Teacher Appointment Booking System

A web application for managing appointments between students and teachers, built with vanilla JavaScript and Firebase.

## Live Demo

[Live Demo](https://student-teacher-appointment-booking-rust.vercel.app/)

## Features

- **Student Portal**: Browse teachers, book appointments, view appointment history
- **Teacher Portal**: Manage appointment requests, view schedule
- **Admin Portal**: Approve student registrations, manage teachers, view statistics

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Firebase Authentication
- Firebase Firestore

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project is already configured in `js/firebase-config.js`
3. Enable **Email/Password** authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider
4. Create a **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (for development)

### 2. Test the Application

1. Open `setup.html` in your browser
2. Click "Create Test Accounts" to generate sample data
3. Use these credentials to login:
   - **Admin**: admin@test.com / admin
   - **Teacher**: teacher@test.com / teacher
   - **Student**: student@test.com / student

### 3. Run the Application

Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari).

> **Note**: For production, you'll need to host this on a web server and update Firestore security rules.

## Project Structure

```
├── index.html              # Login page
├── setup.html             # Test data setup page
├── pages/
│   ├── admin.html         # Admin dashboard
│   ├── student.html       # Student dashboard
│   └── teacher.html       # Teacher dashboard
├── css/
│   ├── index.css          # Login page styles
│   ├── admin.css          # Admin dashboard styles
│   ├── student.css        # Student dashboard styles
│   └── teacher.css        # Teacher dashboard styles
├── js/
│   ├── firebase-config.js # Firebase configuration
│   ├── auth.js           # Authentication helper
│   ├── index.js          # Login page logic
│   ├── admin.js          # Admin dashboard logic
│   ├── student.js        # Student dashboard logic
│   └── teacher.js        # Teacher dashboard logic
└── assets/
    └── login.jpg         # Login background image
```

## Firestore Collections

- **users**: Student, teacher, and admin profiles
- **registrations**: Pending student registration requests
- **appointments**: Appointment bookings

## Security Notes

⚠️ **Important**: The current Firebase configuration is set to test mode. Before deploying to production:

1. Update Firestore security rules (see `js/firebase.rules` for reference)
2. Enable proper authentication rules
3. Consider adding rate limiting
4. Use environment variables for Firebase config

## Testing Workflow

1. **Student Registration**:
   - Register as a new student
   - Admin approves the registration
   - Student can now login

2. **Booking Appointment**:
   - Student browses teachers
   - Selects a teacher and time slot
   - Submits booking request

3. **Teacher Approval**:
   - Teacher views pending requests
   - Approves or rejects appointments
   - Views upcoming schedule

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use for educational purposes.
