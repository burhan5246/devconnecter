const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connecDB = async () => {
    try{
      await mongoose.connect(db, {useNewUrlParser: true});
      console.log('mongoDB connected...');
    } catch(err) {
        console.error(err.message);
        //exit process with failure
        process.exit(1);
    }
};

module.exports = connecDB;

