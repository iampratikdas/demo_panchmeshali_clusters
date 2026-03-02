//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require("yup");

class UserRegistrationMiddleware {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //LinkSchema
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static linkSchema = yup.object({
        body: yup.object({
            email: yup.string().email("Invalid email format").required("Email ID is required"),
            password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
            email_care_giver: yup.string().email("Invalid caregiver email format. Please enter a valid email address"),
            profile_image: yup.string(),
            name: yup.string(),
            em_country_code: yup.string().nullable(),
            ph_country_code: yup.string().nullable(),
            dob: yup.string().nullable(),
            phone_number: yup
                .string()
                .nullable()
                .notRequired(),
            emergency_phone_number: yup
                .string()
                // .matches(/^\d{10}$/, "Caregiver phone number must be 10 digits")
                .nullable()
                .notRequired(),
            user_type: yup.string().oneOf(["User", "CareGiver", "Admin"]),
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
                console.log("user=====================>", err.message === "body.user_type cannot be null" ? "Please select a valid user type" : err.message)
                return res.status(400).json({ status: 400, type: err.name, message: err.message === "body.user_type cannot be null" ? "Please select a valid user type" : err.message, data: {} });
            }
        };
    }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export....
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports = UserRegistrationMiddleware;