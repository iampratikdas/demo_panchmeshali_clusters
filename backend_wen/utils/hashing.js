//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const bcrypt = require('bcrypt');
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// encrypt
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function encrypt(value) {
    try {
        const result = { error_code: 0, message: '', result: [] };
        const saltRounds = 10;
        const plaintextPassword = value;

        const hashed = await bcrypt.hash(plaintextPassword, saltRounds);
        return hashed;
    } catch (error) {
        console.error('Error encrypting password:', error);
        throw error;
    }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// verify
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function verify(enter_pass, store_pass) {
    try {
        const storedHash = store_pass;
        const enteredPassword = enter_pass;
        const is_match = await bcrypt.compare(enteredPassword, storedHash);

        return is_match;
    } catch (error) {
        console.error('Error verifying password:', error);
        throw error;
    }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Export....
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports = {
    encrypt,
    verify
};