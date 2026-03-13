// Firebase Modular SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile, deleteUser } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// TODO: Replace with your Firebase Project Configuration from Console
const firebaseConfig = {
    apiKey: "AIzaSyB7rWpEKkLM9GQe2Uq975r29x0n5m2Hj-8",
    authDomain: "greenschool-70619.firebaseapp.com",
    projectId: "greenschool-70619",
    storageBucket: "greenschool-70619.firebasestorage.app",
    messagingSenderId: "373395189237",
    appId: "1:373395189237:web:e51ed85e4cb3caaec7c4bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashSection = document.getElementById('dashboard-section');
const userControls = document.getElementById('user-controls');
const userNameDisplay = document.getElementById('user-display-name');

const btnLogin = document.getElementById('btn-google-login');
const btnLogout = document.getElementById('btn-logout');

// Backend API
// const API_URL = "http://localhost:3000/api"; 
// TODO: Replace this with your actual Render URL later
const API_URL = "https://your-render-url-here.onrender.com/api"; 

// --- CONFIGURATION ---
// IMPORTANT: Change this to the exact email address the Principal will use to log in!
const PRINCIPAL_EMAIL = "sreeharimm558@gmail.com"; 

let currentChart = null; // Re-declare fixed variable

// Auth State Monitor
onAuthStateChanged(auth, async (user) => {
    if (user) {
        
        // --- CUSTOM DISPLAY NAME CHECK ---
        // If a user doesn't have a display name set by our system yet, force them to set it.
        // Google sets it by default, but we'll use a custom property or just check if they've approved it.
        // For simplicity, we assume if they don't have a displayName OR we want to force them, we show the modal.
        // Since Google provides displayName automatically, we check if they've set a custom one by looking for a specific flag,
        // or easier strategy: Always show the modal if this is their absolute FIRST time signing in (Check creation time).
        
        const isNewUser = (new Date(user.metadata.lastSignInTime).getTime() - new Date(user.metadata.creationTime).getTime()) < 5000;
        
        // If new user OR somehow no display name, show modal and STOP rendering dash until they finish
        if (isNewUser || !user.displayName) {
            document.getElementById('profile-setup-modal').classList.remove('hidden');
            authSection.classList.add('hidden');
            
            // Overwrite form submission specifically for this user
            const profileForm = document.getElementById('profile-setup-form');
            profileForm.onsubmit = async (e) => {
                e.preventDefault();
                const newName = document.getElementById('custom-display-name').value;
                try {
                    await updateProfile(user, { displayName: newName });
                    document.getElementById('profile-setup-modal').classList.add('hidden');
                    continueLoginFlow(user); // Resume login flow
                } catch (error) {
                    alert("Error saving name.");
                }
            };
            return; // STOP execution here untill they submit
        }

        // Return if not new user, proceed normally
        continueLoginFlow(user);
        
    } else {
        // User logged out
        authSection.classList.remove('hidden');
        dashSection.classList.add('hidden');
        document.getElementById('principal-dashboard-section').classList.add('hidden');
        document.getElementById('profile-setup-modal').classList.add('hidden');
        userControls.classList.add('hidden');
    }
});

async function continueLoginFlow(user) {
    // User is fully logged in and has verified their custom display name
    authSection.classList.add('hidden');
    userControls.classList.remove('hidden');
    userNameDisplay.innerText = `${user.displayName} (${user.email})`;
    
    // CHECK ROLE BASED ON EMAIL
    if (user.email === PRINCIPAL_EMAIL) {
        // -- PRINCIPAL ROLE --
        document.getElementById('principal-dashboard-section').classList.remove('hidden');
        dashSection.classList.add('hidden');
        initPrincipalDashboard(user);
    } else {
        // -- STUDENT ROLE --
        document.getElementById('principal-dashboard-section').classList.add('hidden');
        dashSection.classList.remove('hidden');
        await loadMyRecords(user);
    }
}

// Login
btnLogin.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch(err) {
        alert("Login failed: " + err.message);
    }
});

// Logout
btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// Delete Account
document.getElementById('btn-delete-account').addEventListener('click', async () => {
    const confirmDelete = confirm("⚠️ Are you absolutely sure you want to permanently delete your account? This action cannot be undone.");
    if (confirmDelete && auth.currentUser) {
        try {
            await deleteUser(auth.currentUser);
            alert("Your account has been deleted.");
            // UI handles the rest because onAuthStateChanged catches the log out
        } catch (error) {
            console.error(error);
            // Re-authentication requirement catch
            if (error.code === 'auth/requires-recent-login') {
                alert("For security reasons, you must log out and log back in right before deleting your account. Please log out and try again.");
            } else {
                alert("Error deleting account: " + error.message);
            }
        }
    }
});

async function loadMyRecords(user) {
    const token = await user.getIdToken();
    try {
        const response = await fetch(`${API_URL}/records`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const records = await response.json();
        
        const tbody = document.getElementById('records-table-body');
        tbody.innerHTML = ''; // clear previous
        
        records.forEach(rec => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 border border-gray-200">${new Date(rec.date).toLocaleDateString()}</td>
                <td class="p-3 border border-gray-200 capitalize">${rec.type}</td>
                <td class="p-3 border border-gray-200">${rec.value}</td>
                <td class="p-3 border border-gray-200 text-gray-500">${rec.notes || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) {
         console.log("Error loading mock nodejs server, check server.js", e);
    }
}

// Track Submission form
document.getElementById('record-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const token = await auth.currentUser.getIdToken();
    const type = document.getElementById('record-type').value;
    const value = document.getElementById('record-value').value;
    const notes = document.getElementById('record-notes').value;
    
    try {
        const res = await fetch(`${API_URL}/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, value: Number(value), notes })
        });
        
        if (res.ok) {
            e.target.reset();
            loadMyRecords(auth.currentUser); // Refresh table
        } else {
            alert('Failed to save record.');
        }
    } catch(err) {
        console.error(err);
    }
});

// Campaign form handler
document.getElementById('campaign-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const token = await auth.currentUser.getIdToken();
    const title = document.getElementById('camp-title').value;
    const dateCompleted = document.getElementById('camp-date').value;
    const description = document.getElementById('camp-desc').value;
    
    try {
        const res = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, dateCompleted, description })
        });
        
        if (res.ok) {
            e.target.reset();
            alert('Awareness Campaign Logged Successfully!');
        } else {
            alert('Failed to save campaign.');
        }
    } catch(err) {
        console.error(err);
    }
});

// ==========================================
// P R I N C I P A L   F U N C T I O N S
// ==========================================

async function initPrincipalDashboard(user) {
    const today = new Date();
    // Format YYYY-MM
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if(mm < 10) mm = '0' + mm;
    const currentMonthStr = `${yyyy}-${mm}`;
    
    document.getElementById('limit-month').value = currentMonthStr;
    document.getElementById('chart-month').value = currentMonthStr;

    await loadLimitsForm(user, currentMonthStr);
    await loadPrincipalData(user, currentMonthStr);

    // Listeners for month changes
    document.getElementById('limit-month').addEventListener('change', (e) => {
        loadLimitsForm(user, e.target.value);
    });
    document.getElementById('chart-month').addEventListener('change', (e) => {
        loadPrincipalData(user, e.target.value);
    });
}

// Fetch and fill the limit form
async function loadLimitsForm(user, monthStr) {
    const token = await user.getIdToken();
    try {
        const res = await fetch(`${API_URL}/limits/${monthStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const limits = await res.json();
        document.getElementById('limit-electricity').value = limits.electricity || 0;
        document.getElementById('limit-water').value = limits.water || 0;
        document.getElementById('limit-waste').value = limits.waste || 0;
    } catch {
        console.error("Error loading limits");
    }
}

// Save set limits
document.getElementById('limit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = await auth.currentUser.getIdToken();
    const payload = {
        month: document.getElementById('limit-month').value,
        electricity: Number(document.getElementById('limit-electricity').value),
        water: Number(document.getElementById('limit-water').value),
        waste: Number(document.getElementById('limit-waste').value)
    };
    try {
        const res = await fetch(`${API_URL}/limits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if(res.ok) alert('Limits saved!');
        // Refresh the graph side if looking at the same month
        if(document.getElementById('chart-month').value === payload.month) {
            loadPrincipalData(auth.currentUser, payload.month);
        }
    } catch (err) { console.error(err); }
});

// Fetch all records, graph them, and check against limits
async function loadPrincipalData(user, monthStr) {
    const token = await user.getIdToken();
    try {
        // 1. Fetch Limits & Records concurrently
        const [limitsRes, recordsRes] = await Promise.all([
            fetch(`${API_URL}/limits/${monthStr}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/all-records?month=${monthStr}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const limits = await limitsRes.json();
        const records = await recordsRes.json();

        // 2. Clear table and calculate sums
        const tbody = document.getElementById('all-records-table-body');
        tbody.innerHTML = '';
        
        let sums = { electricity: 0, water: 0, waste: 0, tree: 0 };

        records.forEach(rec => {
            sums[rec.type] += rec.value;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 border">${new Date(rec.date).toLocaleDateString()}</td>
                <td class="p-3 border font-medium">${rec.userName || rec.userId}</td>
                <td class="p-3 border capitalize">${rec.type}</td>
                <td class="p-3 border font-semibold">${rec.value}</td>
            `;
            tbody.appendChild(tr);
        });

        // 3. Render Chart
        renderAnalyticsChart(sums, limits, monthStr);

        // 4. Render Alerts
        renderAlerts(sums, limits, monthStr);

    } catch(err) {
        console.error("Error loading principal data", err);
    }
}

function renderAnalyticsChart(sums, limits, monthStr) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    
    if (currentChart) currentChart.destroy(); // Clear old chart

    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Electricity (kWh)', 'Water (L)', 'Waste (kg)', 'Trees'],
            datasets: [
                {
                    label: 'Current Usage',
                    data: [sums.electricity, sums.water, sums.waste, sums.tree],
                    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#22c55e']
                },
                {
                    label: 'Limit Target',
                    data: [limits.electricity || 0, limits.water || 0, limits.waste || 0, 0], // Trees normally don't have limit
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderAlerts(sums, limits, monthStr) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = ''; // clear old alerts

    const checkLimit = (type, unit) => {
        if(limits[type] > 0 && sums[type] > limits[type]) {
            const div = document.createElement('div');
            div.className = "bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm";
            div.innerHTML = `<strong>⚠️ ALARM:</strong> ${type.toUpperCase()} usage (${sums[type]} ${unit}) has exceeded the set limit of ${limits[type]} for ${monthStr}!`;
            container.appendChild(div);
        }
    };

    checkLimit('electricity', 'kWh');
    checkLimit('water', 'Liters');
    checkLimit('waste', 'kg');

    if(container.innerHTML === '') {
         container.innerHTML = `<div class="bg-green-100 text-green-700 p-3 rounded">✅ All numbers are currently under limits for ${monthStr}.</div>`;
    }
}

