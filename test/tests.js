

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
	});
	it("can trigger", function() {
		o.on("foo", handlers.someHandler);
		o.trigger("foo", "hey", "there");
		expect(handlers.someHandler).toHaveBeenCalledWith("hey", "there");
	});
	it("can register for multiple events", function() {
		o.on("foo bar", handlers.someHandler);
		o.trigger("foo", "hey", "there");
		expect(handlers.someHandler.calls.mostRecent().args).toEqual(["foo", "hey", "there"]);
		o.trigger("bar", "hey", "there");
		expect(handlers.someHandler.calls.mostRecent().args).toEqual(["bar", "hey", "there"]);
	});
	it("can register for multiple events in wonky way", function() {
		o.on("   foo   bar  ", handlers.someHandler);
		expect(Object.getOwnPropertyNames(o.callbacks).sort()).toEqual(["bar", "foo"]);
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
		o.trigger("bar", "there");
		expect(handlers.someHandler2).not.toHaveBeenCalled();
		expect(handlers.someHandler).not.toHaveBeenCalledWith("hey");
		expect(handlers.someHandler).toHaveBeenCalledWith("there");
	});

	it("removes specific handler", function() {
		o.on("foo", handlers.someHandler);
		o.on("foo", handlers.someHandler2);
		o.on("bar", handlers.someHandler);
		o.off("foo", handlers.someHandler);
		o.trigger("foo", "hey foo");
		o.trigger("bar", "there bar");
		expect(handlers.someHandler).not.toHaveBeenCalledWith("hey foo");
		expect(handlers.someHandler2).toHaveBeenCalledWith("hey foo");
		expect(handlers.someHandler).toHaveBeenCalledWith("there bar");
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
});

