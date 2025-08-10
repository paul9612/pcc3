document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    // Function to apply theme
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false); // Default to light if no preference or 'light'
    }

    // Event listener for theme toggle in settings modal
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                applyTheme(true);
                localStorage.setItem('theme', 'dark');
            } else {
                applyTheme(false);
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Open settings modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            // Ensure the toggle reflects current theme when modal opens
            applyTheme(document.body.classList.contains('dark-mode'));
        });
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // --- Admin Login Logic ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const adminLoginSection = document.getElementById('admin-login');
    const adminDashboardSection = document.getElementById('admin-dashboard');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Check if admin is already "logged in" (based on session storage for this demo)
    function checkAdminStatus() {
        const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
        if (isAdminLoggedIn === 'true') {
            if (adminLoginSection) adminLoginSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'block';
            if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-block';
            showSection('view-appointments-section'); // Default to view appointments
            fetchAppointments(); // Load appointments on dashboard entry
            fetchComplaints(); // Load complaints on dashboard entry
        } else {
            if (adminLoginSection) adminLoginSection.style.display = 'block';
            if (adminDashboardSection) adminDashboardSection.style.display = 'none';
            if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    loginMessage.className = 'success-message';
                    loginMessage.textContent = 'Login successful! Redirecting to dashboard...';
                    sessionStorage.setItem('isAdminLoggedIn', 'true'); // Store login status
                    setTimeout(() => {
                        checkAdminStatus();
                    }, 1000);
                } else {
                    loginMessage.className = 'error-message';
                    loginMessage.textContent = result.message || 'Login failed.';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginMessage.className = 'error-message';
                loginMessage.textContent = 'An error occurred during login. Please try again.';
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            checkAdminStatus();
            alert('You have been logged out.');
        });
    }

    // --- Dashboard Navigation ---
    const addClientNavBtn = document.getElementById('addClientNavBtn');
    const viewClientsNavBtn = document.getElementById('viewClientsNavBtn');
    const mediaNavBtn = document.getElementById('mediaNavBtn');
    const createAppointmentBtn = document.getElementById('create-appointment-btn');
    const viewAppointmentsBtn = document.getElementById('view-appointments-btn');
    const viewComplaintsBtn = document.getElementById('view-complaints-btn');

    const addClientSection = document.getElementById('add-client-section');
    const viewClientsSection = document.getElementById('view-clients-section');
    const mediaManagementSection = document.getElementById('media-management-section');
    const createAppointmentSection = document.getElementById('create-appointment-section');
    const viewAppointmentsSection = document.getElementById('view-appointments-section');
    const viewComplaintsSection = document.getElementById('view-complaints-section');

    function hideAllSections() {
        if (addClientSection) addClientSection.style.display = 'none';
        if (viewClientsSection) viewClientsSection.style.display = 'none';
        if (mediaManagementSection) mediaManagementSection.style.display = 'none';
        if (createAppointmentSection) createAppointmentSection.style.display = 'none';
        if (viewAppointmentsSection) viewAppointmentsSection.style.display = 'none';
        if (viewComplaintsSection) viewComplaintsSection.style.display = 'none';
    }

    function showSection(sectionId) {
        hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }

    if (addClientNavBtn) {
        addClientNavBtn.addEventListener('click', () => {
            showSection('add-client-section');
            document.getElementById('client-message').textContent = ''; // Clear message
        });
    }
    if (viewClientsNavBtn) {
        viewClientsNavBtn.addEventListener('click', () => {
            showSection('view-clients-section');
            fetchClients(); // Load clients when viewing
        });
    }
    if (mediaNavBtn) {
        mediaNavBtn.addEventListener('click', () => {
            showSection('media-management-section');
            displayMedia(); // Load media when viewing
            document.getElementById('upload-message').textContent = ''; // Clear message
        });
    }
    if (createAppointmentBtn) {
        createAppointmentBtn.addEventListener('click', () => showSection('create-appointment-section'));
    }
    if (viewAppointmentsBtn) {
        viewAppointmentsBtn.addEventListener('click', () => {
            showSection('view-appointments-section');
            fetchAppointments(); // Refresh appointments when viewing
        });
    }
    if (viewComplaintsBtn) {
        viewComplaintsBtn.addEventListener('click', () => {
            showSection('view-complaints-section');
            fetchComplaints(); // Refresh complaints when viewing
        });
    }

    // --- Client Management Functionality (using localStorage) ---
    const newClientNameInput = document.getElementById('newClientName');
    const clientEmailInput = document.getElementById('clientEmail');
    const clientPhoneInput = document.getElementById('clientPhone');
    const clientAddressInput = document.getElementById('clientAddress');
    const saveClientBtn = document.getElementById('saveClientBtn');
    const clientList = document.getElementById('clientList');
    const noClientsMessage = document.getElementById('no-clients-message');
    const clientMessage = document.getElementById('client-message');

    function getClients() {
        try {
            const clients = JSON.parse(localStorage.getItem('clients')) || [];
            return clients;
        } catch (e) {
            console.error("Error parsing clients from localStorage:", e);
            return [];
        }
    }

    function saveClients(clients) {
        localStorage.setItem('clients', JSON.stringify(clients));
    }

    function fetchClients() {
        const clients = getClients();
        clientList.innerHTML = ''; // Clear previous content

        if (clients.length === 0) {
            noClientsMessage.style.display = 'block';
            return;
        }
        noClientsMessage.style.display = 'none';

        clients.forEach(client => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <strong>${client.name}</strong><br>
                    Email: ${client.email || 'N/A'}<br>
                    Phone: ${client.phone || 'N/A'}<br>
                    Address: ${client.address || 'N/A'}
                </div>
                <button data-id="${client.id}">Delete</button>
            `;
            clientList.appendChild(listItem);
        });

        document.querySelectorAll('#clientList li button').forEach(button => {
            button.addEventListener('click', deleteClient);
        });
    }

    function deleteClient(event) {
        const clientIdToDelete = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this client?')) {
            return;
        }

        let clients = getClients();
        clients = clients.filter(client => client.id !== clientIdToDelete);
        saveClients(clients);
        fetchClients(); // Refresh the list
    }

    if (saveClientBtn) {
        saveClientBtn.addEventListener('click', () => {
            const name = newClientNameInput.value.trim();
            const email = clientEmailInput.value.trim();
            const phone = clientPhoneInput.value.trim();
            const address = clientAddressInput.value.trim();

            if (!name || !email) {
                clientMessage.className = 'error-message';
                clientMessage.textContent = 'Client Name and Email are required.';
                return;
            }

            const newClient = {
                id: Date.now().toString(), // Simple unique ID
                name,
                email,
                phone,
                address
            };

            const clients = getClients();
            clients.push(newClient);
            saveClients(clients);

            clientMessage.className = 'success-message';
            clientMessage.textContent = 'Client saved successfully!';

            // Clear inputs
            newClientNameInput.value = '';
            clientEmailInput.value = '';
            clientPhoneInput.value = '';
            clientAddressInput.value = '';

            // Optionally, switch to view clients section after saving
            // showSection('view-clients-section');
            // fetchClients();
        });
    }

    // --- Media Management Functionality (using localStorage) ---
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const mediaGallery = document.getElementById('mediaGallery');
    const noMediaMessage = document.getElementById('no-media-message');
    const uploadMessage = document.getElementById('upload-message');

    function getMedia() {
        try {
            const media = JSON.parse(localStorage.getItem('media')) || [];
            return media;
        } catch (e) {
            console.error("Error parsing media from localStorage:", e);
            return [];
        }
    }

    function saveMedia(media) {
        localStorage.setItem('media', JSON.stringify(media));
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click(); // Trigger the hidden file input click
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length === 0) {
                uploadMessage.className = 'error-message';
                uploadMessage.textContent = 'No files selected.';
                return;
            }

            let filesProcessed = 0;
            let filesFailed = 0;
            const totalFiles = files.length;

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const mediaItem = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More robust ID
                        src: e.target.result,
                        type: file.type,
                        name: file.name,
                        uploadedAt: new Date().toISOString()
                    };

                    const media = getMedia();
                    media.push(mediaItem);
                    saveMedia(media);
                    filesProcessed++;
                    if (filesProcessed === totalFiles) {
                        uploadMessage.className = 'success-message';
                        uploadMessage.textContent = `Successfully uploaded ${totalFiles - filesFailed} file(s).`;
                        if (filesFailed > 0) {
                            uploadMessage.textContent += ` ${filesFailed} file(s) failed to upload.`;
                        }
                        displayMedia(); // Refresh gallery
                        fileInput.value = ''; // Clear file input
                    }
                };

                reader.onerror = () => {
                    console.error("Failed to read file:", file.name);
                    filesProcessed++;
                    filesFailed++;
                    if (filesProcessed === totalFiles) {
                        uploadMessage.className = 'error-message';
                        uploadMessage.textContent = `Failed to upload ${filesFailed} file(s).`;
                        if (totalFiles > filesFailed) {
                            uploadMessage.textContent += ` Successfully uploaded ${totalFiles - filesFailed} file(s).`;
                        }
                        fileInput.value = ''; // Clear file input
                    }
                };

                // Limit file size for localStorage (e.g., 5MB per file)
                const MAX_FILE_SIZE_MB = 5;
                if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    uploadMessage.className = 'error-message';
                    uploadMessage.textContent = `File "${file.name}" is too large (max ${MAX_FILE_SIZE_MB}MB).`;
                    filesProcessed++;
                    filesFailed++;
                    if (filesProcessed === totalFiles) {
                        fileInput.value = ''; // Clear file input
                    }
                    return;
                }

                reader.readAsDataURL(file); // Read file as Base64 Data URL
            });
        });
    }

    function displayMedia() {
        const media = getMedia();
        mediaGallery.innerHTML = ''; // Clear previous content

        if (media.length === 0) {
            noMediaMessage.style.display = 'block';
            return;
        }
        noMediaMessage.style.display = 'none';

        media.forEach(item => {
            const mediaItemDiv = document.createElement('div');
            mediaItemDiv.className = 'media-item';

            let mediaElement;
            if (item.type.startsWith('image/')) {
                mediaElement = document.createElement('img');
                mediaElement.src = item.src;
                mediaElement.alt = item.name;
            } else if (item.type.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.src = item.src;
                mediaElement.controls = true; // Add controls for video playback
                mediaElement.preload = 'metadata'; // Load metadata only initially
            } else {
                // Fallback for unsupported types
                mediaElement = document.createElement('p');
                mediaElement.textContent = `Unsupported file type: ${item.name}`;
            }

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-media-btn';
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.id = item.id;
            deleteButton.addEventListener('click', deleteMedia);

            mediaItemDiv.appendChild(mediaElement);
            mediaItemDiv.appendChild(document.createElement('p')).textContent = item.name;
            mediaItemDiv.appendChild(deleteButton);
            mediaGallery.appendChild(mediaItemDiv);
        });
    }

    function deleteMedia(event) {
        const mediaIdToDelete = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this media item?')) {
            return;
        }

        let media = getMedia();
        media = media.filter(item => item.id !== mediaIdToDelete);
        saveMedia(media);
        displayMedia(); // Refresh the gallery
    }

    // --- Create Appointment Logic ---
    const createAppointmentForm = document.getElementById('create-appointment-form');
    const appointmentMessage = document.getElementById('appointment-message');

    if (createAppointmentForm) {
        createAppointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                clientName: document.getElementById('appointmentClientName').value,
                contactNumber: document.getElementById('contactNumber').value,
                service: document.getElementById('service').value,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                notes: document.getElementById('notes').value
            };

            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    appointmentMessage.className = 'success-message';
                    appointmentMessage.textContent = 'Appointment created successfully!';
                    createAppointmentForm.reset();
                    fetchAppointments(); // Refresh appointments list in admin view
                } else {
                    appointmentMessage.className = 'error-message';
                    appointmentMessage.textContent = result.message || 'Failed to create appointment.';
                }
            } catch (error) {
                console.error('Error creating appointment:', error);
                appointmentMessage.className = 'error-message';
                appointmentMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // --- Fetch and Display Appointments (Admin) ---
    const appointmentsTableBody = document.querySelector('#appointments-table tbody');
    const noAppointmentsMessage = document.getElementById('no-appointments-message');

    async function fetchAppointments() {
        if (!appointmentsTableBody) return; // Exit if table body doesn't exist

        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const appointments = await response.json();
            displayAdminAppointments(appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load appointments.</td></tr>`;
            if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'block';
        }
    }

    function displayAdminAppointments(appointments) {
        if (!appointmentsTableBody) return;

        appointmentsTableBody.innerHTML = ''; // Clear previous content
        if (appointments.length === 0) {
            if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'block';
            return;
        }
        if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'none';

        // Sort appointments by date and then time
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        appointments.forEach(appointment => {
            const row = appointmentsTableBody.insertRow();
            row.innerHTML = `
                <td>${appointment.clientName}</td>
                <td>${appointment.contactNumber}</td>
                <td>${appointment.service}</td>
                <td>${new Date(appointment.date).toLocaleDateString('en-NZ')}</td>
                <td>${appointment.time}</td>
                <td>${appointment.notes || 'N/A'}</td>
                <td><button class="delete-btn" data-id="${appointment._id}">Delete</button></td>
            `;
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteAppointment);
        });
    }

    async function deleteAppointment(event) {
        const appointmentId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Appointment deleted successfully!');
                fetchAppointments(); // Refresh the list in admin view
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete appointment.');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('An error occurred while deleting the appointment.');
        }
    }

    // --- Fetch and Display Complaints/Reports (Admin) ---
    const complaintsTableBody = document.querySelector('#complaints-table tbody');
    const noComplaintsMessage = document.getElementById('no-complaints-message');

    async function fetchComplaints() {
        if (!complaintsTableBody) return; // Exit if table body doesn't exist

        try {
            const response = await fetch('/api/complaints');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const complaints = await response.json();
            displayAdminComplaints(complaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            complaintsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load reports/complaints.</td></tr>`; // Adjusted colspan
            if (noComplaintsMessage) noComplaintsMessage.style.display = 'block';
        }
    }

    function displayAdminComplaints(complaints) {
        if (!complaintsTableBody) return;

        complaintsTableBody.innerHTML = ''; // Clear previous content
        if (complaints.length === 0) {
            if (noComplaintsMessage) noComplaintsMessage.style.display = 'block';
            return;
        }
        if (noComplaintsMessage) noComplaintsMessage.style.display = 'none';

        complaints.forEach(complaint => {
            const row = complaintsTableBody.insertRow();
            row.innerHTML = `
                <td>${complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</td>
                <td>${complaint.senderName}</td>
                <td>${complaint.senderEmail || 'N/A'}</td>
                <td>${complaint.senderPhone || 'N/A'}</td>
                <td>${complaint.message}</td>
                <td>${new Date(complaint.createdAt).toLocaleDateString('en-NZ')} ${new Date(complaint.createdAt).toLocaleTimeString('en-NZ')}</td>
                <td><button class="delete-btn" data-id="${complaint._id}">Delete</button></td> <!-- NEW: Delete button for complaints -->
            `;
        });

        // NEW: Add event listeners for delete buttons for complaints
        document.querySelectorAll('#complaints-table .delete-btn').forEach(button => {
            button.addEventListener('click', deleteComplaint);
        });
    }

    // NEW: Function to delete a complaint/report
    async function deleteComplaint(event) {
        const complaintId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this report/complaint? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/complaints/${complaintId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Report/Complaint deleted successfully!');
                fetchComplaints(); // Refresh the list in admin view
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete report/complaint.');
            }
        } catch (error) {
            console.error('Error deleting report/complaint:', error);
            alert('An error occurred while deleting the report/complaint.');
        }
    }

    // Initial check on page load to determine if admin dashboard should be shown
    checkAdminStatus();
});