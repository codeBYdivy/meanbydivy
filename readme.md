# meanBydivy 

# npm start (simple starts app with logging in console)

# npm run nodemon-start (starts app with logging and nodemon)

# npm run debug (starts app with logging and debgging with node-debug using node-inspector)

# npm run nodemon-debug (starts app with logging, nodemon and debgging with node-debug using node-inspector,  
# start node-inspector in other window )


    "start": "set DEBUG=meanBydivy* && node ./bin/www",
    "debug": "set DEBUG=meanBydivy* && node-debug ./bin/www",
    "nodemon-start": "set DEBUG=meanBydivy* && nodemon ./bin/www",
    "nodemon-debug": "set DEBUG=meanBydivy* && nodemon --debug ./bin/www"
