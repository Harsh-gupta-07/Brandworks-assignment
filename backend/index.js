const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const managerRoutes = require("./routes/manager");
const driverRoutes = require("./routes/driver");
const superadminRoutes = require("./routes/superadmin");

const app = express();
const version = "v1";
app.use(cors());
app.use(express.json());

app.use(`/api/${version}/auth`, authRoutes);
app.use(`/api/${version}/user`, userRoutes);
app.use(`/api/${version}/manager`, managerRoutes);
app.use(`/api/${version}/driver`, driverRoutes);
app.use(`/api/${version}/superadmin`, superadminRoutes);

app.get("/", (req, res) => {
    res.send("Live");
});

app.listen(process.env.PORT || 10000, () => {
    console.log(`Server started on port ${process.env.PORT || 10000}`);
});
