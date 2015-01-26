General considerations:
I try to choose the most performant option considering all browsers. But if I must choose, I will choose the most performant option for Google Chrome, as it is the most widely used version

https://gamealchemist.wordpress.com/2013/05/01/lets-get-those-javascript-arrays-to-work-fast/

ALWAYS TEST AGAINS THE QUICKEST VERSION POSSIBLE

# perf1
*Checking weather a variable is an array*
http://jsperf.com/isarray-vs-instanceof/11
Conclusion:
For most browsers underscore.isArray was the quickest, and second fastest is the Array.isArray() method. As we want to keep this dependancy free, choosing that option

Can be used in all browsers:
http://kangax.github.io/compat-table/es5/#Array.isArray

perf2
*Checking weather a variable is a function*
http://jsperf.com/alternative-isfunction-implementations/9
Conclusion:
typeof variable === 'function' is by far the fastest

per3
*Getting the keys of an object*
Object.keys()
Only IE8+ (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

*Creating an array filled with arbitrary value for iteration
http://jsperf.com/zero-filled-array-creation

*lodash vs underscore*
http://jsperf.com/native-vs-array-js-vs-underscore/8
http://stackoverflow.com/questions/13789618/differences-between-lodash-and-underscore



ASSUMPTION: THE CHECKS DON'T NEED PERFECT PERFORMANCE AS RUNNING THEM IS CONSIDERED ONLY DURING DEVELOPMENT

This is all done with 10.000 iterations over the standard code

Simple checks:
With simple checks vs no checks
1. 73/118 = 62%
2. 74/119 = 62%
3. 75/111 = 68%

Check that an event listener doesn't exist yet
//1. 120/169 = 71%
//2. 86/168 = 51%

1. 625/981 = 64%
2. 626/981 = 67%
3. 521/758 = 69%


Always do !== null iso splice:
http://jsperf.com/array-item-removal-splice-vs-if-null
http://jsperf.com/array-null-vs-splice (KEEPS ON RUNNING FOR EVER!)


GENERAL PROMISES: http://jsperf.com/bluebird-vs-rsvp/14


Alternative pubSub
 3   36   9  18 1  0  1 https://github.com/joezimjs/JZ-Publish-Subscribe-jQuery-Plugin
63 1288 126 205 7  6 16 https://github.com/appendto/amplify
10  253  23  47 1  2  4 https://github.com/uxder/Radio
33  738 100 181 1 24 10 https://github.com/mroderick/PubSubJS
 1   10   2  16 2  0  1 https://github.com/pmelander/Subtopic



 http://jsperf.com/triple-equals-vs-double-equals/3
 === is quicker then ==, because no convertion needs to be made

 http://jsperf.com/array-direct-assignment-vs-push
 Array.push() is sneller dan Array[Array.length]


 Best indexOf method

 http://jsperf.com/jquery-inarray-vs-underscore-indexof/19 (simple loop is quickest, half loop is even quicker)
 http://jsperf.com/js-for-loop-vs-array-indexof/82 (not much difference)


 Maybe null a value in the array, and not splice it?


 before: 5750ms
 after first big refactor: 1750ms



 FIND: Very obvious that native find (for loop with ===) is by far the quickest
 http://jsperf.com/lodash-find-vs-native-code (native at least 87% quicker)
 http://jsperf.com/array-find-loop-native-lodash (native at least 85% quicker)
 http://jsperf.com/native-filter-vs-lodash-find (native at least 76% quicker)

Empty an array
http://jsperf.com/array-destroy/40 (arr.pop() at least 44% quicker)
http://jsperf.com/array-destroy/67 (arr.pop() as quick as splice(0, array.length))
http://jsperf.com/empty-javascript-array (arr.pop() at least 74-78% quicker)

How to test if is null (var) or (var !== null)
http://jsperf.com/implicit-or-explicit-null-testing (About the same)


JSPERF

Lodash vs underscore
http://stackoverflow.com/questions/13789618/differences-between-lodash-and-underscore
http://jsperf.com/for-in-versus-object-keys-foreach/6

My own
http://jsperf.com/iteration-with-or-without-function-call
http://jsperf.com/simple-array-iteration/edit


Array: Push vs direct assignment
http://jsperf.com/array-push-vs-unshift-vs-direct-assignment/2
http://jsperf.com/array-push-vs-array-length23333/2
http://jsperf.com/array-direct-assignment-vs-push
VOLGENS MIJ STOND DEZE AL IN PERFORMANCE.MD

== vs ===
http://jsperf.com/triple-equals-vs-double-equals/3
DEZE STOND OOK AL IN PERFORMANCE.MD



Loops
http://jsperf.com/loops
http://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
http://jsperf.com/fastest-array-loops-in-javascript/32 (WHILE LENGTH LIJKT NOG SELLER TE ZIJN)
http://jsperf.com/testing-foreach-vs-for-loop/11
http://jsperf.com/underscore-lodash/3
https://blogs.oracle.com/greimer/entry/best_way_to_code_a


FIND
NOG UITZOEKEN
http://jsperf.com/lodash-find-where/2
http://jsperf.com/lodash-find-vs-native-code

INDEXOF
http://jsperf.com/checking-if-array-contains-item


object vs array
http://jsperf.com/iterate-over-array-vs-object-keys
http://jsperf.com/performance-of-array-vs-object/3
http://jsperf.com/iterate-object-vs-array-with-each
http://jsperf.com/performance-of-array-vs-object/79
http://jsperf.com/iterating-over-object-properties/2