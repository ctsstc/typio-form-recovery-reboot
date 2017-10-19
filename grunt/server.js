var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + '/../testing')).listen(3000, function(){
    console.log('Server running on 3000...');
});