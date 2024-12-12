async function deleteReview(reviewId) {
    console.log(reviewId);
    if (confirm('Are you sure you want to delete this review?')) {
        try {
            const response = await fetch(`/delete-review/${reviewId}`, {
                method: 'DELETE',
            });

            if (response.ok) {

                const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
                reviewElement.remove();

                window.location.reload();
            } else {
                alert('Failed to delete review');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting review');
        }
    }
}


async function editReview(reviewId) {
    console.log(reviewId);
    try {

        const response = await fetch(`/get-review/${reviewId}`);
        if (!response.ok) throw new Error('Failed to fetch review');
        
        const review = await response.json();
        

        window.location.href = `/edit-review/${reviewId}`;
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error editing review');
    }
}