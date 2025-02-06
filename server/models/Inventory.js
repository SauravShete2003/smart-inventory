import {Schema , model } from "mongoose";

const inventorySchema = new Schema({
    name : {
        type : String,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    image : {
        type : String,
        },
    threshold : {
        type : Number,
        required : true
    },
    description : {
        type : String
        }
},{timestamps : true});

const Inventory = model('Inventory', inventorySchema);
export default Inventory;