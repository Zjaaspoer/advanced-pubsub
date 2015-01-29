'use strict';
angular.module('advancedPubSub', [])
	.provider('aps', function() {



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
		this.$get = function apsFactory(
			$injector
		) {

			// Init variables
			var
				thisService = {},
				listenerNameI = 0,
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
					'memory: remove':					'color:rgb(  0,128,128)',
					'listeners: remove':				'color:rgb(128,128,  0)',
					'listener: remove':					'color:rgb(128,  0,128)'
				};



			// Add event listener
			thisService.addEventListener = function(listenerName, eventNameOrEventNamesObject, listener, checkMemory, singleFire) {

				// Init the listenerNameProvided
				var listenerNameProvided = true;

				// If eventNameOrEventNamesObject is a function, assume listenerName is omitted
				if (typeof eventNameOrEventNamesObject === 'function') {

					// Set that listenerName is not provided
					listenerNameProvided = false;

					// Get the singleFire
					singleFire = checkMemory;

					// Get the checkMemory
					checkMemory = listener;

					// Get the listener
					listener = eventNameOrEventNamesObject;

					// Get the eventNameOrEventNamesObject
					eventNameOrEventNamesObject = listenerName;

					// Generate a anonymous listenerName
					listenerName = 'anonymousListener' + listenerNameI++;

				}

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

						// If listenerNames are provided for both the new listener as the listener we are checking, you can compare by listenerName
						if (listenerNameProvided && eventRef.listenerNameProvided) {

							// If a singleListener with the same listenerName can be found
							if (findByKey(eventRef.singleListeners, 'listenerName', listenerName))

								// Throw error
								throw new Error('Listener \'' + listenerName + '\' is already registered');

							// If a multiListener with the same listenerName can be found
							if (findByKey(eventRef.multiListeners, 'listenerName', listenerName))

								// Throw error
								throw new Error('Listener \'' + listenerName + '\' is already registered');

						}

						// But always check the function profiles

						// Loop over the singleListeners
						each(eventRef.singleListeners, function(singleListener) {

							// If the listeners are the same
							if (singleListener.listener === listener)

								// Throw error
								throw new Error('This listenerFunction is already added');

						});

						// Loop over the singleListeners
						each(eventRef.multiListeners, function(multiListener) {

							// If the listeners are the same
							if (multiListener.listener === listener)

								// Throw error
								throw new Error('This listenerFunction is already added');

						});

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
						listener: listener,
						singleFire: !!singleFire,
						listenerNameProvided: listenerNameProvided
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

								// If this is a singleFire eventListener
								if (singleFire)

									// Remove the eventListener
									thisService.removeEventListener(listenerName);

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

								// If this is a singleFire eventListener
								if (singleFire)

									// Remove the eventListener
									thisService.removeEventListener(listenerName);

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
						listenerEventsMemory: [],
						singleFire: !!singleFire,
						listenerNameProvided: listenerNameProvided
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

							// If the arguments are being stored
							if (config.storeArguments) {

								// If an eventMemoryObject is found
								if (findByKey(eventMemoryObjects, 'eventName', eventName))

									// Add it to the listenerEventsMemory of the listener object
									newListenerObject.listenerEventsMemory.push(eventName);

							}

							// If the arguments are not being stored
							else

								// If an eventMemory is found
								if (indexOf(eventsMemory, eventName) !== -1)

									// Add it to the listenerEventsMemory of the listener object
									newListenerObject.listenerEventsMemory.push(eventName);

						});

						// If the eventNamesObject parses into true
						if (parseEventNamesObject(newListenerObject.eventNamesObject, newListenerObject.listenerEventsMemory)) {

							// Verbose
							if (config.verbose) console.log('%cfireMemory (multi):\t\t\t%s', consoleColors['fireMemory (multi)'], listenerName);

							// Call the listener
							listener();

							// If this is a singleFire eventListener
							if (singleFire)

								// Remove the eventListener
								thisService.removeEventListener(listenerName);

						}

					}

				}


				 // Return the function (named to be able to track it in profiling)
				return function removeSpecificEventListener() {

					// That removes the eventListener
					thisService.removeEventListener(listenerName);

				};

			};



			// Add singleFire eventListener
			thisService.addSingleFireEventListener = function(listenerName, eventNameOrEventNamesObject, listener, checkMemory) {

				// Pass through
				return thisService.addEventListener(listenerName, eventNameOrEventNamesObject, listener, checkMemory, true);

			};



			// Remove all (mainly for testing purposes)
			thisService.removeAll = function() {

				// Remove all arrays
				while (eventsMemory.length > 0) eventsMemory.pop();
				while (eventMemoryObjects.length > 0) eventMemoryObjects.pop();
				while (eventRefs.length > 0) eventRefs.pop();

			};



			// Dispatch an event
			thisService.dispatchEvent = function(eventName) {

				// Check
				if (config.checks)

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

						// If this is a singleFire eventListener
						if (singleListener.singleFire)

							// Remove the eventListener
							thisService.removeEventListener(singleListener.listenerName);

					});

					// Loop over the multiListeners
					each(eventRef.multiListeners, function(multiListener) {

						// If the eventName does not exist in the listenerEventsMemory yet
						if (indexOf(multiListener.listenerEventsMemory, eventName) === -1)

							// Push the new eventName into the multiListeners listenerEventsMemory
							multiListener.listenerEventsMemory.push(eventName);

						// Checks if this listener needs to fire
						if (parseEventNamesObject(multiListener.eventNamesObject, multiListener.listenerEventsMemory)) {

							// Verbose
							if (config.verbose) console.log('%ccallListener (multi):\t\t\t\t%s (%s)', consoleColors['callListener (multi)'], eventName, multiListener.listenerName);

							// Call the listener
							multiListener.listener();

							// If this is a singleFire eventListener
							if (multiListener.singleFire)

								// Remove the eventListener
								thisService.removeEventListener(multiListener.listenerName);

						}

					});

				}

			};



			// Remove an event from eventsMemory
			thisService.removeEventFromMemory = function(eventName, disableCheck) {

				// Checks
				if (config.checks)

					// If eventName is not a non empty string
					if (typeof eventName !== 'string' || eventName === '')

						// Throw error
						throw new Error('eventName should be a non empty string');

				// Verbose
				if (config.verbose) console.log('%cmemory: remove\t\t\t\t\t\t%s', consoleColors['memory: remove'], eventName);

				// If the arguments are being stored
				if (config.storeArguments) {

					// Find the eventMemoryObjectIndex
					var eventMemoryObjectIndex = indexByKey(eventMemoryObjects, 'eventName', eventName);

					// If an eventMemoryObjectIndex is found
					if (eventMemoryObjectIndex !== -1)

						// Remove the element
						removeArrayElement(eventMemoryObjects, eventMemoryObjectIndex);

					// Checks: If the event doesn't exist
					else if (config.checks && !disableCheck)

						// Throw error
						throw new Error('During removeEventFromMemory the eventName \'' + eventName + '\' could not be found');


				}

				// If the arguments are not being stored
				else {

					// Find the eventMemoryIndex
					var eventMemoryIndex = indexOf(eventsMemory, eventName);

					// If an eventMemory is found
					if (eventMemoryIndex !== -1)

						// Remove the element
						removeArrayElement(eventsMemory, eventMemoryIndex);

					// Checks: If the event doesn't exist
					else if (config.checks && !disableCheck)

						// Throw error
						throw new Error('During removeEventFromMemory the eventName \'' + eventName + '\' could not be found');

				}

				// Find the eventRef
				var eventRef = findByKey(eventRefs, 'eventName', eventName);

				// If there is an eventRef for this eventName
				if (eventRef)

					// Loop over the multiListeners
					each(eventRef.multiListeners, function(multiListener) {

						// Get the index of the eventName in the listenerEventsMemory array
						var listenerEventMemoryIndex = indexOf(multiListener.listenerEventsMemory, eventName);

						// If the eventName is found
						if (listenerEventMemoryIndex !== -1)

							// Remove the element
							removeArrayElement(multiListener.listenerEventsMemory, listenerEventMemoryIndex);

					});

			};



			// Remove a specific event listener
			thisService.removeEventListener = function removeEventListener(listenerName, disableCheck) {

				// Checks
				if (config.checks)

					// If listenerName is not a non empty string
					if (typeof listenerName !== 'string' || listenerName === '')

						// Throw error
						throw new Error('listenerName should be a non empty string');

				// Verbose
				if (config.verbose) console.log('%clistener: remove\t\t\t\t\t%s', consoleColors['listener: remove'], listenerName);

				// Init the flag listenerFound
				var listenerFound = false;

				// Loop over the eventRefs
				each(eventRefs, function(eventRef) {

					// Loop over the singleListeners
					each(eventRef.singleListeners, function(singleListener, iSingleListener) {

						// If the listenerName matches
						if (singleListener.listenerName === listenerName) {

							// Remove the array element
							removeArrayElement(eventRef.singleListeners, iSingleListener);

							// Set the listenerFound flag to true
							listenerFound = true;

						}

					});

					// Loop over the multiListeners
					each(eventRef.multiListeners, function(multiListener, iMultiListener) {

						// If the listenerName matches
						if (multiListener.listenerName === listenerName) {

							// Remove the array element
							removeArrayElement(eventRef.multiListeners, iMultiListener);

							// Set the listenerFound flag to true
							listenerFound = true;

						}

					});

				});

				// Checks
				if (config.checks && !disableCheck)

					// If no listener is found
					if (!listenerFound)

						// Throw error
						throw new Error('During removeEventListener the listenerName \'' + listenerName + '\' could not be found');

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
				if (config.verbose) console.log('%clisteners: remove\t\t\t%s', consoleColors['listeners: remove'], listenerNames);

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



			// addListener helper function
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



			// Performant each function
			function each(array, fn) {

				// Loop over the array (cached length)
				for (var i = 0, length = array.length; i < length; i++)

					// Make sure this value is not null
					if (array[i] !== null)

						// Execute the fn by passing the value
						fn(array[i], i);

			}



			// Performant findByKey function
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



			// Flatten an eventNamesObject
			function flattenEventNamesObject(operatorsOriginal, eventNamesFlat) {

				// Create the flat array
				eventNamesFlat = eventNamesFlat || [];

				// Loop over the operatorsOriginal
				each(operatorsOriginal, function(operatorOriginal, i) {

					// Only do this fo the even elements (the eventNames / subArrays and not the operators)
					if (i % 2 === 0) {

						// If the operator is a string
						if (typeof operatorOriginal === 'string') {

							// And the value is not already in the array
							// PERFORMANCE [1] array.push()
							if (indexOf(eventNamesFlat, operatorOriginal) === -1)

								// Push it in
								eventNamesFlat.push(operatorOriginal);

						}

						// Else assume it's an array
						else

							// Recurse over that array
							flattenEventNamesObject(operatorOriginal, eventNamesFlat);

					}

				});

				// Return the flat array
				return eventNamesFlat;

			}



			// Performant indexByKey function
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
						// NOTE: We need to return foundIndex, because after optimization there is no 'each' function anymore so with a return the complete indexOf function is returned
						return foundIndex;

					}

				});

				// Return the foundIndex
				return foundIndex;

			}



			// Parse an event names object
			function parseEventNamesObject(operatorsOriginal, listenerEventsMemory) {

				// Checks
				if (config.checks)

					// Loop over the operators
					each(operatorsOriginal, function(operatorOriginal, i) {

						// Even and not a string, array or boolean
						if (i % 2 === 0 && typeof operatorOriginal !== 'string' && !(operatorOriginal instanceof Array) && typeof operatorOriginal !== 'boolean')

							// Throw error
							throw new Error('Even element should be a string or a (sub)array. It is of type \'' + typeof operatorOriginal + '\' and of value \'' + operatorOriginal + '\'');

						// Uneven, and not one of the two allowed operators (&& or ||)
						if (i % 2 === 1 && operatorOriginal !== '&&' && operatorOriginal !== '||')

							// Throw error
							throw new Error('Uneven element should be \'&&\' or \'&&\'. It is of type \'' + typeof operatorOriginal + '\' and of value \'' + operatorOriginal + '\'');

					});

				// Step 1: Create a fresh object, copy the arrays, and parse the strings
				// Init new eventNamesObject
				var eventNamesObject = [];

				// Loop over all the operators
				each(operatorsOriginal, function(operatorOriginal, i) {

					// Even
					if (i % 2 === 0) {

						// If this is an eventName
						if (typeof operatorOriginal === 'string')

							// See if the eventName is part of the listenerEventsMemory
							eventNamesObject[i] = indexOf(listenerEventsMemory, operatorOriginal) !== -1;

						// Else if this is not a string (and therefore an array)
						else

							// Just copy the array
							eventNamesObject[i] = operatorOriginal;

					}

					// Uneven
					else

						// Just copy the operator
						eventNamesObject[i] = operatorOriginal;

				});

				// Step 2: Resolve all '&&'s
				// Init iStep2
				var iStep2 = 0;

				// While the iStep2 has not reached the 'end' of the array
				while (iStep2 <= eventNamesObject.length - 3) {

					// If this is a '&&' situation
					if (eventNamesObject[iStep2 + 1] === '&&') {

						// If one of them is false
						if (eventNamesObject[iStep2] === false || eventNamesObject[iStep2 + 2] === false)

							// The result is false
							eventNamesObject.splice(iStep2, 3, false);

						// Else if both are a boolean
						else if (typeof eventNamesObject[iStep2] === 'boolean' && typeof eventNamesObject[iStep2 + 2] === 'boolean')

							// The result is the comparison
							eventNamesObject.splice(iStep2, 3, eventNamesObject[iStep2] && eventNamesObject[iStep2 + 2]);

						// Else
						else

							// Move on
							iStep2 += 2;

					}

					// If this is not a '&&'
					else

						// Move on
						iStep2 += 2;

				}

				// Step 3: Resolve all '||'s
				// Init iStep3
				var iStep3 = 0;

				// While the iStep3 has not reached the 'end' of the array
				while (iStep3 <= eventNamesObject.length - 3) {

					// If this is a '||' situation
					if (eventNamesObject[iStep3 + 1] === '||') {

						// If one of them is false
						if (eventNamesObject[iStep3] === true || eventNamesObject[iStep3 + 2] === true)

							// The result is false
							eventNamesObject.splice(iStep3, 3, true);

						// Else if both are a boolean
						else if (typeof eventNamesObject[iStep3] === 'boolean' && typeof eventNamesObject[iStep3 + 2] === 'boolean')

							// The result is the comparison
							eventNamesObject.splice(iStep3, 3, eventNamesObject[iStep3] || eventNamesObject[iStep3 + 2]);

						// Else
						else

							// Move on
							iStep3 += 2;
					}
					// If this is not a '||'
					else

						// Move on
						iStep3 += 2;

				}

				// Step 4: Parse all the subarrays
				// Loop over all the elements in the array
				each(eventNamesObject, function(eventNameObject, i) {

					// If this is a array
					if (eventNameObject instanceof Array)

						// Do a recursive pass
						eventNamesObject[i] = parseEventNamesObject(eventNameObject, listenerEventsMemory);

				});

				// Step 5: Finally resolve all the '&&'s (for explanation see step 2)
				// Init step5
				var iStep5 = 0;

				// While the iStep5 has not reached the 'end' of the array
				while (iStep5 <= eventNamesObject.length - 3) {

					// If this is a '&&' situation
					if (eventNamesObject[iStep5 + 1] === '&&')

						// The result is the comparison
						eventNamesObject.splice(iStep5, 3, eventNamesObject[iStep5] && eventNamesObject[iStep5 + 2]);

					// Else
					else

						// Move on
						iStep5 += 2;

				}

				// Step 6: Finally resolve all the '||'s (for explanation see step 2)
				// Init step6
				var iStep6 = 0;

				// While the iStep6 has not reached the 'end' of the array
				while (iStep6 <= eventNamesObject.length - 3) {

					// If this is a '||' situation
					if (eventNamesObject[iStep6 + 1] === '||')

						// The result is the comparison
						eventNamesObject.splice(iStep6, 3, eventNamesObject[iStep6] || eventNamesObject[iStep6 + 2]);

					// Else
					else

						// Move on
						iStep6 += 2;

				}

				// Return the found object
				return eventNamesObject[0];

			}



			// Remove an element from an array
			function removeArrayElement(array, index) {

				// Null
				array[index] = null;

			}



			// Set the native events
			(function() {

				// init a local reference to $rootScope
				var $rootScope;

				// Only if there are configured nativeEvents
				if (config.nativeEvents)

					// Loop over the native events
					each(config.nativeEvents, function(nativeEvent) {

						// If $rootScope does not exist yet
						if (!$rootScope)

							// Inject $rootScope
							$rootScope = $injector.get('$rootScope');

						// On the native event
						$rootScope.$on(nativeEvent, function() {

							// Dispatch the native event
							thisService.dispatchEvent(['native.' + nativeEvent].concat(arguments));

						});

					});

			})();



			// Return thisService
			return thisService;

		};

	});
