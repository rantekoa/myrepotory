const express = require("express"); 
const router = express.Router();
const bodyParser = require("body-parser");
router.use(express.json());
router.use(bodyParser.json());

const usersController = require("../controllers/users");


router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);

module.exports = router;