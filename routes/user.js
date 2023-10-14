const express  = require("express");
const router = express.Router();

const { signup, signin, logout , forgotPassword , resetPassword, getUserDetails, updatePassword, updateUserDetails, admingetAllUser, managergetAllUser, adminGetUserDetails, adminUpdateAnUser, adminDeleteAnUser } = require("../controllers/userController");
const { isLoggedIn, isAdmin } = require("../middlewares/user");


router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn ,getUserDetails);
router.route("/updatePassword").post(isLoggedIn ,updatePassword);
router.route("/updateUserDetails").post(isLoggedIn ,updateUserDetails);
// routes for admin to get all users as we have passed admin in the isAdmin function
router.route("/admin/getallUsers").get(isLoggedIn, isAdmin("admin") ,admingetAllUser);

// routes for manager to get all users as we have passed admin in the isAdmin function
router.route("/manager/getallUsers").get(isLoggedIn, isAdmin("manager") ,managergetAllUser);


router.route("/admin/user/:id")
    .get(isLoggedIn, isAdmin("admin") ,adminGetUserDetails)
    .put(isLoggedIn, isAdmin("admin") ,adminUpdateAnUser)
    .delete(isLoggedIn, isAdmin("admin") ,adminDeleteAnUser)



module.exports = router