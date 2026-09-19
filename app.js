// =================================
// Imports and initial setup
// =================================

// Web framework for making RESTful APIs
const express = require('express');

/* Allows cross-origin resourse sharing between websites of different domains
 * Without it, websites cannot use this API
*/ 
const cors = require('cors');

/* pg is Node.js library for PostgreSQL
 * Pool is a class, and is a property of the pg object. It:
 * - allows multiple connections to PostreSQL
 * - keeps and reuses existing connections for further queries (no need to make new ones)
*/
const { Pool } = require('pg');

// Loads env variables from .env
require('dotenv').config();

// Creates an Express instance
const app = express();

/* app.use() is a middleware: client request | software-in-the-middle | server response
 * use this middleware for requests: express.json() 
 * It creates and returns an Express middleware that parses a JSON request body into a JS object req.body()
*/ 
app.use(express.json());

// middleware that enables cross-origin rescource sharing on all the routes
app.use(cors());


// =================================
// DB connection
// =================================

const pool = new Pool({
    // Reads from .env the PostgreSQL URL
    connectionString: process.env.DATABASE_URL
});


// =================================
// ROUTE: GET /health
// =================================
// This endpoint checks if the server is up and running
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});


// =================================
// ROUTE: GET /todos
// Retrieves the todos from the DB
// =================================

app.get('/todos', async(req,res) => {
    try {
        const result = await pool.query(
            // Gets the todos sorted from the newest to the oldest
            'SELECT * FROM todos ORDER BY created_at DESC'
        );
        res.json(result.rows); // array of objects, one for each DB row
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json( {error: 'Failed to fetch todos'} );
    }
});


// =================================
// ROUTE: GET /todos/:id
// Retrieves the todo by ID. 
// Eg: GET /todos/5 → id = '5'
// =================================
app.get('/todos/:id', async(req,res) => {
    try {
        const {id} = req.params;
        const result = await pool.query(
            'SELECT * FROM todos WHERE id = $1', // $1 to avoid SQL injection
            [id] // the actual value, instead of $1
        );

        // If the todo doesn't exist
        if (result.rows.length === 0) {
            return res.status(404).json( {error: 'Todo not found'});
        }

        // Sends the TODO as a JSON response
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching todo:', error);
        res.status(500).json( {error: 'Failed to fetch todo'} );
    }
});


// =================================
// ROUTE: POST /todos/
// Creates a new todo
// =================================
app.post('/todos', async(req,res) => {
    try {
        const {title} = req.body;
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({
                error: 'A title is required and must be a string'
            });
        }

        const result = await pool.query(
            // Creates the new row and returns it to the client to let it know the ID
            'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
            [title.trim(), false]
        );

        // Sends the new todo with its ID
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating todo', error);
        res.status(500).json( {error: 'Failed to create todo'} );
    }
});


// =================================
// ROUTE: PUT /todos/:id
// Updates a todo (eg: mark as completed)
// =================================

app.put('/todos/:id', async(req,res) => {
    try {
        const {id} = req.params;
        const {title, completed} = req.body;

        if (!id) return res.status(400).json({error: 'ID is required'});

        const existCheck = await pool.query(
            'SELECT id FROM todos WHERE id = $1',
            [id]
        );

        if (existCheck.rows.length === 0) return res.status(404).json( {error: 'Todo not found'} );

        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (title !== undefined) {
            updateFields.push(`title = $${paramCount}`);
            updateValues.push(title);
            paramCount++;
        }

        if (completed !== undefined) {
            updateFields.push(`completed = $${paramCount}`);
            updateValues.push(completed);
            paramCount++;
        }

        // Adds the timestamp of the last edit
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        updateValues.push(id);

        const query = `UPDATE todos SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING * `;

        const result = await pool.query(query, updateValues);

        // Sends the updated todo
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({error: 'Failed to update todo'});
    }
})


// =================================
// ROUTE: DELETE /todos/:id
// Deletes a todo by ID
// =================================

app.delete('/todos/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const existCheck = await pool.query(
            'SELECT id FROM todos WHERE id = $1',
            [id]
        );

        if (existCheck.rows.length === 0) {
            return res.status(404).json( {error: 'Todo not found'} );
        }

        await pool.query('DELETE FROM todos WHERE id = $1', [id]);

        res.json( {message: 'Todo deleted successfully', id});
    } catch (error) {
        console.error('Error deleting todo', error);
        res.status(500).json( {error: 'Failed to delete todo'} );
    }
});


// =================================
// ROUTE: 404 Handler
// =================================
app.use((req,res) => {
    res.status(404).json( {error: 'Endpoint not found'} );
});


// =================================
// Run the server
// =================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/todo_db'}`);
});