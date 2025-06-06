
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

    modalTitleElement.textContent = 'Daftar';
    modalBodyElement.innerHTML = `
        <form id="registration-form">
            <div class="mb-3">
                <label for="register-name" class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="register-name" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Alamat email</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Kata sandi (min. 8 karakter)</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <div class="mb-3">
                <label for="passwordConfirm" class="form-label">Konfirmasi Kata Sandi</label>
                <input type="password" class="form-control" id="passwordConfirm" required>
            </div>
            <div id="registration-message-modal" class="mt-3"></div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Daftar</button>
        </form>
        <p class="mt-3 text-center">Sudah punya akun? <a href="#" id="show-login-from-modal-register">Masuk di sini</a></p>
    `;
    modalFooterElement.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>';

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
                displayMessageInModal('Kata sandi tidak cocok.', 'danger', 'registration-message-modal');
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
                    displayMessageInModal('Pendaftaran berhasil! Silakan masuk.', 'success', 'registration-message-modal');
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

    modalTitleElement.textContent = 'Masuk';
    modalBodyElement.innerHTML = `
        <form id="login-form">
            <div class="mb-3">
                <label for="loginEmail" class="form-label">Alamat email</label>
                <input type="email" class="form-control" id="loginEmail" placeholder="Masukkan email" required>
            </div>
            <div class="mb-3">
                <label for="loginPassword" class="form-label">Kata sandi</label>
                <input type="password" class="form-control" id="loginPassword" placeholder="Kata sandi" required>
            </div>
            <div id="login-message-modal" class="mt-3"></div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Masuk</button>
        </form>
        <p class="mt-3 text-center">Belum punya akun? <a href="#" id="show-register-from-modal-login">Daftar di sini</a></p>
    `;
    modalFooterElement.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>';
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
                    // Refresh cart link in navbar
                    if (typeof window.updateCartLink === 'function') {
                        window.updateCartLink();
                    } else {
                        console.warn('updateCartLink function not found after login.');
                    }
                    // If on cart page, refresh its display
                    if (typeof window.displayCart === 'function' && window.location.pathname.includes('cart.html')) {
                        window.displayCart();
                    }
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary" id="login-from-profile-modal">Login</button>
        `;
        if(!authUserModal._isShown) authUserModal.show();
        document.getElementById('login-from-profile-modal')?.addEventListener('click', () => {
            showLoginForm();
        });
        updateNavbar();
        return;
    }

    modalTitleElement.textContent = 'Profil Pengguna';
    modalBodyElement.innerHTML = '<p>Loading profile...</p>';
    modalFooterElement.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
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
                    <p><strong>Address:</strong> ${currentUserDataForEdit.address || 'Not set'}</p>
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
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
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

    modalTitleElement.textContent = 'Ubah Profil';
    modalBodyElement.innerHTML = `
        <form id="edit-profile-form">
            <div class="mb-3">
                <label for="edit-name" class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="edit-name" value="${userData.name || ''}" placeholder="Masukkan nama lengkap Anda" required>
            </div>
            <div class="mb-3">
                <label for="edit-email" class="form-label">Alamat email</label>
                <input type="email" class="form-control" id="edit-email" value="${userData.email || ''}" placeholder="Masukkan email" required>
            </div>
            <div class="mb-3">
                <label for="edit-address" class="form-label">Alamat</label>
                <textarea class="form-control" id="edit-address" rows="3" placeholder="Masukkan alamat Anda">${userData.address || ''}</textarea>
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
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-edit-profile">Batal</button>
        <button type="button" class="btn btn-primary" id="save-profile-changes">Simpan Perubahan</button>
    `;

    if(!authUserModal._isShown) authUserModal.show();

    document.getElementById('cancel-edit-profile')?.addEventListener('click', () => {
        showUserProfile(); // Revert to profile view
    });

    document.getElementById('save-profile-changes')?.addEventListener('click', async () => {
        const newName = document.getElementById('edit-name').value;
        const newEmail = document.getElementById('edit-email').value;
        const newAddress = document.getElementById('edit-address').value;
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
        // PocketBase handles empty string for address as unsetting it or setting to empty.
        // Compare with (userData.address || '') to correctly detect change from null/undefined to empty string.
        if (newAddress !== (userData.address || '')) {
            updatedData.address = newAddress;
        }
        // if (newUsername && newUsername !== userData.username) updatedData.username = newUsername;


        if (Object.keys(updatedData).length === 0) {
            displayMessageInModal('No changes detected to save.', 'info', 'edit-profile-message-modal');
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
                displayMessageInModal('Profil berhasil diperbarui.', 'success', 'edit-profile-message-modal');
                // Update localStorage if relevant fields changed
                if (updatedData.name) localStorage.setItem('pocketbase_user_name', responseData.name); // Use responseData
                if (updatedData.email) localStorage.setItem('pocketbase_user_email', responseData.email); // Use responseData

                currentUserDataForEdit = responseData; // Update with latest data from server
                setTimeout(() => {
                    showUserProfile(); // Refresh profile view
                }, 1000);
            } else {
                let errorMessage = 'Gagal memperbarui profil.';
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

            // Refresh cart link in navbar
            if (typeof window.updateCartLink === 'function') {
                window.updateCartLink();
            } else {
                console.warn('updateCartLink function not found after logout.');
            }
            // If on cart page, refresh its display to show logged-out state (empty)
            if (typeof window.displayCart === 'function' && window.location.pathname.includes('cart.html')) {
                window.displayCart();
            }
            showSuccessNotification('You have been logged out successfully.');
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
