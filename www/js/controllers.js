angular.module('starter.controllers', ['ngCart', 'ionic', 'ngCookies'])

        .controller('BasketCtrl', ['$scope', 'ngCart', '$ionicModal', '$http', '$cookies', function ($scope, ngCart, $ionicModal, $http, $cookies) {
                $scope.products = [];
                $scope.productPerRow = 4;
                $scope.aPayer = ngCart.totalCost();
                $scope.dejaPaye = 0.00;
                $scope.resteAPayer = $scope.aPayer - $scope.dejaPaye;
                $scope.customers = [];
                $scope.cardUid = "";
                $scope.posName = "";
                $scope.payed = 0;
                $scope.posId = window.localStorage['posId'];
                if ($scope.posId == null)
                    $scope.posId = 43;
                $scope.terminal_id = "POS_DEMO";
                $scope.hostDomain = "http://pos-test.byemisys.com/";

                var cookiesTerminal_id = $cookies.get('terminal_id');
                if (cookiesTerminal_id != "" && cookiesTerminal_id != null)
                    $scope.terminal_id = cookiesTerminal_id;

                $("#posName").html($scope.terminal_id);

                $scope.cart = ngCart.getCart().items;
                $scope.hist = [];
                $scope.modHisto = [];

                $scope.loadProducts = function () {
                    var url = "https://eventware.lasemo.be/api/formules/list?isOnSite=1&project=9&item_isCashlessUnit=1&pos=" + $scope.posId;
                    $http({
                        method: 'GET',
                        url: url
                    })
                            .then(
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

                    $data = {'action': 'ngCart:change', 'items': ngCart.getCart().items, 'resteAPayer': $scope.resteAPayer};
                    customerScreen.postMessage($data, $scope.hostDomain);
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
                    //var catalog_height = height - 55;
                    var catalogObj = document.getElementById('catalogScroll');
                    catalogObj.style.height = "572px";
                };

                $scope.emptyBasket = function () {
                    ngCart.empty();
                    $data = {'action': 'ngCart:change', 'items': ngCart.getCart().items, 'resteAPayer': $scope.resteAPayer};
                    customerScreen.postMessage($data, $scope.hostDomain);
                }

                /*
                 nfcService.subscribe($scope, function customerAdded() {
                 $scope.$apply();
                 });*/

                $ionicModal.fromTemplateUrl('templates/modal-payment.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: true
                }).then(function (modal) {
                    $scope.modalPayment = modal;
                });

                $scope.showPaymentModal = function () {
                    $data = {'action': 'paymentDialog:open'};
                    customerScreen.postMessage($data, $scope.hostDomain);
                    $scope.cart = ngCart.getCart().items;
                    $scope.card_uid = "";
                    $scope.cardUid = "";
                    $scope.modalPayment.show();
                    focus("modalPayment");
                };

                $ionicModal.fromTemplateUrl('templates/modal-history.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    focusFirstInput: true
                }).then(function (modal) {
                    $scope.modalHistory = modal;
                });
                $scope.showHistoryModal = function (index) {
                    $scope.modHisto = $scope.hist[index];
                    $scope.modalHistory.show();
                    focus("modalHistory");
                };

                $scope.cardUidBLur = function ()
                {
                };
                $scope.checkCardUid = function (strScanned)
                {
                    document.getElementById("cardUid").value = "";

                    var find = ["&", "é", "\"", "'", "(", "§", "è", "!", "ç", "à"];
                    var replace = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
                    for (var c in strScanned) {
                        for (var i in find) {
                            strScanned = strScanned.replace(find[i], replace[i]);
                        }
                    }
                    // convert deciaml to hexa and reverse block of tow char
                    var cardUid = Number(strScanned).toString(16).match(/../g).reverse().join("");

                    if (cardUid.length != 8)
                        alert("Impossible de lire la carte");
                    else
                        $scope.prepareTransaction(cardUid);
                };

                $scope.prepareTransaction = function (cardUid) {
                    if ($scope.resteAPayer < -10 || $scope.resteAPayer == 0)
                        return;

                    for (cus in $scope.customers) {
                        if ($scope.customers[cus].cardUid == cardUid) {
                            return;
                        }
                    }

                    var $data = new Array();
                    $data.card_uid = cardUid;
                    $data.terminal_id = $scope.terminal_id;
                    emisys_ajax("card_solde", $data, function (msg) {
                        console.log(msg);
                        if (!msg)
                        {
                            alert("Carte inactive");
                            return;
                        } else if (msg != false && msg.CURRENT_VALUE >= 0)
                        {
                            if (msg.CARD_STATUS == 1)
                            {
                                alert("Cette carte a été bloquée");
                                return;
                            }

                            if (msg.WALLET_ID != null) {
                                for (cus in $scope.customers) {
                                    if ($scope.customers[cus].walletId == msg.WALLET_ID) {
                                        alert("Cette carte est associé à un portefeuille déja présent dans cette vente");
                                        return;
                                    }
                                }
                            }

                            $scope.soldeCard = msg.CURRENT_VALUE;
                            var amount = 0;
                            if ($scope.soldeCard >= $scope.resteAPayer)
                                amount = parseInt($scope.resteAPayer, 10);
                            else
                                amount = parseInt($scope.soldeCard, 10);
                            $customer = {
                                'cardUid': cardUid,
                                'walletId': msg.WALLET_ID,
                                'emisys_number': msg.EMISYS_NUMBER,
                                'solde': parseInt($scope.soldeCard, 10),
                                'soldeApres': parseInt($scope.soldeCard - amount, 10),
                                'amount': amount,
                                'firstname': msg.FIRST_NAME,
                                'lastname': msg.LAST_NAME
                            };
                            $scope.customers.push($customer);

                            
                            if ($scope.soldeCard >= $scope.resteAPayer) { // loop on customer when all is payed and debit cards
                                for (cus in $scope.customers) {
                                    $data.amount = $scope.customers[cus].amount;
                                    $data.session = [];
                                    $data.card_uid = $scope.customers[cus].cardUid;
                                    emisys_ajax("debit_card", $data, function (msg) {
                                        if (msg.message == "200") {
                                            $scope.aPayer = 0;
                                            $scope.dejaPaye = 0;
                                            $scope.resteAPayer = 0;
                                            $scope.payed = 1;
                                            if ($scope.customers.length == (parseInt(cus) + 1)) { // apply scope when all the ajax call are done
                                                $scope.$apply();
                                                $hist = {
                                                    'customers': $scope.customers,
                                                    'cart': $scope.cart
                                                };
                                                $scope.hist.unshift($hist);
                                            }
                                        }
                                    });
                                }
                            } else { // if resteAPAyer is not null
                                $scope.dejaPaye += amount;
                                $scope.card_uid = cardUid;
                                $scope.resteAPayer = $scope.aPayer - $scope.dejaPaye;
                                $scope.$apply();
                            }
                            $data = {'action': 'customers:add', 'customers': $scope.customers, 'items': ngCart.getCart().items, 'resteAPayer': $scope.resteAPayer};
                            customerScreen.postMessage($data, $scope.hostDomain);

                        }
                    });

                }

                $scope.validatePaymentModal = function () {
                    var $data = new Array();
                    $data.card_uid = cardUid;
                    $data.terminal_id = $scope.terminal_id;


                    $scope.aPayer = 0;
                    $scope.dejaPaye = 0;
                    $scope.resteAPayer = 0;
                    $scope.customers = [];
                    $scope.customersUid = [];
                    ngCart.empty();
                    $data = {'action': 'ngCart:change', 'items': ngCart.getCart().items, 'resteAPayer': $scope.resteAPayer};
                    customerScreen.postMessage($data, $scope.hostDomain);
                    $scope.modalPayment.hide();

                };

                // Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function () {
                    $scope.modalPayment.remove();
                });
                // Execute action on hide modal
                $scope.$on('modal.hidden', function () {
                    $scope.customers = [];

                    $scope.dejaPaye = 0;
                    $scope.resteAPayer = $scope.aPayer;
                    if ($scope.payed == 1) {
                        $scope.customers = [];
                        $scope.cart = [];
                        ngCart.empty();
                        $scope.payed = 0;
                    }
                    $data = {'action': 'ngCart:change', 'items': ngCart.getCart().items, 'resteAPayer': $scope.resteAPayer};
                    customerScreen.postMessage($data, $scope.hostDomain);
                });
                // Execute action on remove modal
                $scope.$on('modal.removed', function () {
                    // Execute action
                });

                ngCart.setShipping(0);
                ngCart.setTaxRate(0);
            }])

        .controller('ChatsCtrl', function ($scope, Chats) {

        })

        .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
            $scope.chat = Chats.get($stateParams.chatId);
        })

        .controller('SettingsCtrl', function ($scope) {
            $scope.settings = {
                enableFriends: true
            };

            $scope.reloadPos = function (posId) {
                console.log("reloadPos" + posId);
                window.localStorage['posId'] = posId;
                $scope.posId = posId;
                //$route.reload();
            }
        })
        .controller('InfosCtrl', function ($scope, $ionicModal) {

            $scope.terminal_id = "POS_DEMO";
            $scope.customers = [];
            $scope.infos = {
                cardUid: ""
            };

            $scope.checkCardUid = function (strScanned) {
                document.getElementById("cardUid2").value = "";

                var find = ["&", "é", "\"", "'", "(", "§", "è", "!", "ç", "à"];
                var replace = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
                for (var c in strScanned) {
                    for (var i in find) {
                        strScanned = strScanned.replace(find[i], replace[i]);
                    }
                }
                // convert deciaml to hexa and reverse block of tow char
                var cardUid = Number(strScanned).toString(16).match(/../g).reverse().join("");

                if (cardUid.length != 8)
                    alert("Erreur dans la lecture de la carte. Veuillez réessayer.");
                else
                    $scope.prepareTransaction(cardUid);
            }

            $scope.prepareTransaction = function (cardUid) {
                var $data = new Array();
                $data.card_uid = cardUid;
                $data.terminal_id = $scope.terminal_id;

                console.log(cardUid);
                emisys_ajax("card_solde", $data, function (msg) {
                    console.log(msg);
                    if (!msg)
                    {
                        alert("Carte inactive");
                        return;
                    } else
                    {
                        if (msg.CARD_STATUS == 1)
                        {
                            alert("Cette carte a été bloquée");
                            return;
                        }

                        $scope.soldeCard = msg.CURRENT_VALUE;
                        $customer = {
                            'cardUid': cardUid,
                            'walletId': msg.WALLET_ID,
                            'emisys_number': msg.EMISYS_NUMBER,
                            'solde': parseInt($scope.soldeCard, 10),
                            'firstname': msg.FIRST_NAME,
                            'lastname': msg.LAST_NAME
                        };
                        $scope.customers.push($customer);
                        $scope.$apply();

                        $data = {'card_uid': cardUid, 'wallet_org_id': msg.WALLET_ORG_ID};
                        emisys_ajax("app_get_wallet_history", $data, function (msgHistory) {
                            $data = {'action': 'cardinfoDialog:open', 'customer': $customer, 'transactions': msgHistory.transactions};
                            customerScreen.postMessage($data, '*');
                        });
                    }
                });

            }

            $ionicModal.fromTemplateUrl('templates/modal-info.html', {
                scope: $scope,
                animation: 'slide-in-up',
                focusFirstInput: true
            }).then(function (modal) {
                $scope.modalInfo = modal;
                $scope.showInfoModal();
            });
            $scope.showInfoModal = function () {
                $scope.card_uid = "";
                $scope.cardUid = "";
                $scope.modalInfo.show();
                focus("modalInfo");
            };

            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {

                $scope.customers = [];
                $scope.modalInfo.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {

                $scope.customers = [];
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });
            $scope.cardUidBLur = function ()
            {
            };

        })
        ;
