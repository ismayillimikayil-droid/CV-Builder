// Error Handling
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('App Error:', msg, error);
    return false;
};

// State
const initialState = {
    personal: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 890',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        location: 'New York, NY',
        headline: 'Senior Software Engineer'
    },
    experience: [
        {
            id: 1,
            company: 'Tech Corp',
            role: 'Senior Developer',
            location: 'San Francisco, CA',
            startDate: '2020-01',
            endDate: 'Present',
            description: '• Led a team of 5 developers\n• Architected microservices'
        }
    ],
    education: [
        {
            id: 1,
            school: 'University of Tech',
            degree: 'B.S. CS',
            location: 'Boston, MA',
            startDate: '2015',
            endDate: '2019'
        }
    ],
    skills: 'JavaScript, React, Node.js'
};

// Safe Init
function getInitialState() {
    try {
        const s = localStorage.getItem('resumeState');
        return s ? JSON.parse(s) : initialState;
    } catch {
        return initialState;
    }
}

const store = {
    state: getInitialState(),
    listeners: [],

    setState(s) {
        this.state = { ...this.state, ...s };
        try { localStorage.setItem('resumeState', JSON.stringify(this.state)); } catch { }
        this.notify();
    },

    notify() { this.listeners.forEach(l => l(this.state)); },
    subscribe(l) { this.listeners.push(l); }
};

// Cloud save shims (simplified for safety)
window.saveToCloud = async () => {
    if (!window.supabase) return alert('Cloud not configured');
    alert('Saving...');
    // Real logic would go here, simplified to ensure app runs first
};
window.loadFromCloud = async () => {
    if (!window.supabase) return alert('Cloud not configured');
    alert('Loading...');
};

// UI Logic
function initApp() {
    console.log('App starting...');
    render();
    store.subscribe(renderPreview);

    // UI State
    const editorPanel = document.querySelector('.editor-panel');
    let isEditorOpen = false;

    // Tab switching with Toggle Logic
    window.switchTab = (id) => {
        // If clicking same tab, toggle close
        const currentActive = document.querySelector('.nav-item.active');
        const clickedSame = currentActive && currentActive.id === `nav-${id}`;

        // Hide all content first
        document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

        if (clickedSame && isEditorOpen) {
            // Close editor
            editorPanel.classList.remove('open');
            isEditorOpen = false;
        } else {
            // Open editor and show new content
            document.getElementById(`section-${id}`).classList.remove('hidden');
            document.getElementById(`nav-${id}`).classList.add('active');
            editorPanel.classList.add('open');
            isEditorOpen = true;
        }
    };

    // Initial tab
    if (document.getElementById('section-personal')) {
        window.switchTab('personal');
    }
}

function render() {
    renderPreview();
    renderInputs();
}

function renderInputs() {
    const s = store.state;
    // Bind inputs
    document.querySelectorAll('input[data-model^="personal."]').forEach(el => {
        const key = el.dataset.model.split('.')[1];
        el.value = s.personal[key] || '';
        el.oninput = (e) => {
            store.setState({ personal: { ...s.personal, [key]: e.target.value } });
        };
    });
}

function renderPreview() {
    const s = store.state;
    const p = document.getElementById('resume-preview-content');
    if (!p) return;

    p.innerHTML = `
        <h1 class="text-4xl font-bold mb-2">${s.personal.fullName}</h1>
        <p class="text-xl text-primary mb-4">${s.personal.headline}</p>
        <div class="text-sm text-gray-600 mb-8">
            ${s.personal.email} • ${s.personal.phone} • ${s.personal.location}
        </div>
        
        <h3 class="font-bold border-b mb-4 pb-2 uppercase text-sm text-gray-500">Experience</h3>
        ${s.experience.map(e => `
            <div class="mb-4">
                <div class="flex justify-between font-bold">
                    <span>${e.company}</span>
                    <span class="text-sm font-normal">${e.startDate} - ${e.endDate}</span>
                </div>
                <div class="text-primary text-sm font-semibold mb-1">${e.role}</div>
                <div class="text-sm whitespace-pre-line">${e.description}</div>
            </div>
        `).join('')}
    `;
    if (window.lucide) lucide.createIcons();
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
