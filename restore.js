
const db = require("./config/mysql");
const fs = require("fs");
const path = require("path");




function setCurrentDB(db_name, callback) {
    db.query(`USE ${db_name}`, function (err, rows) {
      if (err) {
        if (err.errno == 1049) {
          console.log(`${err.sqlMessage} : Failed to connect MySql database`);
          return callback('refused');
        } else {
          console.log(`Mysql Database connection error`);
          return callback('refused');
        }
      } else {
        return callback('connected');
      }
    });
}

function importSqlFile(queries) {
    for (let query of queries) {
        query = query.trim();
        if (query.length !== 0 && !query.match(/\/\*/)) {
          db.query(query, function (err, sets, fields) {
            if (err) {
              //console.log(`Importing failed for Mysql Database  - Query:${query}`);
            } else {
             // console.log(`Importing Mysql Database  - Query:${query}`);
            }
          });
        }
      }
}

function createDatabase(db_name, callback) {
    db.query(`CREATE DATABASE IF NOT EXISTS ${db_name}`, (err , sets, fields) => {
        if (err) {
            console.log(`Failed creating - Database:${db_name}`);
            callback("error");
          } else {
            console.log(`Created successfully  - Database:${db_name}`);
            callback("created");
          }
    })
}

let database_name = "dummy_db";

setCurrentDB(database_name,(data) => {
    console.log(data);
    const file_path = path.join(__dirname, "storage", "dumps", "dummy_db-1592365003208.sql");
    let queries = fs.readFileSync(file_path,{encoding: "UTF-8"}).split(";\n");

    if(data === "connected"){
        importSqlFile(queries)
    }else{
        createDatabase(database_name, (data) => {
            console.log(data);
            if(data === "created"){
                setCurrentDB(database_name, (data)=> {
                    if(data === "connected"){
                        importSqlFile(queries)
                    }
                })
            }else{
                console.log("error")
            }
        })
    }
})
