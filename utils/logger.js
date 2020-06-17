// * import Packages
const chalk = require("chalk");
const moment = require("moment");


exports.LOG = (type, message) => {
    const timeNow = moment().format("YYYY-MM-DD HH:mm:ss")

    switch(type){
        case "DEBUG":
            console.log(chalk.blue(`${timeNow}: ${message}`))
            break;
        case "SUCCESS":
            console.log(chalk.green(`${timeNow}: ${message}`))
            break;
        case "WARNING":
            console.log(chalk.yellow(`${timeNow}: ${message}`))
            break;
        case "ERROR":
            console.log(chalk.red(`${timeNow}: ${message}`))
            break;
    }
}