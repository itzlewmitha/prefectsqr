// js/attendance.js
let videoStream = null;
let scannerActive = false;

document.addEventListener('DOMContentLoaded', function() {
    loadTodaysAttendance();
    
    const startScannerBtn = document.getElementById('startScanner');
    const stopScannerBtn = document.getElementById('stopScanner');
    
    startScannerBtn.addEventListener('click', startScanner);
    stopScannerBtn.addEventListener('click', stopScanner);
});

async function startScanner() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        
        const video = document.getElementById('qrVideo');
        video.srcObject = videoStream;
        
        document.getElementById('startScanner').classList.add('hidden');
        document.getElementById('stopScanner').classList.remove('hidden');
        
        scannerActive = true;
        scanQRCode();
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Error accessing camera. Please ensure you have granted camera permissions.');
    }
}

function stopScanner() {
    scannerActive = false;
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    document.getElementById('startScanner').classList.remove('hidden');
    document.getElementById('stopScanner').classList.add('hidden');
}

function scanQRCode() {
    if (!scannerActive) return;
    
    const video = document.getElementById('qrVideo');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
        try {
            const qrData = JSON.parse(code.data);
            if (qrData.type === 'prefect_attendance') {
                markAttendance(qrData.prefectId);
            }
        } catch (error) {
            console.error('Error parsing QR code:', error);
        }
    }
    
    if (scannerActive) {
        requestAnimationFrame(scanQRCode);
    }
}

async function markAttendance(prefectId) {
    try {
        // Get prefect data
        const prefectDoc = await db.collection('prefects').doc(prefectId).get();
        
        if (!prefectDoc.exists) {
            alert('Prefect not found!');
            return;
        }
        
        const prefect = prefectDoc.data();
        const today = new Date().toDateString();
        
        // Check if already marked attendance today
        const attendanceDoc = await db.collection('attendance')
            .where('prefectId', '==', prefectId)
            .where('date', '==', today)
            .get();
            
        if (!attendanceDoc.empty) {
            alert(`${prefect.name} has already marked attendance today!`);
            return;
        }
        
        // Mark attendance
        await db.collection('attendance').add({
            prefectId: prefectId,
            prefectName: prefect.name,
            prefectGrade: prefect.grade,
            prefectAdmission: prefect.admissionNumber,
            date: today,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update total attendance count
        await db.collection('prefects').doc(prefectId).update({
            totalAttendance: firebase.firestore.FieldValue.increment(1)
        });
        
        alert(`Attendance marked for ${prefect.name}!`);
        loadTodaysAttendance();
        
    } catch (error) {
        console.error('Error marking attendance:', error);
        alert('Error marking attendance. Please try again.');
    }
}

async function loadTodaysAttendance() {
    const attendanceGrid = document.getElementById('attendanceGrid');
    const today = new Date().toDateString();
    
    try {
        const snapshot = await db.collection('attendance')
            .where('date', '==', today)
            .orderBy('timestamp', 'desc')
            .get();
            
        if (snapshot.empty) {
            attendanceGrid.innerHTML = '<p>No attendance marked today.</p>';
            return;
        }
        
        attendanceGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const attendance = doc.data();
            const attendanceElement = createAttendanceElement(attendance);
            attendanceGrid.appendChild(attendanceElement);
        });
        
    } catch (error) {
        console.error('Error loading attendance:', error);
        attendanceGrid.innerHTML = '<p>Error loading attendance data.</p>';
    }
}

function createAttendanceElement(attendance) {
    const div = document.createElement('div');
    div.className = 'grid-item';
    div.innerHTML = `
        <h3>${attendance.prefectName}</h3>
        <p><strong>Grade:</strong> ${attendance.prefectGrade}</p>
        <p><strong>Admission No:</strong> ${attendance.prefectAdmission}</p>
        <p><strong>Time:</strong> ${new Date(attendance.timestamp?.toDate()).toLocaleTimeString()}</p>
    `;
    return div;
}