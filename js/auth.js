const POCKETBASE_URL = 'http://127.0.0.1:8090';

// Helper function to remove existing auth forms
function removeAuthForms() {
    const regFormContainer = document.getElementById('registration-form-container');
    if (regFormContainer) {
        regFormContainer.remove();
    }
    const loginFormContainer = document.getElementById('login-form-container');
    if (loginFormContainer) {
        loginFormContainer.remove();
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const profileLink = document.getElementById('profile-link');
    const mainElement = document.querySelector('main');

    // Initial Navbar update
    updateNavbar();

    // --- REGISTRATION ---
    if (registerLink && mainElement) {
        registerLink.addEventListener('click', (event) => {
            event.preventDefault();
            removeAuthForms(); // Remove other forms

            const formContainer = document.createElement('div');
            formContainer.id = 'registration-form-container';
            formContainer.className = 'container py-5';
            formContainer.innerHTML = `
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <h2 class="text-center mb-4">Register</h2>
                        <form id="registration-form">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email address</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <div class="mb-3">
                                <label for="passwordConfirm" class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" id="passwordConfirm" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Register</button>
                            <div id="registration-message" class="mt-3"></div>
                        </form>
                         <p class="mt-3 text-center">Already have an account? <a href="#" id="show-login-from-register">Login here</a></p>
                    </div>
                </div>
            `;
            mainElement.appendChild(formContainer);

            document.getElementById('show-login-from-register')?.addEventListener('click', (e) => {
                e.preventDefault();
                removeAuthForms();
                if(loginLink) loginLink.click(); // Simulate click on login link
            });

            const registrationForm = document.getElementById('registration-form');
            if (registrationForm) {
                registrationForm.addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const passwordConfirm = document.getElementById('passwordConfirm').value;
                    const messageDiv = document.getElementById('registration-message');
                    messageDiv.textContent = '';

                    if (password !== passwordConfirm) {
                        messageDiv.textContent = 'Passwords do not match.';
                        messageDiv.className = 'alert alert-danger mt-3';
                        return;
                    }
                    if (password.length < 8) {
                        messageDiv.textContent = 'Password must be at least 8 characters long.';
                        messageDiv.className = 'alert alert-danger mt-3';
                        return;
                    }

                    try {
                        const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password, passwordConfirm }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                            messageDiv.textContent = 'Registration successful! Please login.';
                            messageDiv.className = 'alert alert-success mt-3';
                            registrationForm.reset();
                            setTimeout(() => { // Give user time to read message
                                removeAuthForms();
                                if(loginLink) loginLink.click(); // Show login form
                            }, 2000);
                        } else {
                            let errorMessage = 'Registration failed. Please try again.';
                            if (data?.data) {
                                const errors = Object.values(data.data).map(err => err.message).join(' ');
                                if (errors) errorMessage = errors;
                            } else if (data?.message) {
                                errorMessage = data.message;
                            }
                            messageDiv.textContent = errorMessage;
                            messageDiv.className = 'alert alert-danger mt-3';
                        }
                    } catch (error) {
                        console.error('Registration error:', error);
                        messageDiv.textContent = 'An unexpected error occurred.';
                        messageDiv.className = 'alert alert-danger mt-3';
                    }
                });
            }
        });
    }

    // --- LOGIN ---
    if (loginLink && mainElement) {
        loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            removeAuthForms(); // Remove other forms

            const formContainer = document.createElement('div');
            formContainer.id = 'login-form-container';
            formContainer.className = 'container py-5';
            formContainer.innerHTML = `
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <h2 class="text-center mb-4">Login</h2>
                        <form id="login-form">
                            <div class="mb-3">
                                <label for="loginEmail" class="form-label">Email address</label>
                                <input type="email" class="form-control" id="loginEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="loginPassword" class="form-label">Password</label>
                                <input type="password" class="form-control" id="loginPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                            <div id="login-message" class="mt-3"></div>
                        </form>
                        <p class="mt-3 text-center">Don't have an account? <a href="#" id="show-register-from-login">Register here</a></p>
                    </div>
                </div>
            `;
            mainElement.appendChild(formContainer);

            document.getElementById('show-register-from-login')?.addEventListener('click', (e) => {
                e.preventDefault();
                removeAuthForms();
                if (registerLink) registerLink.click(); // Simulate click on register link
            });

            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;
                    const messageDiv = document.getElementById('login-message');
                    messageDiv.textContent = '';

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

                            updateNavbar();
                            removeAuthForms();
                            // Display success message inside main or a global message area
                            const successMsg = document.createElement('div');
                            successMsg.className = 'alert alert-success container mt-3';
                            successMsg.textContent = 'Login successful! Welcome back.';
                            mainElement.insertBefore(successMsg, mainElement.firstChild);
                            setTimeout(() => successMsg.remove(), 3000);
                            // window.location.href = 'index.html'; // Or redirect to profile
                        } else {
                            messageDiv.textContent = data.message || 'Login failed. Please check your credentials.';
                            messageDiv.className = 'alert alert-danger mt-3';
                        }
                    } catch (error) {
                        console.error('Login error:', error);
                        messageDiv.textContent = 'An unexpected error occurred during login.';
                        messageDiv.className = 'alert alert-danger mt-3';
                    }
                });
            }
        });
    }

    // --- LOGOUT ---
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('pocketbase_token');
            localStorage.removeItem('pocketbase_user_id');
            localStorage.removeItem('pocketbase_user_email');
            updateNavbar();
            removeAuthForms(); // Clear any open forms
            // Display success message
            const logoutMsg = document.createElement('div');
            logoutMsg.className = 'alert alert-info container mt-3';
            logoutMsg.textContent = 'You have been logged out successfully.';
            if (mainElement) {
                mainElement.insertBefore(logoutMsg, mainElement.firstChild);
                setTimeout(() => logoutMsg.remove(), 3000);
            }
            // window.location.href = 'index.html'; // Redirect to home
        });
    }

    // --- USER PROFILE ---
    if (profileLink && mainElement) {
        profileLink.addEventListener('click', async (event) => {
            event.preventDefault();
            removeAuthForms(); // Clear any open auth forms

            // Clear previous profile displays or messages in main
            const existingProfileContainer = document.getElementById('user-profile-container');
            if (existingProfileContainer) {
                existingProfileContainer.remove();
            }
            const existingErrorMessages = mainElement.querySelectorAll('.alert-danger, .alert-info');
            existingErrorMessages.forEach(msg => msg.remove());


            const token = localStorage.getItem('pocketbase_token');
            const userId = localStorage.getItem('pocketbase_user_id');

            if (!token || !userId) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger container mt-3';
                errorDiv.textContent = 'You are not logged in. Please login to view your profile.';
                mainElement.insertBefore(errorDiv, mainElement.firstChild);
                updateNavbar(); // Ensure navbar reflects logged-out state
                return;
            }

            try {
                const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    const profileContainer = document.createElement('div');
                    profileContainer.id = 'user-profile-container';
                    profileContainer.className = 'container py-5';
                    profileContainer.innerHTML = `
                        <h2>User Profile</h2>
                        <div class="card">
                            <div class="card-body">
                                <p><strong>ID:</strong> <span id="profile-id"></span></p>
                                <p><strong>Email:</strong> <span id="profile-email"></span></p>
                                <p><strong>Username:</strong> <span id="profile-username"></span></p>
                                <p><strong>Name:</strong> <span id="profile-name"></span></p>
                                <p><strong>Verified:</strong> <span id="profile-verified"></span></p>
                                <p><strong>Created:</strong> <span id="profile-created"></span></p>
                                <p><strong>Updated:</strong> <span id="profile-updated"></span></p>
                            </div>
                        </div>
                    `;
                    mainElement.insertBefore(profileContainer, mainElement.firstChild);

                    document.getElementById('profile-id').textContent = data.id;
                    document.getElementById('profile-email').textContent = data.email;
                    document.getElementById('profile-username').textContent = data.username || 'N/A';
                    document.getElementById('profile-name').textContent = data.name || 'N/A';
                    document.getElementById('profile-verified').textContent = data.verified ? 'Yes' : 'No';
                    document.getElementById('profile-created').textContent = new Date(data.created).toLocaleString();
                    document.getElementById('profile-updated').textContent = new Date(data.updated).toLocaleString();

                } else {
                    let errorMessage = `Error fetching profile: ${data.message || response.statusText}`;
                    if (response.status === 401 || response.status === 403) {
                        errorMessage += ' Your session might be invalid or expired. Please log in again.';
                        localStorage.removeItem('pocketbase_token');
                        localStorage.removeItem('pocketbase_user_id');
                        localStorage.removeItem('pocketbase_user_email');
                        updateNavbar();
                    }
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'alert alert-danger container mt-3';
                    errorDiv.textContent = errorMessage;
                    mainElement.insertBefore(errorDiv, mainElement.firstChild);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger container mt-3';
                errorDiv.textContent = 'An unexpected error occurred while fetching your profile.';
                mainElement.insertBefore(errorDiv, mainElement.firstChild);
            }
        });
    }

    // Warn if essential elements are missing
    if (!registerLink) console.warn('Register link (#register-link) not found.');
    if (!loginLink) console.warn('Login link (#login-link) not found.');
    if (!logoutLink) console.warn('Logout link (#logout-link) not found.');
    if (!profileLink) console.warn('Profile link (#profile-link) not found.');
    if (!mainElement) console.error('Main element not found. Auth forms cannot be displayed.');
});
