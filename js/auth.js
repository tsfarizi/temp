const POCKETBASE_URL = 'http://127.0.0.1:8090';

let authUserModalElement;
let authUserModal;
let modalTitleElement;
let modalBodyElement;
let modalFooterElement;
let currentUserDataForEdit = null; // To store data for edit form

// Function to update navbar based on auth state
function updateNavbar() {
    const token = localStorage.getItem('pocketbase_token');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const profileLink = document.getElementById('profile-link');

    if (token) {
        if (registerLink) registerLink.parentElement.classList.add('d-none');
        if (loginLink) loginLink.parentElement.classList.add('d-none');
        if (logoutLink) logoutLink.parentElement.classList.remove('d-none');
        if (profileLink) profileLink.parentElement.classList.remove('d-none');
    } else {
        if (registerLink) registerLink.parentElement.classList.remove('d-none');
        if (loginLink) loginLink.parentElement.classList.remove('d-none');
        if (logoutLink) logoutLink.parentElement.classList.add('d-none');
        if (profileLink) profileLink.parentElement.classList.add('d-none');
    }
}

// Helper function to clear modal content and hide
function clearModalContentAndHide(keepOpen = false) {
    if (modalTitleElement) modalTitleElement.innerHTML = '';
    if (modalBodyElement) modalBodyElement.innerHTML = '';
    if (modalFooterElement) modalFooterElement.innerHTML = '';
    if (authUserModal && !keepOpen) authUserModal.hide();

    const mainElement = document.querySelector('main');
    if (mainElement) {
        const pageMessages = mainElement.querySelectorAll('.alert.container');
        pageMessages.forEach(msg => msg.remove());
        const oldFormContainers = mainElement.querySelectorAll('#registration-form-container, #login-form-container, #user-profile-container');
        oldFormContainers.forEach(container => container.remove());
    }
}


function displayMessageInModal(message, type = 'danger', areaId = null) {
    let targetArea = modalBodyElement;
    if (areaId) {
        targetArea = document.getElementById(areaId) || modalBodyElement;
    }
    if (!targetArea) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type} mt-3`;
    messageDiv.textContent = message;

    const existingMessageDiv = targetArea.querySelector('.alert');
    if (existingMessageDiv) {
        existingMessageDiv.replaceWith(messageDiv);
    } else {
        targetArea.appendChild(messageDiv);
    }
}

function showRegistrationForm() {
    if (!authUserModal || !modalTitleElement || !modalBodyElement || !modalFooterElement) {
        console.error('Modal elements not initialized for registration form.');
        return;
    }
    clearModalContentAndHide(true);

    modalTitleElement.textContent = 'Register';
    modalBodyElement.innerHTML = `
        <form id="registration-form">
            <div class="mb-3">
                <label for="register-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="register-name" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password (min. 8 characters)</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <div class="mb-3">
                <label for="passwordConfirm" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="passwordConfirm" required>
            </div>
            <div id="registration-message-modal" class="mt-3"></div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Register</button>
        </form>
        <p class="mt-3 text-center">Already have an account? <a href="#" id="show-login-from-modal-register">Login here</a></p>
    `;
    modalFooterElement.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';

    if(!authUserModal._isShown) authUserModal.show();

    document.getElementById('show-login-from-modal-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (submitEvent) => {
            submitEvent.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('passwordConfirm').value;

            if (!name.trim()) {
                displayMessageInModal('Name field cannot be empty.', 'danger', 'registration-message-modal');
                return;
            }
            if (password !== passwordConfirm) {
                displayMessageInModal('Passwords do not match.', 'danger', 'registration-message-modal');
                return;
            }
            if (password.length < 8) {
                displayMessageInModal('Password must be at least 8 characters long.', 'danger', 'registration-message-modal');
                return;
            }

            try {
                const userData = { name, email, password, passwordConfirm };
                const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                });
                const data = await response.json();
                if (response.ok) {
                    registrationForm.reset();
                    displayMessageInModal('Registration successful! Please login.', 'success', 'registration-message-modal');
                    setTimeout(() => {
                        showLoginForm();
                    }, 1500);
                } else {
                    let errorMessage = 'Registration failed.';
                    if (data?.data) errorMessage = Object.values(data.data).map(err => err.message).join(' ');
                    else if (data?.message) errorMessage = data.message;
                    displayMessageInModal(errorMessage, 'danger', 'registration-message-modal');
                }
            } catch (error) {
                console.error('Registration error:', error);
                displayMessageInModal('An unexpected error occurred.', 'danger', 'registration-message-modal');
            }
        });
    }
}

function showLoginForm() {
    if (!authUserModal || !modalTitleElement || !modalBodyElement || !modalFooterElement) {
        console.error('Modal elements not initialized for login form.');
        return;
    }
    clearModalContentAndHide(true);

    modalTitleElement.textContent = 'Login';
    modalBodyElement.innerHTML = `
        <form id="login-form">
            <div class="mb-3">
                <label for="loginEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="loginEmail" required>
            </div>
            <div class="mb-3">
                <label for="loginPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="loginPassword" required>
            </div>
            <div id="login-message-modal" class="mt-3"></div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Login</button>
        </form>
        <p class="mt-3 text-center">Don't have an account? <a href="#" id="show-register-from-modal-login">Register here</a></p>
    `;
    modalFooterElement.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';
    if(!authUserModal._isShown) authUserModal.show();

    document.getElementById('show-register-from-modal-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        showRegistrationForm();
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (submitEvent) => {
            submitEvent.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${POCKETBASE_URL}/api/collections/users/auth-with-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identity: email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('pocketbase_token', data.token);
                    localStorage.setItem('pocketbase_user_id', data.record.id);
                    localStorage.setItem('pocketbase_user_email', data.record.email);
                    localStorage.setItem('pocketbase_user_name', data.record.name);

                    updateNavbar();
                    authUserModal.hide();
                } else {
                    displayMessageInModal(data.message || 'Login failed. Check credentials.', 'danger', 'login-message-modal');
                }
            } catch (error) {
                console.error('Login error:', error);
                displayMessageInModal('An unexpected error occurred.', 'danger', 'login-message-modal');
            }
        });
    }
}

async function showUserProfile() {
    if (!authUserModal || !modalTitleElement || !modalBodyElement || !modalFooterElement) {
        console.error('Modal elements not initialized for user profile.');
        return;
    }
    clearModalContentAndHide(true);

    const token = localStorage.getItem('pocketbase_token');
    const userId = localStorage.getItem('pocketbase_user_id');

    if (!token || !userId) {
        modalTitleElement.textContent = 'Access Denied';
        modalBodyElement.innerHTML = '<p>You are not logged in. Please login to view your profile.</p>';
        modalFooterElement.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="login-from-profile-modal">Login</button>
        `;
        if(!authUserModal._isShown) authUserModal.show();
        document.getElementById('login-from-profile-modal')?.addEventListener('click', () => {
            showLoginForm();
        });
        updateNavbar();
        return;
    }

    modalTitleElement.textContent = 'User Profile';
    modalBodyElement.innerHTML = '<p>Loading profile...</p>';
    modalFooterElement.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="edit-profile-button">Edit Profile</button>
        <button type="button" class="btn btn-danger" id="logout-from-profile-modal">Logout</button>
    `;
    if(!authUserModal._isShown) authUserModal.show();

    document.getElementById('logout-from-profile-modal')?.addEventListener('click', () => {
        localStorage.removeItem('pocketbase_token');
        localStorage.removeItem('pocketbase_user_id');
        localStorage.removeItem('pocketbase_user_email');
        localStorage.removeItem('pocketbase_user_name');
        updateNavbar();
        authUserModal.hide();
    });

    try {
        const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        currentUserDataForEdit = await response.json(); // Store for edit form
        if (response.ok) {
            modalBodyElement.innerHTML = `
                <div class="profile-view-container">
                    <p><strong>ID:</strong> ${currentUserDataForEdit.id}</p>
                    <p><strong>Email:</strong> ${currentUserDataForEdit.email}</p>
                    <p><strong>Username:</strong> ${currentUserDataForEdit.username || 'N/A'}</p>
                    <p><strong>Name:</strong> ${currentUserDataForEdit.name || 'N/A'}</p>
                    <p><strong>Verified:</strong> ${currentUserDataForEdit.verified ? 'Yes' : 'No'}</p>
                    <p><strong>Created:</strong> ${new Date(currentUserDataForEdit.created).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(currentUserDataForEdit.updated).toLocaleString()}</p>
                </div>
            `;
            document.getElementById('edit-profile-button')?.addEventListener('click', () => {
                showEditProfileForm(currentUserDataForEdit);
            });
        } else {
            let errorMessage = `Error: ${currentUserDataForEdit.message || response.statusText}`;
            if (response.status === 401 || response.status === 403) {
                errorMessage += ' Session may be invalid. Please log in again.';
                localStorage.removeItem('pocketbase_token');
                localStorage.removeItem('pocketbase_user_id');
                localStorage.removeItem('pocketbase_user_email');
                localStorage.removeItem('pocketbase_user_name');
                updateNavbar();
                modalFooterElement.innerHTML = `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="login-again-modal">Login</button>`;
                document.getElementById('login-again-modal')?.addEventListener('click', showLoginForm);
            }
            modalBodyElement.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        modalBodyElement.innerHTML = '<div class="alert alert-danger">Failed to fetch profile.</div>';
        currentUserDataForEdit = null; // Clear if fetch failed
    }
}

function showEditProfileForm(userData) {
    if (!authUserModal || !modalTitleElement || !modalBodyElement || !modalFooterElement || !userData) {
        console.error('Modal or user data not available for editing profile.');
        displayMessageInModal('Could not load profile for editing. Please try again.', 'danger');
        return;
    }
    clearModalContentAndHide(true);

    modalTitleElement.textContent = 'Edit Profile';
    modalBodyElement.innerHTML = `
        <form id="edit-profile-form">
            <div class="mb-3">
                <label for="edit-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="edit-name" value="${userData.name || ''}" required>
            </div>
            <div class="mb-3">
                <label for="edit-email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="edit-email" value="${userData.email || ''}" required>
            </div>
            <!-- Username editing can be added if PocketBase schema allows and it's desired -->
            <!-- <div class="mb-3">
                <label for="edit-username" class="form-label">Username</label>
                <input type="text" class="form-control" id="edit-username" value="${userData.username || ''}">
            </div> -->
            <div id="edit-profile-message-modal" class="mt-3"></div>
        </form>
    `;
    modalFooterElement.innerHTML = `
        <button type="button" class="btn btn-secondary" id="cancel-edit-profile">Cancel</button>
        <button type="button" class="btn btn-primary" id="save-profile-changes">Save Changes</button>
    `;

    if(!authUserModal._isShown) authUserModal.show();

    document.getElementById('cancel-edit-profile')?.addEventListener('click', () => {
        showUserProfile(); // Revert to profile view
    });

    document.getElementById('save-profile-changes')?.addEventListener('click', async () => {
        const newName = document.getElementById('edit-name').value;
        const newEmail = document.getElementById('edit-email').value;
        // const newUsername = document.getElementById('edit-username')?.value;

        if (!newName.trim()) {
            displayMessageInModal('Name cannot be empty.', 'danger', 'edit-profile-message-modal');
            return;
        }
        // Basic email validation
        if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
            displayMessageInModal('Please enter a valid email address.', 'danger', 'edit-profile-message-modal');
            return;
        }

        const updatedData = {};
        if (newName !== userData.name) updatedData.name = newName;
        if (newEmail !== userData.email) updatedData.email = newEmail;
        // if (newUsername && newUsername !== userData.username) updatedData.username = newUsername;


        if (Object.keys(updatedData).length === 0) {
            displayMessageInModal('No changes detected.', 'info', 'edit-profile-message-modal');
            return;
        }

        const token = localStorage.getItem('pocketbase_token');
        const userId = localStorage.getItem('pocketbase_user_id');

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            const responseData = await response.json();

            if (response.ok) {
                displayMessageInModal('Profile updated successfully!', 'success', 'edit-profile-message-modal');
                // Update localStorage if relevant fields changed
                if (updatedData.name) localStorage.setItem('pocketbase_user_name', updatedData.name);
                if (updatedData.email) localStorage.setItem('pocketbase_user_email', updatedData.email);

                currentUserDataForEdit = responseData; // Update with latest data from server
                setTimeout(() => {
                    showUserProfile(); // Refresh profile view
                }, 1000);
            } else {
                let errorMessage = 'Failed to update profile.';
                if (responseData?.data) errorMessage = Object.values(responseData.data).map(err => err.message).join(' ');
                else if (responseData?.message) errorMessage = responseData.message;
                displayMessageInModal(errorMessage, 'danger', 'edit-profile-message-modal');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            displayMessageInModal('An unexpected error occurred while updating profile.', 'danger', 'edit-profile-message-modal');
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    authUserModalElement = document.getElementById('auth-user-modal');
    if (authUserModalElement) {
        authUserModal = new bootstrap.Modal(authUserModalElement);
        modalTitleElement = document.getElementById('auth-user-modal-label');
        modalBodyElement = document.getElementById('auth-user-modal-body');
        modalFooterElement = document.getElementById('auth-user-modal-footer');
    } else {
        console.error("Modal HTML structure not found!");
        return;
    }

    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const profileLink = document.getElementById('profile-link');

    updateNavbar();

    if (registerLink) {
        registerLink.addEventListener('click', (event) => {
            event.preventDefault();
            showRegistrationForm();
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            showLoginForm();
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('pocketbase_token');
            localStorage.removeItem('pocketbase_user_id');
            localStorage.removeItem('pocketbase_user_email');
            localStorage.removeItem('pocketbase_user_name');
            currentUserDataForEdit = null; // Clear cached user data
            updateNavbar();
            if (authUserModal && authUserModal._isShown) authUserModal.hide();

            const mainElement = document.querySelector('main');
            if(mainElement){
                const logoutMsg = document.createElement('div');
                logoutMsg.className = 'alert alert-info container mt-3';
                logoutMsg.textContent = 'You have been logged out successfully.';
                mainElement.insertBefore(logoutMsg, mainElement.firstChild);
                setTimeout(() => logoutMsg.remove(), 3000);
            }
        });
    }

    if (profileLink) {
        profileLink.addEventListener('click', (event) => {
            event.preventDefault();
            showUserProfile();
        });
    }

    if (!registerLink) console.warn('Register link (#register-link) not found.');
    if (!loginLink) console.warn('Login link (#login-link) not found.');
    if (!logoutLink) console.warn('Logout link (#logout-link) not found.');
    if (!profileLink) console.warn('Profile link (#profile-link) not found.');
});
