let mongoose = require('mongoose');
const { Schema } = mongoose;

exports.Backup = mongoose.model('Backup', new Schema({
    file_name: {
        type: String,
        required: true
    },
    backup_date: {
        type: String,
        required: true

    },
    backup_size: {
        type: String,
        required: true
    },
    db_name:{
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}));
