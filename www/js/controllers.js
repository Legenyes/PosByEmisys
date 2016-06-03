angular.module('starter.controllers', ['ngCart'])

        .controller('BasketCtrl', function ($scope, ngCart) {
            $scope.products = [];
            $scope.productPerRow = 4;

            $scope.loadProducts = function () {
                for (var i = 0; i < 16; i++) {
                    $product = {
                        'id': i,
                        'name': 'Bière' + i,
                        'orderAvailable': '1',
                        'isOnSite': '1',
                        'price': (0.33 * i) + 1,
                        'picture': 'http://fakeimg.pl/200x200/?text=' + 'Bière' + i
                    };
                    $scope.products.push($product);
                }
            }

            $scope.range = function (min, max, step) {
                step = step || 1;
                var input = [];
                for (var i = min; i <= max; i += step) {
                    input.push(i);
                }
                return input;
            };

            $scope.openPopover = function ($event) {
                console.log('etest');
            };
            
            $scope.refreshBasketScroll = function () {
                var height = window.innerHeight;
                var basket_height = height - 250;
                var basketObj = document.getElementById('basketScroll');
                basketObj.style.height = basket_height+"px";
            };
            
            $scope.refreshCatalogScroll = function () {
                var height = window.innerHeight;
                var catalog_height = height - 132;
                var catalogObj = document.getElementById('catalogScroll');
                catalogObj.style.height = catalog_height+"px";
            };
            
           
            
            $scope.emptyBasket = function () {
                ngCart.empty();
            }

            ngCart.setShipping(0);
            ngCart.setTaxRate(21);
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
