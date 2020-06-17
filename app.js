// * import Packages
const mongoose = require("mongoose"); 
const LOG = require("./utils/logger").LOG;
const db = require("./config/mysql")
const ignore = require("./config/ignore")
const path = require("path");
const fs = require("fs");
const fileSize = require("file-size");
const mysqldump = require("mysqldump")
const moment = require("moment");
const getStream = require("into-stream")
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");


// * Global variables
const GLOBAL = require("./config/global");
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const ONE_MINUTE = 60 * 1000;

// Use StorageSharedKeyCredential with storage account and account key
// StorageSharedKeyCredential is only avaiable in Node.js runtime, not in browsers
const sharedKeyCredential = new StorageSharedKeyCredential(GLOBAL.Azure.AZURE_STORAGE_ACCOUNT_NAME, GLOBAL.Azure.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
const blobServiceClient = new BlobServiceClient(
  `https://${GLOBAL.Azure.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential
);
// * Models
const {Backup} = require("./models/backup");

//* Own Methods
const getAllDatabases = () =>  {
    return new Promise((resolve, reject) => {
        let allDatabases = []; 
        db.queryAsync("show databases")
        .then((dbs) =>{
            dbs.map((db) => {
                if(ignore.indexOf(db.Database) === -1){
                    allDatabases.push(db.Database);
                }
            });
            resolve(allDatabases);
        })
        .catch(err => {
            console.log(err);
            reject(err)
        });
    
    });
}

const getFileSize = (file) => {
    var stats = fs.statSync(file)
    return stats["size"]
}

(async () => {
    //! global thread variables
    let databases = [];

    //TODO 1) connect to mongodb 
    await mongoose.connect(GLOBAL.mongodb.db_url, 
        {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    LOG("SUCCESS", "Mongodb Connected Successfully :)")

    
    //TODO 2) get all mysql databases to back up
    LOG("DEBUG", "Retrieving databases from mysql")
    databases  = await getAllDatabases()
    LOG("SUCCESS", "Databases has been retrieved successfully :)")


    //TODO 3) dump compressed sql file for each database
    databases.forEach(async db => {

        //file information
        const file_date = moment().format("YYYY-MM-DD HH:mm:ss");
        const timestamp = new Date().getTime();
        const file_name = `${db}-${timestamp}.sql`;
        
       //generate sql file from database
       LOG("DEBUG", "Retrieving sql code from database")
        const res = await mysqldump({
            connection: {
                host: '192.168.1.111',
                user: 'msalekmouad',
                password: 'msalekmouad',
                database: db
            },
            dumpToFile: path.join(__dirname, "storage", "dumps", file_name),
        })
        LOG("SUCCESS", "SQL File has been successfully saved")

        //file information 2
        const fileSizeBytes = getFileSize(path.join(__dirname, "storage", "dumps", file_name))   
        const humanFileSize = fileSize(fileSizeBytes).human("si");

        //register backups in database
        const backup_info = {
            file_name: file_name,
            backup_date: file_date,
            db_name: db,
            backup_size: humanFileSize
        }

        LOG("DEBUG", "Saving backup detail to database")
        let _backup = new Backup(backup_info);
        //await _backup.save();
        LOG("SUCCESS", "Backup detail has being saved success fully")

    });


    
})()



