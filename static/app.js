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

angular.module('aps', [
	'awesome.services.events1',
	'awesome.services.events2',
	'awesome.services.events3',
	'awesome.services.events4',
	'advancedPubSub',
	'awesome.services.events2Opt',
	'awesome.services.events3Opt',
	'awesome.services.events4Opt',
	'advancedPubSubOpt'
])
	.config(function(
		events1Provider,
		events2Provider,
		events3Provider,
		events4Provider,
		apsProvider,
		events2OptProvider,
		events3OptProvider,
		events4OptProvider,
		apsOptProvider
	) {

		events1Provider.config(config);
		events2Provider.config(config);
		events3Provider.config(config);
		events4Provider.config(config);
		apsProvider.config(config);
		events2OptProvider.config(config);
		events3OptProvider.config(config);
		events4OptProvider.config(config);
		apsOptProvider.config(config);

	})
	.controller('AppController', function(
		events1,
		events2,
		events3,
		events4,
		aps,
		events2Opt,
		events3Opt,
		events4Opt,
		apsOpt
	) {

		var apsRefs = {
			//events1: events1,
			//events2: events2,
			//events3: events3,
			//events4: events4,
			events2Opt: events2Opt,
			events3Opt: events3Opt,
			events4Opt: events4Opt,
			aps: aps,
			apsOpt: apsOpt
		};
		var checks = [];
		var storeArguments = [];
		//checks.push(true);
		checks.push(false);
		storeArguments.push(true);
		storeArguments.push(false);

		// Create the tests
		var tests = {};
		_.each(apsRefs, function(aps, apsName) {
			_.each(checks, function(checks) {
				_.each(storeArguments, function(storeArguments) {

					// Cancel if this is events2 without storeArguments (as they are always stored)
					if (apsName.indexOf('events2') !== -1 && !storeArguments) return;

					// Cancel if this is events3 with storeArguments (as they are never stored)
					if (apsName.indexOf('events3') !== -1 && storeArguments) return;

					tests[apsName + '-' + (checks ? 'checks' : '') + '-' + (storeArguments ? 'storeArguments' : '')] = {
						aps: aps,
						checks: checks,
						storeArguments: storeArguments
					};

				});
			});
		});


		var suite = new Benchmark.Suite;

		_.each(tests, function(test, testName) {

			var aps = test.aps;

			suite.add(testName, function(deferred) {

				//console.log(testName);
				//console.time(testName);

				aps.updateConfig({
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
					errorDoubleListenerName = 0,
					errorDoubleListener = 0,
					argumentsSingle = 0,
					argumentsDouble = 0,
					removeFunctions = [];

				// Create array
				async.each(cycles, function(zero, cycleFinished) {



					function testListener0() { listener0FireCount++; if(config.verbose) console.log(i + '_testListener0'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener1() { listener1FireCount++; if(config.verbose) console.log(i + '_testListener1'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener2() { listener2FireCount++; if(config.verbose) console.log(i + '_testListener2'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener3() { listener3FireCount++; if(config.verbose) console.log(i + '_testListener3'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener4() { listener4FireCount++; if(config.verbose) console.log(i + '_testListener4'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener5() { listener5FireCount++; if(config.verbose) console.log(i + '_testListener5'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener6() { listener6FireCount++; if(config.verbose) console.log(i + '_testListener6'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; if (arguments.length > 1) debugger; }
					function testListener7() { listener7FireCount++; if(config.verbose) console.log(i + '_testListener7'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; /*if (arguments.length > 1) debugger;*/ }
					function testListener8() { listener8FireCount++; if(config.verbose) console.log(i + '_testListener8'); if (arguments.length === 2) argumentsSingle++; else if (arguments.length === 3) argumentsDouble++; /*if (arguments.length > 1) debugger;*/ }



					// Single event without memory, destroying itself
					aps.addSingleFireEventListener(i + '_testListener8', i + '_testEvent1', testListener8);



					// Simple event
					removeFunctions[i] = aps.addEventListener(i + '_testListener0', i + '_testEvent1', testListener0);



					// Create an a double listenerName error
					try {

						aps.addEventListener(i + '_testListener0', [
							i + '_testEvent1', '&&',
							i + '_testEvent2'
						], testListener0);

					} catch (err) { errorDoubleListenerName++; }



					// Double AND event
					aps.addEventListener(i + '_testListener1', [
						i + '_testEvent1', '&&',
						i + '_testEvent2'
					], testListener1);



					// Create an a double listenerName error
					try {

						aps.addEventListener(i + '_testListener1', i + '_testEvent1', testListener1);

					} catch (err) { errorDoubleListenerName++; }



					// Double OR event (without a name)
					aps.addEventListener([
						i + '_testEvent1', '||',
						i + '_testEvent2'
					], testListener2);



					// Complex event
					aps.addEventListener(i + '_testListener3', [
						i + '_testEvent1', '&&',
						[
							i + '_testEvent2', '||',
							i + '_testEvent3'
						]
					], testListener3);



					// Create an a double listener error
					try {

						aps.addEventListener([
							i + '_testEvent1', '&&',
							[
								i + '_testEvent2', '||',
								i + '_testEvent3'
							]
						], testListener3);

					} catch (err) { errorDoubleListener++; }



					// Complex event
					aps.addEventListener(i + '_testListener4', [
						i + '_testEvent1', '&&',
						[
							i + '_testEvent2', '&&',
							i + '_testEvent3'
						]
					], testListener4);



					// First batch of events
					aps.dispatchEvent(i + '_testEvent1', 'firstArgument' + arguments1[i]);
					aps.dispatchEvent(i + '_testEvent2');
					aps.dispatchEvent(i + '_testEvent3');



					// Single event without memory
					aps.addEventListener(i + '_testListener5', i + '_testEvent1', testListener5);



					// Single event with memory
					aps.addEventListener(i + '_testListener6', i + '_testEvent1', testListener6, true);



					// Second batch of events
					aps.dispatchEvent(i + '_testEvent1', 'firstArgument' + arguments1[i], 'secondArgument' + arguments1[i]);
					aps.dispatchEvent(i + '_testEvent2');
					aps.dispatchEvent(i + '_testEvent3');



					// Single event with memory, destroying itself
					aps.addSingleFireEventListener(i + '_testListener7', i + '_testEvent1', testListener7, true);



					// Concluding event
					aps.addEventListener(i + '_testFinalListener', i + '_testEvent3', function() {

						if(config.verbose) console.log('FINISHED');

						cycleFinished();

					}, true);

					// Increase the i
					i++;

				}, function() {

					if(config.verbose) console.log('REALLY FINISHED');

					// Cleanup
					cycles.forEach(function(cycle) {
						// Removing one eventListener via its return function
						removeFunctions[cycle]();
						// Remove the rest via its direct name
						aps.removeEventListener(cycle + '_testListener1');
						aps.removeEventListener('anonymousListener0');
						aps.removeEventListener(cycle + '_testListener3');
						aps.removeEventListener(cycle + '_testListener4');
						aps.removeEventListener(cycle + '_testListener5');
						aps.removeEventListener(cycle + '_testListener6');
						aps.removeEventListener(cycle + '_testFinalListener');
						aps.removeEventFromMemory(cycle + '_testEvent1');
						aps.removeEventFromMemory(cycle + '_testEvent2');
						aps.removeEventFromMemory(cycle + '_testEvent3');
					});

					//console.timeEnd(testName);

					// Test the counts

					// Fire counts
					if (listener2FireCount			!== 4 * cycles.length) debugger;
					if (listener3FireCount			!== 5 * cycles.length) debugger;
					if (listener4FireCount			!== 4 * cycles.length) debugger;
					if (listener5FireCount			!== 1 * cycles.length) debugger;
					if (listener6FireCount			!== 2 * cycles.length) debugger;
					if (listener7FireCount			!== 1 * cycles.length) debugger;
					if (listener8FireCount			!== 1 * cycles.length) debugger;
					if (test.checks) {
						if (listener0FireCount		!== 2 * cycles.length) debugger;
						if (listener1FireCount		!== 3 * cycles.length) debugger;
					} else {
						if (listener0FireCount		!== 5 * cycles.length) debugger;
						if (listener1FireCount		!== 5 * cycles.length) debugger;
					}

					// Error doubleListener
					if (test.checks) {
						if (errorDoubleListenerName		!== 2 * cycles.length) debugger;
						if (errorDoubleListener			!== 1 * cycles.length) debugger;
					} else {
						if (errorDoubleListenerName		!== 0 * cycles.length) debugger;
						if (errorDoubleListener			!== 0 * cycles.length) debugger;
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


					aps.removeAll();

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
