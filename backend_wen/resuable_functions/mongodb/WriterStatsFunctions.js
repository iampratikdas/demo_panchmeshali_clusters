const moment = require("moment");
const WriterStatsschema = require("../../models/monogdb/WriterStats");
const Setup = require("../../db/mongodb/setupDatabase");

class WriterStatsFunctions {
  constructor() {
    (async () => {
      this.model = await WriterStatsschema(await Setup.getConnection());
    })();
  }

  async findByWriterUid(writer_uid) {
    return await this.model.findOne({ writer_uid }).lean();
  }

  async findManyByWriterUids(writer_uids) {
    return await this.model.find({ writer_uid: { $in: writer_uids } }).lean();
  }

  async upsert(writer_uid, data) {
    return await this.model.findOneAndUpdate(
      { writer_uid },
      { $set: { ...data, updatedAt: moment().unix().toString() } },
      { upsert: true, new: true }
    ).lean();
  }

  async incrementFollowers(writer_uid, delta = 1) {
    return await this.model.findOneAndUpdate(
      { writer_uid },
      { $inc: { followers_count: delta }, $set: { updatedAt: moment().unix().toString() } },
      { upsert: true, new: true }
    ).lean();
  }

  async addRating(writer_uid, rating) {
    // Fetch current stats and recalculate average
    const current = await this.findByWriterUid(writer_uid);
    const total = (current?.total_ratings || 0) + 1;
    const currentAvg = current?.average_rating || 0;
    const newAvg = ((currentAvg * (total - 1)) + rating) / total;
    return await this.model.findOneAndUpdate(
      { writer_uid },
      { $set: { average_rating: Math.round(newAvg * 10) / 10, total_ratings: total, updatedAt: moment().unix().toString() } },
      { upsert: true, new: true }
    ).lean();
  }
}

module.exports = WriterStatsFunctions;
