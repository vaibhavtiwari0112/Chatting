const User = require("../models/User");
const { sendInvitationSMS } = require("../config/smsService");

exports.checkContact = async (req, res) => {
  const { phone } = req.params;
  try {
    const user = await User.findOne({ phone });
    if (user) {
      console.log("Contact exists", user);
      return res.json({ exists: true, userId: user._id });
    } else {
      console.log("Contact does not exist", phone);
      return res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// exports.inviteContact = async (req, res) => {
//   const { phone } = req.body;
//   try {
//     await sendInvitationSMS(phone);
//     res.json({ message: "Invitation sent successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to send invitation" });
//   }
// };
