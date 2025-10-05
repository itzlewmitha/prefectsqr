// js/dashboard.js
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

let currentPrefectId = null;

document.addEventListener('DOMContentLoaded', function() {
    const prefectForm = document.getElementById('prefectFormElement');
    const qrSection = document.getElementById('qrSection');
    const newPrefectBtn = document.getElementById('newPrefectBtn');
    
    if (prefectForm) {
        prefectForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const grade = document.getElementById('grade').value;
            const admissionNumber = document.getElementById('admissionNumber').value;
            
            try {
                // Check if admission number already exists
                const q = query(collection(db, 'prefects'), where('admissionNumber', '==', admissionNumber));
                const existingPrefect = await getDocs(q);
                    
                if (!existingPrefect.empty) {
                    alert('Prefect with this admission number already exists!');
                    return;
                }
                
                // Save prefect to Firestore
                const docRef = await addDoc(collection(db, 'prefects'), {
                    name: name,
                    grade: grade,
                    admissionNumber: admissionNumber,
                    totalAttendance: 0,
                    createdAt: serverTimestamp()
                });
                
                currentPrefectId = docRef.id;
                console.log('Prefect added with ID:', docRef.id);
                
                // Generate QR code
                await generateQRCode(docRef.id);
                
                // Show QR section and hide form
                prefectForm.reset();
                prefectForm.classList.add('hidden');
                qrSection.classList.remove('hidden');
                
            } catch (error) {
                console.error('Error adding prefect:', error);
                alert('Error registering prefect. Please try again.');
            }
        });
    }
    
    if (newPrefectBtn) {
        newPrefectBtn.addEventListener('click', function() {
            qrSection.classList.add('hidden');
            prefectForm.classList.remove('hidden');
        });
    }
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
        } else {
            console.log('QR code generated successfully for prefect:', prefectId);
        }
    });
}
