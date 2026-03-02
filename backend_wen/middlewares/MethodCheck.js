class MethodCheck {
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //Validate
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  static validate() {
      return (req, res, next) => {
          switch (req.path) {
              // case "/api/signup":
              //   if (req.method !== "POST") {
              //     return res.status(405).set("Allow", "POST").json({ status: 405, message: "Method not matched"  , data:{}});
              //   }
              //   break;
              // case "/api/login":
              //   if (req.method !== "POST") {
              //     return res.status(405).set("Allow", "POST").json({ status: 405, message: "Method not matched"  , data:{}});
              //   }
              //   break;
              case "/api/forgotpassword":
                  if (req.method !== "POST") {
                      return res.status(405).set("Allow", "POST").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/userprofile":
                  if (req.method !== "PUT") {
                      return res.status(405).set("Allow", "PUT").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/verifyotp":
                  if (req.method !== "POST") {
                      return res.status(405).set("Allow", "POST").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/requestforgotpasswordotp":
                  if (req.method !== "POST") {
                      return res.status(405).set("Allow", "POST").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/myprofile":
                  if (req.method !== "GET") {
                      return res.status(405).set("Allow", "GET").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/userprofile":
                  if (req.method !== "PUT") {
                      return res.status(405).set("Allow", "PUT").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/caregiverprofile":
                  if (req.method !== "GET") {
                      return res.status(405).set("Allow", "GET").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
              case "/api/updatecaregiverprofile":
                  if (req.method !== "PUT") {
                      return res.status(405).set("Allow", "PUT").json({ status: 405, message: "Method not matched", data: {} });
                  }
                  break;
          }
          next();
      };
  }
}
module.exports = MethodCheck;