const express = require("express");
const psql = require("../db/db");
const { authenticateToken } = require("../middleware/auth");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const router = express.Router();

// Get all parking spots for the dropdown
router.get("/parking-spots", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const parkingSpots = await psql`
            SELECT id, name, location, capacity
            FROM parking_spots
            WHERE deleted = false
            ORDER BY name ASC
        `;

        res.status(200).json({
            success: true,
            message: "Parking spots fetched successfully",
            data: parkingSpots
        });
    } catch (error) {
        console.error("Error fetching parking spots:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get overview statistics (today's performance + overall statistics)
router.get("/overview/:parkingSpotId", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { parkingSpotId } = req.params;

        const parkingSpot = await psql`
            SELECT id, name, location, capacity
            FROM parking_spots
            WHERE id = ${parkingSpotId} AND deleted = false
        `;

        if (parkingSpot.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parking spot not found"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayEnd = tomorrow.toISOString();

        const todayTicketsResult = await psql`
            SELECT COUNT(*) as total
            FROM parked_cars
            WHERE parking_spot_id = ${parkingSpotId}
                AND deleted = false
                AND parked_at >= ${todayStart}
                AND parked_at < ${todayEnd}
        `;

        const todayCollectionResult = await psql`
            SELECT COALESCE(SUM(p.amount), 0) as total
            FROM payments p
            INNER JOIN parked_cars pc ON p.parked_car_id = pc.id
            WHERE pc.parking_spot_id = ${parkingSpotId}
                AND p.deleted = false
                AND p.status = 'COMPLETED'
                AND p.created_at >= ${todayStart}
                AND p.created_at < ${todayEnd}
        `;

        const totalTicketsResult = await psql`
            SELECT COUNT(*) as total
            FROM parked_cars
            WHERE parking_spot_id = ${parkingSpotId}
                AND deleted = false
        `;

        const totalCollectionResult = await psql`
            SELECT COALESCE(SUM(p.amount), 0) as total
            FROM payments p
            INNER JOIN parked_cars pc ON p.parked_car_id = pc.id
            WHERE pc.parking_spot_id = ${parkingSpotId}
                AND p.deleted = false
                AND p.status = 'COMPLETED'
        `;

        const activeParkingResult = await psql`
            SELECT COUNT(*) as total
            FROM parked_cars
            WHERE parking_spot_id = ${parkingSpotId}
                AND deleted = false
                AND status IN ('PARKING', 'PARKED')
        `;

        res.status(200).json({
            success: true,
            message: "Overview statistics fetched successfully",
            data: {
                parking_spot: parkingSpot[0],
                todays_performance: {
                    tickets_issued: parseInt(todayTicketsResult[0].total),
                    collection: parseFloat(todayCollectionResult[0].total)
                },
                overall_statistics: {
                    total_tickets: parseInt(totalTicketsResult[0].total),
                    total_collection: parseFloat(totalCollectionResult[0].total),
                    active_parking: parseInt(activeParkingResult[0].total)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching overview statistics:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/pending-approvals", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const pendingManagers = await psql`
            SELECT 
                m.id,
                m.created_at,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'phone', u.phone
                ) AS user,
                json_build_object(
                    'id', ps.id,
                    'name', ps.name,
                    'location', ps.location
                ) AS parking_spot
            FROM managers m
            INNER JOIN users u ON m.user_id = u.id
            INNER JOIN parking_spots ps ON m.parking_spot_id = ps.id
            WHERE m.approved = false AND m.deleted = false
            ORDER BY m.created_at ASC
        `;

        res.status(200).json({
            success: true,
            message: "Pending managers fetched successfully",
            data: pendingManagers
        });
    } catch (error) {
        console.error("Error fetching pending managers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/pending-drivers", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const pendingDrivers = await psql`
            SELECT 
                d.id,
                d.created_at,
                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'phone', u.phone
                ) AS user,
                json_build_object(
                    'id', ps.id,
                    'name', ps.name,
                    'location', ps.location
                ) AS parking_spot
            FROM drivers d
            INNER JOIN users u ON d.user_id = u.id
            INNER JOIN parking_spots ps ON d.parking_spot_id = ps.id
            WHERE d.approved = false AND d.deleted = false
            ORDER BY d.created_at ASC
        `;

        res.status(200).json({
            success: true,
            message: "Pending drivers fetched successfully",
            data: pendingDrivers
        });
    } catch (error) {
        console.error("Error fetching pending drivers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/approve-manager/:managerId", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { managerId } = req.params;

        const manager = await psql`
            UPDATE managers
            SET approved = true
            WHERE id = ${managerId} AND deleted = false
            RETURNING id
        `;

        if (manager.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Manager not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Manager approved successfully"
        });
    } catch (error) {
        console.error("Error approving manager:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/reject-manager/:managerId", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { managerId } = req.params;

        const manager = await psql`
            UPDATE managers
            SET deleted = true
            WHERE id = ${managerId} AND deleted = false
            RETURNING id
        `;

        if (manager.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Manager not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Manager rejected successfully"
        });
    } catch (error) {
        console.error("Error rejecting manager:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/approve-driver/:driverId", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await psql`
            UPDATE drivers
            SET approved = true
            WHERE id = ${driverId} AND deleted = false
            RETURNING id
        `;

        if (driver.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Driver approved successfully"
        });
    } catch (error) {
        console.error("Error approving driver:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.post("/reject-driver/:driverId", authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await psql`
            UPDATE drivers
            SET deleted = true
            WHERE id = ${driverId} AND deleted = false
            RETURNING id
        `;

        if (driver.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Driver rejected successfully"
        });
    } catch (error) {
        console.error("Error rejecting driver:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
