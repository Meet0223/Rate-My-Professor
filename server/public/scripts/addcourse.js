document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('reviewForm');
    const logoutForm = document.getElementById('logoutForm');
    
    // Handle the main course review form
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(reviewForm);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/addCourse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = '/profile';
            } else {
                alert('Failed to submit the form. Please try again.');
            }
        } catch (error) {
            alert('Error submitting form. Please try again.');
        }
    });


    logoutForm.addEventListener('submit', (e) => {

        return true;
    });


    const courseCodeInput = document.querySelector('#courseCode');
    if (courseCodeInput) {
        courseCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
});