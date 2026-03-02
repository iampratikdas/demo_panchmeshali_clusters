//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require('yup');

class PillCompartmentMiddleware {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //LinkSchema
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static linkSchema = yup.object({
        body: yup.object({
            color_code: yup.string()
                .required('Color Code is required'),
        })
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
                    data: {}
                });
            }
        };
    }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export....
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports = PillCompartmentMiddleware;