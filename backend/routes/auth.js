const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const psql = require("../db/db");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Email, password, name, and phone are required"
            });
        }

        const existingUser = await psql`
            SELECT id FROM users WHERE email = ${email} AND deleted = false
        `;

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await psql`
            INSERT INTO users (email, password, name, phone)
            VALUES (${email}, ${hashedPassword}, ${name}, ${phone || null})
            RETURNING id, email, name, phone, created_at
        `;

        const token = jwt.sign(
            {
                userId: newUser[0].id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                user: newUser[0],
                token
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const users = await psql`
            SELECT id, email, password, name, phone, role, created_at 
            FROM users 
            WHERE email = ${email} AND deleted = false
        `;

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
                token
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
