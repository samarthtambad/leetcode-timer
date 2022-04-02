
export const enum State {
    READY,
    RUNNING,
    PAUSED
}

export class Timer {

    currentState: State = State.READY;
    secondsElapsed: number = 0
    originalDuration: number = 20
    accuracy: number = 2 // ticks per second

    startTime: number
    endTime: number
 
    onStartCallback: Function = () => {}
    onStopCallback: Function = () => {}
    onEndCallback: Function = () => {}
    onTickCallback: Function = () => {}

    constructor(durationInSeconds: number) {
        this.originalDuration = durationInSeconds
        this.startTime = new Date().getTime()
        this.endTime = new Date().getTime() + durationInSeconds * 1000
    }

    public start() {
        // prevent multiple calls to start
        if(this.currentState == State.RUNNING) return

        this.onStart()

        this.currentState = State.RUNNING
        this.tick()
    }

    public stop() {
        this.secondsElapsed = this.originalDuration;
        this.currentState = State.READY;
    }

    public reset() {
        this.currentState = State.READY;
        this.secondsElapsed = 0;
    }

    public getCurrentState() {
        return this.currentState
    }

    public toString() {
        var hrsVal = Math.floor(this.secondsElapsed / 60 / 60)
        var hrs = hrsVal.toString()
        var min = Math.floor(this.secondsElapsed / 60 - hrsVal * 60).toString()
        var sec = (this.secondsElapsed % 60).toString()
        return [hrs.padStart(2, '0'), min.padStart(2, '0'), sec.padStart(2, '0')].join(':')
    }

    private tick() {
        // Stop
        if(this.currentState == State.READY){
            this.onStop()
            return
        }
        
        // End
        var now = new Date().getTime()
        if (now >= this.endTime) {
            this.onEnd()
            return
        }

        this.secondsElapsed = Math.round((this.endTime - now) / 1000)
        this.onTick()
        setTimeout(this.tick, 1000 / this.accuracy)
    }

    private onStart() {
        this.onStartCallback()
    }

    private onStop() {
        this.onStopCallback()
    }

    private onEnd() {
        this.onEndCallback()
    }
    
    private onTick() {
        this.onTickCallback()
    }

    public setOnStartListener(callback: Function = () => {}) {
        this.onStartCallback = callback
    }

    public setOnStopListener(callback: Function = () => {}) {
        this.onStopCallback = callback
    }

    public setOnEndListener(callback: Function = () => {}) {
        this.onEndCallback = callback
    }

    public setOnTickListener(callback: Function = () => {}) {
        this.onTickCallback = callback
    }

}
