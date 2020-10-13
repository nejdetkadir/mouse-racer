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
    }).catch((err) => {
      console.log(err);
    });
  }
}]);
