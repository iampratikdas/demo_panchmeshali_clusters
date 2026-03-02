//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require("yup");

class UserProfileMiddleware {
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //LinkSchema
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  static linkSchema = yup.object({
    body: yup.object({
      email: yup.string().email("Invalid user email format"),
      name: yup.string().nullable(),
      dob: yup.string().nullable(),
      password: yup.string(),
      user_id: yup.string(),
      em_country_code: yup.string().nullable(),
      ph_country_code: yup.string().nullable(),
      user_type: yup.string(),
      is_active: yup.boolean(),
      profile_image: yup.string().nullable(),
      email_care_giver: yup
        .string()
        .nullable()
        .email(
          "Invalid caregiver email format. Please enter a valid email address"
        )
        .transform((value) => (value === "" ? null : value)),
      phone_number: yup
        .string()
        .nullable()
        .transform((value) => (value === "" ? null : value)),
      emergency_phone_number: yup
        .string()
        .nullable()
        .transform((value) => (value === "" ? null : value)),
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
        return res
          .status(400)
          .json({
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
module.exports = UserProfileMiddleware;
