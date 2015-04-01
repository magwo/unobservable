# Interesting benchmarks for reference:

### On using arrays to associate event names with functions, instead of regular objects:

http://jsperf.com/js-objs-vs-arrays

### On using pre-allocated arrays:

http://jsperf.com/pre-allocated-arrays/59 (pre-allocation seems very performant unless you overflow, but penalty for overflowing is not too bad)

### On using indexOf stepping vs split vs various regex strategies to find multiple events:

http://jsperf.com/string-split-vs-indexof-stepping (split is very fast in split scenario, but indexOf stepping is non-allocating (no array), fast and superior in the normal use case with only one event)

### On pushpopping custom and normal array:

http://jsperf.com/customarray-vs-array (keep in mind the custom array leaves no garbage to collect, which the normal one probably does)
