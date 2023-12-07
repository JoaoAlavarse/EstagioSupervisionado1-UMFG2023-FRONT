

let app = angular.module('myApp', ['ui.router', 'cp.ngConfirm']);


app.controller('ctrlGlobal', function ($scope, $http, $ngConfirm) {
    //logout
    $scope.logout = function () {
        $ngConfirm({
            title: 'Atenção',
            content: 'Tem certeza que desejar sair do sistema?',
            scope: $scope,
            buttons: {
                not: {
                    text: 'Não',
                    btnClass: 'btn-danger'
                },
                yes: {
                    text: 'Sim',
                    btnClass: 'btn-primary',
                    action: function () {
                        localStorage.removeItem('@token');
                        window.location.reload();
                    }
                }
            }
        })
    }
})

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    let token = localStorage.getItem('@token');
    if (token == null) {
        window.location.href = '/sbadmin/login.html';
    }

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: './pages/home/home.html'
        })
        .state('about', {
            url: '/about',
            template: '<h3>About</h3>'
        })
        .state('funcionarios', {
            url: '/funcionarios',
            templateUrl: './pages/funcionarios/grid.html',
            controller: function ($scope, $http, $ngConfirm) {


                $scope.formatarData = function (milissegundos) {
                    var data = new Date(milissegundos);
                    return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                };

                $scope.formatarDataParaServidor = function () {
                    var data = new Date($scope.item.birth_date);
                    var dataFormatada = data.getFullYear() + '-' +
                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                $scope.generatePDF = function () {
                    var currentDate = new Date();
                    var formattedDate = currentDate.toLocaleDateString();
                    document.getElementById('dataGeracao').innerText = formattedDate;
                    window.print();
                }


                //listar dados
                $http.get('http://localhost:8080/employee', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(function (response) {
                        console.log("teste" + response)
                        $scope.grid = response.data;
                    })


                $scope.filter = function (status) {
                    var url = 'http://localhost:8080/employee';

                    if (status === 'ativo' || status === 'inativo') {
                        $http.get(url, {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                        })
                            .then(function (response) {
                                console.log(response);
                                $scope.grid = response.data.filter(function (employee) {
                                    return employee.status === (status === 'ativo' ? 'ATIVO' : 'INATIVO');
                                });
                            });
                    } else {
                        window.location.reload();
                    }
                };

                //deletar item
                $scope.del = function (k, i) {
                    $ngConfirm({
                        title: 'Atenção',
                        content: 'Tem certeza que desejar remover este item?',
                        scope: $scope,
                        buttons: {
                            not: {
                                text: 'Não',
                                btnClass: 'btn-danger'
                            },
                            yes: {
                                text: 'Sim',
                                btnClass: 'btn-primary',
                                action: function () {

                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();

                                    $.ajax({
                                        url: 'http://localhost:8080/employee/' + encodeURIComponent(i.id_employee),
                                        type: 'DELETE',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        success: function (data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            alert("Funcionario não pôde ser excluido")
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function (k, i) {

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Funcionario' : 'Atualizar Funcionario',
                        contentUrl: './pages/funcionarios/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function (scope, button) {

                                    let ids = (k == 'add') ? '' : '/' + i.id_employee;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/employee' + ids,
                                        data: JSON.stringify({
                                            "name": data.name,
                                            "cpf": data.cpf,
                                            "phone": data.phone,
                                            "address": data.address,
                                            "charge": data.charge,
                                            "gender": data.gender,
                                            "birth_date": data.birth_date,
                                            "status": data.status
                                        }),
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function () {
                                                // Lida com a resposta de sucesso
                                                console.log('Atualização bem-sucedida:');

                                                // Recarrega a página
                                                window.location.reload();
                                            }
                                        },
                                    })


                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })

        .state('recurso', {
            url: '/recurso',
            templateUrl: './pages/recursos/grid.html',
            controller: function ($scope, $http, $ngConfirm) {

                $scope.generatePDF = function () {
                    var currentDate = new Date();
                    var formattedDate = currentDate.toLocaleDateString();
                    document.getElementById('dataGeracao').innerText = formattedDate;
                    window.print();
                }

                $scope.formatarData = function (milissegundos) {
                    var data = new Date(milissegundos);
                    return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                };

                $scope.formatarDataParaServidor = function () {
                    var data = new Date($scope.item.birth_date);
                    var dataFormatada = data.getFullYear() + '-' +
                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                $scope.filter = function (tipo) {
                    var url = 'http://localhost:8080/resource';
                    if (tipo === 'sem-filtro') {
                        window.location.reload();
                    } else {
                        $http.get(url, {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                        })
                            .then(function (response) {
                                console.log(response);
                                $scope.grid = response.data.filter(function (resource) {
                                    return resource.type === tipo;
                                });
                            });
                    }
                };


                //listar dados
                $http.get('http://localhost:8080/resource', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(function (response) {
                        console.log("teste" + response)
                        $scope.grid = response.data;
                    })


                //deletar item
                $scope.del = function (k, i) {
                    $ngConfirm({
                        title: 'Atenção',
                        content: 'Tem certeza que desejar remover este item?',
                        scope: $scope,
                        buttons: {
                            not: {
                                text: 'Não',
                                btnClass: 'btn-danger'
                            },
                            yes: {
                                text: 'Sim',
                                btnClass: 'btn-primary',
                                action: function () {

                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();

                                    $.ajax({
                                        url: 'http://localhost:8080/resource/' + encodeURIComponent(i.id_resource),
                                        type: 'DELETE',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        success: function (data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            alert("Recurso não pôde ser excluido")
                                            window.location.reload();
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function (k, i) {

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Recurso' : 'Atualizar Recurso',
                        contentUrl: './pages/recursos/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function (scope, button) {

                                    let ids = (k == 'add') ? '' : '/' + i.id_resource;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/resource' + ids,
                                        data: JSON.stringify({
                                            "name": data.name,
                                            "brand": data.brand,
                                            "quantity": data.quantity,
                                            "type": data.type,
                                            "purchase": data.purchase,
                                            "observation": data.observation
                                        }),
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function () {
                                                // Lida com a resposta de sucesso
                                                console.log('Atualização bem-sucedida:');

                                                // Recarrega a página
                                                window.location.reload();
                                            }
                                        },
                                    })


                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })

        .state('obra', {
            url: '/obra',
            templateUrl: './pages/obras/grid.html',
            controller: function ($scope, $http, $ngConfirm) {

                $scope.generatePDF = function () {
                    var currentDate = new Date();
                    var formattedDate = currentDate.toLocaleDateString();
                    document.getElementById('dataGeracao').innerText = formattedDate;
                    window.print();
                }

                $scope.formatarData = function (milissegundos) {
                    var data = new Date(milissegundos);
                    return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                };

                $scope.formatarDataParaServidor = function () {
                    var data = new Date($scope.item.start_date);
                    var dataFormatada = data.getFullYear() + '-' +
                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                $scope.formatarDataParaServidor = function () {
                    var data = new Date($scope.item.delivery_date);
                    var dataFormatada = data.getFullYear() + '-' +
                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                $scope.filter = function (tipo) {
                    var url = 'http://localhost:8080/construction';
                    if (tipo === 'sem-filtro') {
                        window.location.reload();
                    } else {
                        $http.get(url, {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                        })
                            .then(function (response) {
                                console.log(response);
                                $scope.grid = response.data.filter(function (construction) {
                                    return construction.status === tipo;
                                });
                            });
                    }
                };


                //listar dados
                $http.get('http://localhost:8080/construction', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(function (response) {
                        console.log("teste" + response)
                        $scope.grid = response.data;
                    })

                //deletar item
                $scope.del = function (k, i) {
                    $ngConfirm({
                        title: 'Atenção',
                        content: 'Tem certeza que desejar remover este item?',
                        scope: $scope,
                        buttons: {
                            not: {
                                text: 'Não',
                                btnClass: 'btn-danger'
                            },
                            yes: {
                                text: 'Sim',
                                btnClass: 'btn-primary',
                                action: function () {

                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();

                                    $.ajax({
                                        url: 'http://localhost:8080/construction/' + encodeURIComponent(i.id_construction),
                                        type: 'DELETE',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        success: function (data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            alert("Obra não pôde ser excluido")
                                            window.location.reload();
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function (k, i) {

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Obra' : 'Atualizar Obra',
                        contentUrl: './pages/obras/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function (scope, button) {

                                    let ids = (k == 'add') ? '' : '/' + i.id_construction;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/construction' + ids,
                                        data: JSON.stringify({
                                            "company": data.company,
                                            "cnpj": data.cnpj,
                                            "start_date": data.start_date,
                                            "delivery_date": data.delivery_date,
                                            "address": data.address,
                                            "status": data.status
                                        }),
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function () {
                                                // Lida com a resposta de sucesso
                                                console.log('Atualização bem-sucedida:');

                                                // Recarrega a página
                                                window.location.reload();
                                            }
                                        },
                                    })


                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })

        .state('alocacao', {
            url: '/alocacao',
            templateUrl: './pages/alocacao/grid.html',
            controller: function ($scope, $http, $ngConfirm) {


                $scope.formatarData = function (milissegundos) {
                    var data = new Date(milissegundos);
                    return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                };

                $scope.formatarDataParaServidor = function () {
                    var data = new Date($scope.item.allocation_date);
                    var dataFormatada = data.getFullYear() + '-' +
                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                $scope.formatarDataParaServidor = function () {
                    var data = new Date($scope.item.devolution_date);
                    var dataFormatada = data.getFullYear() + '-' +
                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };


                $scope.showObraDetails = function (index, item) {
                    // Faz uma requisição GET para obter os dados da obra
                    $.ajax({
                        type: 'GET',
                        url: 'http://localhost:8080/construction/' + item.id_construction, // Substitua pela sua URL correta
                        headers: { 'Authorization': 'Bearer ' + token },
                        dataType: 'json',
                        success: function (response) {
                            // Verifica se a resposta contém dados válidos
                            if (response && response.id_construction) {
                                // Abre o formulário com os dados preenchidos
                                $ngConfirm({
                                    title: 'Detalhes da Obra',
                                    contentUrl: './pages/obras/form.html',
                                    scope: $scope,
                                    typeAnimed: true,
                                    closeIcon: true,
                                    theme: 'dark',
                                    buttons: {
                                        close: {
                                            text: 'Fechar',
                                            btnClass: 'btn-secondary',
                                            action: function (scope, button) {
                                                // Nenhuma ação necessária ao fechar o formulário
                                            }
                                        }
                                    },
                                    onScopeReady: function (scope) {
                                        // Define os dados da obra no escopo
                                        scope.item = response;
                                    }
                                });
                            } else {
                                console.error('Erro ao obter dados da obra.');
                            }
                        },
                        error: function () {
                            console.error('Erro na requisição GET para obter dados da obra.');
                        }
                    });
                };


                $scope.showRecursoDetails = function (index, item) {
                    // Faz uma requisição GET para obter os dados da obra
                    $.ajax({
                        type: 'GET',
                        url: 'http://localhost:8080/resource/' + item.id_resource, // Substitua pela sua URL correta
                        headers: { 'Authorization': 'Bearer ' + token },
                        dataType: 'json',
                        success: function (response) {
                            // Verifica se a resposta contém dados válidos
                            if (response && response.id_resource) {
                                // Abre o formulário com os dados preenchidos
                                $ngConfirm({
                                    title: 'Detalhes da Obra',
                                    contentUrl: './pages/recursos/form.html',
                                    scope: $scope,
                                    typeAnimed: true,
                                    closeIcon: true,
                                    theme: 'dark',
                                    buttons: {
                                        close: {
                                            text: 'Fechar',
                                            btnClass: 'btn-secondary',
                                            action: function (scope, button) {
                                                // Nenhuma ação necessária ao fechar o formulário
                                            }
                                        }
                                    },
                                    onScopeReady: function (scope) {
                                        // Define os dados da obra no escopo
                                        scope.item = response;
                                    }
                                });
                            } else {
                                console.error('Erro ao obter dados da obra.');
                            }
                        },
                        error: function () {
                            console.error('Erro na requisição GET para obter dados da obra.');
                        }
                    });
                };


                //listar dados
                $http.get('http://localhost:8080/allocation', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(function (response) {
                        console.log("teste" + response)
                        $scope.grid = response.data;
                    })


                //deletar item
                $scope.del = function (k, i) {
                    $ngConfirm({
                        title: 'Atenção',
                        content: 'Tem certeza que desejar remover este item?',
                        scope: $scope,
                        buttons: {
                            not: {
                                text: 'Não',
                                btnClass: 'btn-danger'
                            },
                            yes: {
                                text: 'Sim',
                                btnClass: 'btn-primary',
                                action: function () {

                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();

                                    $.ajax({
                                        url: 'http://localhost:8080/allocation/' + encodeURIComponent(i.id_allocation),
                                        type: 'DELETE',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        success: function (data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            alert("Alocação não pôde ser excluido")
                                            window.location.reload();
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function (k, i) {

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Alocação' : 'Atualizar Alocação',
                        contentUrl: './pages/alocacao/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function (scope, button) {

                                    let ids = (k == 'add') ? '' : '/' + i.id_allocation;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/allocation' + ids,
                                        data: JSON.stringify({
                                            "id_construction": data.id_construction,
                                            "id_resource": data.id_resource,
                                            "allocation_date": data.allocation_date,
                                            "devolution_date": data.devolution_date
                                        }),
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function () {
                                                // Lida com a resposta de sucesso
                                                console.log('Atualização bem-sucedida:');

                                                // Recarrega a página
                                                window.location.reload();
                                            }
                                        },
                                    })


                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })
        .state('funcionarioObra', {
            url: '/funcionarioObra',
            templateUrl: './pages/funcionarioObra/grid.html',
            controller: function ($scope, $http, $ngConfirm) {

                $scope.showEmployeeDetails = function (index, item) {
                    // Faz uma requisição GET para obter os dados do id_employee
                    $.ajax({
                        type: 'GET',
                        url: 'http://localhost:8080/employee/' + item.id_employee, // Substitua pela sua URL correta
                        headers: { 'Authorization': 'Bearer ' + token },
                        dataType: 'json',
                        success: function (response) {
                            // Verifica se a resposta contém dados válidos
                            if (response && response.id_employee) {
                                // Abre o formulário com os dados preenchidos
                                $ngConfirm({
                                    title: 'Detalhes do Funcionário',
                                    contentUrl: './pages/funcionarios/form.html',
                                    scope: $scope,
                                    typeAnimed: true,
                                    closeIcon: true,
                                    theme: 'dark',
                                    buttons: {
                                        close: {
                                            text: 'Fechar',
                                            btnClass: 'btn-secondary',
                                            action: function (scope, button) {
                                                // Nenhuma ação necessária ao fechar o formulário
                                            }
                                        }
                                    },
                                    onScopeReady: function (scope) {
                                        // Define os dados do funcionário no escopo
                                        scope.item = response;
                                    }
                                });
                            } else {
                                console.error('Erro ao obter dados do funcionário.');
                            }
                        },
                        error: function () {
                            console.error('Erro na requisição GET para obter dados do funcionário.');
                        }
                    });
                };

                $scope.showObraDetails = function (index, item) {
                    // Faz uma requisição GET para obter os dados da obra
                    $.ajax({
                        type: 'GET',
                        url: 'http://localhost:8080/construction/' + item.id_construction, // Substitua pela sua URL correta
                        headers: { 'Authorization': 'Bearer ' + token },
                        dataType: 'json',
                        success: function (response) {
                            // Verifica se a resposta contém dados válidos
                            if (response && response.id_construction) {
                                // Abre o formulário com os dados preenchidos
                                $ngConfirm({
                                    title: 'Detalhes da Obra',
                                    contentUrl: './pages/obras/form.html',
                                    scope: $scope,
                                    typeAnimed: true,
                                    closeIcon: true,
                                    theme: 'dark',
                                    buttons: {
                                        close: {
                                            text: 'Fechar',
                                            btnClass: 'btn-secondary',
                                            action: function (scope, button) {
                                                // Nenhuma ação necessária ao fechar o formulário
                                            }
                                        }
                                    },
                                    onScopeReady: function (scope) {
                                        // Define os dados da obra no escopo
                                        scope.item = response;
                                    }
                                });
                            } else {
                                console.error('Erro ao obter dados da obra.');
                            }
                        },
                        error: function () {
                            console.error('Erro na requisição GET para obter dados da obra.');
                        }
                    });
                };



                //listar dados
                $http.get('http://localhost:8080/constructionEmployee', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(function (response) {
                        console.log("teste" + response)
                        $scope.grid = response.data;
                    })


                //deletar item
                $scope.del = function (k, i) {
                    $ngConfirm({
                        title: 'Atenção',
                        content: 'Tem certeza que desejar remover este item?',
                        scope: $scope,
                        buttons: {
                            not: {
                                text: 'Não',
                                btnClass: 'btn-danger'
                            },
                            yes: {
                                text: 'Sim',
                                btnClass: 'btn-primary',
                                action: function () {

                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();

                                    $.ajax({
                                        url: 'http://localhost:8080/constructionEmployee/' + encodeURIComponent(i.id_construction_employee),
                                        type: 'DELETE',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        success: function (data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            alert("Relação não pôde ser excluido")
                                            window.location.reload();
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function (k, i) {

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Alocação' : 'Atualizar Alocação',
                        contentUrl: './pages/funcionarioObra/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function (scope, button) {

                                    let ids = (k == 'add') ? '' : '/' + i.id_construction_employee;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/constructionEmployee' + ids,
                                        data: JSON.stringify({
                                            "id_construction": data.id_construction,
                                            "id_employee": data.id_employee
                                        }),
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function () {
                                                // Lida com a resposta de sucesso
                                                console.log('Atualização bem-sucedida:');

                                                // Recarrega a página
                                                window.location.reload();
                                            }
                                        },
                                    })


                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })
        .state('usuarios', {
            url: '/usuarios',
            templateUrl: './pages/users/grid.html',
            controller: function ($scope, $http, $ngConfirm) {

                $http.get('http://localhost:8080/user', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(function (response) {
                        console.log("teste" + response)
                        $scope.grid = response.data;
                    })

                //deletar item
                $scope.del = function (k, i) {
                    $ngConfirm({
                        title: 'Atenção',
                        content: 'Tem certeza que desejar remover este item?',
                        scope: $scope,
                        buttons: {
                            not: {
                                text: 'Não',
                                btnClass: 'btn-danger'
                            },
                            yes: {
                                text: 'Sim',
                                btnClass: 'btn-primary',
                                action: function () {

                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();

                                    $.ajax({
                                        url: 'http://localhost:8080/user/' + encodeURIComponent(i.id_user),
                                        type: 'DELETE',
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        success: function (data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            alert("Usuário não pôde ser excluido")
                                            window.location.reload();
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function (k, i) {

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Usuário' : 'Atualizar Usuário',
                        contentUrl: './pages/users/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function (scope, button) {

                                    let ids = (k == 'add') ? '' : '/' + i.id_user;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/user' + ids,
                                        data: JSON.stringify({
                                            "email": data.email,
                                            "password": data.password
                                        }),
                                        headers: { 'Authorization': 'Bearer ' + token },
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function () {
                                                // Lida com a resposta de sucesso
                                                console.log('Atualização bem-sucedida:');

                                                // Recarrega a página
                                                window.location.reload();
                                            }
                                        },
                                    })


                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })
}]);