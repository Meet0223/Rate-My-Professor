# Rate My Professor

## Features

- User authentication with JWT
- Rate and review professors
- Search for professors by name or department
- View average ratings and reviews for professors
- Admin panel for managing users and reviews

## Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Meet0223/Rate-My-Professor.git
    cd Rate-My-Professor/server
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the [server](http://_vscodecontentref_/1) directory with the following content:
    ```env
    DATABASE_URL=your_database_url
    JWT_SECRET=your_jwt_secret
    ```

4. Connect to your PostgreSQL database and seed the database:
    ```sh
    npm run seed-db
    ```

5. Start the server:
    ```sh
    npm start
    ```

### Scripts

- `npm start`: Starts the server using `nodemon`.
- `npm run seed-db`: Seeds the database with initial data.

### License

This project is licensed under the ISC License.
