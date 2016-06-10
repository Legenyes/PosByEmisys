var nfc = {
    addTagIdListener: function (success, failure) {
        cordova.exec(success, failure, "NfcAcr122Plugin", "listen", []);
    }
}

var currentCardUid = "";
var inPayementProcess = false;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

        .run(function ($ionicPlatform, nfcService) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);

                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }

                var success = function (result) {
                    if (result) {
                        currentCardUid = result;
                        nfcService.add(currentCardUid);
                    }
                };

                var failure = function (reason) {
                    currentCardUid = "";/*
                    document.getElementById("debug").innerHtml = reason;
                    navigator.notification.alert("Error " + JSON.stringify(reason), function () {}, "NFC Tag ID");
                    alert("Error " + JSON.stringify(reason))*/
                };
                
                nfc.addTagIdListener(success, failure);
            });
        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

            $ionicConfigProvider.tabs.position("top");
            $ionicConfigProvider.tabs.style("standard");
            $stateProvider

                    // setup an abstract state for the tabs directive
                    .state('tab', {
                        url: '/tab',
                        abstract: true,
                        templateUrl: 'templates/tabs.html'
                    })

                    // Each tab has its own nav history stack:

                    .state('tab.basket', {
                        url: '/basket',
                        views: {
                            'tab-basket': {
                                templateUrl: 'templates/tab-basket.html',
                                controller: 'BasketCtrl'
                            }
                        }
                    })

                    .state('tab.chats', {
                        url: '/chats',
                        views: {
                            'tab-chats': {
                                templateUrl: 'templates/tab-chats.html',
                                controller: 'ChatsCtrl'
                            }
                        }
                    })
                    .state('tab.chat-detail', {
                        url: '/chats/:chatId',
                        views: {
                            'tab-chats': {
                                templateUrl: 'templates/chat-detail.html',
                                controller: 'ChatDetailCtrl'
                            }
                        }
                    })

                    .state('tab.settings', {
                        url: '/settings',
                        views: {
                            'tab-settings': {
                                templateUrl: 'templates/tab-settings.html',
                                controller: 'SettingsCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/tab/basket');

        });

