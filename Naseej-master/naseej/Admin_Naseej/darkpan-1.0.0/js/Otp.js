
// Global variable to store email for OTP verification
let userEmail = '';

// Show forgot password wizard
function showForgotPassword(event) {
    event.preventDefault();
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('resetPasswordWizard').style.display = 'block';
    // Reset wizard state
    document.getElementById('forgotPasswordContainer').style.display = 'block';
    document.getElementById('verifyOtpContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '50%';
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
}

// Show login form
function showLoginForm() {
    document.getElementById('resetPasswordWizard').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
    // Clear form inputs
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('verifyOtpForm').reset();
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('floatingInput').value;
    const password = document.getElementById('floatingPassword').value;
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('http://localhost:25025/api/EmpolyeeLogin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', email);
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            successMessage.textContent = 'Login successful! Redirecting...';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
            errorMessage.textContent = 'Invalid email or password';
        }
    } catch (error) {
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.textContent = 'An error occurred. Please try again later.';
        console.error('Error:', error);
    }
}

// Handle forgot password form submission
async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value;
    userEmail = email;

    // Show loading state
    Swal.fire({
        title: 'Sending OTP...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('http://localhost:25025/api/EmpolyeeLogin/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'OTP Sent!',
                text: 'Please check your email for the OTP code',
                confirmButtonColor: '#0d6efd'
            });

            // Update wizard UI
            document.getElementById('forgotPasswordContainer').style.display = 'none';
            document.getElementById('verifyOtpContainer').style.display = 'block';
            document.getElementById('progressBar').style.width = '100%';
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorData.message || 'Failed to send OTP. Please try again.',
                confirmButtonColor: '#0d6efd'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred. Please try again later.',
            confirmButtonColor: '#0d6efd'
        });
        console.error('Error:', error);
    }
}

// Handle OTP verification form submission
async function handleVerifyOtp(event) {
    event.preventDefault();

    const otp = document.getElementById('otpCode').value;
    const newPassword = document.getElementById('newPassword').value;

    // Show loading state
    Swal.fire({
        title: 'Verifying OTP...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const verifyResponse = await fetch('http://localhost:25025/api/EmpolyeeLogin/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                otp: otp
            })
        });

        if (verifyResponse.ok) {
            // Verify OTP success, now reset password
            const resetResponse = await fetch('http://localhost:25025/api/EmpolyeeLogin/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    newPassword: newPassword
                })
            });

            if (resetResponse.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Password reset successful! Redirecting to login...',
                    timer: 2000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    window.location.reload();   
                }, 2000);

                
            } else {
                const errorData = await resetResponse.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Reset Password',
                    text: errorData.message || 'Failed to reset password. Please try again.',
                    confirmButtonColor: '#0d6efd'
                });
            }
        } else {
            const errorData = await verifyResponse.json();
            Swal.fire({
                icon: 'error',
                title: 'Invalid OTP',
                text: errorData.message || 'Invalid OTP. Please try again.',
                confirmButtonColor: '#0d6efd'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred. Please try again later.',
            confirmButtonColor: '#0d6efd'
        });
        console.error('Error:', error);
    }
}

// Go back to previous step
function goBack() {
    document.getElementById('verifyOtpContainer').style.display = 'none';
    document.getElementById('forgotPasswordContainer').style.display = 'block';
    document.getElementById('progressBar').style.width = '50%';
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
}

// Initialize the wizard
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('resetPasswordWizard').style.display = 'none';
    document.getElementById('verifyOtpContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '50%';
});