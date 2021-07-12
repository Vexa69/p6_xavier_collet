const Sauce = require("../models/Sauce");
const fs = require("fs"); //package filesystem de node. Pour avoir accès aux différentes opérations liées aux fichiers
const sanitize = require("mongo-sanitize");

exports.getAllSauces = (req, res, next) => {
	Sauce.find()
		.then(sauces => {
			res.status(200).json(sauces);
		})
		.catch(error => {
			res.status(400).json({
				error: error
			});
		});
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => res.status(200).json(sauce))
		.catch(error => res.status(404).json({ error }));
};

exports.createOneSauces = (req, res, next) => {
	const sauceParse = JSON.parse(req.body.sauce);
	const sauceObject = sanitize(sauceParse);
	delete req.body._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
	});
	sauce
		.save()
		.then(() => res.status(201).json({ message: "Objet enregistré !" }))
		.catch(error => res.status(400).json({ error }));
};

exports.modifyOneSauces = (req, res, next) => {
	let sauceObject = {};
	const body = sanitize(req.body);
	req.file
		? (Sauce.findOne({ _id: req.params.id })
				.then(sauce => {
					const filename = sauce.imageUrl.split("/images/")[1];
					fs.unlinkSync(`images/${filename}`);
				})
				.catch(error => res.status(500).json({ error })),
		  (sauceObject = {
				...JSON.parse(body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
		  }))
		: (sauceObject = { ...body });

	Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
		.then(() => {
			res.status(200).json({ message: "Objet modifié !" });
		})
		.catch(error => res.status(400).json({ error }));
};

exports.deleteOneSauces = (req, res, _) => {
	Sauce.findOne({ _id: req.params.id }).then(sauce => {
		if (sauce.userId !== req.user) {
			// on compare l'id de l'auteur de la sauce et l'id de l'auteur de la requête
			return res.status(401).json({ message: "action non autorisée" }); // si ce ne sont pas les mêmes id = code 401: unauthorized.
		}
		const filename = sauce.imageUrl.split("/images/")[1];
		fs.unlink(`images/${filename}`, () => {
			Sauce.deleteOne({ _id: req.params.id })
				.then(() => res.status(200).json({ message: "sauce supprimée." }))
				.catch(error => res.status(400).json({ error }));
		});
	});
};

exports.likeDislikeSauce = (req, res, next) => {
	const userId = req.body.userId;
	const like = req.body.like;

	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			switch (like) {
				case 1:
					Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
						.then(() => {
							res.status(200).json({ message: "Like !" });
						})
						.catch(error => res.status(400).json({ error }));
					break;
				case 0:
					if (sauce.usersLiked.includes(userId)) {
						Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
							.then(() => {
								res.status(200).json({ message: "Stop Like !" });
							})
							.catch(error => res.status(400).json({ error }));
					} else if (sauce.usersDisliked.includes(userId)) {
						Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
							.then(() => {
								res.status(200).json({ message: "Stop Dislike !" });
							})
							.catch(error => res.status(400).json({ error }));
					}
					break;
				case -1:
					Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1 }, $push: { usersDisliked: userId } })
						.then(() => {
							res.status(200).json({ message: "Dislike !" });
						})
						.catch(error => res.status(400).json({ error }));
					break;
				default:
					console.log("error");
			}
		})
		.catch(error => {
			res.status(404).json({ error });
		});
};
