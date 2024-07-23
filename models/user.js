const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/miniproject')

const userSchema = mongoose.Schema({
    name:String,
    userName:String,
    email:String,
    age:Number,
    password:String,
    profilepic:{
     type:String,
     default: "abc.jpg"
    },
    posts:[
        {type:mongoose.Schema.Types.ObjectId, ref:"post"}
    ]
})
module.exports = mongoose.model('user',userSchema)