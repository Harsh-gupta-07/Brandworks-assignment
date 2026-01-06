const express = require("express");
const psql = require("../db/db");
const { authenticateToken } = require("../middleware/auth");
const isDriver = require("../middleware/isDriver");
const router = express.Router();

router.get("/parking-cars", authenticateToken, isDriver, async (req, res) => {
    try {
        const parkingSpotId = req.driver.parking_spot_id;

        const parkedCars = await psql`
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
                AND (pc.status = 'PARKING' or pc.status="RETRIEVE")
            ORDER BY pc.parked_at DESC
        `;

        res.status(200).json({
            success: true,
            message: "Parking cars fetched successfully",
            data: parkedCars
        });
    } catch (error) {
        console.error("Error fetching parking cars:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


router.get("/unassigned-cars", authenticateToken, isDriver, async (req, res) => {
    try {
        const parkingSpotId = req.driver.parking_spot_id;

        const unassignedCars = await psql`
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
                AND pc.status = 'PARKING' or pc.status="RETRIEVE")
                AND pc.driver_id IS NULL
            ORDER BY pc.parked_at DESC
        `;

        res.status(200).json({
            success: true,
            message: "Unassigned parking cars fetched successfully",
            data: unassignedCars
        });
    } catch (error) {
        console.error("Error fetching unassigned cars:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


module.exports = router;
