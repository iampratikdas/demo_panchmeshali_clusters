//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require("yup");

class UserForgotPasswordMiddleware {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //LinkSchema
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static linkSchema = yup.object({
        body: yup.object({
            email: yup
                .string()
                .email("Invalid email format")
                .required("Email ID is required"),
            otp: yup.string().required("Otp is required"),
        }),
    });
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //Validate
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static validate(schema) {
        return async (req, res, next) => {
            try {
                const validatedData = await schema.validate({ body: req.body }, { stripUnknown: true });
                req.body = validatedData.body;
                return next();
            } catch (err) {
                return res.status(400).json({
                    status: 400,
                    type: err.name,
                    message: err.message,
                    data: {},
                });
            }
        };
    }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export....
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports = UserForgotPasswordMiddleware;