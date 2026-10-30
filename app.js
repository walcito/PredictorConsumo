import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { projectRoot } from "./utils/paths.js";
import predictionRoutes from "./routes/predictionRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(projectRoot, "views", "layouts")
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(projectRoot, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(projectRoot, "public")));

app.use(predictionRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "Página no encontrada" });
});

app.listen(PORT);
