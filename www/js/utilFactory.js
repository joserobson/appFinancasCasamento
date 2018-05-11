(function () {

    'use strict'

    angular
        .module('appMeuCasamento.Util', [])

        .factory('UtilFactory', function ($ionicPlatform, $cordovaSQLite) {

            return {
                runQuery: runQuery
            }

            //executa query
            function runQuery(db,query, dataArray, successCb, errorCb) {
                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, dataArray).then(function (res) {
                        successCb(res);
                    }, function (err) {
                        errorCb(err);
                    });
                }.bind(this));
            }

        });

})();