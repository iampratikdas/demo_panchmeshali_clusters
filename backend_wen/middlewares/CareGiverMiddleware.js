//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require("yup");

class CareGiverMiddleware {
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //LinkSchema
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  static linkSchema = yup.object({
    body: yup.object({
      email: yup
        .string()
        .email("Invalid email format")
        .required("Email is required"),
      phone: yup
        .string()
        .required("Phone number is required"),
      dob: yup
        .date()
        .required("Date of birth is required")
        .max(new Date(), "Date of birth cannot be in the future"),
    }),
  });
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Validate
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  static validate(schema) {
    return async (req, res, next) => {
      try {
        const validatedData = await schema.validate(
          { body: req.body },
          { stripUnknown: true }
        );
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
module.exports = CareGiverMiddleware;
