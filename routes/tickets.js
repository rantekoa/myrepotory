const express = require("express"); 
const router = express.Router();
const bodyParser = require("body-parser");
router.use(express.json());
router.use(bodyParser.json());
const ticketsController = require("../controllers/tickets");

router.post("/createticket", ticketsController.insertTicket);

module.exports = router;