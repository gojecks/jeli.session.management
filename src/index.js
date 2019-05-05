    //Created by Gojecks Joseph
    //application Session ManageMent v1.0 
    //sets a watch over your application
    //Mainly Effective with oAuth2.0
    //Events thrown
    //isAlive
    //isTimedOut
    //isIdle
    //isIdleEnd
    //isTimeOutWarn
    //sessionFn Provider
    function sessionProviderFn() {
        this.idleTime = 30;
        this.timeOutWarn = 15;
        this.autoReconnect = true;
        this.events = ['mousedown', 'keydown', 'touchstart', 'mousemove']
    }

    //AppplicationWatchManFn 
    function sessionManagementFn(session) {
        //Watch Obj requires OAUTH 2.0 JSON format
        //set timeout time using 
        // var expiredAt = new Date();
        //expiredAt.setSeconds(expiredAt.getSeconds() + expires_in);

        //@require Object
        //expires_at : Date() in Milliseconds (see example above)
        //expires_in : Number
        var watchObj = {},
            watchManService = null,
            keepAlive = 1,
            countDown = 0,
            watchMan = {},
            _currentTimer = 0,
            handler = {},
            lastTriggered = null,
            autoReconnect = session.autoReconnect,
            eventsName = ['isIdle', 'isAlive', 'isIdleEnd', 'isTimedOut', 'isTimeOutWarn'],
            $self = this,
            timeOutWarnInitialized = false;



        function watchManIntervalService() {
            if (+new Date >= watchObj.expires_at) {
                watchMan.trigger('isTimedOut');
                $self.$destroy(watchManService);
                return
            }

            //when to set user idle
            //current time is set to 60 seconds
            if (countDown >= session.idleTime) {
                keepAlive = false;
                watchMan.trigger('isIdle');
            }

            if (keepAlive) {
                watchMan.trigger('isAlive');

                if (session.timeOutWarn) {
                    var tWarning = ((watchObj.expires_at - +new Date) <= (session.timeOutWarn * 1000));
                    if (tWarning && !timeOutWarnInitialized) {
                        watchMan.trigger('isTimeOutWarn');
                        timeOutWarnInitialized = true;
                    }
                }
            }

            //set countdown
            countDown++;
            _currentTimer++;
        }

        //watchmanFn
        function WatchManActivity() {
            function event() {
                return ({
                    type: "",
                    currentTime: null,
                    expiresAt: watchObj.expires_at,
                    expiresIn: watchObj.expires_in,
                    "$current": _currentTimer,
                    isAlive: keepAlive,
                    idle: countDown,
                    canRevalidate: function(diff) {
                        if (diff) {
                            return ((this.expiresAt - this.currentTime) <= (diff * 1000));
                        }

                        return false;
                    }
                });
            }

            //Handler to trigger user Events
            //broadcast on different event name
            var _handler = function(eventName) {
                trigger(eventName);
            };

            /**
             * 
             * @param {*} name 
             */
            function trigger(name) {
                if (name && handler[name]) {
                    var _event = event();
                    _event.type = name;
                    _event.currentTime = +new Date;
                    handler[name](_event);
                }
            }

            //set event listerners
            //using different event method name
            this.on = function(name, fn) {
                //set a listener
                if (name && fn) {
                    handler[name] = fn;
                }

                return this;
            };

            //Trigger an event
            this.trigger = function(name) {
                if (name && eventsName.indexOf(name) > -1) {
                    if (lastTriggered !== name) {
                        // remove the alert
                        sessionManagement.alert.close();
                        _handler(name);
                        lastTriggered = name;
                    }
                }
            };

            this.destroy = function() {
                session.events.forEach(remEvent);

                function remEvent(ev) {
                    document.removeEventListener(ev, _listener);
                }
            };

            //set domEvent Listener
            var _this = this;

            function _listener(e) {
                countDown = 0;
                if (lastTriggered === 'isIdle') {
                    _this.trigger('isIdleEnd');
                }
                //keep alive
                keepAlive = true;
                _this.trigger('isAlive');
            }

            /**
             * register listeners
             */
            session.events.forEach(function(ev) {
                document.addEventListener(ev, _listener, false);
            });
        }


        //set the Object to watch over
        this.setWatchObject = function(obj) {
            if (obj && jeli.$isObject(obj)) {
                watchObj = obj;
            }

            return this;
        };

        this.startWatch = function(timer) {
            // if (watchObj.expires_at && (watchObj.expires_at > +new Date)) {
            watchManService = setInterval(watchManIntervalService, timer || 1000);
            //set started variable
            this.started = true;
            // }

            watchMan = new WatchManActivity();
            return watchMan;
        };

        this.$destroy = function() {
            if (this.started) {
                //clear our interval
                //unbind events bound to document
                clearInterval(watchManService);
                watchMan.destroy();
                countDown = _currentTimer = 0;
                watchMan = {};
                delete this.started;
                // remove alert
                sessionManagement.alert.close();
            }
        };

        //reset timer
        this.reset = function() {
            //set the timeoutWarn
            //if it has been removed
            timeOutWarnInitialized = false;
        };

        return this;
    }

    var provider = (new sessionProviderFn);
    var sessionManagement = {
        provider: provider,
        manager: new sessionManagementFn(provider),
        alert: (new sessionAlertServiceFn)
    }