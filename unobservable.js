(function(unobservable) { "use strict";

function Observable() {
    this.callbacks = {};
    this.slice = [].slice;
};
Observable.prototype.on = function(events, fn) {
    var count = 0;
    for(var i=0; i>=0; i++) {
        var i2 = events.indexOf(" ", i);
        if(i2 < 0) {
            if(i < events.length) {
                var name = events.slice(i);
                (this.callbacks[name] = this.callbacks[name] || []).push(fn);
                count++;
            }
            break;
        }
        else if(i2-i > 1) {
            var name = events.slice(i, i2);
            (this.callbacks[name] = this.callbacks[name] || []).push(fn);
            count++;
            i = i2;
        }
    }
    fn.typed = count > 1;
};

Observable.prototype.off = function(events, fn) {
    if (events === "*") this.callbacks = {};
    else if (fn) {
        var arr = this.callbacks[events];
        for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
            if (cb === fn) arr.splice(i, 1);
        }
    } else {
        var self = this;
        events.replace(/[^\s]+/g, function(name) {
            self.callbacks[name] = [];
        });
    }
    return this;
};

// only single event supported
Observable.prototype.one = function(name, fn) {
    if (fn) fn.one = true;
    return this.on(name, fn);
};

Observable.prototype.trigger = function(name) {
    var args = this.slice.call(arguments, 1),
        fns = this.callbacks[name] || [];

    for (var i = 0, fn; (fn = fns[i]); ++i) {
        fn.apply(this, fn.typed ? [name].concat(args) : args);
        if (fn.one) { fns.splice(i, 1); i--; }
        else if(fns[i] && fns[i] !== fn) { i-- } // Makes self-removal possible during iteration
    }

    return this;
};

unobservable.Observable = Observable;
})((typeof window !== "undefined" ? window.unobservable = {} : exports));