const psql = require("../db/db");
const isManager = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = await psql`
            SELECT role
            FROM users
            WHERE id = ${userId}
        `;

        if (role[0].role !== 'MANAGER') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Manager role required."
            });
        }

        const manager = await psql`
            SELECT m.id, m.parking_spot_id, m.approved
            FROM managers m
            WHERE m.user_id = ${userId} AND m.deleted = false
        `;

        if (manager.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Manager record not found"
            });
        }

        if (!manager[0].approved) {
            return res.status(403).json({
                success: false,
                message: "Manager account not yet approved"
            });
        }

        req.manager = manager[0];
        next();
    } catch (error) {
        console.error("Error in manager middleware:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = isManager;