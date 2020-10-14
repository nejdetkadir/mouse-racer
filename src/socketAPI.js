const socketio = require('socket.io');
const io = socketio();
const socketAPI = {

};
const users = {};

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
    users[socket.id] = userData;
    socket.broadcast.emit('newUser', userData);
    socket.emit('initUsers', users);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('disUser', users[socket.id]);
    delete users[socket.id];
  });

  socket.on('changeStatus', (data) => {
    users[socket.id].readyStatus = (data.readyStatus === "Cancel") ? 0 : 1;
    socket.broadcast.emit('changeStatus', users[socket.id]);
    socket.emit('initUsers', users);
  });
});

module.exports = socketAPI;
