    //session Alert
    function sessionAlertServiceFn() {
        var isOpen = false,
            _content = '<div class="overlay"></div><div class="modal-dialog countDown"><div class="modal-content"><div class="modal-header"> \
            {{title}}</div><div class="modal-body">{{content}}</div></div></div>',
            _css = require('./sessionManagement.css');
        this.ele = null;
        //set a new prototype object
        this.open = function(obj) {
            var options = jeli.$extend({
                content: '',
                title: "Alert Status",
                isActive: true
            }, obj);
            isOpen = true;
            /**
             * append the element
             */
            this.ele = document.createElement('session-alert');
            this.ele.innerHTML = _content.replace(/\{\{(.*?)\}\}/g, function(match, key) {
                return options[key];
            });
            // write the style
            var style = document.createElement('style');
            style.innerText = _css;
            this.ele.appendChild(style);
            // append to body;
            document.body.appendChild(this.ele);

            // restyle modal
            var modal = this.ele.children[1];
            var height = modal.clientHeight;
            var windowHeight = this.ele.clientHeight;
            modal.style.top = ((windowHeight - height) / 2) + "px";

            this.opetions = options;
        };

        this.close = function(fn) {
            isOpen = !isOpen;
            if (fn && jeli.$isFunction(fn)) {
                fn();
            }
            // remove the element
            this.ele && this.ele.parentNode.removeChild(this.ele);
            this.ele = null;
        };

        this.click = function(eventName) {
            if (this.options[eventName]) {
                this.options[eventName]();
            }
        }
    }