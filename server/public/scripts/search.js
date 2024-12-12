document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#courseCode');


    searchInput.addEventListener('input', (e) => {

        const cursorPosition = e.target.selectionStart;
        

        e.target.value = e.target.value.toUpperCase();
        

        e.target.setSelectionRange(cursorPosition, cursorPosition);
    });


    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const courseCode = searchInput.value.trim();
        

        const coursePattern = /^[A-Za-z]{2,4}\d{2,3}$/;
        
        if (!coursePattern.test(courseCode)) {
            alert('Please enter a valid course code (e.g., CSC317)');
            return;
        }


        searchForm.submit();
    });
});