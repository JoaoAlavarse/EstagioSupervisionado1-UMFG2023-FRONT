let app = angular.module('myApp', ['ui.router', 'cp.ngConfirm']);

app.controller('ctrlGlobal', function($scope, $http, $ngConfirm){
    //logout
    $scope.logout = function(){
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
                    action: function(){
                        localStorage.removeItem('@token');
                        window.location.reload();
                    }
                }
            }
        })
    }
})

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    let token = localStorage.getItem('@token');
    if(token == null){
        window.location.href = '/sbadmin/login.html';
    }
 
    $stateProvider
        .state('home', {
            url:'/',
            template: '<h3>Home</h3>'
        })
        .state('about', {
            url:'/about',
            template: '<h3>About</h3>'
        })
        .state('funcionarios', {
            url:'/funcionarios',
            templateUrl: './pages/funcionarios/grid.html',
            controller: function($scope, $http, $ngConfirm){


                $scope.formatarData = function (milissegundos) {
                    var data = new Date(milissegundos);
                    return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                };

                $scope.formatarDataParaServidor = function() {
                    var data = new Date($scope.item.birth_date);
                    var dataFormatada = data.getFullYear() + '-' +
                                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                
                //listar dados
                $http.get('http://localhost:8080/employee', {
                    headers: {
                        'Authorization': 'Bearer ' + token},        
                })
                .then(function(response) {
                    console.log(response)
                    $scope.grid = response.data;
                })

                
                $scope.filter = function(status) {
                    var url = 'http://localhost:8080/employee';
                    
                    if (status === 'ativo' || status === 'inativo') {
                        $http.get(url, {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                        })
                        .then(function(response) {
                            console.log(response);
                            $scope.grid = response.data.filter(function(employee) {
                                return employee.status === (status === 'ativo' ? 'ATIVO' : 'INATIVO');
                            });
                        });
                    } else {
                        window.location.reload();
                    }
                };

                //deletar item
                $scope.del = function(k, i){
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
                                action: function(){
                                    
                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();   

                                    $.ajax({
                                        url: 'http://localhost:8080/employee/' + encodeURIComponent(i.id_employee),
                                        type: 'DELETE',
                                        headers: {'Authorization': 'Bearer ' + token}, 
                                        success: function(data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
                                           alert("Funcionario não pôde ser excluido")
                                        }
                                    });
                                }
                            }
                        }
                    })
                }

                //função para adicionar e editar dados
                $scope.send = function(k, i){

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
                                action: function(scope, button){

                                    let ids = (k == 'add') ? '' : '/'+i.id_employee;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/employee'+ids,
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
                                        headers: {'Authorization': 'Bearer ' + token}, 
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function() {
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
            url:'/recurso',
            templateUrl: './pages/recursos/grid.html',
            controller: function($scope, $http, $ngConfirm){

                $scope.formatarData = function (milissegundos) {
                    var data = new Date(milissegundos);
                    return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                };

                $scope.formatarDataParaServidor = function() {
                    var data = new Date($scope.item.birth_date);
                    var dataFormatada = data.getFullYear() + '-' +
                                        ('0' + (data.getMonth() + 1)).slice(-2) + '-' +
                                        ('0' + data.getDate()).slice(-2);
                    $scope.item.birth_date = dataFormatada;
                };

                $scope.filter = function(tipo) {
                    var url = 'http://localhost:8080/resource';                           
                    if (tipo === 'sem-filtro') {
                        window.location.reload();
                    } else {
                        $http.get(url, {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                        })
                        .then(function(response) {
                            console.log(response);
                            $scope.grid = response.data.filter(function(resource) {
                                return resource.type === tipo;
                            });
                        });
                    }
                };
                
                
                //listar dados
                $http.get('http://localhost:8080/resource', {
                    headers: {
                        'Authorization': 'Bearer ' + token},        
                })
                .then(function(response) {
                    console.log("teste" + response)
                    $scope.grid = response.data;
                })


                //deletar item
                $scope.del = function(k, i){
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
                                action: function(){
                                    
                                    $scope.grid.splice(k, 1);
                                    $scope.$apply();   

                                    $.ajax({
                                        url: 'http://localhost:8080/resource/' + encodeURIComponent(i.id_resource),
                                        type: 'DELETE',
                                        headers: {'Authorization': 'Bearer ' + token}, 
                                        success: function(data) {
                                            console.log('Delete bem-sucedido:', data);
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
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
                $scope.send = function(k, i){

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
                                action: function(scope, button){

                                    let ids = (k == 'add') ? '' : '/'+i.id_resource;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/resource'+ids,
                                        data: JSON.stringify({
                                            "name": data.name,
                                            "brand": data.brand,
                                            "quantity": data.quantity,
                                            "type": data.type,
                                            "purchase": data.purchase,
                                            "observation": data.observation
                                          }),
                                        headers: {'Authorization': 'Bearer ' + token}, 
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function() {
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
            url:'/obra',
            templateUrl: './pages/obrasM/grid.html',
            controller: function($scope, $http, $ngConfirm){
                
                //listar dados
                $http.get('./api/obras.php?list')
                .then(function(response) {
                    $scope.grid = response.data;
                });

                //deletar item
                $scope.del = function(k, i){
           
                    // $ngConfirm({
                    //     title: 'Atenção',
                    //     content: 'Tem certeza que desejar remover este item?',
                    //     scope: $scope,
                    //     buttons: {
                    //         not: {
                    //             text: 'Não',
                    //             btnClass: 'btn-danger'
                    //         },
                    //         yes: {
                    //             text: 'Sim',
                    //             btnClass: 'btn-primary',
                    //             action: function(){
                                    
                    //                 $scope.grid.splice(k, 1);
                    //                 $scope.$apply();   

                    //                 $.get('./api/obras.php?del='+i.id)
                    //                 .then(function(){
                    //                     $.alert('Registro deletado com sucesso.');
                    //                 })
                    //             }
                    //         }
                    //     }
                    // })
                }

                //função para adicionar e editar dados
                $scope.send = function(k, i){

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar User' : 'Atualizar User',
                        contentUrl: './pages/obrasM/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function(scope, button){

                                    let ids = (k == 'add') ? '' : '?id='+i.id;
                                    let data = $scope.item;
                                    $.post('./api/users.php' + ids, data, function(rs){
                                        
                                        $('.msg').text(rs.msg).removeClass('alert-danger');

                                        if(rs.status == 200){
                                            $('.msg').addClass('alert alert-success');

                                            if(k == 'add'){
                                                console.log($scope.item)
                                                $scope.grid.push($scope.item);
                                            } else {
                                                $scope.grid[k] = $scope.item;
                                            }
                                           
                                            $scope.$apply();
                                            setTimeout(function(){
                                                $('.ng-confirm').remove();
                                            }, 1000)
                                            
                                        } else {
                                            $('.msg').addClass('alert alert-danger');
                                            return false
                                        }
                                        
                                    }, "json");

                                    return false

                                }
                            }
                        }
                    })
                }
            }
        })

        .state('construct', {
            url:'/construct',
            templateUrl: './pages/obras/grid.html',
            controller: function($scope, $http, $ngConfirm){

                $scope.getCep = function(){
                    $.getJSON("https://viacep.com.br/ws/" + $scope.item.cep + "/json/?callback=?", function(dados) {
                        $scope.item.endereco = dados.logradouro;
                        $scope.item.cidade = dados.localidade;
                        $scope.item.uf = dados.uf;
                    })
                }


                
                //listar dados
                $http.get('http://localhost:8080/employee')
                .then(function(response) {
                    console.log(response)
                    $scope.grid = response.data;
                });


                //deletar item
                $scope.del = function(k, i){

                        $.ajax({
                            url: 'http://localhost:8080/employeeemployeeemployee/'+i.id_employee,
                            type: 'DELETE',
                            success: function(data) {
                              //play with data
                            }
                          });
           
                    // $ngConfirm({
                    //     title: 'Atenção',
                    //     content: 'Tem certeza que desejar remover este item?',
                    //     scope: $scope,
                    //     buttons: {
                    //         not: {
                    //             text: 'Não',
                    //             btnClass: 'btn-danger'
                    //         },
                    //         yes: {
                    //             text: 'Sim',
                    //             btnClass: 'btn-primary',
                    //             action: function(){
                                    
                    //                 $scope.grid.splice(k, 1);
                    //                 $scope.$apply();   

                    //                 $.ajax('http://localhost:8080/employee/'+i.id_employee,{
                    //                     type : 'DELETE'
                    //                     })
                    //                 .then(function(){
                    //                     $.alert('Registro deletado com sucesso.');
                    //                 })
                    //             }
                    //         }
                    //     }
                    // })
                }

                //função para adicionar e editar dados
                $scope.send = function(k, i){

                    $scope.item = angular.copy(i);

                    $ngConfirm({
                        title: (k == 'add') ? 'Cadastrar Pessoa' : 'Atualizar Pessoa',
                        contentUrl: './pages/obras/form.html',
                        scope: $scope,
                        typeAnimed: true,
                        closeIcon: true,
                        theme: 'dark',
                        buttons: {
                            yes: {
                                text: (k == 'add') ? 'Salvar' : 'Editar',
                                btnClass: 'btn-primary',
                                action: function(scope, button){

                                    let ids = (k == 'add') ? '' : '/'+i.id_employee;
                                    let data = $scope.item;
                                    let methotd = (k == 'add') ? 'POST' : 'PUT';

                                    $.ajax({
                                        type: methotd,
                                        url: 'http://localhost:8080/employee'+ids,
                                        data: JSON.stringify({
                                            "name": data.name,
                                            "cpf": data.cpf,
                                            "phone": "string",
                                            "address": "string",
                                            "charge": "string",
                                            "gender": 0,
                                            "birth_date": "2023-11-18T00:36:41.079Z"
                                          }),
                                        contentType: "application/json",
                                        dataType: 'json',
                                        statusCode: {
                                            200: function() {
                                                msg.text('Login efeuado com sucesso').addClass('alert alert-sucess');
                                                setTimeout(function(){
                                                    localStorage.setItem('@token', 'true');
                                                    window.location.href = "./";
                                                }, 2000)
                                            },
                                            401: function() {
                                                msg.addClass('alert alert-danger');
                                                loading.toggleClass('open');
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