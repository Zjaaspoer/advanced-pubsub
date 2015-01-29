# Advanced PubSub (aps)


#### What is it

The basis of this library is a PubSub system. But with added functionality I believe some drawbacks of this pattern are removed, and some awesome new (pattern) possibilities arise. Please be advised that this is the first code I've ever published, this is the draft I'll be working on (hopefully getting it finished before [ng-nl](http://www.ng-nl.org/)) and there's a pretty big chance I have no idea what I'm doing.

#### Features

- Event memory (listener fires even if it is attached after event dispatch)

- Complex inter-event dependencies (nested AND's & OR's)

- Easy debugging: Very detailed (colored) logging to help you understand exactly **what** your program is doing **when** and **why**

- Very extensive checks, to help you eliminate double listeners (e.g. to prevent memory leaks and hard to debug code)

- Highly tuned to be as performant as possible

#### How to install

_TODO: add it to bower / npm_

Just load advancedPubSub.js in your browser

angular:

    angular.module('myModule', ['advancedPubSub'])
        .service('myService', function(aps) {

            // Go nuts!

        });

#### Examples

Classic pattern

    aps.addEventListener('event1', listener);

    aps.dispatchEvent('event1');

    // listener is called

Advanced event patterns

    aps.addEventListener([
        'event1', '&&',
        [
            'event2', '||',
            'event3'
        ],
        listener
    );

    aps.dispatchEvent('event1');

    aps.dispatchEvent('event2');

    // listener is called

    aps.dispatchEvent('event3');

    // listener is called

Event memory

    aps.dispatchEvent('event1');

    aps.addEventListener('event1', listener, true);

    // listener is called

Remove events from event memory

    aps.dispatchEvent('event1');

    aps.addEventListener('event1', listener, true);

    // listener is called

    aps.remove

Checks: Multiple listeners

    // Note: checks are enabled

    for (var i = 0; i < 2; i++) {

        aps.addEventListener('listenerName', 'event1', listener1);

        // when providing a listenerName: second iteration will throw an error stating this listenerName is already in use

        aps.addEventListener('event1', listener2);

        // when not providing a listenerName: second iteration will throw an error stating this listener function is already added

    }

Removing listeners (by listenerName)

    aps.addEventListener('listenerName', 'event1', listener);

    aps.removeEventListener('listenerName');

Removing listeners (by provided function)

    var removeEventListener = aps.addEventListener('listenerName', 'event1', listener);

    removeEventListener();

Removing multiple event listeners

    aps.removeEventListeners(['listenerName1', 'listenerName2']);

Adding a listener that only fires once

    aps.addSingleFireEventListener('event1', listener);

    aps.dispatchEvent('event1');

    // listener is called

    aps.dispatchEvent('event1');

    // listener is NOT called

#### Why did I develop this library?

I was building a lot of [AngularJS](https://www.angularjs.org/) apps and liked the [PubSub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) pattern, in the way that it solved the synchronization problem (order of initializing components). But in this pattern (and it's implementations) I was missing several important features:

##### Complex event dependencies

If something was dependent on several events, the conventional pattern would create a listener that would fire on all events. Then inside the listener function checks would need to be done to know if all needed events had fired (by checking state). I wanted this logic to be defined during initialization of the event listener, so I needed a way of defining complex event dependencies:

- Fire when any of these events fire `event1 || event2 || event3`

- Fire when all of these events have fired `event1 && event2 && event3`

- Fire when event 1 has fired, and event 2 or 3 have fired `event1 && (event2 || event3)`

- Fire when event 1 has fired, or when event 2 and event 3 or 4 have fired `event1 || (event2 && (event3 || event4))`

##### Memory

Sometimes when you start listening for an event, the event has already taken place. Imagine a global user model, which fires a 'user logged in' event as soon as the page loads. Now imagine a service that is dependent on the user being logged in and therefore listens for the 'user logged in' event. But if this service only gets loaded after visiting a subpage, the event may already have been fired before adding the listener, resulting in no fire. I want the listener to be able to specify that it should fire directly, if the event sits in 'memory'

##### Extensive checks

When working with the PubSub pattern, often bugs / memory leaks occur because of listeners initialized multiple times by accident. This library has extensive checks built in to help you avoid double listeners. By using the option to name each separate listener the library can make sure you only check it once.

##### Why not promises

Promises would solve the 'memory' requirement. But once fired you would need to get a new promise if the dependency kept existing. Also, if a component was initialized before the component existed that it was dependent on, no promise could be fetched.

#### Can't you solve this with extra code?

Yes you could. The complex event dependencies could be defined in the listener itself, and you could fire a listener always once to check if the required state was not already met, but this would mean a lot of extra code. Also I like the idea of having the logic of how the events relate to each other in one spot, namely during the adding of an event listener

#### Checks

_TODO: Explain the checking philosophy_

#### Configuration

    angular.module('myModule', ['advancedPubSub'])
        .config(function(apsProvider) {

            apsProvider.config({
                checks: true
                verbose: false,
                storeArguments: false
            });

        });

**checks**: (default: true) Enables the extensive (opinionated) checks. Does make the library a lot slower. So the advice is to enable the checks during development, and disable them in production

**verbose**: (default: false) Great for debugging: Logs (in a colorful way) all event fires, all listeners that are being called etc. Gives you an exact overview what your app is doing

**storeArguments**: (default: false) This option stores the arguments of a event dispatch in memory, for when a listener is added with the checkMemory flag enabled. Could potentially be a memory hog so is optional

#### Performance

This library is already been highly tuned and is continually being improved. There is even a grunt task that builds a new version of the library (advancedPubSubOpt.js) with the each() function replaced with a inline for loop, giving a great performance boost.

# API

---

### addEventListener([listenerName], eventName, listener, [checkMemory], [singleFire])

_Main method to add a listener_

**listenerName:** (Optional) A name to give to the listener

**eventName:** The name (or names) of the events that should be listened to

**listener:** The actual listening function

**checkMemory:** To check the memory. If the event(s) have already been fired, the listener will immediately fire

**singleFire:** Only fire the listener once (removing itself after the fire)

---

### addSingleFireEventListener([listenerName], eventName, listener, [checkMemory])

_Convenience method (same a method above, with singleFire set to true)_

---

### clearAll()

_Method used mainly for testing: to clear all listeners and events from memory_

---

### dispatchEvent(eventName)

_Dispatch an event_

**eventName:** The eventName to dispatch

---

### clearEventFromMemory(eventName, disableCheck)

_Clear an event from memory_

**eventName:** The eventName to clear

**disableCheck:** Flag to disable the check if the event does exist in memory. Without this flag, and with global checks enabled, an error will occur if you try to remove a event from memory that doesn't exist

---

### removeEventListener(listenerName, disableCheck)

_Remove an eventListener

**listenerName:** The name of the listener to be removed

**disableCheck:** Flag to disable the check if the listener does exist. Without this flag, and with global checks enabled, an error will occur if you try to remove a listener that doesn't exist

---

### removeEventListeners(listenerNames)

_Convenience method to remove multiple listeners at once_

**listenerNames**: An array of names of listeners

---

### updateConfig(newConfig)

_Update the config during runtime_

**newConfig**: An object containing the new configuration (see configuration explanation)

#### TODO's

- Fine grained configuration of the checks