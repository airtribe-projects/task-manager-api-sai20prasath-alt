// app.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// In-memory store
const tasks = [];

/* -------------------------
   Validation middleware
-------------------------- */
function validateTask(forUpdate = false) {
  return (req, res, next) => {
    const payload = req.body;
    const errors = [];

    if (!forUpdate || payload.title !== undefined) {
      if (typeof payload.title !== 'string' || payload.title.trim() === '') {
        errors.push({ field: 'title', message: 'Title is required and must be a non-empty string.' });
      }
    }

    if (payload.description !== undefined && typeof payload.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string.' });
    }

    if (payload.completed !== undefined && typeof payload.completed !== 'boolean') {
      errors.push({ field: 'completed', message: 'Completed must be a boolean.' });
    }

    if (payload.dueDate !== undefined && isNaN(Date.parse(payload.dueDate))) {
      errors.push({ field: 'dueDate', message: 'dueDate must be a valid ISO date string.' });
    }

    if (payload.priority !== undefined && !['low', 'medium', 'high'].includes(payload.priority)) {
      errors.push({ field: 'priority', message: 'Priority must be low, medium, or high.' });
    }

    if (errors.length) {
      return res.status(400).json({ errors });
    }

    next();
  };
}

/* -------------------------
   Find task middleware
-------------------------- */
function findTask(req, res, next) {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  req.task = task;
  next();
}

/* -------------------------
   Routes
-------------------------- */

// CREATE task
app.post('/tasks', validateTask(false), (req, res) => {
  const now = new Date().toISOString();
  const payload = req.body;

  const task = {
    id: uuidv4(),
    title: payload.title.trim(),
    description: payload.description?.trim() ?? '',
    completed: payload.completed ?? false,
    createdAt: now,
    updatedAt: now,
    dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
    priority: payload.priority ?? 'medium',
  };

  tasks.push(task);
  res.status(201).json(task);
});

// READ all tasks with filters, sorting, pagination
app.get('/tasks', (req, res) => {
  let result = [...tasks];

  // filtering
  if (req.query.completed !== undefined) {
    result = result.filter((t) => t.completed === (req.query.completed === 'true'));
  }

  if (req.query.priority) {
    result = result.filter((t) => t.priority === req.query.priority);
  }

  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    result = result.filter((t) =>
      (t.title + ' ' + (t.description || '')).toLowerCase().includes(s)
    );
  }

  // sorting
  if (req.query.sort) {
    const [field, dir] = req.query.sort.split(':');
    const direction = dir === 'desc' ? -1 : 1;

    result.sort((a, b) => {
      if (!a[field] && !b[field]) return 0;
      if (!a[field]) return -1 * direction;
      if (!b[field]) return 1 * direction;
      return (a[field] > b[field] ? 1 : -1) * direction;
    });
  }

  // pagination
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(req.query.perPage) || 10));

  const start = (page - 1) * perPage;
  const paged = result.slice(start, start + perPage);

  res.json({
    meta: { total: result.length, page, perPage },
    data: paged,
  });
});

// READ single task
app.get('/tasks/:id', findTask, (req, res) => {
  res.json(req.task);
});

// UPDATE full (PUT)
app.put('/tasks/:id', findTask, validateTask(false), (req, res) => {
  const payload = req.body;
  const t = req.task;

  t.title = payload.title.trim();
  t.description = payload.description?.trim() ?? '';
  t.completed = payload.completed ?? false;
  t.dueDate = payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined;
  t.priority = payload.priority ?? 'medium';
  t.updatedAt = new Date().toISOString();

  res.json(t);
});

// PARTIAL update (PATCH)
app.patch('/tasks/:id', findTask, validateTask(true), (req, res) => {
  const payload = req.body;
  const t = req.task;

  if (payload.title !== undefined) t.title = payload.title.trim();
  if (payload.description !== undefined) t.description = payload.description.trim();
  if (payload.completed !== undefined) t.completed = payload.completed;
  if (payload.dueDate !== undefined)
    t.dueDate = payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined;
  if (payload.priority !== undefined) t.priority = payload.priority;

  t.updatedAt = new Date().toISOString();

  res.json(t);
});

// DELETE task
app.delete('/tasks/:id', findTask, (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.task.id);
  tasks.splice(index, 1);

  res.status(204).send();
});

/* -------------------------
   Global error handler
-------------------------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

/* -------------------------
   Start server
-------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tasks API running on port ${PORT}`);
});
