// js/dashboard.js
let currentPrefectId = null;

document.addEventListener('DOMContentLoaded', function() {
    const prefectForm = document.getElementById('prefectForm');
    const qrSection = document.getElementById('qrSection');
    const newPrefectBtn = document.getElementById('newPrefectBtn');
    
    prefectForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const grade = document.getElementById('grade').value;
        const admissionNumber = document.getElementById('admissionNumber').value;
        
        try {
            // Save prefect to Firestore
            const docRef = await db.collection('prefects').add({
                name: name,
                grade: grade,
                admissionNumber: admissionNumber,
                totalAttendance: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            currentPrefectId = docRef.id;
            
            // Generate QR code
            await generateQRCode(docRef.id);
            
            // Show QR section and hide form
            prefectForm.reset();
            prefectForm.style.display = 'none';
            qrSection.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error adding prefect:', error);
            alert('Error registering prefect. Please try again.');
        }
    });
    
    newPrefectBtn.addEventListener('click', function() {
        qrSection.classList.add('hidden');
        prefectForm.style.display = 'block';
    });
});

function generateQRCode(prefectId) {
    const qrCodeElement = document.getElementById('qrCode');
    qrCodeElement.innerHTML = '';
    
    const qrData = JSON.stringify({
        type: 'prefect_attendance',
        prefectId: prefectId,
        timestamp: Date.now()
    });
    
    QRCode.toCanvas(qrCodeElement, qrData, {
        width: 200,
        height: 200,
        colorDark: '#1a237e',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    }, function(error) {
        if (error) {
            console.error('QR Code generation error:', error);
            alert('Error generating QR code. Please try again.');
        }
    });
}