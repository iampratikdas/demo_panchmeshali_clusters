const { getDb } = require('./connection');
class SetupDatabase {
    constructor() {
        this.UserDb =null
    }

    async UserDbSetup(connectionString) {
        this.UserDb = await getDb(connectionString);
        if (!this.UserDb) {
            throw new Error("Failed to connect to the User database");
        }
        return this.UserDb;
    }

    async getConnection() {
        return this.UserDb;
    }
}

module.exports = new SetupDatabase;