const API_URL = '/api';

async function fetchCourses() {
    const res = await fetch(`${API_URL}/courses`);
    return res.json();
}

async function getCourse(id) {
    const res = await fetch(`${API_URL}/courses/${id}`);
    return res.json();
}

async function createCourse(data) {
    const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function updateCourse(id, data) {
    const res = await fetch(`${API_URL}/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function deleteCourse(id) {
    const res = await fetch(`${API_URL}/courses/${id}`, {
        method: 'DELETE'
    });
    return res.json();
}

async function addQuestion(courseId, data) {
    const res = await fetch(`${API_URL}/courses/${courseId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function updateQuestion(questionId, data) {
    const res = await fetch(`${API_URL}/courses/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function deleteQuestion(questionId) {
    const res = await fetch(`${API_URL}/courses/questions/${questionId}`, {
        method: 'DELETE'
    });
    return res.json();
}

async function registerCourse(userId, courseId) {
    const res = await fetch(`${API_URL}/users/${userId}/register-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
    });
    return res.json();
}

async function fetchRegisteredCourses(userId) {
    const res = await fetch(`${API_URL}/users/${userId}/registered-courses`);
    return res.json();
}

// New Helper for Dashboard Data
async function fetchUserDashboardData(userId) {
    const res = await fetch(`${API_URL}/users/${userId}/dashboard-data`);
    return res.json();
}

async function login(url, email, password) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}
