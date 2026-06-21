const moment = require('moment');
const ProofReadschema = require('../../models/monogdb/ProofReads');
const Setup = require('../../db/mongodb/setupDatabase');

class ProofReadFunctions {
  constructor() {
    (async () => {
      this.proofReadModel = await ProofReadschema(await Setup.getConnection());
    })();
  }

  async findOne(query) {
    return await this.proofReadModel.findOne(query).lean();
  }

  async findMany(query) {
    return await this.proofReadModel.find(query).lean();
  }

  async upsertProofRead({ cont_id, eid, pid, marked_by }) {
    const now = String(moment().unix());
    return await this.proofReadModel.updateOne(
      { cont_id },
      {
        $set: {
          cont_id,
          eid,
          pid: pid || '',
          pr: true,
          marked_by: marked_by || '',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
  }

  async findDoneByEid(eid, pid = null) {
    const query = { eid, pr: true };
    if (pid) query.pid = pid;
    return await this.findMany(query);
  }

  async findDoneContIds(eid, pid = null) {
    const rows = await this.findDoneByEid(eid, pid);
    return rows.map((r) => r.cont_id).filter(Boolean);
  }

  async getPrMapForContIds(contIds = []) {
    if (!contIds.length) return {};
    const rows = await this.findMany({ cont_id: { $in: contIds }, pr: true });
    const map = {};
    for (const row of rows) {
      map[row.cont_id] = true;
    }
    return map;
  }
}

module.exports = ProofReadFunctions;
