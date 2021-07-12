const jwt = require("jsonwebtoken");
const Sauce = require("../models/Sauce");

// Pour chaque requête sur une route protégée on passe d'abord par ce middleware :
module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.DB_TOKEN);
		const userId = decodedToken.userId;

		Sauce.findOne({ _id: req.params.id })
			.then(sauce => {
				if (userId === sauce.userId) {
					next();
				} else {
					throw "User ID non propriétaire !";
				}
				res.status(200).json(sauce);
			})

			.catch(error => res.status(404).json({ error }));
	} catch (error) {
		res.status(403).json({ error: error | "Requête non approuvé !" });
	}
};
