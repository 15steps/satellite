#!/usr/bin/env node

const cmd = require('node-cmd');
const url = process.env.npm_config_url;

if (url == "=" || url == "")
{
    console.log("You need run script with url paramater: npm --url=<your_url> run-script requests");
}
else
{
    console.log("Making requests to -> " + url + " <-...");

    cmd.get(
        "./node_modules/artillery/bin/artillery quick --count 900 -n 100 " + url ,
        function(err, data, stderr){
            console.log(data)
        }
    );
}