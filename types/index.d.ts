/**
 * SessionManager Interface
 */
declare const jsession: jSessionStatic;
export = jsession;

export as namespace jsession;

interface jSessionStatic {
    alert: jSessionAlertStatic;
    manager: jSessionManagerStatic;
    provider: jSessionProviderStatic;
}

interface jSessionAlertStatic {
    open(definition:{
        template:String;
        title?: String;
        isActive?: Boolean;
    }):void;

    close(cb?: Function): void
}

interface jSessionManagerStatic {
    setWatchObject(definition: {
        expires_in: Number;
        expires_at: Number;
    }): this;

    startWatch(timer?: Number): jSessionWatch;
    $destroy():void;
    reset():void;
}

interface jSessionWatch {
    destroy():void;
    trigger(eventName: String):void;
    on(name: String, listener: Function): this;
}

interface jSessionProviderStatic {
    idleTime?: Number;
    timeOutWarn?: Number;
    autoReconnect?:Boolean;
    events: Array<string>
}


