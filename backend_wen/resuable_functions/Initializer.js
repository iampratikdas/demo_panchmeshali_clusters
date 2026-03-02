const { GetUserAuthorization } = require("../utils/Authorization.js");
const { findOneUserById } = require("./mongodb/UserFunctions.js");
async function initializes(req, res,module ,  role = null) {
    const token_data = await GetUserAuthorization(req.headers.authorization);
    console.log("working=======================>", token_data)
    if (token_data.error_code) {
        throw new Error(token_data.message);
    }
    const existingUser = await module.usersFunctions.findOneUserByEmail(token_data.email);
    // console.log("existingUser===============>", existingUser)
    if (!existingUser) {
        throw new Error( "User not found.");
    }
    if (existingUser.is_deleted === true) {
        throw new Error( "User not found.");
    }
    // console.log("role checking ===============>" ,role, ((role.find( item => item === existingUser.role))) )
    // if(role){
            if (role && !(role && (role.find( item => item === existingUser.role)))) {
                throw new Error(`Unauthorized. Required user_type: ${role}`);
        }  
    
     
        
    return existingUser;
}
module.exports = initializes