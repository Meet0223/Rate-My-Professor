document.addEventListener('DOMContentLoaded', function() {
    const signInForm = document.querySelector('#signInForm');

    signInForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful.') {

                window.location.href = '/profile';
            } else {
                alert(data.error || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });
});