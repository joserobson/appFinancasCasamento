(function () {

    angular
        .module('appMeuCasamento.services', [])

        .service('CasalService', function (Backand, $http) {

            var service = this;

            var casal,
                baseUrl = '/1/objects/',
                objectName = 'casal/';

            function getUrl() {
                return Backand.getApiUrl() + baseUrl + objectName;
            }

            service.buscarCasal = function (login) {
                return $http({
                    method: 'GET',
                    url: getUrl(),
                    params: {        
                        pageSize: 50,
                        pageNumber: 1,                
                        filter: [
                            { "fieldName": "usuarioLogin", "operator": "equals", "value": login }
                        ]
                    }
                })
            }

        })

        .service('DespesaService', function (Backand, $http) {

            var service = this;

            var despesas,
                baseUrl = '/1/objects/',
                objectName = 'despesa/';


            function getUrl() {
                return Backand.getApiUrl() + baseUrl + objectName;
            }

            service.buscarAtualizacoes = function (dataAlteracao, idCasal) {
                return $http({
                    method: 'GET',
                    url: getUrl(),
                    params: {
                        pageSize: 50,
                        pageNumber: 1,
                        filter: [
                            { "fieldName": "dataAlteracao", "operator": "greaterThan", "value": dataAlteracao },
                            { "fieldName": "casal", "operator": "in", "value": idCasal }
                        ]
                    }
                })
            }

        })

        .service('PagamentoService', function (Backand, $http) {

            var service = this;

            var despesas,
                baseUrl = '/1/objects/',
                objectName = 'pagamento/';


            function getUrl() {
                return Backand.getApiUrl() + baseUrl + objectName;
            }

            service.buscarAtualizacoes = function (dataAlteracao) {
                return $http({
                    method: 'GET',
                    url: getUrl(),
                    params: {
                        pageSize: 50,
                        pageNumber: 1,
                        filter: [
                            { "fieldName": "dataAlteracao", "operator": "greaterThan", "value": dataAlteracao }
                        ]
                    }
                })
            }
        })


        .service('LoginService', function (Backand) {
            var service = this;

            service.signin = function (email, password) {
                //call Backand for sign in
                return Backand.signin(email, password);
            };

            service.anonymousLogin = function () {
                // don't have to do anything here,
                // because we set app token att app.js
            }

            service.socialSignIn = function (provider) {
                return Backand.socialSignIn(provider);
            };

            service.socialSignUp = function (provider) {
                return Backand.socialSignUp(provider);

            };

            service.signout = function () {
                return Backand.signout();
            };

            service.signup = function (firstName, lastName, email, password, confirmPassword) {
                return Backand.signup(firstName, lastName, email, password, confirmPassword);
            }
        })

})();