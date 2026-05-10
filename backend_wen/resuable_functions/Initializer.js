const { GetUserAuthorization } = require("../utils/Authorization.js");
const { findOneUserById } = require("./mongodb/UserFunctions.js");
async function initializes(req, res,module ,  role = null) {
    try {
        const token_data = await GetUserAuthorization(req.headers.authorization);
        console.log("working=======================>", token_data)
        if (token_data.error_code) {
            res.status(401).json({ status: 401, message: token_data.message });
            return null;
        }
        const existingUser = await module.usersFunctions.findOneUserByEmail(token_data.email);
        
        if (!existingUser) {
            res.status(401).json({ status: 401, message: "User not found." });
            return null;
        }
        if (existingUser.is_deleted === true) {
            res.status(401).json({ status: 401, message: "User not found." });
            return null;
        }
        
        if (role && !(role && (role.find( item => item === existingUser.role)))) {
            res.status(403).json({ status: 403, message: `Unauthorized. Required user_type: ${role}` });
            return null;
        }  
        
        return existingUser;
    } catch (error) {
        console.error("Initializer error:", error);
        if (!res.headersSent) {
            res.status(500).json({ status: 500, message: "Internal server error during authorization." });
        }
        return null;
    }
}
module.exports = initializes