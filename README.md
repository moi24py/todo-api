# TODO API

I made a basic backend TODO API, in a rush, to challenge myself and learn about databases, Docker and cloud.

For this project, I used:
- JavaScript
- Node.js + Express
- Docker
- PostgreSQL
- Render

It has been tough and the directory structure is messy, but I really enjoyed the process!
I have never used PostgreSQL, Docker and Render, and thanks to a little (lots of!) help from Stackoverflow, LLMs and documentations, I managed to integrate everything. I am definitely going to learn more and make bigger and better projects in the future!

## Project structure
``` bash
todo-api/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
├── package-lock.json
├── app.js
├── render.yaml
├── init.sql
└── docker-compose.yml
```

## Pipeline
``` bash
GitHub
   ↓
Render
   ↓
Docker
   ↓
Node.js / Express
   ↓
PostgreSQL
   ↓
GET /todos
   ↓
[]
```