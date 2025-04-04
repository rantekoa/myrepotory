const express = require("express"); 
const router = express.Router();
const bodyParser = require("body-parser");
router.use(express.json());
router.use(bodyParser.json());

const chatscontroller = require("../controllers/chats");

router.post("/insertChats", chatscontroller.insertChat);
router.get("/getChats", chatscontroller.getAllChats);
router.get("/stats", chatscontroller.getChatStats);
router.get("/usercount", chatscontroller.getDistinctUserCount);

router.get("/filterByDate", chatscontroller.getChatsByDate);
router.get("/filterByTime", chatscontroller.getChatsByTime);

router.get("/getInteractionTrends", chatscontroller.getInteractionTrends);


router.put("/resolvechat", chatscontroller.resolveChat);


module.exports = router;
