const socketio = require('socket.io');
const io = socketio();
const socketAPI = {

};
const users = [];

socketAPI.io = io;
io.on('connection', (socket) => {
  //console.log('a user connected.');
  socket.on('newUser', (data) => {
    const defaultData = {
      id: socket.id,
      readyStatus: 0,
      totalClick: 0,
    };
    const userData = Object.assign(data, defaultData);
    users.push(userData);
    socket.broadcast.emit('newUser', userData);
  });
});

module.exports = socketAPI;
