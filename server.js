import express from "express";

import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cloudinaryConfig from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import UserRouter from "./routes/userRoute.js";

//app config
const app = express();
const port = process.env.PORT || 4000;  

//database config
connectDB();
cloudinaryConfig();

//middleware
app.use(cors());
app.use(express.json());

//api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", UserRouter);

app.get("/", (req, res) => {
  res.send("API is running Great");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
