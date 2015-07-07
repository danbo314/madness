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
            poolNames: ["A", "B"]
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
        $scope.getWinPercentage = function (id) {
            var record = $scope.tournyInfo.poolPlayRecords[id],
                winP = record.w || record.l ? record.w / (record.w+record.l) : 0;

            return winP;
        };

        $scope.tournyInfo.poolFormatCopy = $scope.tournyInfo.poolFormat.slice();
        $scope.tournyInfo.poolResults = getSortedPools($scope.tournyInfo.poolFormatCopy, $scope.getWinPercentage);
        $scope.tournyInfo.bracketFormat = [];
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

            $scope.tournyInfo.poolResults = getSortedPools($scope.tournyInfo.poolFormatCopy, $scope.getWinPercentage);
            updateFirstRoundBracket($scope.tournyInfo.bracketFormat[0], $scope.tournyInfo.poolResults);
        };
        $scope.tournyInfo.bracketFormat[0] = {
            s1: { upBracket: "f1", upGame: 0, teams: [{ selected: false, id: $scope.tournyInfo.poolResults[0][0] }, { selected: false, id: $scope.tournyInfo.poolResults[1][1] }] },
            s2: { upBracket: "f1", upGame: 1, teams: [{ selected: false, id: $scope.tournyInfo.poolResults[1][0] }, { selected: false, id: $scope.tournyInfo.poolResults[0][1] }] }
        };
        $scope.tournyInfo.bracketFormat[1] = {
            f1: { upBracket: "w1", upGame: 0, teams: [{ selected: false, id: null }, { selected: false, id: null }] }
        };
        $scope.tournyInfo.bracketFormat[2] = {
            w1: { teams: [{ selected: true, id: null }] }
        };
        $scope.brackWidth = poolToColRatio[$scope.tournyInfo.bracketFormat.length];
        $scope.toggleBracketGame = function(bracketTier, gameKey, teamId, teamIdx) {
            var notIdx = teamIdx ? 0 : 1,
                currentGame = $scope.tournyInfo.bracketFormat[bracketTier][gameKey];

            if (!currentGame.teams[teamIdx].selected) {
                currentGame.teams[teamIdx].selected = true;
                currentGame.teams[notIdx].selected = false;

                $scope.tournyInfo.bracketFormat[bracketTier + 1][currentGame.upBracket].teams[currentGame.upGame].id = teamId;
            }
        };
    }]);

function updateFirstRoundBracket (firstRound, results) {
     firstRound.s1.teams[0].id = results[0][0];
     firstRound.s1.teams[1].id = results[1][1];
     firstRound.s2.teams[0].id = results[1][0];
     firstRound.s2.teams[1].id = results[0][1];
}

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

function getSortedPools(poolFormat, getWinPerc) {
    var i,
        plen = poolFormat.length,
        sorted = [];

    for (i = 0; i < plen; i++) {
        sorted[i] = poolFormat[i].sort(function (a, b) {
            return getWinPerc(b) - getWinPerc(a);
        });
    }

    return sorted;
};