const express = require("express");
const psql = require("../db/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await psql`
            SELECT id, email, name, phone, created_at
            FROM users
            WHERE id = ${userId} AND deleted = false
        `;

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user[0]
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/recent-parked-cars", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const countResult = await psql`
            SELECT COUNT(*) as total
            FROM parked_cars pc
            WHERE pc.user_id = ${userId} AND pc.deleted = false
        `;
        const totalCount = parseInt(countResult[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        const recentParkedCars = await psql`
            SELECT 
                pc.id,
                pc.status,
                pc.parked_at,
                pc.retrieved_at,
                pc.created_at,
                json_build_object(
                    'id', c.id,
                    'brand', c.brand,
                    'model', c.model,
                    'license_plate', c.license_plate
                ) AS car,
                json_build_object(
                    'id', ps.id,
                    'name', ps.name,
                    'location', ps.location,
                    'capacity', ps.capacity
                ) AS parking_spot,
                json_build_object(
                    'id', p.id,
                    'amount', p.amount,
                    'payment_type', p.payment_type,
                    'status', p.status,
                    'created_at', p.created_at
                ) AS payment
            FROM parked_cars pc
            INNER JOIN cars c ON pc.car_id = c.id
            INNER JOIN parking_spots ps ON pc.parking_spot_id = ps.id
            LEFT JOIN payments p ON p.parked_car_id = pc.id
            WHERE pc.user_id = ${userId} 
                AND pc.deleted = false
            ORDER BY pc.created_at DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        res.status(200).json({
            success: true,
            message: "Recent parked cars fetched successfully",
            data: recentParkedCars,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching paginated parked cars:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/add-car", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { brand, model, license_plate } = req.body;

        if (!brand || !model || !license_plate) {
            return res.status(400).json({
                success: false,
                message: "brand, model, and license_plate are required"
            });
        }


        const newCar = await psql`
            INSERT INTO cars (brand, model, license_plate, user_id)
            VALUES (${brand}, ${model}, ${license_plate}, ${userId})
            RETURNING id, brand, model, license_plate, created_at
        `;

        res.status(201).json({
            success: true,
            message: "Car added successfully",
            data: newCar[0]
        });
    } catch (error) {
        console.error("Error adding car:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/park-car", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { car_id, parking_spot_id, amount, payment_type, payment_status } = req.body;

        if (!car_id || !parking_spot_id || !amount || !payment_type || !payment_status) {
            return res.status(400).json({
                success: false,
                message: "car_id, parking_spot_id, amount, payment_type, and payment_status are required"
            });
        }

        const validPaymentTypes = ['CASH', 'NET_BANKING', 'UPI', 'CARD'];
        if (!validPaymentTypes.includes(payment_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment_type. Must be one of: CASH, NET_BANKING, UPI, CARD"
            });
        }

        const car = await psql`
            SELECT id FROM cars 
            WHERE id = ${car_id} AND user_id = ${userId} AND deleted = false
        `;

        if (car.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Car not found or does not belong to the user"
            });
        }

        const parkingSpot = await psql`
            SELECT id FROM parking_spots 
            WHERE id = ${parking_spot_id} AND deleted = false
        `;

        if (parkingSpot.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parking spot not found"
            });
        }

        const result = await psql.begin(async (sql) => {
            const level = Math.floor(Math.random() * 2) + 1;
            const section = String.fromCharCode(65 + Math.floor(Math.random() * 6));
            const spotNumber = String(Math.floor(Math.random() * 10) + 1).padStart(2, '0');
            const parked_pos = `Level ${level} - ${section}${spotNumber}`;

            const parkedCar = await sql`
                INSERT INTO parked_cars (car_id, user_id, parking_spot_id, status, parked_pos)
                VALUES (${car_id}, ${userId}, ${parking_spot_id}, 'PARKING', ${parked_pos})
                RETURNING id, car_id, parking_spot_id, status, parked_pos, parked_at, created_at
            `;

            const payment = await sql`
                INSERT INTO payments (user_id, parked_car_id, amount, payment_type, status)
                VALUES (${userId}, ${parkedCar[0].id}, ${amount}, ${payment_type}, ${payment_status})
                RETURNING id, amount, payment_type, status, created_at
            `;

            return { parkedCar: parkedCar[0], payment: payment[0] };
        });

        res.status(201).json({
            success: true,
            message: "Car parked and payment initiated successfully",
            data: {
                parked_car: result.parkedCar,
                payment: result.payment
            }
        });
    } catch (error) {
        console.error("Error parking car:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.put("/update-profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email, name, phone } = req.body;

        if (!email || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: "email, name, and phone are required"
            });
        }

        const updatedUser = await psql`
            UPDATE users
            SET email = ${email}, name = ${name}, phone = ${phone}
            WHERE id = ${userId} AND deleted = false
            RETURNING id, email, name, phone, updated_at
        `;

        if (updatedUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser[0]
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.put("/update-car/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const carId = req.params.id;
        const { brand, model, license_plate } = req.body;

        if (!brand || !model || !license_plate) {
            return res.status(400).json({
                success: false,
                message: "brand, model, and license_plate are required"
            });
        }

        const updatedCar = await psql`
            UPDATE cars
            SET brand = ${brand}, model = ${model}, license_plate = ${license_plate}
            WHERE id = ${carId} AND user_id = ${userId} AND deleted = false
            RETURNING id, brand, model, license_plate, updated_at
        `;

        if (updatedCar.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Car not found or does not belong to the user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Car updated successfully",
            data: updatedCar[0]
        });
    } catch (error) {
        console.error("Error updating car:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.delete("/delete-car/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const carId = req.params.id;

        const deletedCar = await psql`
            UPDATE cars
            SET deleted = true
            WHERE id = ${carId} AND user_id = ${userId} AND deleted = false
            RETURNING id
        `;

        if (deletedCar.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Car not found or does not belong to the user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Car deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/cars", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const cars = await psql`
            SELECT id, brand, model, license_plate, created_at
            FROM cars
            WHERE user_id = ${userId} AND deleted = false
            ORDER BY created_at DESC
        `;

        res.status(200).json({
            success: true,
            message: "Cars fetched successfully",
            data: cars
        });
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/payments", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const payments = await psql`
            SELECT 
                p.id,
                p.amount,
                p.payment_type,
                p.status,
                p.created_at,
                ps.location AS parking_location,
                c.brand AS car_brand,
                c.model AS car_model,
                c.license_plate AS car_license_plate,
                ps.name AS parking_spot_name
            FROM payments p
            INNER JOIN parked_cars pc ON p.parked_car_id = pc.id
            INNER JOIN cars c ON pc.car_id = c.id
            INNER JOIN parking_spots ps ON pc.parking_spot_id = ps.id
            WHERE p.user_id = ${userId} AND p.deleted = false
            ORDER BY p.created_at DESC
        `;

        res.status(200).json({
            success: true,
            message: "Payments fetched successfully",
            data: payments
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/active-parked-car", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const activeParkedCar = await psql`
            SELECT 
                pc.id,
                pc.status,
                pc.parked_at,
                pc.parked_pos,
                pc.created_at,
                json_build_object(
                    'id', c.id,
                    'brand', c.brand,
                    'model', c.model,
                    'license_plate', c.license_plate
                ) AS car,
                json_build_object(
                    'id', ps.id,
                    'name', ps.name,
                    'location', ps.location,
                    'capacity', ps.capacity
                ) AS parking_spot,
                json_build_object(
                    'id', p.id,
                    'amount', p.amount,
                    'payment_type', p.payment_type,
                    'status', p.status,
                    'created_at', p.created_at
                ) AS payment
            FROM parked_cars pc
            INNER JOIN cars c ON pc.car_id = c.id
            INNER JOIN parking_spots ps ON pc.parking_spot_id = ps.id
            LEFT JOIN payments p ON p.parked_car_id = pc.id
            WHERE pc.user_id = ${userId} 
                AND pc.deleted = false
                AND pc.status != 'RETRIEVED'
            ORDER BY pc.created_at ASC
            LIMIT 1
        `;

        if (activeParkedCar.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active parked car found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Active parked car fetched successfully",
            data: activeParkedCar[0]
        });
    } catch (error) {
        console.error("Error fetching active parked car:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.put("/retrieve-car/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const parkedCarId = req.params.id;

        const updatedParkedCar = await psql`
            UPDATE parked_cars
            SET status = 'RETRIEVE'
            WHERE id = ${parkedCarId} AND user_id = ${userId} AND deleted = false
            RETURNING id, status, updated_at
        `;

        if (updatedParkedCar.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parked car not found or does not belong to the user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Car retrieval requested successfully",
            data: updatedParkedCar[0]
        });
    } catch (error) {
        console.error("Error requesting car retrieval:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
