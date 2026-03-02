//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Import Default
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const moment = require("moment");
const Contentschema = require("../../models/monogdb/Contents");
const Setup = require("../../db/mongodb/setupDatabase");
class ContentFunctions {
    constructor(){
        (async ()=>{
             this.contentmodel = await Contentschema(await  Setup.getConnection());
         })()
    }
    
    async findOneContentById(contentId) {
        return await this.contentmodel.findOne({cont_id: contentId}).lean()
    }
    async findOneEvenTContentById(eid) {
        return await this.contentmodel.findOne({eid: eid}).lean()
    }
    async findOneEvenTContentAll(data , skip = 0 ,limit =0) {
        return await this.contentmodel.find(data).skip(skip).limit(limit).lean()
    }
    async findOneEvenTContentOne(data ) {
        return await this.contentmodel.findOne(data).lean()
    }
  
    async contentCount(data){
        return await this.contentmodel.find(data).countDocuments().lean()
    }
    async findUserEventAggregates(data){
        return await this.contentmodel.aggregate(data);
    }
    async ContentInsert(contentData) {
        try {
            // console.log("contents----------------------->", contentData)
          return await this.contentmodel.insertOne(contentData);
        }catch (error) {
            //console.error("Error inserting content:", error);
            throw new Error("Failed to insert content", error);
        }
    }
    async ContentUpdate(contentData, data) {
        try {
          return await this.contentmodel.updateOne({...data}, { $set: { name: contentData } });
        }catch (error) {
            //console.error("Error inserting content:", error);
            throw new Error("Failed to update content");
        }
    }
    async ContentMarksUpdate(contentData, data, token_data, marks) {
        try {
            
          return await this.contentmodel.updateOne( contentData , data ).then(async (rs)=>{
            if(rs.matchedCount === 0){
                // console.log("contentdata============>",   rs)
                await this.contentmodel.updateOne( {cont_id : contentData.cont_id} , { $push: { marks: { uid: token_data.uid, score: marks } } })
            }
          });
        }catch (error) {
            console.error("Error inserting content:", error);
            throw new Error("Failed to update content");
        }
    }
}


module.exports = ContentFunctions