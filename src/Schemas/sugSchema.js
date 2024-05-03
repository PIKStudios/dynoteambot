const { model, Schema} = require("mongoose");
 
let sugSchema = new Schema({
    Channel: String,
    Guild: String,
});
 
module.exports = model("sugSchema", sugSchema);