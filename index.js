const app = require('express')
const PORT = process.env.PORT || 4000;
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { timeStamp } = require('console');
const mysql = require("mysql");
var moment = require('moment-timezone');
const { disconnect } = require('process');
const connection = mysql.createConnection({
  "host": "localhost",
  "user": "root",
  "password": "",
  "database": "flashwork"
});

// connect
connection.connect(function (error) {
});

io.on("connection", socket => {
  socket.on('joinroom', (id) => {

    socket.join(id)
    connection.query("SELECT `m_id`,`Username`,`To_Username`,`m_message`,`m_time` FROM `message` WHERE`m_room`= '" + id + " 'ORDER BY m_id DESC limit 20", function (error, result) {
      io.in(id).emit('message', result)
    });
    socket.on('message', ({ User_id, toUser_id, message }) => {
      time = moment().tz("Asia/Bangkok").format('YYYY-MM-DD HH:mm:ss');
      connection.query("INSERT INTO `message`(`m_id`, `Username`, `To_Username`, `m_message`, `m_time`, `m_room`, `status`) VALUES ('','" + User_id + "','" + toUser_id + "','" + message + "','" + time + "','" + id + "','" + "unread" + "')", function (error, result) {
      });
      connection.query("SELECT `m_id`,`Username`,`To_Username`,`m_message`,`m_time` FROM `message` WHERE`m_room`= '" + id + "'ORDER BY m_id DESC limit 20", function (error, result) {
        io.in(id).emit('message', result)
      });
    });
    socket.on('history', ({ countdata }) => {
      connection.query("SELECT `m_id`,`Username`,`To_Username`,`m_message`,`m_time` FROM `message` WHERE`m_room`= '" + id + "'ORDER BY m_id DESC limit " + countdata + "", function (error, result) {
        io.in(id).emit('message', result)
      });
    });

    socket.on("disconnect", () => {
      socket.leave(id);
      console.log("user:" + socket.id + "leave:" + id)
    });
  });
})


http.listen(PORT, function () {
  console.log('listening on port 4000')
})
