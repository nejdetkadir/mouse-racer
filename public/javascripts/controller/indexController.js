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
    const url = 'https://mouse-racer.herokuapp.com'; // live demo
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
          $('#clckBut').prop("disabled", false);
          socket.emit('gameStarted');
        }, 2500);
      });

      $scope.clickCalculator = ($event) => {
        let total = $('#click-num').html();
        total++;
        $('#click-num').html(total);
        socket.emit('clickButton', {
          data: socket.id
        });
      };

      socket.on('gameFinish', (data) => {
        $('#game-status').html('Waiting for players to ready up');
        $('#clickArea').removeClass('start').addClass('stop');
        $('#clckBut').prop("disabled", true);
        $('#rdy').html('Ready').removeClass('btn-danger').addClass('btn-primary').attr('disabled', false);
        const username = $scope.users[data.data].username;
        alert(`${username} is winner!`);
        $('#click-num').html(0);
      });

    }).catch((err) => {
      console.log(err);
    });
  }
}]);
