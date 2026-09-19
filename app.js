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
// Retrieves the todo by ID. Eg: GET /todos/5 → id = '5'
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


