'use strict';

// TODO: Create a selfDestroying eventListener, that will only listen once and then destoy itself

// TODO: Build a ie8 version, with the non ie8 compatible code replaced

// TODO: Guarantee that listeners will be fired in the order that they have been added?

angular.module('awesome.services.events4', [])
	.provider('events4', function() {



		// Init the default configuration
		var config = {
			checks: false,
			verbose: false,
			storeArguments: false
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
				thisService = {},
				eventsMemory = [],
				eventMemoryObjects = [],
				eventRefs = [],
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
				};



			// Add event listener
			//noinspection FunctionWithMultipleLoopsJS
			thisService.addEventListener = function(listenerName, eventNameOrEventNamesObject, listener, checkMemory) {

				// Checks
				if (config.checks) {

					// If listenerName is not a non empty string
					if (typeof listenerName !== 'string' || listenerName === '')

						// Throw error
						throw new Error('listenerName should be a non empty string');

					// If eventNameOrEventNamesObject is not a non empty string or a non empty array (perf1)
					if (!(typeof eventNameOrEventNamesObject === 'string' && eventNameOrEventNamesObject !== '') && !(Array.isArray(eventNameOrEventNamesObject) && eventNameOrEventNamesObject.length > 0))

						// Throw error
						throw new Error('eventNameOrEventNamesObject should be a non empty string or a non empty array');

					// If eventNameOrEvenNamesObject is not a non empty string (perf2)
					if (typeof listener !== 'function')

						// Throw error
						throw new Error('listener should be a function');

					// If checkMemory is not undefined or a Boolean
					if (typeof checkMemory !== 'undefined' && typeof checkMemory !== 'boolean')

						// Throw error
						throw new Error('(Optional) checkMemory should be a boolean');

					// Loop over the eventRefs
					each(eventRefs, function(eventRef) {

						// If a singleListener with the same listenerName can be found
						if (findByKey(eventRef.singleListeners, 'listenerName', listenerName))

							// Throw an error
							throw new Error('Listener \'' + listenerName + '\' is already registered');

						// If a multiListener with the same listenerName can be found
						if (findByKey(eventRef.multiListeners, 'listenerName', listenerName))

							// Throw an error
							throw new Error('Listener \'' + listenerName + '\' is already registered');

					});

				}



				// If this is a single event
				if (typeof eventNameOrEventNamesObject === 'string') {

					// Create an eventName shorthand
					var eventName = eventNameOrEventNamesObject;

					// Verbose
					if (config.verbose) console.log('%caddEventListener (single) add:\t\t%s', consoleColors['addEventListener (single) add'], listenerName);

					// Create a new newListenerObject
					var newListenerObject = {
						listenerName: listenerName,
						listener: listener
					};

					// Add the listener
					addListener('single', eventName, newListenerObject);

					// If the eventsMemory should be checked
					if (checkMemory) {

						// If the arguments are being stored
						if (config.storeArguments) {

							// Find the eventMemoryObject
							var eventMemoryObject = findByKey(eventMemoryObjects, 'eventName', eventName);

							// If an eventMemoryObject is found
							if (eventMemoryObject) {

								// Verbose
								if (config.verbose) console.log('%cfireMemory (single):\t\t\t\t%s', consoleColors['fireMemory (single)'], listenerName);

								// Apply the listener with the stored arguments
								listener.apply(null, eventMemoryObject.arguments);

							}

						}

						// If the arguments are not being stored
						else

							// If an eventMemory is found
							if (indexOf(eventsMemory, eventName) !== -1) {

								// Verbose
								if (config.verbose) console.log('%cfireMemory (single):\t\t\t\t%s', consoleColors['fireMemory (single)'], listenerName);

								// Call the listener
								listener(eventName);

							}

					}

				}



				// Else assume this is a multi event
				else {

					// Create an eventNamesObject shorthand
					var eventNamesObject = eventNameOrEventNamesObject;

					// Verbose
					if (config.verbose) console.log('%caddEventListener (multiple) add:\t%s', consoleColors['addEventListener (multiple) add'], listenerName);

					// Create a new newListenerObject
					var newListenerObject = {
						listenerName: listenerName,
						eventNamesObject: eventNamesObject,
						eventNamesFlat: flattenEventNamesObject(eventNamesObject),
						listener: listener,
						eventsMemory: []
					};

					// Loop over the eventNamesFlat
					each(newListenerObject.eventNamesFlat, function(eventName) {

						// Add the listener
						addListener('multi', eventName, newListenerObject);

					});

					// If the eventsMemory should be checked
					if (checkMemory) {

						// Loop over the eventNamesFlat
						each(newListenerObject.eventNamesFlat, function(eventName) {

							// TODO: HERE WE SHOULD DESTINGUISH BETWEEN STORING ARGUMENTS AND NOT, BECAUSE IT WOULD MEAN AN OTHER MEMORY OBJECT

							// If the arguments are being stored
							if (config.storeArguments) {

								// If an eventMemoryObject is found
								if (findByKey(eventMemoryObjects, 'eventName', eventName))

									// Add it to the eventsMemory of the listener object
									newListenerObject.eventsMemory.push(eventName);

							}

							// If the arguments are not being stored
							else

								// If an eventMemory is found
								if (indexOf(eventsMemory, eventName) !== -1)

									// Add it to the eventsMemory of the listener object
									newListenerObject.eventsMemory.push(eventName);

						});

						// If the eventNamesObject parses into true
						if (parseEventNamesObject(newListenerObject.eventNamesObject, newListenerObject.eventsMemory)) {

							// Verbose
							if (config.verbose) console.log('%cfireMemory (multi):\t\t\t%s', consoleColors['fireMemory (multi)'], listenerName);

							// Call the listener
							listener();

						}

					}

				}

				// Return the listenerName, so it can be stored by the calling function
				return listenerName;

			};



			// Clear all (mainly for testing purposes)
			thisService.clearAll = function() {

				// Clear all arrays
				while (eventsMemory.length > 0) eventsMemory.pop();
				while (eventMemoryObjects.length > 0) eventMemoryObjects.pop();
				while (eventRefs.length > 0) eventRefs.pop();

			};



			// Dispatch an event
			//noinspection FunctionWithMultipleLoopsJS
			thisService.dispatchEvent = function(eventName) {

				// If eventName is not a non empty string
				if (typeof eventName !== 'string' || eventName === '')

					// Throw error
					throw new Error('eventName should be a non empty string');

				// Verbose
				if (config.verbose) console.log('%cdispatchEvent:\t\t\t\t\t\t%s', consoleColors.dispatchEvent, eventName);

				// Store the eventArguments
				var eventArguments = arguments;

				// If the arguments are being stored
				if (config.storeArguments) {

					// Find the eventMemoryObject
					var eventMemoryObject = findByKey(eventMemoryObjects, 'eventName', eventName);

					// If an eventMemoryObject if found
					if (eventMemoryObject)

						// Update the arguments
						eventMemoryObject.arguments = eventArguments;

					// If no eventMemoryObject if found
					else

						// Push a new eventMemoryObject
						eventMemoryObjects.push({
							eventName: eventName,
							arguments: eventArguments
						});

				}

				// If the arguments are not being stored
				else {

					// If an eventMemory is not found
					if (indexOf(eventsMemory, eventName) === -1)

						// Push the new eventName
						eventsMemory.push(eventName);

				}

				// Find the eventRef
				var eventRef = findByKey(eventRefs, 'eventName', eventName);

				// If an eventRef is found
				if (eventRef) {

					// Loop over the singleListeners
					each(eventRef.singleListeners, function(singleListener) {

						// Verbose
						if (config.verbose) console.log('%ccallListener (single):\t\t\t\t%s\t%s', consoleColors['callListener (single)'], eventName, singleListener.listenerName);

						// Apply the listener
						singleListener.listener.apply(null, eventArguments);

					});

					// Loop over the multiListeners
					each(eventRef.multiListeners, function(multiListener) {

						// If the eventName does not exist in the eventsMemory yet
						if (indexOf(multiListener.eventsMemory, eventName) === -1)

							// Push the new eventName into the multiListeners eventsMemory
							multiListener.eventsMemory.push(eventName);

						// Checks if this listener needs to fire
						if (parseEventNamesObject(multiListener.eventNamesObject, multiListener.eventsMemory)) {

							// Verbose
							if (config.verbose) console.log('%ccallListener (multi):\t\t\t\t%s (%s)', consoleColors['callListener (multi)'], eventName, multiListener.listenerName);

							// Call the listener
							multiListener.listener();

						}

					});

				}

			};



			// Clear an event from eventsMemory
			//noinspection FunctionWithMultipleLoopsJS
			thisService.clearEventFromMemory = function(eventName) {

				// TODO: Also do a check to make sure this eventName exits!

				// Checks
				if (config.checks)

					// If eventName is not a non empty string
					if (typeof eventName !== 'string' || eventName === '')

						// Throw error
						throw new Error('eventName should be a non empty string');

				// Verbose
				if (config.verbose) console.log('%cmemory: clear\t\t\t\t\t\t%s', consoleColors['memory: clear'], eventName);

				// If the arguments are being stored
				if (config.storeArguments) {

					// Find the eventMemoryObjectIndex
					var eventMemoryObjectIndex = indexByKey(eventMemoryObjects, 'eventName', eventName);

					// If an eventMemoryObjectIndex is found
					if (eventMemoryObjectIndex !== -1)

						// Remove the element
						removeArrayElement(eventMemoryObjects, eventMemoryObjectIndex);


				}

				// If the arguments are not being stored
				else {

					// Find the eventMemoryIndex
					var eventMemoryIndex = indexOf(eventsMemory, eventName);

					// If an eventMemory is found
					if (eventMemoryIndex !== -1)

						// Remove the element
						removeArrayElement(eventsMemory, eventMemoryIndex);

				}

				// Find the eventRef
				var eventRef = findByKey(eventRefs, 'eventName', eventName);

				// If there is an eventRef for this eventName
				if (eventRef)

					// Loop over the multiListeners
					each(eventRef.multiListeners, function(multiListener) {

						// Get the index of the eventName in the eventsMemory array
						var eventMemoryIndex = indexOf(multiListener.eventsMemory, eventName);

						// If the eventName is found
						if (eventMemoryIndex !== -1)

							// Remove the element
							removeArrayElement(multiListener.eventsMemory, eventMemoryIndex);

					});

			};



			// Remove a specific event listener
			//noinspection FunctionWithMultipleLoopsJS
			thisService.removeEventListener = function removeEventListener(listenerName) {

				// TODO: Also do a check to make sure this listenerName exits!

				// Checks
				if (config.checks)

					// If listenerName is not a non empty string
					if (typeof listenerName !== 'string' || listenerName === '')

						// Throw error
						throw new Error('listenerName should be a non empty string');

				// TODO: This loop can be done via a lookup per listenerName too (???)

				// Verbose
				if (config.verbose) console.log('%clistener: clear\t\t\t\t\t%s', consoleColors['listener: clear'], listenerName);

				// Loop over the eventRefs
				each(eventRefs, function(eventRef) {

					// Loop over the singleListeners
					each(eventRef.singleListeners, function(singleListener, iSingleListener) {

						// If the listenerName matches
						if (singleListener.listenerName === listenerName)

							// Remove the array element
							removeArrayElement(eventRef.singleListeners, iSingleListener);

					});

					// Loop over the multiListeners
					each(eventRef.multiListeners, function(multiListener, iMultiListener) {

						// If the listenerName matches
						if (multiListener.listenerName === listenerName)

							// Remove the array element
							removeArrayElement(eventRef.multiListeners, iMultiListener);


					});

				});

			};



			// Remove an array of event listeners
			thisService.removeEventListeners = function(listenerNames) {

				// Checks
				if (config.checks)

					// If listenerNames is not an array (perf1)
					if (!Array.isArray(listenerNames))

						// Throw error
						throw new Error('listenerNames should be an array');

				// Verbose
				if (config.verbose) console.log('%clisteners: clear\t\t\t%s', consoleColors['listeners: clear'], listenerNames);

				// Loop over the listenerNames
				each(listenerNames, function(listenerName) {

					// Remove the listenerName
					thisService.removeEventListener(listenerName);

				});

			};



			// Update config (mainly for testing purposes)
			thisService.updateConfig = function(newConfig) {

				// If the checks key is a boolean
				if (typeof newConfig.checks === 'boolean')

					// Set the new checks value
					config.checks = newConfig.checks;

				// If the storeArguments key is a boolean
				if (typeof newConfig.storeArguments === 'boolean')

					// Set the new storeArguments value
					config.storeArguments = newConfig.storeArguments;

				// If the verbose key is a boolean
				if (typeof newConfig.verbose === 'boolean')

					// Set the new verbose value
					config.verbose = newConfig.verbose;

			};



			// Parse an event names object
			//noinspection FunctionWithMoreThanThreeNegationsJS,FunctionWithMultipleLoopsJS
			function parseEventNamesObject(operatorsOriginal, eventsMemory) {

				// Checks
				if (config.checks)

					// First check the object if needed
					each(operatorsOriginal, function(operatorOriginal, i) {

						if (i % 2 === 0 && typeof operatorOriginal !== 'string' && Object.prototype.toString.call(operatorOriginal) !== '[object Array]' && typeof operatorOriginal !== 'boolean')
							throw new Error('Even element should be a string or a (sub)array. It is of type \'' + typeof operatorOriginal + '\' and of value \'' + operatorOriginal + '\'');

						if (i % 2 === 1 && operatorOriginal !== '&&' && operatorOriginal !== '||')
							throw new Error('Uneven element should be \'&&\' or \'&&\'. It is of type \'' + typeof operatorOriginal + '\' and of value \'' + operatorOriginal + '\'');

					});

				var
					// Run 1: Create a fresh object, copy the arrays, and parse the strings
					eventNamesObject = [];

				// Loop over all the operators
				each(operatorsOriginal, function(operatorOriginal, i) {

					// On the even values
					if (i % 2 === 0) {

						// If this is a string
						if (typeof operatorOriginal === 'string')

							// Parse the value
							eventNamesObject[i] = indexOf(eventsMemory, operatorOriginal) !== -1;

						// Else if this is not a string (and therefore an array)
						else

							// Just copy the array
							eventNamesObject[i] = operatorOriginal;

					}

					// on the uneven values
					else

						// Just copy the operator
						eventNamesObject[i] = operatorOriginal;

				});

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
				each(eventNamesObject, function(eventNameObject, i) {

					// If this is a array
					if (Object.prototype.toString.call(eventNameObject) === '[object Array]')

						// Recursive parse
						eventNamesObject[i] = parseEventNamesObject(eventNameObject, eventsMemory);

				});

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

				// TODO: Make a each() out of this one
				for (var i = 0, operatorsLength = operatorsOriginal.length; i < operatorsLength; i += 2) {

					// If the operator is a string
					if (typeof operatorsOriginal[i] === 'string') {

						// And the value is not already in the array
						// PERFORMANCE [1] array.push()
						if (indexOf(eventNamesFlat, operatorsOriginal[i]) === -1)

							// Push it in
							eventNamesFlat.push(operatorsOriginal[i]);

					}

					// Else assume it's an array
					else

						// Recurse over that array
						flattenEventNamesObject(operatorsOriginal[i], eventNamesFlat);

				}

				// Return the flat array
				return eventNamesFlat;

			}



			function each(array, fn) {

				// Loop over the array (cached length)
				for (var i = 0, length = array.length; i < length; i++)

					// Make sure this value is not null
					if (array[i] !== null)

						// Execute the fn by passing the value
						fn(array[i], i);

			}



			function indexByKey(array, key, value) {

				// Loop over the array (cached length)
				for (var i = 0, length = array.length; i < length; i++)

					// If the object has the value at the key
					if (array[i] !== null && array[i][key] === value)

						// Return this object
						return i;

				// If the element is not found return -1
				return -1;

			}


			function findByKey(array, key, value) {

				// Get the index
				var index = indexByKey(array, key, value);

				// If index is -1 (so the element is not found)
				if (index === -1)

					// Return null
					return null;

				// Else return the element
				return array[index];

			}


			function addListener(singleOrMulti, eventName, listener) {

				// Find the eventRef
				var eventRef = findByKey(eventRefs, 'eventName', eventName);

				// If there is no eventRef object yet
				if (!eventRef) {

					// Create it
					eventRef = {
						eventName: eventName,
						singleListeners: [],
						multiListeners: []
					};

					// Push the eventRef object in the eventRefs array
					eventRefs.push(eventRef);

				}

				// Add the new listener to the eventRef object
				eventRef[singleOrMulti + 'Listeners'].push(listener);

			}



			// An efficient index of function
			function indexOf(array, value) {

				// Init the foundIndex
				var foundIndex = -1;

				// Loop over the array
				each(array, function(element, iArray) {

					// If the element is the value we're looking for
					if (element === value) {

						// Set the foundIndex
						foundIndex = iArray;

						// Stop this function
						// TODO: THERE ARE PROBLEMS WITH THIS OPTIMIZATION BECAUSE OF THE SCOPE CHANGE
						return foundIndex;

					}

				});

				// Return the foundIndex
				return foundIndex;

			}



			// Remove an element from an array
			function removeArrayElement(array, index) {

				// TODO: Perf question: Is it better to splice or to null, looking at looping performance of the array later on

				// Splice
				//array.splice(index, 1);

				// Null
				array[index] = null;

			}



			// Set the statuschange events
			// TODO: Move this to a separate Angular implementation
			(function() {

				var $rootScope;

				if (config.stateChangeStart) {

					$rootScope = $injector.get('$rootScope');
					// TODO: Do this with a more elegant call/apply method
					$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
						thisService.dispatchEvent('native.$stateChangeStart', event, toState, toParams, fromState, fromParams);
					});

				}

				if (config.stateChangeSuccess) {

					if (!$rootScope)
						$rootScope = $injector.get('$rootScope');
					$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
						thisService.dispatchEvent('native.$stateChangeSuccess', event, toState, toParams, fromState, fromParams);
					});

				}

			})();



			// Return thisService
			return thisService;

		};

	});
