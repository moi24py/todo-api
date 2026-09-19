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

