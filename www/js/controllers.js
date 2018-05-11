(function () {
    'use strict'

    angular
        .module('appMeuCasamento.controllers', [])

        .controller('MainCtrl', function ($scope, UsuarioRepositorio, LoginService, Backand, $ionicLoading,
            SyncDespesaFactory, SyncPagamentoFactory, CasalService, CasalRepositorio) {

            var vm = this;

            vm.login = "casamentoAnaRobson@gmail.com";
            vm.senha = "123456";
            vm.carregando = true;


            var inicializaPagina = function () {

                CasalRepositorio.initDB();
                UsuarioRepositorio.initDB();

                obterUsuario();
            }

            //obter usuario            
            var obterUsuario = function () {

                UsuarioRepositorio.getUsuario()
                    .then(function (response) {
                        if (response && response.rows && response.rows.length > 0) {

                            var usuario = {
                                senha: response.rows.item(0).senha,
                                login: response.rows.item(0).login,
                                token: response.rows.item(0).token
                            }

                            $scope.usuario = usuario;

                            //buscar casal no banco local
                            CasalRepositorio.getCasal($scope.usuario.login)
                                .then(function (response) {
                                    if (response && response.rows && response.rows.length > 0) {

                                        $scope.casal = {
                                            id: response.rows.item(0).id,
                                            nomeNoivo: response.rows.item(0).nomeNoivo,
                                            nomeNoiva: response.rows.item(0).nomeNoiva,
                                            dataCasamento: response.rows.item(0).dataCasamento,
                                            enderecoIgreja: response.rows.item(0).enderecoIgreja,
                                            usuarioLogin: response.rows.item(0).usuarioLogin
                                        }

                                        vm.usuarioLogado = true;
                                    }
                                }, function (response) {
                                    console.log('Erro ao buscar casal no serviço: ' + response.data);
                                });


                        } else {
                            vm.usuarioLogado = false;
                        }
                        vm.carregando = false;
                    });
            }

            //login
            vm.fazerLogin = function () {
                $ionicLoading.show();

                LoginService.signin(vm.login, vm.senha)
                    .then(function () {
                        onLogin();
                    }, function (error) {
                        console.log(error.error_description)
                        vm.error = error.error_description;
                    })
                    .finally(function () {
                        $ionicLoading.hide();
                    });
            }

            //dps do login
            function onLogin() {

                //gravar usuario no banco
                var usuario = {
                    login: vm.login,
                    senha: vm.senha
                }

                UsuarioRepositorio.salvarUsuario(usuario,
                    function () {
                        $scope.usuario = usuario;

                        buscarCasal(vm.login);

                    });
            }

            inicializaPagina();

            //buscar casal no serviço remoto
            var buscarCasal = function (login) {

                //buscar dados do Casal
                CasalService.buscarCasal(login)
                    .then(function (response) {

                        var dados = response.data.data;

                        if (dados.length > 0) {

                            var casal = {
                                id: dados[0].id,
                                nomeNoivo: dados[0].NomeNoivo,
                                nomeNoiva: dados[0].NomeNoiva,
                                dataCasamento: dados[0].dataCasamento,
                                enderecoIgreja: dados[0].EnderecoIgreja,
                                usuarioLogin: dados[0].usuarioLogin
                            }

                            //salvar casal                                                        
                            CasalRepositorio.salvarCasal(casal,
                                function () {
                                    $scope.casal = casal;
                                    vm.usuarioLogado = true;
                                    console.log('Sucesso ao cadastrar casal');
                                });

                        }
                    }, function (error) {
                        console.log(error);
                        console.log('Erro ao buscar casal...')
                    });

            }

        })

        .controller('MenuCtrl', function ($scope, $ionicModal, $ionicPopover, $timeout, $state,
            LoginService, UsuarioRepositorio, CasalRepositorio) {

            var vm = this;

            vm.fazerLogin = true;

            // Form data for the login modal
            $scope.loginData = {};

            var navIcons = document.getElementsByClassName('ion-navicon');
            for (var i = 0; i < navIcons.length; i++) {
                navIcons.addEventListener('click', function () {
                    this.classList.toggle('active');
                });
            }

            vm.sair = function () {

                UsuarioRepositorio.deletarUsuario()
                    .then(function () {
                        console.log("Usuário deletado com sucesso");
                        CasalRepositorio.deletarCasal()
                            .then(function () {
                                console.log("Casal deletado com sucesso");
                                ionic.Platform.exitApp();
                            })
                    });
            }
        })



        .controller('ListarDespesasCtrl', function ($state, $cordovaToast, $ionicPopup, $ionicLoading,
            $scope, DespesaService, DespesaRepositorio, $ionicGesture,
            PagamentoRepositorio, SyncDespesaFactory) {

            var vm = this;
            vm.nenhumaDespesaEncontrada = false;
            //$scope.isOnline = true;

            vm.sincronizarDados = function () {

                if ($scope.isOnline) {

                    $ionicLoading.show();

                    SyncDespesaFactory.sincronizarComBancoRemoto(callbackSucess,
                        $scope.usuario, callbackError, $scope.casal.id);
                } else {
                    buscarDespesas();
                }
            }

            var callbackSucess = function () {
                buscarDespesas();
            }

            var callbackError = function () {
                $ionicLoading.hide();
                buscarDespesas();
            }

            //carregar dados da pagina
            var iniciarPagina = function () {
                console.log('iniciando pagina...');

                DespesaRepositorio.initDB();
                PagamentoRepositorio.initDB();

                vm.sincronizarDados();
            }


            //buscar despesas no banco local
            function buscarDespesas() {
                vm.nenhumaDespesaEncontrada = false;

                DespesaRepositorio.getAllDespesas()
                    .then(listarDespesas, function (error) {
                        console.log(error);
                    });
            }

            //
            function listarDespesas(response) {

                if (response && response.rows && response.rows.length > 0) {
                    vm.despesas = [];
                    for (var i = 0; i < response.rows.length; i++) {

                        var idDespesa = response.rows.item(i).id;

                        var despesa = {
                            id: response.rows.item(i).id,
                            descricao: response.rows.item(i).descricao,
                            valor: response.rows.item(i).valor,
                            valorNoivo: response.rows.item(i).valorNoivo,
                            valorNoiva: response.rows.item(i).valorNoiva,
                            excluido: response.rows.item(i).excluido,
                            numeroPagsNoiva: 0,
                            numeroPagsNoivo: 0
                        };

                        vm.despesas.push(despesa);
                        obterNumPagamentos(idDespesa);
                    }
                } else {
                    console.log("Lista de Despesas Vazia");
                    vm.despesas = [];
                    vm.nenhumaDespesaEncontrada = true;
                }

                $ionicLoading.hide();
            }

            //buscar numero de pagamentos por despesa
            var obterNumPagamentos = function (idDespesa) {

                PagamentoRepositorio.obterNumeroPagamentos(idDespesa)
                    .then(function (response) {

                        var posDespesa = vm.despesas.map(function (x) { return x.id; }).indexOf(idDespesa);
                        var desp = vm.despesas[posDespesa];

                        if (response.rows.length > 0) {
                            desp.numeroPagsNoiva = response.rows.item(0).count;
                            if (response.rows.length > 1) {
                                desp.numeroPagsNoivo = response.rows.item(1).count;
                            }
                        }

                    });
            }

            //navegar para detalhes
            vm.detalhesPagamento = function (despesa, resp) {
                $state.go('app.listarPagamentos', { despesaSelecionada: despesa, responsavel: resp });
            }

            /*
            * if given group is the selected group, deselect it
            * else, select the given group
            */
            vm.toggleGroup = function (group) {
                if (vm.isGroupShown(group)) {
                    vm.shownGroup = null;
                } else {
                    vm.shownGroup = group;
                }
            };

            vm.isGroupShown = function (group) {
                return vm.shownGroup === group;
            };

            iniciarPagina();

        })


        .controller('ListarPagamentosCtrl', function ($stateParams, $state, PagamentoService, $ionicPopup,
            $cordovaToast, $filter, $ionicLoading, $scope, PagamentoRepositorio, SyncPagamentoFactory) {

            var vm = this;

            vm.nenhumaPagamentoEncontrado = false;
            vm.despesaSelecionada = $stateParams.despesaSelecionada;
            vm.responsavel = $stateParams.responsavel;

            vm.obterValorPorResponsavel = function(){
                if (vm.responsavel === 'noivo')
                    return vm.despesaSelecionada.valorNoivo;
                else
                    return vm.despesaSelecionada.valorNoiva;
            }

            vm.sincronizarDados = function () {

                if ($scope.isOnline) {

                    $ionicLoading.show();
                    SyncPagamentoFactory.sincronizarComBancoRemoto(callbackSucess,
                        $scope.usuario, callbackError);
                } else {
                    buscarPagamentos(vm.despesaSelecionada.id, vm.responsavel);
                }
            }

            var callbackSucess = function () {
                buscarPagamentos(vm.despesaSelecionada.id, vm.responsavel);
            }

            var callbackError = function () {
                $ionicLoading.hide();
                buscarPagamentos(vm.despesaSelecionada.id, vm.responsavel);
            }

            //buscar pagamentos no banco local
            function buscarPagamentos(idDespesa, responsavel) {
                PagamentoRepositorio.getPagamentos(idDespesa, responsavel)
                    .then(listarPagamentos, function (error) {
                        console.log(error);
                    });
            }

            //listar pagamentos na view
            function listarPagamentos(response) {

                if (response && response.rows && response.rows.length > 0) {

                    vm.nenhumaPagamentoEncontrado = false;
                    console.log("pagamentos encontrado...");

                    vm.pagamentos = [];
                    for (var i = 0; i < response.rows.length; i++) {

                        var pagamento = {
                            id: response.rows.item(i).id,
                            dataPagamento: response.rows.item(i).dataPagamento,
                            valor: response.rows.item(i).valor,
                            status: response.rows.item(i).status
                        };

                        vm.pagamentos.push(pagamento);
                    }
                } else {
                    console.log("nenhum pagamento foi encontrada");
                    vm.pagamentos = [];
                    vm.nenhumaPagamentoEncontrado = true;
                }

                $ionicLoading.hide();
            }

            vm.getStatus = function (status) {

                if (status === 1) {
                    return "Pago";
                } else if (status === 0) {
                    return "Pendente";
                }
            }

            vm.obterTitulo = function () {
                if (vm.responsavel === 'noivo') {
                    return "Pagamentos do Noivo";
                } else {
                    return "Pagamentos da Noiva";
                }
            }

            //carregar dados da pagina
            var iniciarPagina = function () {
                console.log('iniciando pagina de pagamentos...');

                if (!vm.despesaSelecionada || vm.despesaSelecionada === null)
                    $state.go('app.listarDespesas');
                else {
                    vm.nomeDespesa = vm.despesaSelecionada.descricao;
                }

                PagamentoRepositorio.initDB();
                vm.sincronizarDados();
            }

            iniciarPagina();

        })

        //LOGIN CONTROLLER
        .controller('LoginCtrl', function (Backand, $state, $rootscope, LoginService) {

            var login = this;

            function signin() {
                LoginService.signin(login.email, login.password)
                    .then(function () {
                        onLogin();
                    }, function (error) {
                        console.log(error.error_description)
                        login.error = error.error_description;
                    })
            }

            function anonymousLogin() {
                LoginService.anonymousLogin();
                onLogin();
            }

            function onLogin() {
                $rootscope.$broadcast('authorized');
                $state.go('app.listarDespesas');
                login.username = Backand.getUsername();
            }

            function signout() {
                LoginService.signout()
                    .then(function () {
                        //$state.go('tab.login');
                        $rootscope.$broadcast('logout');
                        $state.go($state.current, {}, { reload: true });
                    })

            }

            login.username = '';
            login.error = '';
            login.signin = signin;
            login.signout = signout;
            login.anonymousLogin = anonymousLogin;
        })

        .controller('DadosCasamentoCtrl', function (Backand, $state, $scope, CasalService, CasalRepositorio) {

            var vm = this;

        })

        .controller('PlanejamentoFinancasCtrl', function (PagamentoRepositorio) {

            var vm = this;
            vm.hoje = new Date();

            PagamentoRepositorio.initDB();

            vm.controleCasal = {
                pago: 0,
                pendente: 0
            }

            vm.controleNoiva = {
                pago: 0,
                pendente: 0
            }

            vm.controleNoivo = {
                pago: 0,
                pendente: 0
            }


            PagamentoRepositorio.somarPagamentosCasalPorStatus(1)
                .then(function (valor) {
                    vm.controleCasal.pago = valor;
                });

            PagamentoRepositorio.somarPagamentosCasalPorStatus(0)
                .then(function (valor) {
                    vm.controleCasal.pendente = valor;
                });

            PagamentoRepositorio.somarPagamentosPorResponsavelPorStatus('noivo', 1)
                .then(function (valor) {
                    vm.controleNoivo.pago = valor;
                });

            PagamentoRepositorio.somarPagamentosPorResponsavelPorStatus('noivo', 0)
                .then(function (valor) {
                    vm.controleNoivo.pendente = valor;
                });


            PagamentoRepositorio.somarPagamentosPorResponsavelPorStatus('noiva', 1)
                .then(function (valor) {
                    vm.controleNoiva.pago = valor;
                });

            PagamentoRepositorio.somarPagamentosPorResponsavelPorStatus('noiva', 0)
                .then(function (valor) {
                    vm.controleNoiva.pendente = valor;
                });

        });
})();