'use strict';
module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.config.init({
		watch: {
			livereload: {
				files: [
					'static/*.*'
				],
				options: {
					livereload: true,
					spawn: false
				}
			},
			optimizeIterations: {
				files: [
					//'static/events2.js',
					//'static/events3.js',
					//'static/events4.js',
					'advancedPubSub.js'//,
					//'gruntfile.js'
				],
				tasks: [
					'optimizeIterations'
				]
			}
		},
		optimizeIterations: {
			//2: {options: {name: 'events2'}},
			//3: {options: {name: 'events3'}},
			//4: {options: {name: 'events4'}},
			aps: {options: {name: 'aps'}}
		}
	});

	grunt.registerMultiTask('optimizeIterations', function testFunction() {

		// Get the fileString
		var
			// Get the options
			options = this.options({
				name: null
			}),
			// Regex string to mach the each() function start
			regexString = /each\(([a-zA-Z\.]+), function\(([a-zA-Z]+)(, )*([a-zA-Z]+)*\) \{/g,
			// Get the fileString
			fileString = grunt.file.read(options.name === 'aps' ? 'advancedPubSub.js' : 'static/' + options.name + '.js'),
			// The iteration count
			iIteration = 0,
			// Track if a match is found
			matchFound = true;



		// As long as a match is found
		while (matchFound) {

			// Init the last... variales
			var
				lastMatch,
				lastMatchArray,
				lastMatchElement,
				lastMatchI,
				lastIndex = null;

			// Find all the matches of the regex
			fileString.replace(regexString, function(match, matchArray, matchElement, matchComma, matchI, index) {

				// Store the values, as to always have the last version
				lastMatch = match;
				lastMatchArray = matchArray;
				lastMatchElement = matchElement;
				lastMatchI = matchI;
				lastIndex = index;

			});

			// If no match was found
			if(lastIndex === null)

				// Set the flag
				matchFound = false;

			// Else if there was a match found
			else {

				var
					// Init the current index, starting after the each() match
					currentIndex = lastIndex + lastMatch.length,
					// Init leftCount as allready having one (because of the first bracket at the end of the match
					leftCount = 1,
					// Init rightCount as 0
					rightCount = 0;

				// While there
				while (leftCount > rightCount) {

					// If the currentIndex is at the end of the fileString
					if (currentIndex >= fileString.length)

						// Throw an error
						throw new Error('End of the string reached: not enough matching closing brackets found');

					// Count left brackets
					if (fileString.charAt(currentIndex) === '{') leftCount++;

					// Count right brackets
					if (fileString.charAt(currentIndex) === '}') rightCount++;

					// Increase the currentIndex position by 1
					currentIndex++;

				}

				// Create a newIterationFunction
				var newIterationFunction = [
					'for (',
					'var i', iIteration, ' = 0, ',
					'length', iIteration, ' = ', lastMatchArray, '.length; ',
					'i', iIteration, ' < length', iIteration, '; ',
					'i', iIteration, '++',
					') {',
					// Add the !== null check because of the convention that we are deleting by setting an element to null
					'if (',
					lastMatchArray, '[i', iIteration, ']', ' !== null',
					') {'
				].join('');

				// Actually replace the section by getting the whole match
				fileString = fileString.replace(fileString.substr(lastIndex, currentIndex - lastIndex + 2), function(matchIntern) {

					// Get the matchIntern
					return matchIntern

						// And find every name
						.replace(/[a-zA-Z]+/g, function(match, index) {

							// As long as the index is after the iterationFunction
							if (index > lastMatch.length)

								// As long as this is not a string (check this by assuming the character before is a ' or a "
								if (matchIntern.substr(index - 1) !== "'" && matchIntern.substr(index - 1) !== '"') {

									// If this name matches the element name
									if (match === lastMatchElement)

										// Replace it with the new way of getting an element
										return lastMatchArray + '[i' + iIteration + ']';

									// If this name matches the i name
									if (match === lastMatchI)

										// Replace it with the new i
										return 'i' + iIteration;

								}

							// Else just return the match
							return match;

						})

						// Replace the original iterationFunction with the newInterationFunction
						.replace(lastMatch, newIterationFunction)

						// Make sure the end is no longer }); but }} (double because of the !== null check)
						.replace(/\);$/, '}');

				});

			}

			// Increase the iIteration
			iIteration++;

		}

		// Remove the each function
		fileString = fileString.replace(/\t+function each\(array, fn\) \{[\s\S]+?\}\n\n\n\n/, '');

		// Temporary create a events#Opt service
		// If this is the main aps file
		if (options.name === 'aps') {

			// Replace where appropriate
			fileString = fileString.replace(new RegExp('advancedPubSub', 'g'), 'advancedPubSubOpt');
			fileString = fileString.replace(new RegExp('aps', 'g'), 'apsOpt');

		}

		// If these are the old files
		else

			// Replace where appropriate
			fileString = fileString.replace(new RegExp(options.name, 'g'), options.name + 'Opt');


		// Write the file
		grunt.file.write(options.name === 'aps' ? 'advancedPubSubOpt.js' : 'static/' + options.name + 'Opt.js', fileString);

	});

	// Default task(s).
	grunt.registerTask('default', ['optimizeIterations', 'watch:optimizeIterations']);

};