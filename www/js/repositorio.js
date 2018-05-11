(function () {

    angular
        .module('appMeuCasamento.repositorio', [])

        .service('DespesaRepositorio', function ($cordovaSQLite, $q, $ionicPlatform) {

            var repositorio = this;
            var db;

            //verifica se tabela existe no banco
            repositorio.checkExistsTableDespesa = function () {

                var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='despesa'";
                runQuery(query, [], function (response) {
                    return response.rows.length == 1
                }, function (error) {
                    console.log(error);
                })
            }

            //cria tabela despesa se não existir
            repositorio.initDB = function () {
                $ionicPlatform.ready(function () {
                    db = $cordovaSQLite.openDB({ name: "meuCasamentoDB.db", iosDatabaseLocation: 'default' });

                    var query = "CREATE TABLE IF NOT EXISTS despesa (id integer primary key autoincrement, descricao string, "
                        + "valor string, valorNoivo string, valorNoiva string, excluido integer, dataAlteracao datetime)";

                    runQuery(query, [], function (res) {
                        console.log("table created ");
                    }, function (err) {
                        console.log(err);
                    });

                }.bind(this));
            }

            //retorna todas as despesas no banco
            repositorio.getAllDespesas = function () {

                var deferred = $q.defer();
                var query = "SELECT * from despesa where excluido = 'false'";

                runQuery(query, [], function (response) {
                    //Success Callback
                    console.log(response);
                    deferred.resolve(response);
                }, function (error) {
                    //Error Callback
                    console.log(error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            //executa query
            function runQuery(query, dataArray, successCb, errorCb) {
                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, dataArray).then(function (res) {
                        successCb(res);
                    }, function (err) {
                        errorCb(err);
                    });
                }.bind(this));
            }

            //buscar a maior data de alteracao
            repositorio.obterMaxDataAlteracao = function (callback) {

                var query = "SELECT MAX(dataAlteracao) as ultData FROM despesa";
                runQuery(query, [], function (response) {
                    var dataAlteracao = response.rows.item(0).ultData;
                    console.log('Data de alteração mais recente: ' + dataAlteracao);
                    callback(dataAlteracao);
                }, function (error) {
                    console.log(error);
                });
            }

            //insere e atualiza lista de despesas
            repositorio.salvarDespesas = function (despesas, callback) {

                db.transaction(function () {

                    var query = "INSERT OR REPLACE INTO despesa (descricao, valor, valorNoivo, valorNoiva,excluido,dataAlteracao, id) VALUES (?,?,?,?,?,?,?)";

                    var numDespesas = despesas.length;
                    var desp;

                    console.log('inserindo ou alterando despesas no bando local');

                    for (var i = 0; i < numDespesas; i++) {
                        desp = despesas[i];

                        runQuery(query, [desp.descricao, desp.valor, desp.valorNoivo, desp.valorNoiva, desp.excluido, desp.dataAlteracao, desp.id],
                            function (response) {
                                //Success Callback
                                console.log(response);
                            }, function (error) {
                                //Error Callback
                                console.log(error);
                            });
                    }
                }, function (error) {
                    console.log('Erro ao aplicar alteracoes de despesa: ' + error.message);
                    callback();
                }, function () {
                    console.log('ok alteracões aplicadas...');
                    callback();
                });
            }

            //deletar tabela despesa
            repositorio.dropTabelaDespesa = function () {
                
                db = $cordovaSQLite.openDB({ name: "meuCasamentoDB.db", iosDatabaseLocation: 'default' });

                $cordovaSQLite.execute(db, 'DROP TABLE despesa').then(function () {
                    console.log('tabela despesa removida com sucesso')
                });
            }            
            
        })

        .service('PagamentoRepositorio', function ($cordovaSQLite, $q, $ionicPlatform) {

            var repositorio = this;
            var db;

            //buscar a maior data de alteracao
            repositorio.obterMaxDataAlteracao = function (callback) {

                var query = "SELECT MAX(dataAlteracao) as ultData FROM pagamento";
                runQuery(query, [], function (response) {
                    var dataAlteracao = response.rows.item(0).ultData;
                    console.log('Pagamento - Data de alteração mais recente: ' + dataAlteracao);
                    callback(dataAlteracao);
                }, function (error) {
                    console.log(error);
                });
            }

            //insere e atualiza lista de pagamentos
            repositorio.salvarPagamentos = function (pagamentos, callback) {

                db.transaction(function () {

                    var query = "INSERT OR REPLACE INTO pagamento (dataPagamento, idDespesa, valor, status,responsavel,dataAlteracao,excluido, id) VALUES (?,?,?,?,?,?,?,?)";

                    var numPagamentos = pagamentos.length;
                    var pag;

                    console.log('inserindo ou alterando pagamentos no bando local');

                    for (var i = 0; i < numPagamentos; i++) {
                        pag = pagamentos[i];

                        runQuery(query, [pag.dataPagamento, pag.despesa, pag.valor, pag.status, pag.responsavel,
                        pag.dataAlteracao, pag.excluido, pag.id],
                            function (response) {
                                //Success Callback
                                console.log(response);
                            }, function (error) {
                                //Error Callback
                                console.log(error);
                            });
                    }
                }, function (error) {
                    console.log('Erro ao aplicar alteracoes de pagamento: ' + error.message);
                    callback();
                }, function () {
                    console.log('ok pagamento alteracões aplicadas...');
                    callback();
                });
            }

            repositorio.getPagamentos = function (idDespesa, responsavel) {
                var deferred = $q.defer();
                console.log('Buscando pagamentos para despesa: ' + idDespesa + ' respo: ' + responsavel);

                var query = "SELECT * FROM pagamento where excluido = 'false' and idDespesa = ? and responsavel = ? order by ordemPagamento";
                runQuery(query, [idDespesa, responsavel], function (response) {
                    //Success Callback
                    console.log(response);
                    deferred.resolve(response);
                }, function (error) {
                    //Error Callback
                    console.log(error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            //executa query
            function runQuery(query, dataArray, successCb, errorCb) {
                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, dataArray).then(function (res) {
                        successCb(res);
                    }, function (err) {
                        errorCb(err);
                    });
                }.bind(this));
            }

            //inicializa banco de dados
            repositorio.initDB = function () {
                $ionicPlatform.ready(function () {

                    db = $cordovaSQLite.openDB({ name: "myappDB.db", iosDatabaseLocation: 'default' });
                    var query = "CREATE TABLE IF NOT EXISTS pagamento (id integer primary key autoincrement, dataPagamento string ," +
                        "valor string, status string, responsavel string, dataAlteracao datetime, idDespesa integer, excluido integer, ordemPagamento integer )";
                    runQuery(query, [], function (res) {
                        console.log("table pagamento created ");
                    }, function (err) {
                        console.log(err);
                    });
                }.bind(this));
            }

            //deletar tabela pagamento
            repositorio.dropTabelaPagamento = function () {
                db = $cordovaSQLite.openDB({ name: "meuCasamentoDB.db", iosDatabaseLocation: 'default' });
                $cordovaSQLite.execute(db, 'DROP TABLE pagamento').then(function () {
                    console.log('tabela pagamento removida com sucesso')
                });
            }


            //buscar numero de pagamentos de uma despesa por responsavel
            repositorio.obterNumeroPagamentos = function (idDespesa) {

                var deferred = $q.defer();

                var query = "SELECT count(id) as count, responsavel FROM pagamento where excluido = 'false' and idDespesa = ? group by responsavel ";

                runQuery(query, [idDespesa], function (response) {
                    console.log("sucesso ao buscar pagamentos");
                    deferred.resolve(response);
                }, function (error) {
                    console.log("erro ao buscar pagamentos: " + error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            //somar pagamentos por status
            repositorio.somarPagamentosCasalPorStatus = function(status){

                var deferred = $q.defer();
                var query = "SELECT SUM(CAST(valor as decimal)) as valor FROM pagamento WHERE status = ?" ;
                
                runQuery(query, [status], function (response) {                    
                                        
                    console.log("somarPagamentosCasalPorStatus sucesso!!!");                    
                    deferred.resolve(response.rows.item(0).valor);
                    
                }, function (error) {

                    console.log("somarPagamentosCasalPorStatus =>" + error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            //somar pagamentos por responsavel e status
            repositorio.somarPagamentosPorResponsavelPorStatus = function(responsavel, status){

                var deferred = $q.defer();                
                var query = "SELECT SUM(CAST(valor as decimal)) as valor FROM pagamento WHERE status = ? AND responsavel = ?";                
                
                runQuery(query, [status, responsavel], function (response) {                    
                    deferred.resolve(response.rows.item(0).valor);                                  
                    console.log("somarPagamentosPorResponsavelPorStatus sucesso!!!");                        
                }, function (error) {
                    console.log("somarPagamentosPorResponsavelPorStatus =>" + error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }          

        })

        .service('UsuarioRepositorio', function ($cordovaSQLite, $q, $ionicPlatform) {

            var repositorio = this;
            var db;

            //inicializa banco de dados
            repositorio.initDB = function () {
                $ionicPlatform.ready(function () {

                    db = $cordovaSQLite.openDB({ name: "myappDB.db", iosDatabaseLocation: 'default' });
                    var query = "CREATE TABLE IF NOT EXISTS usuario (id integer primary key autoincrement, login string ," +
                        "senha string, token string)";
                    runQuery(query, [], function (res) {
                        console.log("tabela usuario criada ");
                    }, function (err) {
                        console.log(err);
                    });
                }.bind(this));
            }

            //executa query
            function runQuery(query, dataArray, successCb, errorCb) {
                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, dataArray).then(function (res) {
                        successCb(res);
                    }, function (err) {
                        errorCb(err);
                    });
                }.bind(this));
            }

            //buscar usuario
            repositorio.getUsuario = function () {
                var deferred = $q.defer();
                console.log('Buscando usuario');

                var query = "SELECT * FROM usuario";
                runQuery(query, [], function (response) {
                    //Success Callback
                    console.log(response);
                    deferred.resolve(response);
                }, function (error) {
                    //Error Callback
                    console.log(error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            //insere e atualiza lista de pagamentos
            repositorio.salvarUsuario = function (usuario, callback) {

                db.transaction(function () {

                    var query = "INSERT OR REPLACE INTO usuario (login, senha, token) VALUES (?,?,?)";

                    runQuery(query, [usuario.login, usuario.senha, usuario.token],
                        function (response) {
                            //Success Callback
                            console.log(response);
                        }, function (error) {
                            //Error Callback
                            console.log(error);
                        });

                }, function (error) {
                    console.log('Erro ao cadastrar usuario: ' + error.message);
                    callback();
                }, function () {
                    console.log('sucesso ao cadastrar usuario...');
                    callback();
                });
            }

            //remover usuário
            repositorio.deletarUsuario = function () {

                var deferred = $q.defer();

                var query = "Delete from usuario";
                runQuery(query, [],
                    function (response) {
                        //Success Callback
                        console.log(response);
                        deferred.resolve(response);

                    }, function (error) {
                        //Error Callback
                        console.log(error);
                        deferred.reject(error);
                    });

                return deferred.promise;

            }

        })

        .service('CasalRepositorio', function ($cordovaSQLite, $q, $ionicPlatform) {
            var repositorio = this;
            var db;

            //executa query
            function runQuery(query, dataArray, successCb, errorCb) {
                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, dataArray).then(function (res) {
                        successCb(res);
                    }, function (err) {
                        errorCb(err);
                    });
                }.bind(this));
            }

            //inicializa banco de dados
            repositorio.initDB = function () {
                $ionicPlatform.ready(function () {

                    db = $cordovaSQLite.openDB({ name: "myappDB.db", iosDatabaseLocation: 'default' });
                    var query = "CREATE TABLE IF NOT EXISTS casal (id integer primary key autoincrement, nomeNoivo string ," +
                        "nomeNoiva string, dataCasamento datetime, enderecoIgreja string, usuarioLogin string)";
                    runQuery(query, [], function (res) {
                        console.log("tabela casal criada ");
                    }, function (err) {
                        console.log(err);
                    });
                }.bind(this));
            }

            //insere ou atualiza casal
            repositorio.salvarCasal = function (casal, callback) {

                db.transaction(function () {

                    var query = "INSERT OR REPLACE INTO casal (id,nomeNoivo, nomeNoiva, dataCasamento, enderecoIgreja, "
                        + "usuarioLogin) VALUES (?,?,?,?,?,?)";

                    runQuery(query, [casal.id,casal.nomeNoivo, casal.nomeNoiva, casal.dataCasamento, casal.enderecoIgreja, casal.usuarioLogin],
                        function (response) {
                            //Success Callback
                            console.log(response);
                        }, function (error) {
                            //Error Callback
                            console.log(error);
                        });

                }, function (error) {
                    console.log('Erro ao cadastrar usuario: ' + error.message);
                    callback();
                }, function () {
                    console.log('sucesso ao cadastrar usuario...');
                    callback();
                });
            }

            //buscar Casal
            repositorio.getCasal = function () {
                var deferred = $q.defer();
                console.log('Buscando casal');

                var query = "SELECT * FROM casal";
                runQuery(query, [], function (response) {
                    //Success Callback
                    console.log(response);
                    deferred.resolve(response);
                }, function (error) {
                    //Error Callback
                    console.log(error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            //remover casal
            repositorio.deletarCasal = function () {

                var deferred = $q.defer();

                var query = "Delete from casal";
                runQuery(query, [],
                    function (response) {
                        //Success Callback
                        console.log(response);
                        deferred.resolve(response);

                    }, function (error) {
                        //Error Callback
                        console.log(error);
                        deferred.reject(error);
                    });

                return deferred.promise;

            }

        });
})();