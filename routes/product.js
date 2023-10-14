const express  = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/user");
const { getAllProduct, addProduct ,admingetAllProduct , getProductDetails, updateProduct , deleteProduct} = require("../controllers/productController");




router.route("/getallproducts").get(isLoggedIn,getAllProduct);
router.route("/product/:id").get(isLoggedIn,getProductDetails);


// admin only
router.route("/product/add").post(isLoggedIn,isAdmin("admin"), addProduct);
router.route("/admin/products").get(isLoggedIn,isAdmin("admin"), admingetAllProduct);
router.route("/admin/products/:id").post(isLoggedIn,isAdmin("admin"), updateProduct);
router.route("/admin/products/:id").delete(isLoggedIn,isAdmin("admin"), deleteProduct);







module.exports = router
