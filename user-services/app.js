const express = require('express');
const cors = require('cors');
const app = express();

// Port untuk User Service
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Penting untuk memparsing body JSON pada request POST

// Dummy data pengguna
let users = [
    { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
    { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
    { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
];

// Helper untuk mendapatkan ID berikutnya
let nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

// --------------------------------------------------------------------
// 1. Endpoint: List All Users (GET /users)
// --------------------------------------------------------------------
app.get('/users', (req, res) => {
    res.json(users);
});

// --------------------------------------------------------------------
// 2. Endpoint: Detail User by ID (GET /users/:id)
// --------------------------------------------------------------------
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --------------------------------------------------------------------
// 3. Endpoint: Add New User (POST /users)
// --------------------------------------------------------------------
app.post('/users', (req, res) => {
    const { name, email, role } = req.body;

    // Validasi minimal
    if (!name || !email || !role) {
        return res.status(400).json({ 
            error: 'Missing fields. Required fields: name, email, role' 
        });
    }

    const newUser = {
        id: nextId++,
        name,
        email,
        role
    };

    users.push(newUser);
    
    // Mengembalikan user yang baru dibuat dengan status 201 Created
    res.status(201).json(newUser);
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});