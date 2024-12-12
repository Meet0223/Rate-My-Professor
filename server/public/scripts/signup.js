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

            localStorage.setItem('authToken', result.token);
            alert('User registered successfully!');
            window.location.href = '/login'; 
        } else {
            alert(result.error); 
        }
    } catch (error) {
        console.error(error);
        alert('Something went wrong');
    }
});
