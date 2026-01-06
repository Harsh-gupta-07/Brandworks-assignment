const psql = require("../db/db");

const isDriver = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = await psql`
            SELECT role
            FROM users
            WHERE id = ${userId}
        `;

        if (role[0].role !== 'DRIVER' && role[0].role !== 'SUPERADMIN' && role[0].role !== 'MANAGER') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Driver role required."
            });
        }

        const driver = await psql`
            SELECT d.id, d.parking_spot_id, d.approved
            FROM drivers d
            WHERE d.user_id = ${userId} AND d.deleted = false
        `;
        // console.log(driver);

        if (driver.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver record not found"
            });
        }

        if (!driver[0].approved) {
            return res.status(403).json({
                success: false,
                message: "Driver account not yet approved"
            });
        }

        req.driver = driver[0];
        next();
    } catch (error) {
        console.error("Error in driver middleware:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = isDriver;
