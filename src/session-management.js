(function(){

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
	//License GPL v2
	
	'use strict';

	jEli
	.jModule('jeli.session.management',{})
	.jProvider('session',sessionFn)
	.jFactory('sessionManagement',['$document','$rootModel','$injector','session',sessionManagementFn])
	.jElement('sessionAlert',['$jCompiler',sessionAlertFn]);

	//sessionFn Provider
	function sessionFn(){

		var sessionObj = {};
		this.setIdleTime = function(duration){
			sessionObj['idleTime'] = duration || 30;
		};

		this.setTimeOutWarn = function(duration){
			sessionObj['timeOutWarn'] = duration;
		};

		this.$get = function(){
			return function(name){
				return sessionObj[name];
			};
		};
	}

	//AppplicationWatchManFn 
	function sessionManagementFn($document,$rootModel,$injector,session)
	{
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
			idleTime = session('idleTime'),
			timeOutWarn = session('timeOutWarn'),
			eventsName = ['isIdle','isAlive','isIdleEnd','isTimedOut','isTimeOutWarn'],
			$self = this,
			timeOutWarnInitialized = false;



		function watchManIntervalService(){
			if(+new Date >= watchObj.expires_at){
				watchMan.trigger('isTimedOut');
				$self.$destroy(watchManService);
				return
			}

			//when to set user idle
			//current time is set to 60 seconds
			if(countDown >= idleTime){
				keepAlive = false;
				watchMan.trigger('isIdle');
			}

			if(keepAlive){
				watchMan.trigger('isAlive');
				
				if(timeOutWarn){
					var tWarning = ((watchObj.expires_at - +new Date) <= (timeOutWarn * 1000));
					if(tWarning && !timeOutWarnInitialized){
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
		function WatchManActivity()
		{
			function event(){
				return ({
					type : "",
					currentTime : null,
					expiresAt : watchObj.expires_at,
					expiresIn : watchObj.expires_in,
					"$current":_currentTimer,
					isAlive : keepAlive,
					idle:countDown,
					canRevalidate : function(diff){
						if(diff){
							return ((this.expiresAt - this.currentTime) <= (diff * 1000));
						}

						return false;
					}
				});
			}
			
			//Handler to trigger user Events
			//broadcast on different event name
			var _handler = function(eventName){
				var $broadcastName = '$watchManService.'+eventName;
				trigger(eventName);
			};

			function trigger(name){
				if(name && handler[name]){
					var _event = event();
					_event.type = name;
					_event.currentTime = +new Date;
					handler[name](_event);
				}
			}

			//set event listerners
			//using different event method name

			this.on = function(name,fn){
				//set a listener
				if(name && fn){
					handler[name] = fn;
				}

				return this;
			};

			//Trigger an event

			this.trigger = function(name)
			{
				if(name && eventsName.indexOf(name) > -1){
					if(lastTriggered !== name){

						_handler(name);
						lastTriggered = name;
					}
				}
			};

			//set domEvent Listener
			var _this = this;
			$document
			.on('mousedown.watchman keydown.watchman',function(e){
				countDown = 0;
				if(lastTriggered === 'isIdle'){
					_this.trigger('isIdleEnd');
				}
				//keep alive
				keepAlive = true;
				_this.trigger('isAlive');
			});
		}

		//session Alert
		function sessionAlert(){

			var isOpen = false,
				body = jEli.dom('body'),
				model = $rootModel.$new(),
				$compiler = $injector.get('$jCompiler');
			//set a new prototype object
			this.open = function(obj){

				var options = {
					html :"Set Alert Message here",
					include : null,
					title : "Alert Status",
					isActive : true
				};

				model.modal = jEli.$extend(options,obj);
				model.trigger = function(name){
					if(obj[name] && jEli.$isFunction(obj[name])){
						obj[name]();
					}
				};

				if(!isOpen){
					body.append($compiler('<session-alert></session-alert>')(model));
				}
				
				model.$consume();
				isOpen = true;
			};

			this.close = function(fn){
				isOpen = !isOpen;
				jEli.dom('session-alert').remove();
				if(fn && jEli.$isFunction(fn)){
					fn(model);
				}
			};
		}

		//set the Object to watch over
		this.setWatchObject = function(obj){
			if(obj && jEli.$isObject(obj)){
				watchObj = obj;
			}

			return this;
		};

		this.startWatch = function(timer){
			if(watchObj.expires_at && watchObj.access_token){
				watchManService = setInterval(watchManIntervalService,timer || 1000);
				watchMan = new WatchManActivity();
			}

			//set started variable
			this.started = true;
			return watchMan;
		};

		this.$destroy = function(){
			if(this.started)
			{
				//clear our interval
				//unbind events bound to document
				clearInterval(watchManService);
				$document.unbind('.watchman');
				delete this.started;
			}
		};

		//reset timer
		this.reset = function(){
			//set the timeoutWarn
			//if it has been removed
			timeOutWarnInitialized = false;
		};

		this.alert = new sessionAlert();

		return this;
	}


	function sessionAlertFn($compile){

		return ({
			template : function(){
				var html = '<div class="overlay"></div><div>';
	      			html +='<div class="modal-dialog countDown"><div class="modal-content"><div class="modal-header" j-if="modal.title">';
	                html +='{{modal.title | translate}}</div><div class="modal-body">';
	                html +='<div j-if="modal.html && !modal.include" j-bind-html="modal.html">{{modal.html}}</div>';
	                html +='<div j-if="modal.include"><div j-include="modal.include"></div></div></div></div></div></div>';

	                return html;
			}
		});
	}

})();