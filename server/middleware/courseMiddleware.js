function validateCourseInput(req, res, next) {
    const {
        courseCode,
        courseName,
        semester,
        year,
        professorName,
        professorRating,
        difficultyLevel
    } = req.body;


    if (!courseCode || !courseName || !semester || !year || !professorName || 
        !professorRating || !difficultyLevel) {
        return res.status(400).json({ error: 'Missing required fields' });
    }


    if (professorRating < 0 || professorRating > 5 || 
        difficultyLevel < 0 || difficultyLevel > 5) {
        return res.status(400).json({ error: 'Ratings must be between 0 and 5' });
    }


    const validSemesters = ['Spring', 'Summer', 'Fall', 'Winter'];
    if (!validSemesters.includes(semester)) {
        return res.status(400).json({ error: 'Invalid semester' });
    }


    const year_num = parseInt(year);
    if (year_num < 2020 || year_num > 2024) {
        return res.status(400).json({ error: 'Invalid year' });
    }

    next();
}

export default validateCourseInput;