app.controller('indexController', ['$scope', 'indexFactory', ($scope, indexFactory) => {

  $scope.users = {};

  $scope.init = () => {
    const username = prompt('Please enter your username');
    if (username)
      initSocket(username);
    else
      return false;
  };

  function initSocket(username) {
    const url = 'http://localhost:3000'; // development
    indexFactory.connectSocket(url, {
      reconnectionAttempts: 3,
      reconnectionDelay: 600
    }).then((socket) => {
      //console.log('connection successfully', socket);
      socket.emit('newUser', {
        username
      });

      socket.on('newUser', (data) => {
        $scope.users[data.id] = data;
        $scope.$apply();
      });

      socket.on('disUser', (data) => {
        delete $scope.users[data.id];
        $scope.$apply();
      });

      socket.on('initUsers', (data) => {
        $scope.users = data;
        $scope.$apply();
      });

      $scope.onReadyClick = ($event) => {
        const readyStatus = $('#rdy').text();
        socket.emit('changeStatus', { readyStatus });
        if (readyStatus === "Ready") {
          $('#rdy').html('Cancel').removeClass('btn-primary').addClass('btn-danger').attr('disabled', true);
        }
      }

      socket.on('changeStatus', (data) => {
        $scope.users[data.id] = data;
        $scope.$apply();
      });

      socket.on('gameStart', () => {
        $('#clickArea').removeClass('stop').addClass('wait');
        $('#game-status').html('ATTENTOON!');
        setTimeout(() => {
          $('#game-status').html('START, CLICK THIS BUTTON!');
          $('#clickArea').removeClass('wait').addClass('start');
        }, 2500);
      });

    }).catch((err) => {
      console.log(err);
    });
  }
}]);
