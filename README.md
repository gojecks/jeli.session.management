# jeli.session.management

This library provides the ability to manage logged in user sessions and activty.

## installation
 ```
 npm install jeli.sesion.management
 ```

## usuage
### typescript
```
import * as jsession from 'jeli.sesion.management' 
```

Configure the watch plugin using the provider property, below example are default configurations.
  ```javascript
  jsession.provder.idleTime = 30 
  jsession.provder.timeOutWarn =  15;
  jsession.provder.autoReconnect = . true;
  jsession.provder.events.push('mouseenter');
  ```
  Start the sessionWatch service
  ```javascript
  var watchMan = jsession
        .manager
        .setWatchObject({
          expires_in: <timestamp>,
          expires_at: 7200
        })
        .startWatch(1000);
  ```
  register a listener
  ```javascript
    watchMan
    .on('isIdle', function(){
      // do something
    })
   ```
   
   
  Below are events emitted from sessionManager
  ```
    'isIdle', 
    'isAlive', 
    'isIdleEnd', 
    'isTimedOut', 
    'isTimeOutWarn'
   ```
   
   please feel free to open any issues found
   
