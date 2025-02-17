

document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        
        const response = await fetch('/logout', { method: 'POST' });
        
        if (response.ok) {

            window.location.href = '/login';
        } else {
            console.error('Logout failed');
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred. Please try again.');
    }
});