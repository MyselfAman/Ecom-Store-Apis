const mongoose = require("mongoose")
const connectDb = () => {
    mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology:true})
    .then(console.log("DB got connected"))
    .catch(err => {
        console.log("DB CONNECTION PROBLEM");
        console.log(err);
        process.exit(1);
    })
}

module.exports = connectDb