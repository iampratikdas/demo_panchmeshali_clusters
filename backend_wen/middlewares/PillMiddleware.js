//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const yup = require("yup");

class PillMiddleware {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //LinkSchema
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static linkSchema = yup.object({
        body: yup.object({
            medicine_name: yup.string().required("Medicine name is required").transform((value) => (value === '' ? null : value)),
            set_medicine_frequency: yup.string().oneOf(["hourly", "daily"], "Medicine frequency must be either hourly or daily").required("Medicine frequency is required"),
            ringtone: yup.string().transform((value) => (value === '' ? '' : value)),
            alarm: yup.boolean().transform((value) => (value === '' ? null : value)),
            pill_time: yup.mixed().nullable().transform((value) => (value === '' || value === null || value.length === 0 ? "" : value)),
            taken_date: yup.string().transform((value) => (value === '' || value === null ? '' : value)),
            interval_time: yup.number().nullable().transform((value) => {
                let out = (value === '' || value === null || isNaN(value) ? 0 : value)
                console.log("value=====>", out ,"<--->", value === '' || value === null || value === NaN , isNaN(value))
                return out
            }),
            pill_hourly_start_time: yup.string().transform((value) => (value === '' || value === null ? "" : value)),
            pill_hourly_end_time: yup.string().transform((value) => (value === '' || value === null ? "" : value)),
            pill_comp_id: yup.string().required("Pill compartment is required"),
            set_reminder: yup.number().required("Reminder time is required"),
            dossage: yup.number().required("Dossage is required").positive("Please Add Dossage"),
            total_pills: yup.number().required("Total pills is required").positive("Please add Total pills"),
            blood_pressure_medication: yup.boolean().default(false),
            taken_type: yup.string().oneOf(["with food", "Doesnt Matter", "Before Bed", "Empty Stomach"], "Invalid taken type").required("Taken type is required"),
            start_date: yup.string().required("Start date is required").test("is-valid-date", "Start date must be a valid date", (value) => {
                return !isNaN(Date.parse(value));
            }).transform((value) => (value === '' ? null : value)),
            end_date: yup.string().required("End date is required").test("is-valid-date", "End date must be a valid date", (value) => {
                return !isNaN(Date.parse(value));
            }).test("is-greater", "End date must be greater than start date", function(value) {
                const { start_date } = this.parent;
                if (!start_date || !value) return true;
                return Date.parse(value) > Date.parse(start_date);
            }).transform((value) => (value === '' ? null : value)),
            set_refull_reminder: yup.boolean().default(false),
        }),
    });
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //Validate
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static validate(schema) {
        return async (req, res, next) => {
            try {
                const currentTime = Math.floor(Date.now() / 1000);

                if (req.body.start_date < currentTime) {
                    return res.status(400).json({
                        status: 400,
                        success: false,
                        message: "Start date cannot be in the past",
                        data: {}
                    });
                }
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
module.exports = PillMiddleware;