// js/prefects.js
document.addEventListener('DOMContentLoaded', function() {
    loadPrefects();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        loadPrefects(this.value);
    });
});

async function loadPrefects(searchTerm = '') {
    const prefectsGrid = document.getElementById('prefectsGrid');
    prefectsGrid.innerHTML = '<p>Loading prefects...</p>';
    
    try {
        let query = db.collection('prefects');
        
        if (searchTerm) {
            query = query.where('name', '>=', searchTerm)
                        .where('name', '<=', searchTerm + '\uf8ff');
        }
        
        const snapshot = await query.orderBy('name').get();
        
        if (snapshot.empty) {
            prefectsGrid.innerHTML = '<p>No prefects found.</p>';
            return;
        }
        
        prefectsGrid.innerHTML = '';
        
        snapshot.forEach(doc => {
            const prefect = doc.data();
            const prefectElement = createPrefectElement(doc.id, prefect);
            prefectsGrid.appendChild(prefectElement);
        });
        
    } catch (error) {
        console.error('Error loading prefects:', error);
        prefectsGrid.innerHTML = '<p>Error loading prefects. Please try again.</p>';
    }
}

function createPrefectElement(id, prefect) {
    const div = document.createElement('div');
    div.className = 'grid-item';
    div.innerHTML = `
        <h3>${prefect.name}</h3>
        <p><strong>Grade:</strong> ${prefect.grade}</p>
        <p><strong>Admission No:</strong> ${prefect.admissionNumber}</p>
        <p><strong>Total Attendance:</strong> ${prefect.totalAttendance || 0}</p>
        <div style="margin-top: 15px;">
            <button onclick="editPrefect('${id}')" class="btn-secondary" style="margin-right: 10px;">Edit</button>
            <button onclick="deletePrefect('${id}')" class="btn-secondary" style="background: #f44336; color: white;">Delete</button>
        </div>
    `;
    return div;
}

async function editPrefect(id) {
    const newName = prompt('Enter new name:');
    const newGrade = prompt('Enter new grade:');
    const newAdmission = prompt('Enter new admission number:');
    
    if (newName && newGrade && newAdmission) {
        try {
            await db.collection('prefects').doc(id).update({
                name: newName,
                grade: newGrade,
                admissionNumber: newAdmission
            });
            loadPrefects();
            alert('Prefect updated successfully!');
        } catch (error) {
            console.error('Error updating prefect:', error);
            alert('Error updating prefect. Please try again.');
        }
    }
}

async function deletePrefect(id) {
    if (confirm('Are you sure you want to delete this prefect?')) {
        try {
            await db.collection('prefects').doc(id).delete();
            loadPrefects();
            alert('Prefect deleted successfully!');
        } catch (error) {
            console.error('Error deleting prefect:', error);
            alert('Error deleting prefect. Please try again.');
        }
    }
}