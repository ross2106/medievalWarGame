//Config file to hold static information such as DB or secret token
module.exports = {
    'port': process.env.PORT || 8080,
    'database': 'mongodb://admin:admin@ds247439.mlab.com:47439/medievalwar',
    'localdb': 'mongodb://localhost:27017/medievalwar',
    'secret': 'whysosecretive'
};