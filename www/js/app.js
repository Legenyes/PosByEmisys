// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var nfc = {
    addTagIdListener: function (success, failure) {
        cordova.exec(success, failure, "NfcAcr122Plugin", "listen", []);
    }
}

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

        .run(function ($ionicPlatform) {
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
                        //alert(result);
                        //navigator.notification.alert(result, function() {}, "NFC Tag ID");
                        document.getElementById("tagIdDiv").innerHTML = result;
                    }
                };

                var failure = function (reason) {
                     navigator.notification.alert("Error " + JSON.stringify(reason), function() {}, "NFC Tag ID");
                    alert("Error " + JSON.stringify(reason))
                };

                console.log("Calling plugin");
                nfc.addTagIdListener(success, failure);
                console.log("Called plugin");

            });
        })

        .config(function ($stateProvider, $urlRouterProvider) {
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

