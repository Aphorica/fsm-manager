# FSM_Manager - Finite State Machine Manager for Vue.js

<h1 style='color:red;text-decoration:underline'>This is old and stale.  Preparing to delete it.</h1> 

### Rick Berger, Aphorica Inc. (gbergeraph@gmail.com)

> Finite State Machine Composer/Manager with Timeout
> (For _Vue.js_ applications)

## Intro
This is implemented over (and is dependent on) the excellent
<a href="https://github.com/jakesgordon/javascript-state-machine">
JakesGordon/Javascript-Finite-State-Machine</a> package.

This package allows composibility of _Finite State Machine_ instances, which
are maintained on a basic LIFO stack.  The implementation is as
a base class - the intent is for the application to derive an
application-specific variant.

## Install
Install via NPM or Yarn:
```
npm install fsm-manaager
...
yarn add fsm-manager
```
## Usage
To use is fairly simple:
```
import StateMachine from 'javascript-state-machine';
import FSM_Manager from 'fsm-manager';

let LOGGING = true;
    // enable or disble log output

import FSM_Manager from 'fsm-manager';

class APP_FSM_Manager extends FSM_Manager {
  constructor(_router) {
            // router is a VueRouter instance

    super(_router, LOGGING);
    let main_fsm = (create a state machine instance);
    this.setupObserver(main_fsm);
            // sets up the fsm_manager as an observer to the fsm

    this.pushFSM(main_fsm);
            // pushes this fsm onto the stack and makes it the currentFSM

    this.currentFSM().init();
            // starts the fsm
  }

  // at some point (transition, likely) you'll want to add an fsm:
  //
  setupNewFSM(info) {
          // info is passed from the transition

    let newFSM = (create another state machine instance);
    this.setupObserver(newFSM);
          // same as before

    this.pushFSM(newFSM);
          // and onto the stack it goes
          // now, newFSM is the currentFSM
  }

  // in some other transition, (like an 'exit' transition from the newFSM) it's
  // time to pop the newFSM and resume the main_fsm instance:
  //
  exitTransition(info) {
    let self = this;
    setTimeout(function() {
              // do the pop and trigger of the main_fsm transition in a timeout
              // to avoid the 'transition triggered within a transition' problem.

      let currentFSM = self.popFSM();
      self.currentFSM().newFSMPopped();
      }, 0);
    })
  }
}
```

## Vue Router Handling
The _VueRouter_ instance is passed to the FSM.  After that, for the most part, the FSM
handles the route invocations.  This is done by looking for a route of the same name
as the 'to' state.  Consider a router definition snippet:
```
...
{
  path: '/action-selection',
  name: 'action-selection',
  component: 'ActionSelection'
},
...
```
When a transition occurs, the 'to' state of the transition is checked against the 'name' value of the route.  If there is a match, the route is invoked.  If not,
`handleStateChange()` is called.  Your derived class can then handle the state change
for which there is no corresponding UI component.

There are a couple of functions you can override:

<dl>
<dt>handleTimeout();</dt>
<dd>
Called when the built-in timout transition is invoked (described below).</dd>
<dt>beforeStateChange();</dt>
<dd>
Called <em>after</em> the transition, but just before the state is actually changed.</dd>
<dt>handleStateChange();</dt>
<dd>
Called if there are no routes that match the 'to' state.</dd>
</dl>

## Built-in Timeout Transition Handler
If your application needs to time out after a period of inactivity (or whatever),
FSM_Manager has a built in timer facility to help you implement that functionality.

For each FSM, you need to provide two things:
<dl>
<dt>A 'timeout' transition.</dt>
<dd>
<em>FSM_Manager</em> will call this on timeout.</></dd>
<dt>A 'timed-out' data item, initially set to 'false'.</dt>
<dd>
<em>FSM_Manager</em> will set this to 'true' when the timeout occurs,
and then trigger the <em>timeout</em> transition.  
</dl>

To start the timer, just call the base class function with a duration value:
```
...
  this.setTimer(60000);
          // sets the timer for 60 seconds
...
```

When the timer triggers, the currentFSM is popped off the stack, the `timed-out` data
item is set to true, and the `timeout` transition is invoked.  This proceeds until the
stack only contains the _main_fsm_ instance.

You can override the `handleTimeout()` override if you need to do anything else.

You can clear (stop) the timer with a call to `clearTimer()`. 

## Other JS Frameworks
I'm focusing on _Vue.js_ for my own work.  I imagine this could be fairly easily refactored
to provide variants for other frameworks such as _Angular2_ or _React_.  If that is something that is desirable, I can work with you on it.

## ES6 Implementation
I personally am only writing in ES6, anymore.  The project is 'babel-ized', and the
_babel_ output is what you are importing/requiring.  I have left the ES6 source in
the package, so you can view it and see what it's doing.

It's a single file &mdash; you could just pull the file and include it in your project
if you want to handle the 'babel-izing' differently.

## Browser BackButton Behavior.
In the code, you'll see `handleBrowserHashChange()`.  This was a stab at handling
browser back-button behavior, but it doesn't work very well.  I'll revisit this
at some point (when I need it.)  I suspect it is a simpler problem than this approach.

If it's something you drastically need, ping me and we can discuss.

## Working Example
You can see how this all works in the demo <a href="https://github.com/Aphorica/atmplus">
Aphorica/atmplus</a>.

This is also serving as my test app, for now.

## License
While _fsm-manager_ is MIT-Licensed, note that the
<a href="https://github.com/jakesgordon/javascript-state-machine">
JakesGordon/Javascript-Finite-State-Machine</a> package is under LGPL.

You need to follow that license requirements for your own efforts.
