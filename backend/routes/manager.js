const express = require("express");
const psql = require("../db/db");
const { authenticateToken } = require("../middleware/auth");
const isManager = require("../middleware/isManager");
const router = express.Router();


router.get("/daily-stats", authenticateToken, isManager, async (req, res) => {
    try {
        const parkingSpotId = req.manager.parking_spot_id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayEnd = tomorrow.toISOString();

        const activeCars = await psql`
            SELECT 
                pc.id,
                pc.status,
                pc.parked_pos,
                pc.parked_at,
                json_build_object(
                    'id', c.id,
                    'brand', c.brand,
                    'model', c.model,
                    'license_plate', c.license_plate
                ) AS car,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'phone', u.phone
                ) AS user
            FROM parked_cars pc
            INNER JOIN cars c ON pc.car_id = c.id
            INNER JOIN users u ON pc.user_id = u.id
            WHERE pc.parking_spot_id = ${parkingSpotId}
                AND pc.deleted = false
                AND pc.status != 'RETRIEVED'
                AND pc.parked_at >= ${todayStart}
                AND pc.parked_at < ${todayEnd}
            ORDER BY pc.parked_at DESC
        `;

        const totalCarsResult = await psql`
            SELECT COUNT(*) as total
            FROM parked_cars
            WHERE parking_spot_id = ${parkingSpotId}
                AND deleted = false
                AND parked_at >= ${todayStart}
                AND parked_at < ${todayEnd}
        `;

        const revenueResult = await psql`
            SELECT COALESCE(SUM(p.amount), 0) as total_revenue
            FROM payments p
            INNER JOIN parked_cars pc ON p.parked_car_id = pc.id
            WHERE pc.parking_spot_id = ${parkingSpotId}
                AND p.deleted = false
                AND p.status = 'COMPLETED'
                AND p.created_at >= ${todayStart}
                AND p.created_at < ${todayEnd}
        `;

        const parkingSpot = await psql`
            SELECT id, name, location, capacity
            FROM parking_spots
            WHERE id = ${parkingSpotId} AND deleted = false
        `;

        res.status(200).json({
            success: true,
            message: "Daily statistics fetched successfully",
            data: {
                parking_spot: parkingSpot[0],
                summary: {
                    active_cars_count: activeCars.length,
                    total_cars_today: parseInt(totalCarsResult[0].total),
                    revenue_today: parseFloat(revenueResult[0].total_revenue)
                },
                active_cars: activeCars,
            }
        });
    } catch (error) {
        console.error("Error fetching daily stats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/parked-cars", authenticateToken, isManager, async (req, res) => {
    try {
        const parkingSpotId = req.manager.parking_spot_id;
        const { page = 1, limit = 10, keyword = '', status = '' } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const pageLimit = parseInt(limit);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayEnd = tomorrow.toISOString();

        let parkedCars;
        let totalResult;

        if (keyword && status) {
            const searchPattern = `%${keyword}%`;
            parkedCars = await psql`
                SELECT 
                    pc.id,
                    pc.status,
                    pc.parked_pos,
                    pc.parked_at,
                    pc.retrieved_at,
                    json_build_object(
                        'id', c.id,
                        'brand', c.brand,
                        'model', c.model,
                        'license_plate', c.license_plate
                    ) AS car,
                    json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'phone', u.phone
                    ) AS user,
                    json_build_object(
                        'id', d.id,
                        'name', du.name,
                        'phone', du.phone
                    ) AS driver,
                    (
                        SELECT json_build_object(
                            'amount', p.amount,
                            'payment_type', p.payment_type,
                            'status', p.status
                        )
                        FROM payments p
                        WHERE p.parked_car_id = pc.id AND p.deleted = false
                        LIMIT 1
                    ) AS payment
                FROM parked_cars pc
                INNER JOIN cars c ON pc.car_id = c.id
                INNER JOIN users u ON pc.user_id = u.id
                LEFT JOIN drivers d ON pc.driver_id = d.id
                LEFT JOIN users du ON d.user_id = du.id
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                    AND pc.status = ${status}
                    AND (c.license_plate ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
                ORDER BY pc.parked_at DESC
                LIMIT ${pageLimit} OFFSET ${offset}
            `;

            totalResult = await psql`
                SELECT COUNT(*) as total
                FROM parked_cars pc
                INNER JOIN cars c ON pc.car_id = c.id
                INNER JOIN users u ON pc.user_id = u.id
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                    AND pc.status = ${status}
                    AND (c.license_plate ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
            `;
        } else if (keyword) {
            const searchPattern = `%${keyword}%`;
            parkedCars = await psql`
                SELECT 
                    pc.id,
                    pc.status,
                    pc.parked_pos,
                    pc.parked_at,
                    pc.retrieved_at,
                    json_build_object(
                        'id', c.id,
                        'brand', c.brand,
                        'model', c.model,
                        'license_plate', c.license_plate
                    ) AS car,
                    json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'phone', u.phone
                    ) AS user,
                    json_build_object(
                        'id', d.id,
                        'name', du.name,
                        'phone', du.phone
                    ) AS driver,
                    (
                        SELECT json_build_object(
                            'amount', p.amount,
                            'payment_type', p.payment_type,
                            'status', p.status
                        )
                        FROM payments p
                        WHERE p.parked_car_id = pc.id AND p.deleted = false
                        LIMIT 1
                    ) AS payment
                FROM parked_cars pc
                INNER JOIN cars c ON pc.car_id = c.id
                INNER JOIN users u ON pc.user_id = u.id
                LEFT JOIN drivers d ON pc.driver_id = d.id
                LEFT JOIN users du ON d.user_id = du.id
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                    AND (c.license_plate ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
                ORDER BY pc.parked_at DESC
                LIMIT ${pageLimit} OFFSET ${offset}
            `;

            totalResult = await psql`
                SELECT COUNT(*) as total
                FROM parked_cars pc
                INNER JOIN cars c ON pc.car_id = c.id
                INNER JOIN users u ON pc.user_id = u.id
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                    AND (c.license_plate ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
            `;
        } else if (status) {
            parkedCars = await psql`
                SELECT 
                    pc.id,
                    pc.status,
                    pc.parked_pos,
                    pc.parked_at,
                    pc.retrieved_at,
                    json_build_object(
                        'id', c.id,
                        'brand', c.brand,
                        'model', c.model,
                        'license_plate', c.license_plate
                    ) AS car,
                    json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'phone', u.phone
                    ) AS user,
                    json_build_object(
                        'id', d.id,
                        'name', du.name,
                        'phone', du.phone
                    ) AS driver,
                    (
                        SELECT json_build_object(
                            'amount', p.amount,
                            'payment_type', p.payment_type,
                            'status', p.status
                        )
                        FROM payments p
                        WHERE p.parked_car_id = pc.id AND p.deleted = false
                        LIMIT 1
                    ) AS payment
                FROM parked_cars pc
                INNER JOIN cars c ON pc.car_id = c.id
                INNER JOIN users u ON pc.user_id = u.id
                LEFT JOIN drivers d ON pc.driver_id = d.id
                LEFT JOIN users du ON d.user_id = du.id
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                    AND pc.status = ${status}
                ORDER BY pc.parked_at DESC
                LIMIT ${pageLimit} OFFSET ${offset}
            `;

            totalResult = await psql`
                SELECT COUNT(*) as total
                FROM parked_cars pc
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                    AND pc.status = ${status}
            `;
        } else {
            parkedCars = await psql`
                SELECT 
                    pc.id,
                    pc.status,
                    pc.parked_pos,
                    pc.parked_at,
                    pc.retrieved_at,
                    json_build_object(
                        'id', c.id,
                        'brand', c.brand,
                        'model', c.model,
                        'license_plate', c.license_plate
                    ) AS car,
                    json_build_object(
                        'id', u.id,
                        'name', u.name,
                        'phone', u.phone
                    ) AS user,
                    json_build_object(
                        'id', d.id,
                        'name', du.name,
                        'phone', du.phone
                    ) AS driver,
                    (
                        SELECT json_build_object(
                            'amount', p.amount,
                            'payment_type', p.payment_type,
                            'status', p.status
                        )
                        FROM payments p
                        WHERE p.parked_car_id = pc.id AND p.deleted = false
                        LIMIT 1
                    ) AS payment
                FROM parked_cars pc
                INNER JOIN cars c ON pc.car_id = c.id
                INNER JOIN users u ON pc.user_id = u.id
                LEFT JOIN drivers d ON pc.driver_id = d.id
                LEFT JOIN users du ON d.user_id = du.id
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
                ORDER BY pc.parked_at DESC
                LIMIT ${pageLimit} OFFSET ${offset}
            `;

            totalResult = await psql`
                SELECT COUNT(*) as total
                FROM parked_cars pc
                WHERE pc.parking_spot_id = ${parkingSpotId}
                    AND pc.deleted = false
                    AND pc.parked_at >= ${todayStart}
                    AND pc.parked_at < ${todayEnd}
            `;
        }

        const total = parseInt(totalResult[0].total);
        const totalPages = Math.ceil(total / pageLimit);

        res.status(200).json({
            success: true,
            message: "Parked cars fetched successfully",
            data: {
                cars: parkedCars,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: pageLimit
                }
            }
        });
    } catch (error) {
        console.error("Error fetching parked cars:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/drivers", authenticateToken, isManager, async (req, res) => {
    try {
        const parkingSpotId = req.manager.parking_spot_id;

        const drivers = await psql`
            SELECT 
                d.id,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'phone', u.phone
                ) AS user
            FROM drivers d
            INNER JOIN users u ON d.user_id = u.id
            WHERE d.parking_spot_id = ${parkingSpotId}
                AND d.deleted = false
                AND d.approved = true
            ORDER BY u.name ASC
        `;

        res.status(200).json({
            success: true,
            message: "Drivers fetched successfully",
            data: drivers
        });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
