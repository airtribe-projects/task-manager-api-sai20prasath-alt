📌 Task Manager API (Express + Node.js)

A simple RESTful API for managing tasks, built using Node.js, Express.js, and in-memory storage.
All code is contained in a single file: app.js — perfect for beginners learning CRUD APIs.

🚀 Features

Create, read, update, delete tasks (CRUD)

In-memory data storage

Input validation (title, description, dueDate, priority)

Filtering (completed, priority, search)

Sorting (sort=createdAt:asc or sort=dueDate:desc)

Pagination (page, perPage)

UUID for task IDs

Centralized error handling

Clean, beginner-friendly structure

📁 Project Structure
app.js
package.json
README.md


Everything happens inside app.js.

🛠️ Installation & Setup
1️⃣ Clone or download the project
git clone <your-repo-url>
cd tasks-api


Or simply create the folder and add app.js.

2️⃣ Install Dependencies
npm init -y
npm install express uuid

3️⃣ Run the Server
node app.js


The API will start at:

http://localhost:3000

📘 Task Object Structure

Each task has the following structure:

{
  "id": "uuid",
  "title": "Task title",
  "description": "Optional text",
  "completed": false,
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "dueDate": "Optional ISO date",
  "priority": "low | medium | high"
}

📚 API Endpoints
➕ Create Task
POST /tasks
Body:
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "dueDate": "2025-12-01T10:00:00.000Z"
}

Response: 201 Created
📄 Get All Tasks
GET /tasks
Query Parameters:
Param	Type	Description
completed	boolean	true or false
priority	string	low, medium, high
search	string	Keyword search in title/description
sort	string	e.g. createdAt:asc, dueDate:desc
page	number	Page number
perPage	number	Items per page

Example:

GET /tasks?completed=false&priority=high&search=buy&sort=createdAt:desc&page=1&perPage=5

📄 Get Single Task
GET /tasks/:id

Returns a single task by ID.

✏️ Update Task (Full)
PUT /tasks/:id
Body:
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "medium"
}

🔧 Update Task (Partial)
PATCH /tasks/:id

Send only the fields you want to update.

Example:

{
  "completed": true
}

🗑️ Delete Task
DELETE /tasks/:id

Returns: 204 No Content

⚠️ Validation Rules
Field	Rules
title	Required, non-empty string
description	Optional string
completed	Boolean
priority	low, medium, high
dueDate	Must be valid ISO date
🧪 Example cURL Commands

Create a task:

curl -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d '{"title":"Buy food","priority":"high"}'


Get all tasks:

curl http://localhost:3000/tasks


Update a task:

curl -X PATCH http://localhost:3000/tasks/<ID> \
-H "Content-Type: application/json" \
-d '{"completed":true}'


Delete a task:

curl -X DELETE http://localhost:3000/tasks/<ID>

📌 Notes

Data is stored in-memory, so tasks reset when the server restarts.

Ideal for beginners and learning REST API fundamentals.

🎯 Future Enhancements (Optional)

You can extend this project with:

MongoDB / PostgreSQL storage

User authentication (JWT)

Swagger documentation

File-based or JSON-based storage

TypeScript version
