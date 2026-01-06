const express = require("express");
const psql = require("../db/db");
const { authenticateToken } = require("../middleware/auth");
const isDriver = require("../middleware/isDriver");
const router = express.Router();

router.get("/parking-cars", authenticateToken, isDriver, async (req, res) => {
    try {
        const parkingSpotId = req.driver.parking_spot_id;
        const driverId = req.driver.id;
        // console.log(driverId);
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
                AND (pc.status = 'PARKING' OR pc.status = 'RETRIEVE')
                AND pc.driver_id = ${driverId}
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
                AND pc.driver_id IS NULL
                AND pc.status != 'RETRIEVED'
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



router.put("/update-status/:parkedCarId", authenticateToken, isDriver, async (req, res) => {
    try {
        const { parkedCarId } = req.params;
        const { status } = req.body;
        const driverId = req.driver.id;

        const validStatuses = ['PARKING', 'PARKED', 'RETRIEVE', 'RETRIEVED'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: PARKING, PARKED, RETRIEVE, RETRIEVED"
            });
        }



        const updatedCar = await psql`
            UPDATE parked_cars
            SET 
                status = ${status.toUpperCase()},
                driver_id = ${driverId},
                retrieved_at = ${status.toUpperCase() === 'RETRIEVED' ? psql`NOW()` : psql`retrieved_at`},
                updated_at = NOW()
            WHERE id = ${parkedCarId}
                AND deleted = false
            RETURNING *
        `;

        if (updatedCar.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parked car not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Parked car status updated successfully",
            data: updatedCar[0]
        });
    } catch (error) {
        console.error("Error updating parked car status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.put("/assign/:parkedCarId", authenticateToken, isDriver, async (req, res) => {
    try {
        const { parkedCarId } = req.params;
        const driverId = req.driver.id;

        const car = await psql`
            SELECT * FROM parked_cars
            WHERE id = ${parkedCarId}
                AND deleted = false
        `;

        if (car.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Parked car not found"
            });
        }

        if (car[0].driver_id !== null) {
            return res.status(400).json({
                success: false,
                message: "This car is already assigned to a driver"
            });
        }

        const updatedCar = await psql`
            UPDATE parked_cars
            SET 
                driver_id = ${driverId},
                updated_at = NOW()
            WHERE id = ${parkedCarId}
                AND deleted = false
            RETURNING *
        `;

        res.status(200).json({
            success: true,
            message: "Assignment accepted successfully",
            data: updatedCar[0]
        });
    } catch (error) {
        console.error("Error assigning driver:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


module.exports = router;

