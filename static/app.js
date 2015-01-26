'use strict';

var config = {
	checks: false,
	verbose: false
};



// Create an array with n numbers for iteration
var cycles = [];
//while(cycles.length < 1) { // Too little
//while (cycles.length < 25) { // Ok (disable console.time with this one as the hz is too high)
while(cycles.length < 1000) { // Too much, but used to get a more fine grained result
	cycles.push(cycles.length);
}

// Create arguments content
var arguments1 = [];
while (arguments1.length < cycles.length)
	arguments1.push(String(Math.random()));

angular.module('events', [
	'awesome.services.events',
	'awesome.services.events2',
	'awesome.services.events3',
	'awesome.services.events4',
	'awesome.services.events5',
	'awesome.services.events2Opt',
	'awesome.services.events3Opt',
	'awesome.services.events4Opt',
	'awesome.services.events5Opt'
])
	.config(function(
		eventsProvider,
		events2Provider,
		events3Provider,
		events4Provider,
		events5Provider,
		events2OptProvider,
		events3OptProvider,
		events4OptProvider,
		events5OptProvider
	) {

		eventsProvider.config(config);
		events2Provider.config(config);
		events3Provider.config(config);
		events4Provider.config(config);
		events5Provider.config(config);
		events2OptProvider.config(config);
		events3OptProvider.config(config);
		events4OptProvider.config(config);
		events5OptProvider.config(config);

	})
	.controller('AppController', function(
		events,
		events2,
		events3,
		events4,
		events5,
		events2Opt,
		events3Opt,
		events4Opt,
		events5Opt
	) {

		var eventsRefs = {
			//events: events,
			//events2: events2,
			//events3: events3,
			//events4: events4,
			//events5: events5,
			events2Opt: events2Opt,
			events3Opt: events3Opt,
			events4Opt: events4Opt,
			events5Opt: events5Opt
		};
		var checks = [];
		var storeArguments = [];
		//checks.push(true);
		checks.push(false);
		storeArguments.push(true);
		storeArguments.push(false);

		// Create the tests
		var tests = {};
		_.each(eventsRefs, function(events, eventsName) {
			_.each(checks, function(checks) {
				_.each(storeArguments, function(storeArguments) {

					// Cancel if this is events2 without storeArguments (as they are always stored)
					if (eventsName.indexOf('events2') !== -1 && !storeArguments) return;

					// Cancel if this is events3 with storeArguments (as they are never stored)
					if (eventsName.indexOf('events3') !== -1 && storeArguments) return;

					tests[eventsName + '-' + (checks ? 'checks' : '') + '-' + (storeArguments ? 'storeArguments' : '')] = {
						events: events,
						checks: checks,
						storeArguments: storeArguments
					};

				});
			});
		});


		var suite = new Benchmark.Suite;

		_.each(tests, function(test, testName) {

			var events = test.events;

			suite.add(testName, function(deferred) {

				//console.log(testName);
				//console.time(testName);

				events.updateConfig({
					checks: test.checks,
					storeArguments: test.storeArguments
				});

				var i = 0;

				var
					listener0FireCount = 0,
					listener1FireCount = 0,
					listener2FireCount = 0,
					listener3FireCount = 0,
					listener4FireCount = 0,
					listener5FireCount = 0,
					listener6FireCount = 0,
					errorDoubleListener = 0,
					argumentsSingle = 0,
					argumentsDouble = 0;

				// Create array
				async.each(cycles, function(zero, cycleFinished) {



					function testListener0() { listener0FireCount++; if(config.verbose) console.log(i + '_testListener0'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener1() { listener1FireCount++; if(config.verbose) console.log(i + '_testListener1'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener2() { listener2FireCount++; if(config.verbose) console.log(i + '_testListener2'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener3() { listener3FireCount++; if(config.verbose) console.log(i + '_testListener3'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener4() { listener4FireCount++; if(config.verbose) console.log(i + '_testListener4'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener5() { listener5FireCount++; if(config.verbose) console.log(i + '_testListener5'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener6() { listener6FireCount++; if(config.verbose) console.log(i + '_testListener6'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }



					// Simple event
					events.addEventListener(i + '_testListener0', i + '_testEvent1', testListener0);



					// Create an a double listenerName error
					try {

						events.addEventListener(i + '_testListener0', [
							i + '_testEvent1', '&&',
							i + '_testEvent2'
						], testListener0);

					} catch (err) { errorDoubleListener++; }



					// Double AND event
					events.addEventListener(i + '_testListener1', [
						i + '_testEvent1', '&&',
						i + '_testEvent2'
					], testListener1);



					// Create an a double listenerName error
					try {

						events.addEventListener(i + '_testListener1', i + '_testEvent1', testListener1);

					} catch (err) { errorDoubleListener++; }



					// Double OR event
					events.addEventListener(i + '_testListener2', [
						i + '_testEvent1', '||',
						i + '_testEvent2'
					], testListener2);



					// Complex event
					events.addEventListener(i + '_testListener3', [
						i + '_testEvent1', '&&',
						[
							i + '_testEvent2', '||',
							i + '_testEvent3'
						]
					], testListener3);



					// Complex event
					events.addEventListener(i + '_testListener4', [
						i + '_testEvent1', '&&',
						[
							i + '_testEvent2', '&&',
							i + '_testEvent3'
						]
					], testListener4);



					// First batch of events
					events.dispatchEvent(i + '_testEvent1', 'firstArgument' + arguments1[i]);
					events.dispatchEvent(i + '_testEvent2');
					events.dispatchEvent(i + '_testEvent3');



					// Single event without memory
					events.addEventListener(i + '_testListener5', i + '_testEvent1', testListener5);



					// Single event with memory
					events.addEventListener(i + '_testListener6', i + '_testEvent1', testListener6, true);



					// Second batch of events
					events.dispatchEvent(i + '_testEvent1', 'firstArgument' + arguments1[i], 'secondArgument' + arguments1[i]);
					events.dispatchEvent(i + '_testEvent2');
					events.dispatchEvent(i + '_testEvent3');



					// Concluding event
					events.addEventListener(i + '_testFinalListener', i + '_testEvent3', function() {

						if(config.verbose) console.log('FINISHED');

						cycleFinished();

					}, true);

					// Increase the i
					i++;

				}, function() {

					if(config.verbose) console.log('REALLY FINISHED');

					// Cleanup
					cycles.forEach(function(cycle) {
						events.removeEventListener(cycle + '_testListener0');
						events.removeEventListener(cycle + '_testListener1');
						events.removeEventListener(cycle + '_testListener2');
						events.removeEventListener(cycle + '_testListener3');
						events.removeEventListener(cycle + '_testListener4');
						events.removeEventListener(cycle + '_testListener5');
						events.removeEventListener(cycle + '_testListener6');
						events.removeEventListener(cycle + '_testFinalListener');
						events.clearEventFromMemory(cycle + '_testEvent1');
						events.clearEventFromMemory(cycle + '_testEvent2');
						events.clearEventFromMemory(cycle + '_testEvent3');
					});

					//console.timeEnd(testName);

					// Test the counts

					// Fire counts
					if (listener2FireCount			!== 4 * cycles.length) debugger;
					if (listener3FireCount			!== 5 * cycles.length) debugger;
					if (listener4FireCount			!== 4 * cycles.length) debugger;
					if (listener5FireCount			!== 1 * cycles.length) debugger;
					if (listener6FireCount			!== 2 * cycles.length) debugger;
					if (test.checks) {
						if (listener0FireCount		!== 2 * cycles.length) debugger;
						if (listener1FireCount		!== 3 * cycles.length) debugger;
					} else {
						if (listener0FireCount		!== 5 * cycles.length) debugger;
						if (listener1FireCount		!== 5 * cycles.length) debugger;
					}

					// Error doubleListener
					if (test.checks) {
						if (errorDoubleListener		!== 2 * cycles.length) debugger; // There are two addListeners who would fire an error
					} else {
						if (errorDoubleListener		!== 0 * cycles.length) debugger; // If the checks are turned off the error will never fire
					}

					// Arguments
					if (test.checks) {
						if (test.storeArguments) {
							if (argumentsSingle	!== 3 * cycles.length) debugger; // batch 1: 0 & 6
						} else if(!test.storeArguments) {
							if (argumentsSingle	!== 2 * cycles.length) debugger; // batch 1: 0
						} else { debugger; }
						if (argumentsDouble		!== 4 * cycles.length) debugger;
					} else if (!test.checks) {
						if (test.storeArguments) {
							if (argumentsSingle	!== 4 * cycles.length) debugger; // batch 1: 0 & 1(D) & 6
						} else if(!test.storeArguments) {
							if (argumentsSingle	!== 3 * cycles.length) debugger; // batch 1: 0 & 6
						} else { debugger; }
						if (argumentsDouble		!== 5 * cycles.length) debugger;
					} else { debugger; }


					events.clearAll();

					deferred.resolve();

				});

			}, {defer: true});

		});

		suite
			.run({
				async: true
			})

			.on('complete', function() {
				console.log('Fastest is ' + this.filter('fastest').pluck('name'));
				_.each(this, function(completeBenchmark) {
					console.log(Math.round(completeBenchmark.hz * 1000) / 1000, completeBenchmark.name);
				});
				_.each(this, function(completeBenchmark) {
					console.log(completeBenchmark);
				});
			});

	});
