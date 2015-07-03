'use strict';

/* Controllers */

var madnessControllers = angular.module('madnessControllers', []),
    poolToColRatio = {
        1: 12,
        2: 6,
        3: 4,
        4: 3
    };

madnessControllers.
controller('homeCtrl', ['$scope', "$location",
    function($scope, $location) {
        $scope.loadProfile = function () {
            // TODO: authentication and proper page id creation
            var id="314159";
            $location.path("/profile/"+id);
        };
    }]).
controller("ProfileCtrl", ["$scope", "$location",'UserService',
    function ($scope, $location, UserService) {
        $scope.user = UserService.get();
        $scope.templates = {
            navbar: "app/html/nav.html",
            profile: "app/html/dashboard.html"
        };
        $scope.loadTournament = function () {
            var id = "314159";
            $location.path("/tournament/"+id);
        }
    }]).
controller("BracketCtrl", ["$scope", 'UserService', "$sce",
    function ($scope, UserService, $sce) {
        $scope.user = UserService.get();
        $scope.templates = {
            navbar: "app/html/nav.html",
            tourny: "app/html/tourny.html"
        };
        $scope.escapeHTML = function (html) {
            return $sce.trustAsHtml(html);
        };
        $scope.tournyInfo = {
            name: "U.S. Open",
            division: "Open",
            date: "July 2<sup>nd</sup> 2015 - June 5<sup>th</sup> 2015",
            poolNames: ["Pool A", "Pool B"]
        };
        $scope.tournyInfo.poolFormat = [
            [1,3,6,7,10,12],
            [2,4,5,8,9,11]
        ];
        $scope.tournyInfo.teams = [
            "Johhny Bravo",
            "Ironside",
            "Ring of Fire",
            "GOAT",
            "Revolver",
            "Truck Stop",
            "PoNY",
            "Temper",
            "Great Britain",
            "Furious George",
            "Team Columbia",
            "Inside Rakete"
        ];
        $scope.tournyInfo.poolPlayRecords = getDefaultRecords($scope.tournyInfo.teams);
        $scope.tournyInfo.poolGames = getPoolPlayGames($scope.tournyInfo.poolFormat);
        $scope.colWidth = poolToColRatio[$scope.tournyInfo.poolFormat.length];
        $scope.togglePoolPlayGame = function (poolIdx, gameIdx, teamIdx) {
            var otherIdx = teamIdx ? 0 : 1,
                selectedGame = $scope.tournyInfo.poolGames[poolIdx][gameIdx][teamIdx],
                unSelectedGame = $scope.tournyInfo.poolGames[poolIdx][gameIdx][otherIdx];

            if (selectedGame.selected !== true) {
                if (selectedGame.selected !== undefined) {
                    $scope.tournyInfo.poolPlayRecords[selectedGame.id].l--;
                }
                $scope.tournyInfo.poolPlayRecords[selectedGame.id].w++;

                if (unSelectedGame.selected !== undefined) {
                    $scope.tournyInfo.poolPlayRecords[unSelectedGame.id].w--;
                }
                $scope.tournyInfo.poolPlayRecords[unSelectedGame.id].l++;

                selectedGame.selected = true;
                unSelectedGame.selected = false;
            }
        };
        $scope.getWinPercentage = function (id) {
            var record = $scope.tournyInfo.poolPlayRecords[id],
                winP = record.w || record.l ? record.w / (record.w+record.l) : 0;

            return winP;
        };
    }]);

function getDefaultRecords (teams) {
    var i,
        tlen = teams.length,
        records = {};

    for (i = 0; i < tlen; i++) {
        records[i+1] = { w: 0, l: 0 };
    }

    return records;
}

function getPoolPlayGames (format) {
    var games = [],
        flen = format.length,
        i, j, k,
        pool,
        plen;

    for (i = 0; i < flen; i++) {
        if (!games[i]) {
            games[i] = [];
        }
        pool = format[i];
        plen = pool.length;
        for (j = 0; j < plen; j++) {
            for (k = j+1; k < plen; k++) {
                games[i].push([{
                    id: pool[j]
                }, {
                    id: pool[k]
                }]);
            }
        }
    }

    return games;
}