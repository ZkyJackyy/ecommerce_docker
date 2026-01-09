const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Import module pg
const app = express();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Koneksi Database
// Konfigurasi Koneksi Database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Fungsi Init DB
const initDb = async () => {
    let retries = 20;
    while (retries) {
        try {
            // PERUBAHAN: Menambahkan kolom 'password'
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL, 
                    role VARCHAR(50) NOT NULL
                );
            `);
            console.log("✅ Database initialized (Users table ready)");
            return;
        } catch (err) {
            console.error(`⏳ Database not ready yet, retrying... (${retries} left)`);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error("❌ Could not connect to database after multiple retries");
};

// Jalankan init DB saat server start
initDb();

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                error: 'Mohon lengkapi name, email, password, dan role' 
            });
        }

        // Cek apakah email sudah ada (opsional, tapi pg akan error jika duplikat)
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        // Simpan data (Password disimpan sebagai Plain Text sesuai permintaan)
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, password, role]
        );

        res.status(201).json({
            message: "Registrasi berhasil",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error saat register" });
    }
});

// 2. Endpoint: LOGIN (POST /login)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password harus diisi' });
        }

        // 1. Cari user berdasarkan email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        const user = result.rows[0];

        // 2. Cek Password (Perbandingan String Biasa / Plain Text)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        // 3. Login Berhasil
        // Di aplikasi nyata, biasanya kita return JWT Token di sini
        res.json({
            message: "Login berhasil",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error saat login" });
    }
});
// --------------------------------------------------------------------
// 1. Endpoint: List All Users (GET /users)
// --------------------------------------------------------------------
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// --------------------------------------------------------------------
// 2. Endpoint: Detail User by ID (GET /users/:id)
// --------------------------------------------------------------------
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// --------------------------------------------------------------------
// 3. Endpoint: Add New User (POST /users)
// --------------------------------------------------------------------
app.post('/users', async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // Validasi minimal
        if (!name || !email || !role) {
            return res.status(400).json({ 
                error: 'Missing fields. Required fields: name, email, role' 
            });
        }

        const newUser = await pool.query(
            'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
            [name, email, role]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});