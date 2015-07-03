'use strict';

// Declare app level module which depends on views, and components
var madness = angular.module('madnessApp', [
    'ngRoute',
    'madnessControllers',
    "ngSanitize"
]);

madness.factory('UserService', function() {
    var user = {
        name: "Dan Bolivar"
    };

    return {
        get: function () {
            return user;
        }
    };
}).
factory("TournamentService", function () {
    var testTourny = {

    };

});

madness.
config(function($locationProvider) {
  $locationProvider.html5Mode(false).hashPrefix('');
}).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when("/", {
        templateUrl: "html/home.html",
        controller: "homeCtrl"
      }).
      when('/profile/:profile_id', {
        templateUrl: 'html/profile.html',
        controller: 'ProfileCtrl'
      }).
      when('/tournament/:tournament_id', {
          templateUrl: 'html/bracket.html',
          controller: "BracketCtrl"
      }).
      otherwise({redirectTo: '/'});
}]);
