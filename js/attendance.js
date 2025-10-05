// js/attendance.js
let videoStream = null;
let scannerActive = false;
let scanInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    loadTodaysAttendance();
    
    const startScannerBtn = document.getElementById('startScanner');
    const stopScannerBtn = document.getElementById('stopScanner');
    
    if (startScannerBtn) {
        startScannerBtn.addEventListener('click', startScanner);
    }
    if (stopScannerBtn) {
        stopScannerBtn.addEventListener('click', stopScanner);
    }
});

async function startScanner() {
    try {
        const constraints = {
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const video = document.getElementById('qrVideo');
        video.srcObject = videoStream;
        
        // Wait for video to load
        video.onloadedmetadata = function() {
            video.play();
            document.getElementById('startScanner').classList.add('hidden');
            document.getElementById('stopScanner').classList.remove('hidden');
            
            scannerActive = true;
            scanInterval = setInterval(scanQRCode, 1000); // Scan every second
        };
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Error accessing camera. Please ensure you have granted camera permissions.');
    }
}

function stopScanner() {
    scannerActive = false;
    
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    const video = document.getElementById('qrVideo');
    if (video) {
        video.srcObject = null;
    }
    
    document.getElementById('startScanner').classList.remove('hidden');
    document.getElementById('stopScanner').classList.add('hidden');
}

function scanQRCode() {
    if (!scannerActive) return;
    
    const video = document.getElementById('qrVideo');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            console.log('QR Code detected:', code.data);
            try {
                const qrData = JSON.parse(code.data);
                if (qrData.type === 'prefect_attendance' && qrData.prefectId) {
                    stopScanner(); // Stop scanner after successful scan
                    markAttendance(qrData.prefectId);
                }
            } catch (error) {
                console.error('Error parsing QR code data:', error);
            }
        }
    } catch (error) {
        console.error('Error scanning QR code:', error);
    }
}

async function markAttendance(prefectId) {
    try {
        console.log('Marking attendance for prefect:', prefectId);
        
        // Get prefect data
        const prefectDoc = await db.collection('prefects').doc(prefectId).get();
        
        if (!prefectDoc.exists) {
            alert('Prefect not found!');
            return;
        }
        
        const prefect = prefectDoc.data();
        const today = new Date().toDateString();
        
        console.log('Prefect found:', prefect.name);
        console.log('Today date:', today);
        
        // Check if already marked attendance today
        const attendanceQuery = await db.collection('attendance')
            .where('prefectId', '==', prefectId)
            .where('date', '==', today)
            .get();
            
        if (!attendanceQuery.empty) {
            alert(`✅ ${prefect.name} has already marked attendance today!`);
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
        
        alert(`🎉 Attendance marked successfully for ${prefect.name}!`);
        loadTodaysAttendance();
        
    } catch (error) {
        console.error('Error marking attendance:', error);
        alert('❌ Error marking attendance. Please try again.');
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
            attendanceGrid.innerHTML = '<p>No attendance marked today yet.</p>';
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
    
    const time = attendance.timestamp ? 
        new Date(attendance.timestamp.toDate()).toLocaleTimeString() : 
        'Time not available';
        
    div.innerHTML = `
        <h3>${attendance.prefectName}</h3>
        <p><strong>Grade:</strong> ${attendance.prefectGrade}</p>
        <p><strong>Admission No:</strong> ${attendance.prefectAdmission}</p>
        <p><strong>Time:</strong> ${time}</p>
    `;
    return div;
}
