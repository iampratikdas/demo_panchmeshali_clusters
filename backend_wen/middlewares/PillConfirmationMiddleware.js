//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require("yup");
const moment = require("moment");

class PillConfirmationMiddleware {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //LinkSchema
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static linkSchema = yup.object({
        body: yup.object({
            taken_time: yup.string().required("Taken time is required"),
            status: yup.string().transform((value) => (value === null || value === "" ? "taken" : value)).optional(),
            pill_time: yup.string().required("Pill time is required"),
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
                    success: false,
                    type: err.name,
                    message: err.message,
                    data: {}
                });
            }
        };
    }
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export....
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports = PillConfirmationMiddleware;