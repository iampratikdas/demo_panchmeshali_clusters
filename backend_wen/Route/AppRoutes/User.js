
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const passport = require('passport');



//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Controller
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const UserLoginMiddleware = require("../../middlewares/UserLoginMiddleware.js");
const VerifyOtpMiddleware = require("../../middlewares/VerifyOtpMiddleware.js");
const RequestOtpMiddleware = require("../../middlewares/RequestOtpMiddleware.js");
const UserRegistrationMiddleware = require("../../middlewares/UserRegistrationMiddleware.js");
const UserResetPasswordMiddleware = require("../../middlewares/UserResetPasswordMiddleware.js");
const UserForgotPasswordMiddleware = require("../../middlewares/UserForgotPasswordMiddleware.js");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Method
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const { MethodValidate } = require("../../utils/Method_Check.js");
const { findOneUserByEmail, findOneUserById, UserInsert, UserUpdate } = require("../../resuable_functions/mongodb/UserFunctions.js");

const initializes = require("../../resuable_functions/Initializer.js")
class User {
    async Routes(router, userController, userFunc, paginationFunc) {
        router.get('/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/', session: false }),
            (req, res) => userController.signupbygoogle(req, res)
        );
        router.get('/auth/google/callback/mobile',
            passport.authenticate('google-admin', { failureRedirect: '/', session: false }),
            (req, res) => userController.signupbygoogle(req, res)
        );


        router.get('/logout', (req, res) => {
            req.logout(() => {
                res.redirect('/hello');
            });
        })


        router.post("/signup", (req, res, next) => MethodValidate(req, res, next, "POST"), (req, res) => userController.signup(req, res));
        router.post("/createuser", (req, res, next) => MethodValidate(req, res, next, "POST"), (req, res) => userController.createuser(req, res));
        router.post("/updateprofile", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && userController.updateprofile(req, res, token_data)));
        // router.post("/createuser", (req, res, next) => MethodValidate(req, res, next, "POST"), UserRegistrationMiddleware.validate(UserRegistrationMiddleware.linkSchema), (req, res) => userController.createuser(req, res));
        router.get("/getuserprofile", (req, res, next) => MethodValidate(req, res, next, "GET"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && userController.getprofile(req, res, token_data)));

        router.post(
            "/login",
            (req, res, next) => MethodValidate(req, res, next, "POST"),
            // UserLoginMiddleware.validate(UserLoginMiddleware.linkSchema),
            async (req, res) => await userController.login(req, res)
        );


        router.use("/user_list", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager"]).then((token_data) => token_data && userController.userslist(req, res, token_data)).catch((data) => {

            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));

        router.use("/resetpassword", (req, res, next) => MethodValidate(req, res, next, "POST"), UserResetPasswordMiddleware.validate(UserResetPasswordMiddleware.linkSchema), (req, res) => userController.resetpassword(req, res));
        router.use("/verifyotp", (req, res, next) => MethodValidate(req, res, next, "POST"), VerifyOtpMiddleware.validate(VerifyOtpMiddleware.linkSchema), (req, res) => userController.verifyotp(req, res));
        router.use("/requestforgotpasswordotp", (req, res, next) => MethodValidate(req, res, next, "POST"), RequestOtpMiddleware.validate(RequestOtpMiddleware.linkSchema), (req, res) => userController.requestforgotpasswordotp(req, res));
        router.use("/forgotpassword", (req, res, next) => MethodValidate(req, res, next, "POST"), UserForgotPasswordMiddleware.validate(UserForgotPasswordMiddleware.linkSchema), (req, res) => userController.forgotpassword(req, res));
        router.use("/deleteaccount", (req, res, next) => MethodValidate(req, res, next, "delete"), (req, res) => userController.deleteAccount(req, res));
        router.use("/upload-image", (req, res, next) => MethodValidate(req, res, next, "POST"), multer().single("image"), (req, res) => userController.uploadImage(req, res));

        //+++++++++++++++++++++++++++++NewApis+++++++++++++++++++++++++++++++++++++++++
        // New Global Api for  Search list
        router.use("/search_list/:search_type", (req, res, next) => MethodValidate(req, res, next, "post"), async (req, res) => await initializes(req, res, userFunc).then((token_data) => token_data && userController.searchList(req, res, token_data, paginationFunc)).catch((data) => {

            return res.status(404).json({ status: 404, message: data.message, data: {} });
        }));

        //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //Admin route
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        router.post("/updateprofile_by_admin", (req, res, next) => MethodValidate(req, res, next, "POST"), async (req, res) => await initializes(req, res, userFunc, ["admin", "manager"]).then((token_data) => token_data && userController.updateprofileAdmin(req, res, token_data)));

    }
}
module.exports = User;