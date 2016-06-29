angular.module('starter.controllers', ['ngCart', 'ionic'])

        .controller('BasketCtrl', function ($scope, ngCart, $ionicModal, $http, nfcService) {
            $scope.products = [];
            $scope.productPerRow = 4;
            $scope.aPayer = ngCart.totalCost();
            $scope.dejaPaye = 0.00;
            $scope.resteAPayer = $scope.aPayer - $scope.dejaPaye;
            $scope.customers = nfcService.get();
            $scope.cardUid = "";
            $scope.posId = 43;

            $scope.loadProducts = function () {
                console.log("begin load product");
                //var url = "controllers.js"
                var url = "https://eventware.lasemo.be/api/formules/list?isOnSite=1&project=9&item_isCashlessUnit=1&sort=formule.id&dir=ASC&pos=" + $scope.posId;
                $http({
                    method: 'GET',
                    url: url
                }).
                        then(
                                function (response) {
                                    var log = [];
                                    angular.forEach(response.data, function (value, key) {
                                        var price = value.formule_item[0].quantity;
                                        var picture = 'http://fakeimg.pl/200x200/?text=' + value.name;
                                        if (value.picture != null)
                                            picture = 'https://eventware.lasemo.be/uploads/documents/' + value.picture.name;
                                        $product = {
                                            'id': value.id,
                                            'name': value.name,
                                            'isOnSite': value.is_on_site,
                                            'price': parseInt(value.price_with_vat) >= 0 ? parseInt(price) : 0,
                                            'picture': picture
                                        };
                                        this.push($product);
                                    }, $scope.products);
                                },
                                function (response) {
                                    console.log(response.data);
                                    console.log(response.status);
                                    console.log(response.statusText);
                                    console.log(response.config.timeout);

                                }
                        );


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

            nfcService.subscribe($scope, function customerAdded() {
                $scope.$apply();
            });

            $ionicModal.fromTemplateUrl('templates/modal-payment.html', {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true
            }).then(function (modal) {
                $scope.modalPayment = modal;

            });
            $scope.showPaymentModal = function () {
                $scope.modalPayment.show();
                focus("modalPayment");
            };
            $scope.cardUidBLur = function ()
            {
                alert("tes");
            };
            $scope.checkCardUid = function (strScanned)
            {
                document.getElementById("cardUid").value = "";
                // convert deciaml to hexa and reverse block of tow char
                var cardUid = Number(strScanned).toString(16).match(/../g).reverse().join("");
                console.log(cardUid);
                
                if(cardUid.length!=8)
                    alert("Impossible de lire la carte");
                else                    
                    $scope.debitCard(cardUid);
            };
            
            $scope.debitCard = function (cardUid) {                
                var $data = new Array();
                emisys_ajax("app_register_card_by_cardnumber", $data, function (msg) {
                    if (msg.status == "OK" || msg.status == "CARD_004") {
                        alert(msg.status);
                    } else {
                        alert(msg.error_msg);
                    }
                });
            }
            
            $scope.closePaymentModal = function () {
                $scope.modalPayment.hide();
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

        })

        .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
            $scope.chat = Chats.get($stateParams.chatId);
        })

        .controller('SettingsCtrl', function ($scope) {
            $scope.settings = {
                enableFriends: true
            };
        });
