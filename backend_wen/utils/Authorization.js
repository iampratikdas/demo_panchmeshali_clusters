//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const jwt = require("jsonwebtoken");
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const Config = require("./Config");
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GenUserToken
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function GenUserToken(user, creation_updation_time) {
    console.log("Config.jwt_secret_key- --" ,Config.jwt_secret_key);

    const token = jwt.sign({
          full_name: user.full_name,
          email: user.email,
          ph_country_code: user.ph_country_code,
          phone_number: user.phone_number,
          ip: user.ip,
          role : user.role,
        },
        Config.jwt_secret_key, { expiresIn: "1000h" }
    );

    return token;
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GetUserAuthorization
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function GetUserAuthorization(auth_header) {
    const auth_token = (auth_header || "").split("Bearer ").at(1);
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    let token_data;
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    try {
        token_data = jwt.verify(auth_token, Config.jwt_secret_key);
    } catch (e) {
        console.log("existingUser==--------------------------------------------=============>",auth_header , e)
        return { error_code: 1001, message: "ERROR: Authentication failed." };
    }
    return token_data;
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export....
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports = {
    GenUserToken,
    GetUserAuthorization,
};