

describe("CustomArray class", function() {
    var a = null;

    beforeEach(function() {
        a = new unobservable.CustomArray(4);
    });

    it("can push an element", function() {
        a.push("hey");
        expect(a.arr[0]).toEqual("hey");
        expect(a.len).toBe(1);
    });
    it("can remove an element at end", function() {
        a.push("hey"); a.push("hey2"); a.push("hey3");
        expect(a.len).toEqual(3);
        a.removeAt(2);
        expect(a.len).toBe(2);
        expect(a.arr[0]).toBe("hey");
        expect(a.arr[1]).toBe("hey2");
    });
    it("can remove an element at start", function() {
        a.push("hey"); a.push("hey2"); a.push("hey3");
        expect(a.len).toEqual(3);
        a.removeAt(0);
        expect(a.len).toBe(2);
        expect(a.arr[0]).toBe("hey2");
        expect(a.arr[1]).toBe("hey3");
    });
    it("can remove all elements", function() {
        a.push("hey"); a.push("hey2"); a.push("hey3");
        expect(a.len).toEqual(3);
        a.removeAt(0);
        a.removeAt(0);
        a.removeAt(0);
        expect(a.len).toBe(0);
    });
});
describe("Observable class", function() {
    var o = null;
    var handlers = null;

    beforeEach(function() {
        o = new unobservable.Observable();
        handlers = {
            someHandler: function() {},
            someHandler2: function() {},
        };
        spyOn(handlers, "someHandler").and.callThrough();
        spyOn(handlers, "someHandler2").and.callThrough();
    });

    it("can register handler", function() {
        o.on("foo", handlers.someHandler);
        expect(o.callbacks["foo"].arr[0]).toBe(handlers.someHandler);
    });
    it("can trigger", function() {
        o.on("foo", handlers.someHandler);
        o.trigger("foo", "hey", "there");
        expect(handlers.someHandler.calls.mostRecent().args.slice(0, 2)).toEqual(["hey", "there"])
    });
    it("can register for multiple events", function() {
        o.on("foo bar", handlers.someHandler);
        o.trigger("foo", "hey", "there");
        expect(handlers.someHandler.calls.mostRecent().args.slice(0, 3)).toEqual(["foo", "hey", "there"]);
        o.trigger("bar", "hey", "there");
        expect(handlers.someHandler.calls.mostRecent().args.slice(0, 3)).toEqual(["bar", "hey", "there"]);
    });
    it("can register for multiple events in wonky way", function() {
        o.on("   foo    bar   baz    ", handlers.someHandler);
        expect(Object.getOwnPropertyNames(o.callbacks).sort()).toEqual(["bar", "baz", "foo"]);
    });
    it("removes all handlers on *", function() {
        o.on("foo", handlers.someHandler);
        o.on("foo", handlers.someHandler2);
        o.on("bar", handlers.someHandler);
        o.on("bar", handlers.someHandler2);
        o.off("*");
        o.trigger("foo");
        o.trigger("bar");
        expect(handlers.someHandler).not.toHaveBeenCalled();
        expect(handlers.someHandler2).not.toHaveBeenCalled();
    });
    it("removes all handlers for specific event", function() {
        o.on("foo", handlers.someHandler);
        o.on("foo", handlers.someHandler2);
        o.on("bar", handlers.someHandler);
        o.off("foo");
        o.trigger("foo", "hey");
        expect(handlers.someHandler).not.toHaveBeenCalled();
        expect(handlers.someHandler2).not.toHaveBeenCalled();
        o.trigger("bar", "there");
        expect(handlers.someHandler.calls.mostRecent().args.slice(0, 1)).toEqual(["there"]);
    });

    it("removes specific handler", function() {
        o.on("foo", handlers.someHandler);
        o.on("foo", handlers.someHandler2);
        o.on("bar", handlers.someHandler);
        o.off("foo", handlers.someHandler);
        o.trigger("foo", "hey foo");
        expect(handlers.someHandler).not.toHaveBeenCalled();
        expect(handlers.someHandler2.calls.mostRecent().args.slice(0, 1)).toEqual(["hey foo"]);
        o.trigger("bar", "there bar");
        expect(handlers.someHandler.calls.mostRecent().args.slice(0, 1)).toEqual(["there bar"]);
        //expect(handlers.someHandler).toHaveBeenCalledWith("there bar");
    });

    it("triggers 'one' only once", function() {
        o.one("foo", handlers.someHandler);
        o.trigger("foo");
        o.trigger("foo");
        o.trigger("foo");
        expect(handlers.someHandler.calls.count()).toBe(1);
    });
    it("can add 'one' several times", function() {
        o.one("foo", handlers.someHandler);
        o.trigger("foo");
        o.trigger("foo");
        o.one("foo", handlers.someHandler);
        o.trigger("foo");
        o.trigger("foo");
        o.trigger("foo");
        expect(handlers.someHandler.calls.count()).toBe(2);
    });
    it("does not treat non-'one' re-added as 'one'", function() {
        o.one("foo", handlers.someHandler);
        o.trigger("foo");
        o.on("foo", handlers.someHandler);
        o.trigger("foo");
        o.trigger("foo");
        o.trigger("foo");
        expect(handlers.someHandler.calls.count()).toBe(4);
    });
    xit("can use same function as 'one' in one listener, and 'on' in another", function() {
        // Known bug here, not sure how to fix performantly. Also a bug in riot.
        o.one("foo", handlers.someHandler);
        o.on("bar", handlers.someHandler);
        o.trigger("bar");
        o.trigger("bar");
        expect(handlers.someHandler.calls.count()).toBe(2);
        o.trigger("foo");
        o.trigger("foo");
        expect(handlers.someHandler.calls.count()).toBe(3);
    });
    it("can remove multiple events", function() {
        o.one("foo bar baz", handlers.someHandler);
        o.trigger("bar");
        expect(handlers.someHandler.calls.count()).toBe(1);
        o.off("baz foo bar");
        o.trigger("foo");
        o.trigger("bar");
        o.trigger("baz");
        expect(handlers.someHandler.calls.count()).toBe(1);
    });

    it("can remove self during triggering", function() {
        var localHandlers = {selfRemovingHandler: function() { o.off("foo", localHandlers.selfRemovingHandler); }};
        spyOn(localHandlers, "selfRemovingHandler").and.callThrough();
        o.on("foo", handlers.someHandler);
        o.on("foo", localHandlers.selfRemovingHandler)
        o.one("foo", handlers.someHandler2);
        expect(o.callbacks["foo"].len).toBe(3);
        o.trigger("foo");
        expect(o.callbacks["foo"].len).toBe(1);
        o.trigger("foo");
        expect(o.callbacks["foo"].len).toBe(1);
        expect(handlers.someHandler.calls.count()).toBe(2);
        expect(localHandlers.selfRemovingHandler.calls.count()).toBe(1);
        expect(handlers.someHandler2.calls.count()).toBe(1);
    });
});

