import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Membuat EJS sabagai view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "uas-open-course",
    resave: false,
    saveUninitialized: false,
  })
);

//Routing
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
