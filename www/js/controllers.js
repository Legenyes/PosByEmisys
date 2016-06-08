angular.module('starter.controllers', ['ngCart', 'ionic'])

        .controller('BasketCtrl', function ($scope, ngCart, $ionicModal, $http) {
            $scope.products = [];
            $scope.productPerRow = 4;
            $scope.aPayer = ngCart.totalCost();
            $scope.dejaPaye = 0.00;
            $scope.resteAPayer = $scope.aPayer - $scope.dejaPaye;
            $scope.customers = [];
            
            
            $scope.loadProducts = function () {
                var url = "http://lasemo.leveque.ovh/api/formules/list?project=9&is_on_site=1";
                $http.get(url).
                        success(function (data, status, headers, config) {
                            var log = [];
                            angular.forEach(data, function (value, key) {
                                $product = {
                                    'id': value.id,
                                    'name': value.name,
                                    'isOnSite': value.is_on_site,
                                    'price': value.price_with_vat,
                                    'picture': 'http://fakeimg.pl/200x200/?text=' + value.name
                                };
                                this.push($product);
                            }, $scope.products);
                        }).
                        error(function (data, status, headers, config) {
                            console.log(data);
                        });
            }

            $scope.$on('ngCart:change', function (event, data) {
                $scope.aPayer = ngCart.totalCost();
                $scope.resteAPayer = $scope.aPayer - $scope.dejaPaye;
            });

            $scope.range = function (min, max, step) {
                step = step || 1;
                var input = [];
                for (var i = min; i <= max; i += step) {
                    input.push(i);
                }
                return input;
            };

            $scope.refreshBasketScroll = function () {
                var height = window.innerHeight;
                var basket_height = height - 220;
                var basketObj = document.getElementById('basketScroll');
                basketObj.style.height = basket_height + "px";
            };

            $scope.refreshCatalogScroll = function () {
                var height = window.innerHeight;
                var catalog_height = height - 110;
                var catalogObj = document.getElementById('catalogScroll');
                catalogObj.style.height = catalog_height + "px";
            };

            $scope.emptyBasket = function () {
                ngCart.empty();
            }

            $ionicModal.fromTemplateUrl('templates/modal-payment.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modalPayment = modal;
            });
            $scope.showPaymentModal = function () {
                $scope.modalPayment.show();
                inPayementProcess = true;
            };
            $scope.closeModal = function () {
                $scope.modalPayment.hide();
                inPayementProcess = false;
            };
            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modalPayment.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });

            ngCart.setShipping(0);
            ngCart.setTaxRate(0);
        })

        .controller('ChatsCtrl', function ($scope, Chats) {
            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //
            //$scope.$on('$ionicView.enter', function(e) {
            //});

            $scope.chats = Chats.all();
            $scope.remove = function (chat) {
                Chats.remove(chat);
            };
        })

        .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
            $scope.chat = Chats.get($stateParams.chatId);
        })

        .controller('SettingsCtrl', function ($scope) {
            $scope.settings = {
                enableFriends: true
            };
        });
