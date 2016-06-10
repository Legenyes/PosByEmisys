'use strict';

angular.module('nfcPlugin', ['nfcPlugin.directives'])

        .config([function () {

            }])

        .provider('$nfcPlugin', function () {
            this.$get = function () {
            };
        })

        .run(['$rootScope', 'nfcPlugin', function ($rootScope, nfcPlugin) {

            }])

        .service('ngCart', ['$rootScope', 'ngCartItem', 'store', function ($rootScope, ngCartItem, store) {



                this.addItem = function (id, name, price, quantity, data) {

                    var inCart = this.getItemById(id);

                    if (typeof inCart === 'object') {
                        //Update quantity of an item if it's already in the cart
                        inCart.setQuantity(quantity, true);
                    } else {
                        var newItem = new ngCartItem(id, name, price, quantity, data);
                        this.$cart.items.push(newItem);
                        $rootScope.$broadcast('ngCart:itemAdded', newItem);
                    }

                    $rootScope.$broadcast('ngCart:change', {});
                };
            }])

        .controller('NfcController', ['$scope', 'nfcPlugin', function ($scope, nfcPlugin) {
                $scope.nfcPlugin = nfcPlugin;

            }])

        .value('version', '0.0.1');

