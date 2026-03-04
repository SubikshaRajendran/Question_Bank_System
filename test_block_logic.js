async function testBlockedList() {
    console.log('--- Test Blocked Students List ---');

    // 2. Fetch all students route (what the frontend uses)
    const res = await fetch('http://127.0.0.1:3000/api/users/admin/students', {
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const students = await res.json();

    // 3. Filter on the client-side like BlockedStudents.jsx does
    if (students && Array.isArray(students)) {
        const blockedStudents = students.filter(s => s.isBlocked === true);
        console.log(`\nFound ${blockedStudents.length} blocked students out of ${students.length} total.`);

        if (blockedStudents.length > 0) {
            console.log('\nBlocked Students:');
            blockedStudents.forEach(s => {
                console.log(`- ${s.username} (${s.email})`);
            });
        }
    } else {
        console.log('\nFailed to fetch student array. Result:', students);
    }
}

testBlockedList().catch(console.error);
