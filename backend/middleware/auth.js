const jwt = require("jsonwebtoken");

// Pour chaque requête sur une route protégée on passe d'abord par ce middleware :
module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.DB_TOKEN);
		const userId = decodedToken.userId;
		if (req.body.userId && req.body.userId !== userId) {
			throw "User ID non valable !";
		} else {
			req.token = token;
			req.user = userId; // on ajoute l'id du user: cela servira à l'authentifiacation pour les routes delete et put
			next();
		}
	} catch (error) {
		res.status(401).json({ error: error | "Requête non authentifiée !" });
	}
};
