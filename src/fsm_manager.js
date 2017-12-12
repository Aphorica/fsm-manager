module.exports = class FSM_Manager {
  constructor(_router, log) {
    this.log = log === undefined? false : log;
    this.fsmStack = [];
    this.router = _router;
    this.locationHashStack = [];
    this.locationHashStackIX = -1;
    this.timerID = null;
    window.onhashchange = this.handleBrowserHashChange.bind(this);
  }

  pushFSM(fsm) {
    let reportStr = null;

    if (this.log)
      reportStr = 'Pushing fsm state from level ' + this.fsmStack.length;

    this.fsmStack.push(fsm);

    if (this.log) {
      reportStr += ' to ' + this.fsmStack.length;
      console.log(reportStr);
    }
  }

  popFSM() {
    let reportStr = null;

    if (this.log)
      reportStr = 'Popping fsm state from level ' + this.fsmStack.length;

    let topFSM = this.fsmStack.pop();
    if (this.log) {
      reportStr += ' to ' + this.fsmStack.length;
      console.log(reportStr);
    }
    return topFSM;
  }

  currentFSM() { 
    return this.fsmStack.length === 0? null : this.fsmStack[this.fsmStack.length - 1];
  }

  handleBrowserHashChange(event) {
    let fsm = this.currentFSM();
    if (fsm === null)
      return;

    let thisHash = location.hash;
    if (this.locationHashStackIX != -1 ) {
      let thisHashIX = this.locationHashStackIX.indexOf(thisHash);
      if (thisHashIX === -1)
        this.locationHashStack[++this.locationHashStackIX] = thisHashIX;
      else {
        let diffIX = thisHashIX - this.locationHashStackIX;
        if (diffIX === -1 && this.currentFSM().canHistoryBack()) {
          this.locationHashStackIX = thisHashIX;
          this.currentFSM().historyBack();
        }
        else if (diffIX === 1 && this.currentFSM().canHistoryForward()) {
          this.locationHashStackIX = thisHashIX;
          this.currentFSM().historyForward();
        }
        else if (diffIX !== 0) {
          alert("FSM Confusion!  Reload...");
          this.locationHashStackIX = -1;
          this.locationHashStack = [];
          location.replace('/#');
        }
      }
    }
  }

  // begin overrides
  handleTimeout() {}
  beforeStateChange(info) {}
  handleStateChange(info) {}
  // end overrides

  setupObserver(fsm) {
    let self = this;
    fsm.observe('onEnterState', function(info) { 
      if (self.log) {
        console.log('-----\n>>> State change to: ' + info.to)
        console.log(info);
      }
      self.beforeStateChange(info);
      if (self.router.getMatchedComponents(info.to).length > 0) {
        if (self.log)
          console.log('Pushing route: ' + info.to)
        self.router.push({name: info.to});
      }
      else
        self.handleStateChange(info);
    });
  }
  
  setTimer(duration) {
    this.currentFSM().timed_out = false;
    let self = this;

    this.stopTimer();
    
    this.timerID = setTimeout(function() {
      let fsm = self.currentFSM();
      fsm.timed_out = true;
      self.timedOut();
    }, duration) 
  }

  stopTimer() {
    if (this.timerID != null) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  timedOut() {
    if (this.log)
      console.log('fsm timed out');

    this.handleTimeout();
    if (this.timerID !== null)
    {
      clearTimeout(this.timerID);
      this.timerID === null;
    }
    
    let self = this;

    setTimeout(function() {
      while (self.fsmStack.length > 1)
      {
        self.popFSM();
        self.currentFSM().timed_out = true;
        self.currentFSM().timeout();
      }

      // get the zero level fsm
      self.currentFSM().timed_out = true;
      self.currentFSM().timeout();
    }, 0)
  }
}