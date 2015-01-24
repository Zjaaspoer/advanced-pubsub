'use strict';

// TODO: Create a selfDestroying eventListener, that will only listen once and then destoy itself

angular.module('awesome.services.events', [])
	.provider('events', function() {



		// Init the default configuration
		var config = {
			check: false,
			verbose: false
		};



		// Configure the service
		this.config = function(newConfig) {

			// Update the default config with the newConfig
			angular.extend(config, newConfig);

		};



		// Create the factory
		this.$get = function eventsFactory(
			$injector
		) {

			// Init variables
			var
				// TODO: Is this the right way to do this with a provider?
				self = {},
				eventsMemory = {},
				eventRefs = {},
				consoleColors = {
					'addEventListener (single) add':	'color:rgb(255,  0,  0)',
					'addEventListener (multiple) add':	'color:rgb(128,  0,  0)',
					'fireMemory (single)':				'color:rgb(  0,255,  0)',
					'fireMemory (multi)':				'color:rgb(  0,128,  0)',
					'callListener (single)':			'color:rgb(  0,  0,255)',
					'callListener (multi)':				'color:rgb(  0,  0,128)',
					dispatchEvent:						'color:rgb(255,  0,255)',
					'memory: clear':					'color:rgb(  0,128,128)',
					'listeners: clear':					'color:rgb(128,128,  0)',
					'listener: clear':					'color:rgb(128,  0,128)'
				},
				// Set shorthands for the config parameters
				verbose = config.verbose,
				check = config.check;



			// Add event listener
			//noinspection FunctionWithMultipleLoopsJS
			self.addEventListener = function(listenerName, eventNameOrEventNamesObject, listener, checkMemory, argumentsEvent) {

				// If listenerName is not a non empty string
				if (check && typeof listenerName !== 'string' || listenerName === '')

					// Throw error
					throw new Error('listenerName should be a non empty string');

				// If eventNameOrEventNamesObject is not a non empty string or a non empty array (perf1)
				if (check && !(typeof eventNameOrEventNamesObject === 'string' && eventNameOrEventNamesObject !== '') && !(Array.isArray(eventNameOrEventNamesObject) && eventNameOrEventNamesObject.length > 0))

					// Throw error
					throw new Error('eventNameOrEventNamesObject should be a non empty string or a non empty array');

				// If eventNameOrEvenNamesObject is not a non empty string (perf2)
				if (check && typeof listener !== 'function')

					// Throw error
					throw new Error('listener should be a function');

				// If checkMemory is not undefined or a Boolean
				if (check && typeof checkMemory !== 'undefined' && typeof checkMemory !== 'boolean')

					// Throw error
					throw new Error('(Optional) checkMemory should be a boolean');

				// TODO: Create argumentsEvent check

				// If this is a single event
				if (typeof eventNameOrEventNamesObject === 'string') {

					// Verbose
					if (verbose) console.log('%caddEventListener (single) add:\t\t%s', consoleColors['addEventListener (single) add'], listenerName);

					// If check is enabled and this event has an eventRef, check that this listener does not exist yet
					if (check) {
						// Loop through all of the events
						for (var iKey = 0, eventNames = Object.keys(eventRefs), lengthEventNames = eventNames.length; iKey < lengthEventNames; iKey++)
							// Loop through all the singleListeners
							for (var iListener = 0, listenersLength = eventRefs[eventNames[iKey]].singleListeners.length; iListener < listenersLength; iListener++)
								// If this listener is not nulled (because of the clearEventListener method) & If the listenerName is the same
								if (eventRefs[eventNames[iKey]].singleListeners[iListener] && eventRefs[eventNames[iKey]].singleListeners[iListener].listenerName === listenerName)
									// Throw an error
									throw new Error('Single event \'' + listenerName + '\' is already registered');
					}

					// If there is no eventRef object yet, create it
					if (!eventRefs[eventNameOrEventNamesObject])
						eventRefs[eventNameOrEventNamesObject] = {
							singleListeners: [],
							multiListeners: []
						};

					// Add the new listener to the eventRef object
					eventRefs[eventNameOrEventNamesObject].singleListeners.push({
						listenerName: listenerName,
						eventName: eventNameOrEventNamesObject,
						listener: listener
					});

					// If the memory should be checked, and the event is in memory, fire the listener
					if (checkMemory && eventsMemory[eventNameOrEventNamesObject]) {

						// Verbose
						if (verbose) console.log('%cfireMemory (single):\t\t\t\t%s', consoleColors['fireMemory (single)'], listenerName);

						// Fire the listener with the arguments provided
						listener.apply(null, eventsMemory[eventNameOrEventNamesObject]);

					}

				}



				// If this is an array of eventNames
				else if (Object.prototype.toString.call(eventNameOrEventNamesObject) === '[object Array]') {

					// Verbose
					if (verbose) console.log('%caddEventListener (multiple) add:\t%s', consoleColors['addEventListener (multiple) add'], listenerName);

					// Check that this listener does not exist yet
					// TODO: Create the check again
					/*if (check)
						throw new Error('Multi event \'' + listenerName + '\' is already registered');*/

					// Add the listener to the listeners object
					var newListenerObject = {
						listenerName: listenerName,
						eventNamesObject: eventNameOrEventNamesObject,
						eventNamesFlat: flattenEventNamesObject(eventNameOrEventNamesObject),
						listener: listener,
						argumentsEvent: argumentsEvent,
						memory: []
					};

					// Loop over every seperate event
					for (var iEvent = 0, eventsLength = newListenerObject.eventNamesFlat.length; iEvent < eventsLength; iEvent++) {

						// If check is enabled and this event has an eventRef, check that this listener does not exist yet
						if (check && eventRefs[newListenerObject.eventNamesFlat[iEvent]]) {
							// Loop through all the multiListeners
							for (var jListener = 0, listenersLengthJ = eventRefs[newListenerObject.eventNamesFlat[iEvent]].multiListeners.length; jListener < listenersLengthJ; jListener++)
								// If this listener is not nulled (because of the clearEventListener method) & If the listenerName is the same
								if (eventRefs[newListenerObject.eventNamesFlat[iEvent]].multiListeners[jListener] && eventRefs[newListenerObject.eventNamesFlat[iEvent]].multiListeners[jListener].listenerName === listenerName)
								// Throw an error
									throw new Error('Multi event \'' + listenerName + '\' is already registered');
						}

						// Create the eventRef object if it does not yet exist
						if (!eventRefs[newListenerObject.eventNamesFlat[iEvent]])
							eventRefs[newListenerObject.eventNamesFlat[iEvent]] = {
								singleListeners: [],
								multiListeners: []
							};

						// Push the created listener into the eventRef object of this event
						eventRefs[newListenerObject.eventNamesFlat[iEvent]].multiListeners.push(newListenerObject);

					}



					// If the memory should be checked
					if (checkMemory) {

						// Fill the memory of the listener object: First loop over all the events of this listener
						for (var jEvent = 0, eventsLengthJ = newListenerObject.eventNamesFlat.length; jEvent < eventsLengthJ; jEvent++) {
							// If the event is allready in the main memory
							if (eventsMemory[newListenerObject.eventNamesFlat[jEvent]])
							// Add it to the memory of the listener object
								newListenerObject.memory.push(newListenerObject.eventNamesFlat[jEvent]);
						}

						// Check if the eventNamesObject parses into true, and fire if so
						if (parseEventNamesObject(newListenerObject.eventNamesObject, newListenerObject.memory)) {

							// Verbose
							if (verbose) console.log('%cfireMemory (multi):\t\t\t%s', consoleColors['fireMemory (multi)'], listenerName);

							// If there is an argumentsEvent, call the listener with those arguments
							if (argumentsEvent && eventsMemory[argumentsEvent])
								listener.apply(null, eventsMemory[argumentsEvent]);

							// Else just call the listener
							else
								listener.apply();

						}

					}

				}

				// Return the listenerName, so it can be stored by the calling function
				return listenerName;

			};



			// Dispatch an event
			//noinspection FunctionWithMultipleLoopsJS
			self.dispatchEvent = function(eventName) {

				// If eventName is not a non empty string
				if (check && typeof eventName !== 'string' || eventName === '')

					// Throw error
					throw new Error('eventName should be a non empty string');

				// Verbose
				if (verbose) { //noinspection JSHint
					console.log('%cdispatchEvent:\t\t\t\t\t\t%s', consoleColors.dispatchEvent, eventName);
				}

				// Create the event in eventsMemory
				eventsMemory[eventName] = arguments;

				// Normal broadcast
				if (eventRefs[eventName]) {



					// Loop over the singleListeners
					for (var i = 0, listenersLength = eventRefs[eventName].singleListeners.length; i < listenersLength; i++)
						if (eventRefs[eventName].singleListeners[i]) {

							// Verbose
							if (verbose) console.log('%ccallListener (single):\t\t\t\t%s\t%s', consoleColors['callListener (single)'], eventName, eventRefs[eventName].singleListeners[i].listenerName);

							eventRefs[eventName].singleListeners[i].listener.apply(null, arguments);

						}



					// Loop through the collections (Check if one of the collections needs to be fired)
					for (var j = 0, listenersLengthJ = eventRefs[eventName].multiListeners.length; j < listenersLengthJ; j++) {

						// Push the new event into the multiListeners memory, if it does not yet exist
						if (eventRefs[eventName].multiListeners[j] && !efficientIndexOf(eventRefs[eventName].multiListeners[j].memory, eventName))
							eventRefs[eventName].multiListeners[j].memory.push(eventName);

						// Check if this listener needs to file
						if (eventRefs[eventName].multiListeners[j] && parseEventNamesObject(eventRefs[eventName].multiListeners[j].eventNamesObject, eventRefs[eventName].multiListeners[j].memory)) {

							// Verbose
							if (verbose) console.log('%ccallListener (multi):\t\t\t\t%s (%s)', consoleColors['callListener (multi)'], eventName, eventRefs[eventName].multiListeners[j].listenerName);

							// If there is an argumentsEvent, call the listener with those arguments
							if (eventRefs[eventName].multiListeners[j].argumentsEvent && eventsMemory[eventRefs[eventName].multiListeners[j].argumentsEvent])
								eventRefs[eventName].multiListeners[j].listener.apply(null, eventsMemory[eventRefs[eventName].multiListeners[j].argumentsEvent]);

							// Else just call the listener
							else
								eventRefs[eventName].multiListeners[j].listener.apply();

						}

					}

				}

			};



			// Clear an event from memory
			//noinspection FunctionWithMultipleLoopsJS
			self.clearEventFromMemory = function(eventName) {

				// If eventName is not a non empty string
				if (check && typeof eventName !== 'string' || eventName === '')

					// Throw error
					throw new Error('eventName should be a non empty string');

				// Verbose
				if (verbose) console.log('%cmemory: clear\t\t\t\t\t\t%s', consoleColors['memory: clear'], eventName);

				// Clear the arguments memory
				if (eventsMemory[eventName])
					eventsMemory[eventName] = null;

				// If there is an eventRef for this event
				if (eventRefs[eventName])
					// Remove from multi events by first looping through the multiListeners of this event
					for (var iListener = 0, listenerLength = eventRefs[eventName].multiListeners.length; iListener < listenerLength; iListener++)
						// Only if this listener has not allready been nullified
						if (eventRefs[eventName].multiListeners[iListener])
						// Loop through all the events in memory for this listener
							for (var iEvent = 0, eventLength = eventRefs[eventName].multiListeners[iListener].memory.length; iEvent < eventLength; iEvent++)
								// If the name of the event is found
								if (eventRefs[eventName].multiListeners[iListener].memory[iEvent] === eventName)
								// Set the value to null
									eventRefs[eventName].multiListeners[iListener].memory[iEvent] = null;

			};



			// Remove a specific event listener
			//noinspection FunctionWithMultipleLoopsJS
			self.removeEventListener = function removeEventListener(listenerName) {

				// If listenerName is not a non empty string
				if (check && typeof listenerName !== 'string' || listenerName === '')

					// Throw error
					throw new Error('listenerName should be a non empty string');

				// TODO: Perf question: Is it better to splice or to null, looking at looping performance of the array later on
				// TODO: This loop can be done via a lookup per listenerName too

				// Verbose
				if (verbose) console.log('%clistener: clear\t\t\t\t\t%s', consoleColors['listener: clear'], listenerName);

				// Loop through all the eventRefs
				for (var iKey = 0, eventNames = Object.keys(eventRefs), lengthEventNames = eventNames.length; iKey < lengthEventNames; iKey++) {

					// Loop through the singleListeners
					for (var iListener = 0, lengthListeners = eventRefs[eventNames[iKey]].singleListeners.length; iListener < lengthListeners; iListener++) {
						// If this singleListener exists, and it has the right listenerName, set it to null
						if (eventRefs[eventNames[iKey]].singleListeners[iListener] && eventRefs[eventNames[iKey]].singleListeners[iListener].listenerName === listenerName)
							eventRefs[eventNames[iKey]].singleListeners[iListener] = null;
					}

					// Loop throught the multiListeners
					for (var jListener = 0, lengthListenersJ = eventRefs[eventNames[iKey]].multiListeners.length; jListener < lengthListenersJ; jListener++) {
						// If the multiListeners exists, and it has the right listenerName, set it to null
						if (eventRefs[eventNames[iKey]].multiListeners[jListener] && eventRefs[eventNames[iKey]].multiListeners[jListener].listenerName === listenerName)
							eventRefs[eventNames[iKey]].multiListeners[jListener] = null;
					}

				}

			};



			// Remove an array of event listeners
			self.removeEventListeners = function(listenerNames) {

				// If listenerNames is not an array (perf1)
				if (check && !Array.isArray(listenerNames))

					// Throw error
					throw new Error('listenerNames should be an array');

				// Verbose
				if (verbose) console.log('%clisteners: clear\t\t\t%s', consoleColors['listeners: clear'], listenerNames);

				// Loop through the array of listener names
				for (var i = 0, listenerNamesLength = listenerNames.length; i < listenerNamesLength; i++)
					self.removeEventListener(listenerNames[i]);

			};



			// Parse an event names object
			//noinspection FunctionWithMoreThanThreeNegationsJS,FunctionWithMultipleLoopsJS
			function parseEventNamesObject(operatorsOriginal, memory) {

				// First check the object if needed
				if (check)
					for (var i = 0, length = operatorsOriginal.length; i < length; i++) {

						if (i % 2 === 0 && typeof operatorsOriginal[i] !== 'string' && Object.prototype.toString.call(operatorsOriginal[i]) !== '[object Array]' && typeof operatorsOriginal[i] !== 'boolean')
							throw new Error('Even element should be a string or a (sub)array. It is of type \'' + typeof operatorsOriginal[i] + '\' and of value \'' + operatorsOriginal[i] + '\'');

						if (i % 2 === 1 && operatorsOriginal[i] !== '&&' && operatorsOriginal[i] !== '||')
							throw new Error('Uneven element should be \'&&\' or \'&&\'. It is of type \'' + typeof operatorsOriginal[i] + '\' and of value \'' + operatorsOriginal[i] + '\'');

					}

				var
					// Run 1: Create a fresh object, copy the arrays, and parse the strings
					eventNamesObject = [],
					// Loop over the original
					even = true;

				for (var j = 0, lengthJ = operatorsOriginal.length; j < lengthJ; j += 1) {
					// On the uneven values
					if (even) {

						// If this is a string, parse the value
						if (typeof operatorsOriginal[j] === 'string')
							eventNamesObject[j] = efficientIndexOf(memory, operatorsOriginal[j]);
						// Else (so it is an array) just copy the array
						else
							eventNamesObject[j] = operatorsOriginal[j];
						// Toggle even
						even = false;

					}

					// on the even values
					else {

						// Just copy the operator
						eventNamesObject[j] = operatorsOriginal[j];
						// Toggle even
						even = true;

					}

				}

				// Run 2: Resolve all '&&'s
				var k = 0;
				// While the k has not reached the 'end' of the array
				while (k <= eventNamesObject.length - 3) {
					// If this is an '&&' situation
					if (eventNamesObject[k + 1] === '&&') {
						// If one of them is false, the result is false
						if (eventNamesObject[k] === false || eventNamesObject[k + 2] === false)
							eventNamesObject.splice(k, 3, false);
						// Else if both are a boolean, parse the result
						else if (typeof eventNamesObject[k] === 'boolean' && typeof eventNamesObject[k + 2] === 'boolean')
							eventNamesObject.splice(k, 3, eventNamesObject[k] && eventNamesObject[k + 2]);
						// Else go one
						else
							k += 2;
					}
					// If this is not an '&&', move on
					else
						k += 2;
				}

				// Run 3: Resolve all '||'s
				var l = 0;
				// While the i has not reached the 'end' of the array
				while (l <= eventNamesObject.length - 3) {
					// If this is an '||' situation
					if (eventNamesObject[l + 1] === '||') {
						// If one of them is false, the result is false
						if (eventNamesObject[l] === true || eventNamesObject[l + 2] === true)
							eventNamesObject.splice(l, 3, true);
						// Else if both are a boolean, parse the result
						else if (typeof eventNamesObject[l] === 'boolean' && typeof eventNamesObject[l + 2] === 'boolean')
							eventNamesObject.splice(l, 3, eventNamesObject[l] || eventNamesObject[l + 2]);
						// Else go one
						else
							l += 2;
					}
					// If this is not an '||', move on
					else
						l += 2;
				}

				// Run 4: Parse all the subarrays
				// Loop over all the elements in the array
				for (var m = 0, lengthM = eventNamesObject.length; m < lengthM; m += 2) {
					// If this is a array
					if (Object.prototype.toString.call(eventNamesObject[m]) === '[object Array]')
					// Recursive parse
						eventNamesObject[m] = parseEventNamesObject(eventNamesObject[m], memory);
				}

				// Run 5: Finally resolve all the '&&'s (for explanation see step 2)
				var n = 0;

				while (n <= eventNamesObject.length - 3) {
					if (eventNamesObject[n + 1] === '&&')
						eventNamesObject.splice(n, 3, eventNamesObject[n] && eventNamesObject[n + 2]);

					else
						n += 2;
				}

				// Run 6: Finally resolve all the '||'s (for explanation see step 2)
				var o = 0;

				while (o <= eventNamesObject.length - 3) {
					if (eventNamesObject[o + 1] === '||')
						eventNamesObject.splice(o, 3, eventNamesObject[o] || eventNamesObject[o + 2]);

					else
						o += 2;
				}

				// Return the found object
				return eventNamesObject[0];

			}



			// Flatten an eventNamesObject
			function flattenEventNamesObject(operatorsOriginal, eventNamesFlat) {

				// Create the flat array
				eventNamesFlat = eventNamesFlat || [];

				for (var i = 0, operatorsLength = operatorsOriginal.length; i < operatorsLength; i += 2) {
					// If the operator is a string
					if (typeof operatorsOriginal[i] === 'string') {
						// And the value is not allready in the array
						// PERFORMANCE [1] array.push()
						if (!efficientIndexOf(eventNamesFlat, operatorsOriginal[i]))
						// Push it in
							eventNamesFlat.push(operatorsOriginal[i]);
					}
					// Else if the value is an array
					else if (Object.prototype.toString.call(operatorsOriginal[i]) === '[object Array]') {
						// Recurse over that array
						flattenEventNamesObject(operatorsOriginal[i], eventNamesFlat);
					}
				}
				// Return the flat array
				return eventNamesFlat;

			}



			// An efficient index of function
			// TODO: Check this out: http://jsperf.com/regexp-test-search-vs-indexof/27
			function efficientIndexOf(array, value) {

				for (var i = 0, arrayLength = array.length; i < arrayLength; i++)
					if (array[i] === value && i in array)
						return true;

				return false;

			}



			// Set the statuschange events
			(function() {

				var $rootScope;

				if (config.stateChangeStart) {

					$rootScope = $injector.get('$rootScope');
					$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
						self.dispatchEvent('native.$stateChangeStart', event, toState, toParams, fromState, fromParams);
					});

				}

				if (config.stateChangeSuccess) {

					if (!$rootScope)
						$rootScope = $injector.get('$rootScope');
					$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
						self.dispatchEvent('native.$stateChangeSuccess', event, toState, toParams, fromState, fromParams);
					});

				}

			})();


			// TODO: Is this the right way to do this?
			return self;

		};

	});
