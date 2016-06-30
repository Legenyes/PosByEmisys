'use strict';

// EDIT BY SEP
angular.module('ngCart', ['ngCart.directives'])

        .config([function () {

            }])

        .provider('$ngCart', function () {
            this.$get = function () {
            };
        })

        .run(['$rootScope', 'ngCart', 'ngCartItem', 'store', function ($rootScope, ngCart, ngCartItem, store) {

                $rootScope.$on('ngCart:change', function () {
                    ngCart.clearCart();
                    ngCart.$save();
                });

                if (angular.isObject(store.get('cart'))) {
                    ngCart.$restore(store.get('cart'));

                } else {
                    ngCart.init();
                }

            }])

        .service('ngCart', ['$rootScope', 'ngCartItem', 'store', function ($rootScope, ngCartItem, store) {

                this.init = function () {
                    this.$cart = {
                        shipping: null,
                        taxRate: null,
                        tax: null,
                        items: []
                    };
                };

                this.addItem = function (id, name, price, quantity, data) {

                    var inCart = this.getItemById(id);

                    if (typeof inCart === 'object') {
                        //Update quantity of an item if it's already in the cart
                        inCart.setQuantity(quantity, true);
						if((jQuery("#qtt-"+id).parent().parent().parent().position().top - 455) > 0) {
							jQuery("#basketScroll > .scroll").attr('style','transform: translate3d(0px, -'+(jQuery("#qtt-"+id).parent().parent().parent().position().top-455)+'px, 0px) scale(1);');
						}	
						else
							jQuery("#basketScroll > .scroll").attr('style','transform: translate3d(0px, 0px, 0px) scale(1);');
						jQuery("#qtt-"+id).parent().parent().css("background-color","rgba(255,255,255,0.6)");
						jQuery("#qtt-"+id).css("background-color","#6EE0C2");
						setTimeout(function() {
							jQuery("#basketScroll .item-content").css("background-color","#ffffff");
							jQuery("#basketScroll .item-content .button-number").css("background-color","#36BC9B");
						},800);
						jQuery("#qtt-"+id).stop(true,true).animate({'font-size':'28px'}).animate({'font-size':'16px'});
                    } else {
                        var newItem = new ngCartItem(id, name, price, quantity, data);
                        this.$cart.items.unshift(newItem);
                        $rootScope.$broadcast('ngCart:itemAdded', newItem);
						jQuery("#basketScroll > .scroll").attr('style','transform: translate3d(0px, 0px, 0px) scale(1);');
                    }

                    $rootScope.$broadcast('ngCart:change', {});
                };

                this.clearCart = function ()
                {
                    var items = this.getItems();
                    var ngCart = this;
                    var i = 0;
                    angular.forEach(items, function (item) {
                        if (item.getQuantity() <= 0) {
                            ngCart.removeItem(i);
                        }
                        i++;
                    });
                }

                this.getItemById = function (itemId) {
                    var items = this.getCart().items;
                    var build = false;

                    angular.forEach(items, function (item) {
                        if (item.getId() === itemId) {
                            build = item;
                        }
                    });
                    return build;
                };

                this.setShipping = function (shipping) {
                    this.$cart.shipping = shipping;
                    return this.getShipping();
                };

                this.getShipping = function () {
                    if (this.getCart().items.length == 0)
                        return 0;
                    return  this.getCart().shipping;
                };

                this.setTaxRate = function (taxRate) {
                    this.$cart.taxRate = +parseFloat(taxRate).toFixed(2);
                    return this.getTaxRate();
                };

                this.getTaxRate = function () {
                    return this.$cart.taxRate
                };

                this.getTax = function () {
                    return +parseFloat(((this.getSubTotal() / 100) * this.getCart().taxRate)).toFixed(2);
                };

                this.setCart = function (cart) {
                    this.$cart = cart;
                    return this.getCart();
                };

                this.getCart = function () {
                    return this.$cart;
                };

                this.getItems = function () {
                    return this.getCart().items;
                };

                this.getTotalItems = function () {
                    var count = 0;
                    var items = this.getItems();
                    angular.forEach(items, function (item) {
                        count += item.getQuantity();
                    });
                    return count;
                };

                this.getTotalUniqueItems = function () {
                    return this.getCart().items.length;
                };

                this.getSubTotal = function () {
                    var total = 0;
                    angular.forEach(this.getCart().items, function (item) {
                        total += item.getTotal();
                    });
                    return +parseFloat(total).toFixed(2);
                };

                this.totalCost = function () {
                    return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
                };

                this.removeItem = function (index) {
                    this.$cart.items.splice(index, 1);
                    $rootScope.$broadcast('ngCart:itemRemoved', {});
                    $rootScope.$broadcast('ngCart:change', {});

                };

                this.removeItemById = function (id) {
                    var cart = this.getCart();
                    angular.forEach(cart.items, function (item, index) {
                        if (item.getId() === id) {
                            cart.items.splice(index, 1);
                        }
                    });
                    this.setCart(cart);
                    $rootScope.$broadcast('ngCart:itemRemoved', {});
                    $rootScope.$broadcast('ngCart:change', {});
                };

                this.empty = function () {
                    this.$cart.items = [];
                    localStorage.removeItem('cart');
                };

                this.toObject = function () {

                    if (this.getItems().length === 0)
                        return false;

                    var items = [];
                    angular.forEach(this.getItems(), function (item) {
                        items.push(item.toObject());
                    });

                    return {
                        shipping: this.getShipping(),
                        tax: this.getTax(),
                        taxRate: this.getTaxRate(),
                        subTotal: this.getSubTotal(),
                        totalCost: this.totalCost(),
                        items: items
                    }
                };


                this.$restore = function (storedCart) {
                    var _self = this;
                    _self.init();
                    _self.$cart.shipping = storedCart.shipping;
                    _self.$cart.tax = storedCart.tax;

                    angular.forEach(storedCart.items, function (item) {
                        _self.$cart.items.push(new ngCartItem(item._id, item._name, item._price, item._quantity, item._data));
                    });
                    this.$save();
                };

                this.$save = function () {
                    return store.set('cart', JSON.stringify(this.getCart()));
                }

            }])

        .factory('ngCartItem', ['$rootScope', '$log', function ($rootScope, $log) {

                var item = function (id, name, price, quantity, data) {
                    this.setId(id);
                    this.setName(name);
                    this.setPrice(price);
                    this.setQuantity(quantity);
                    this.setData(data);
                };


                item.prototype.setId = function (id) {
                    if (id)
                        this._id = id;
                    else {
                        $log.error('An ID must be provided');
                    }
                };

                item.prototype.getId = function () {
                    return this._id;
                };


                item.prototype.setName = function (name) {
                    if (name)
                        this._name = name;
                    else {
                        $log.error('A name must be provided');
                    }
                };
                item.prototype.getName = function () {
                    return this._name;
                };

                item.prototype.setPrice = function (price) {
                    this._price = parseFloat(price);    
                };
                item.prototype.getPrice = function () {
                    return this._price;
                };


                item.prototype.setQuantity = function (quantity, relative) {


                    var quantityInt = parseInt(quantity);
                    if (quantityInt % 1 === 0) {
                        if (relative === true) {
							if(quantity>1)
								this._quantity += 1;
							else
								this._quantity += quantityInt;
							
                        } else {
                            this._quantity = quantityInt;
                        }
                        //if (this._quantity < 1) this._quantity = 1;

                    } else {
                        this._quantity = 1;
                        $log.info('Quantity must be an integer and was defaulted to 1');
                    }
                    $rootScope.$broadcast('ngCart:change', {});

                };

                item.prototype.getQuantity = function () {
                    return this._quantity;
                };

                item.prototype.setData = function (data) {
                    if (data)
                        this._data = data;
                };

                item.prototype.getData = function () {
                    if (this._data)
                        return this._data;
                    else
                        $log.info('This item has no data');
                };


                item.prototype.getTotal = function () {
                    return +parseFloat(this.getQuantity() * this.getPrice()).toFixed(2);
                };

                item.prototype.toObject = function () {
                    return {
                        id: this.getId(),
                        name: this.getName(),
                        price: this.getPrice(),
                        quantity: this.getQuantity(),
                        data: this.getData(),
                        total: this.getTotal()
                    }
                };

                return item;

            }])

        .service('store', ['$window', function ($window) {

                return {
                    get: function (key) {
                        if ($window.localStorage [key]) {
                            var cart = angular.fromJson($window.localStorage [key]);
                            return JSON.parse(cart);
                        }
                        return false;

                    },
                    set: function (key, val) {

                        if (val === undefined) {
                            $window.localStorage.removeItem(key);
                        } else {
                            $window.localStorage [key] = angular.toJson(val);
                        }
                        return $window.localStorage [key];
                    }
                }
            }])

        .controller('CartController', ['$scope', 'ngCart', function ($scope, ngCart) {
                $scope.ngCart = ngCart;

            }])

        .value('version', '0.0.3-rc.1');


angular.module('ngCart.directives', [])

        .controller('CartController', ['$scope', 'ngCart', function ($scope, ngCart) {
                $scope.ngCart = ngCart;
            }])

        .directive('ngcartAddtocart', ['ngCart', function (ngCart) {
                return {
                    restrict: 'E',
                    controller: 'CartController',
                    scope: {
                        id: '@',
                        name: '@',
                        quantity: '@',
                        quantityMax: '@',
                        price: '@',
                        data: '='
                    },
                    transclude: true,
                    templateUrl: 'lib/ngCart/partials/addtocart.html',
                    link: function (scope, element, attrs) {
                        scope.attrs = attrs;
                        scope.inCart = function () {
                            return  ngCart.getItemById(attrs.id);
                        };

                        if (scope.inCart()) {
                            scope.q = ngCart.getItemById(attrs.id).getQuantity();
                        } else {
                            scope.q = parseInt(scope.quantity);
                        }

                        scope.qtyOpt = [];
                        for (var i = 1; i <= scope.quantityMax; i++) {
                            scope.qtyOpt.push(i);
                        }

                    }

                };
            }])

        .directive('ngcartCart', [function () {
                return {
                    restrict: 'E',
                    controller: 'CartController',
                    scope: {},
                    templateUrl: 'lib/ngCart/partials/cart.html',
                    link: function (scope, element, attrs) {

                    }
                };
            }])

        .directive('ngcartSummary', [function () {
                return {
                    restrict: 'E',
                    controller: 'CartController',
                    scope: {},
                    transclude: true,
                    templateUrl: 'lib/ngCart/partials/summary.html'
                };
            }]);