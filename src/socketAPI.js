const socketio = require('socket.io');
const io = socketio();
const socketAPI = {

};
const users = {};

function gameIsStarted(users) {
  let total_user = 0;
  let total_ready = 0;
  for (const property in users) {
    if (users[property].readyStatus === 1) {
      total_ready++;
    }
    total_user++;
  }
  if (total_user === total_ready && total_user > 1) {
    return true;
  } else {
    return false;
  }
}

function gameWon(users) {
  let max_click = 0;
  let socket_id = 0;
  for (const property in users) {
    users[property].readyStatus = 0;
    if (max_click < users[property].totalClick) {
      max_click = users[property].totalClick;
      socket_id = users[property].id;
    }
    users[property].totalClick = 0;
  }
  return socket_id;
}

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
    socket.broadcast.emit('disUser', {id: users[socket.id]});
    delete users[socket.id];
  });

  socket.on('changeStatus', (data) => {
    users[socket.id].readyStatus = (data.readyStatus === "Cancel") ? 0 : 1;
    socket.broadcast.emit('changeStatus', users[socket.id]);
    socket.emit('initUsers', users);
    if (gameIsStarted(users)) {
      socket.broadcast.emit('gameStart');
      socket.emit('gameStart');
    }
  });

  socket.on('clickButton', (data) => {
    users[data.data].totalClick++;
  });

  socket.on('gameStarted', () => {
    let order = 0;
    const interval = setInterval(() => {
      if (order===5) {
        clearInterval(interval);
        socket.emit('gameFinish', {
          data: gameWon(users)
        });
        socket.emit('initUsers', users);
      } else {
        order++;
      }
    }, 1000);
  });
});

module.exports = socketAPI;
