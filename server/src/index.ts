import express from "express";
import cors from "cors";
import path from "path";
import editJobRoutes from "./routes/editJobRouter";
import videoRoutes from "./routes/videoRouter";

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/jobs", editJobRoutes);
app.use("/api", videoRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
