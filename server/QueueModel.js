const mongoose = require("mongoose")

const QueueSchema = new mongoose.Schema({

name:String, email:String, joinedAt:{ type:Date, default:Date.now }

})

module.exports = mongoose.model("Queue",QueueSchema)