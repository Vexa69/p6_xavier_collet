const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const sauceRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

//Pour créer une application express

require("dotenv").config();
mongoose
	.connect("mongodb+srv://vexa69:V21e09x19a83@cluster0.nmpux.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

// Système de sécurité CORS : Cross Origin Resource Sharing
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
	next();
});

//Transformer le corps de la requête en objet javascript utilisable grâce à la méthode json() de bodyParser
app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;