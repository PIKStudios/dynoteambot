const { model, Schema} = require("mongoose");
 
let suggSchema = new Schema({
    User: String,
    Server: String,
    Suggestion: String,
    SuggestionID: String,
});
 
module.exports = model("suggSchema", suggSchema);