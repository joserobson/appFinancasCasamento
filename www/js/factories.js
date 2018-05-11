(function () {

    angular

        .module('appMeuCasamento.factories', [])

        .factory('SyncDespesaFactory', function (DespesaRepositorio, DespesaService, LoginService,Backand) {

            var factory = this;

            //funcao para sincronizar com service red
            factory.sincronizarComBancoRemoto = function (callback, usuario,callbackError,idCasal) {
                

                console.log('inicando sincronização de despesas....');

                //verificar se usuario logado no Backand
                if (Backand.getToken() === null){                       
                       LoginService.signin(usuario.login, usuario.senha)
                        .then(function () { 
                              sincronizar(callback);                         
                        }, function (error) {
                           
                            if (error)
                                console.log(error.error_description)  
                            
                            callbackError;                          
                        })                        
                }else{
                    sincronizar(callback,idCasal);
                }                
            }

            var sincronizar = function(callback,idCasal){
                  DespesaRepositorio.initDB();

                  DespesaRepositorio.obterMaxDataAlteracao(function (ultDataAlteracao) {

                    DespesaService.buscarAtualizacoes(ultDataAlteracao, idCasal)
                        .then(function (response) {
                            var changes = response.data.data;
                            if (changes.length > 0) {
                                DespesaRepositorio.salvarDespesas(changes, callback);
                            } else {
                                console.log('sem alterações para despesa...')
                                callback();
                            }

                        }, function (response) {
                            console.log('erro ao buscar alterações para despesa' + response.data);
                            callback();
                        });
                });
            }
            return factory;
        })

        .factory('SyncPagamentoFactory', function (PagamentoRepositorio, PagamentoService,Backand,LoginService) {

            var factory = this;

            //funcao para sincronizar com service red
            factory.sincronizarComBancoRemoto = function (callbackSucess, usuario, callbackError) {
                
                console.log('inicando sincronização de pagamentos....');

                //verificar se usuario logado no Backand
                if (Backand.getToken() === null){                       
                       LoginService.signin(usuario.login, usuario.senha)
                        .then(function () { 
                              sincronizar(callbackSucess);                         
                        }, function (error) {
                            console.log(error.error_description)
                            callbackError(error);                            
                        })                        
                }else{
                    sincronizar(callbackSucess);
                }                
            }

            var sincronizar = function(callback){

                PagamentoRepositorio.initDB();

                PagamentoRepositorio.obterMaxDataAlteracao(function (ultDataAlteracao) {

                    PagamentoService.buscarAtualizacoes(ultDataAlteracao)
                        .then(function (response) {
                            var changes = response.data.data;
                            if (changes.length > 0) {
                                PagamentoRepositorio.salvarPagamentos(changes, callback);
                            } else {
                                callback();
                                console.log('sem alterações para pagamentos...')
                            }

                        }, function (response) {
                            console.log('erro ao buscar alterações para pagamento' + response.data);
                            callback();
                        });
                });
            }

            return factory;
        });


})();