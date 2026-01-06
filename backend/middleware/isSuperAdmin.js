const psql = require("../db/db");

const isSuperAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = await psql`
            SELECT role
            FROM users
            WHERE id = ${userId}
        `;

        if (role.length === 0 || role[0].role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Super Admin role required."
            });
        }

        next();
    } catch (error) {
        console.error("Error in super admin middleware:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = isSuperAdmin;
