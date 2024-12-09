// Example: signUp.js (or similar)
const signUpForm = document.getElementById('signUpForm');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(signUpForm);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Store token in localStorage or sessionStorage
            localStorage.setItem('authToken', result.token);
            alert('User registered successfully!');
            window.location.href = '/login'; // Redirect after successful registration
        } else {
            alert(result.error); // Display error message
        }
    } catch (error) {
        console.error(error);
        alert('Something went wrong');
    }
});
