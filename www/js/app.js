// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('appMeuCasamento', ['ionic', 'appMeuCasamento.services', 'appMeuCasamento.controllers', 
    'appMeuCasamento.repositorio', 'ngCordova', 'backand','appMeuCasamento.factories'])

    .run(function ($ionicPlatform, $rootScope, Backand, $state) {

        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }            
        });

        //check connection internet
            if (window.Connection) {
                if (navigator.connection.type == Connection.NONE) {
                    console.log('Internet não conectada...');
                    $rootScope.isOnline = false;
                } else {
                    console.log('Internet conectada');
                    $rootScope.isOnline = true;
                }
            }

            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                console.log('Internet conectada');
                $rootScope.isOnline = true;
            });

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                console.log('Internet não conectada...');
                $rootScope.isOnline = false;
            });


            ///events autorizacao
            $rootScope.$on('unauthorized', function () {
                unauthorized();
            });

            function unauthorized() {
                console.log("user is unauthorized, sending to login");
                $state.go('app.login');
            }

            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                
                // if (toState.name != 'app.login' && Backand.getToken() === null) {
                //     unauthorized();
                // }

            });
                
            $rootScope.usuario = null;
            $rootScope.casal = null;
    })


    .config(function ($stateProvider, $urlRouterProvider, BackandProvider) {

        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'MenuCtrl as vm'
            })

            .state('app.listarDespesas', {
                url: '/listarDespesas',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/listarDespesas.html',
                        controller: 'ListarDespesasCtrl as vm'
                    }
                }
            })

            .state('app.listarPagamentos', {
                url: '/listarPagamentos',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/listarPagamentos.html',
                        controller: 'ListarPagamentosCtrl as vm'
                    }
                },
                params: {
                    despesaSelecionada: null,
                    responsavel: null
                }
            }) 

             .state('app.dadosCasamento', {
                url: '/dadosCasamento',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dadosCasamento.html',
                        controller: 'DadosCasamentoCtrl as vm'
                    }
                }
            })           

            .state('app.planejamentoFinancas', {
                url: '/planejamentoFinancas',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/planejamentoFinancas.html',
                        controller: 'PlanejamentoFinancasCtrl as vm'
                    }
                }
            })  

        $urlRouterProvider.otherwise('/app/dadosCasamento');

        BackandProvider.setAppName('casamentoanarobson');
        BackandProvider.setSignUpToken('ccc470a7-ada6-44fd-8885-08de4b10a3e2');
        //BackandProvider.setAnonymousToken('6c07d8b3-2abd-4565-8428-12b93a375a4f');

    });
