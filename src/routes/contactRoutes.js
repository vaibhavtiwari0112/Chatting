const express = require("express");
const {
  checkContact,
  inviteContact,
} = require("../controllers/contactController");
const router = express.Router();

router.get("/check/:phone", checkContact);
//router.post("/invite", inviteContact);

module.exports = router;
