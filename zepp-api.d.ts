// Expose globals
let hmUI = (await import("@zos/ui")).default;

// I can't get these to work- they might just be for the API versions 3+.
// declare const BasePage = (await import("@zeppos/zml/base-page")).BasePage;
// declare const BaseApp = (await import("@zeppos/zml/base-app")).BaseApp;

// From https://github.com/melianmiko/ZeppPlayer/blob/master/src/zepp_player/SyystemEnvironment.ts#L41
declare const __$$module$$__: any = {};
declare const __$$hmAppManager$$__ = {
    currentApp: {
        pid: 10,
        current: {
            module: {}
        },
        app: {
            __globals__: {}
        }
    }
}

// TODO: fix createWidget so the properties are appropriate for each Widget Type 
declare const hmApp: HmApp;
declare const DeviceRuntimeCore: DeviceRuntimeCoreMock;
declare const timer: TimerMock;

class TimerMock {
    constructor(runtime) {
        this.runtime = runtime;
        this.timers = [];

        runtime.onDestroy.push(() => {
            for (let a in this.timers) try {
                this.stopTimer(a);
            } catch (e) { }
        })
    }

    createTimer(delay, period, callable, option) {
        const runtime = this.runtime;
        const id = this.timers.length;

        this.timers[id] = {
            interval: -1,
            timeout: -1,
            func: callable
        };

        (async () => {
            // If init not complete, ignore delay
            if (!!runtime.initTime) {
                await this.wait(delay, id);
            }

            // One-time delay
            if (!period) {
                callable.apply(this, option);
                return;
            }

            // Setup interval
            this.timers[id].interval = setInterval(() => {
                if (runtime.uiPause) return;
                callable.apply(this, option);
            }, Math.max(period, 25))
        })();

        return id;
    }

    wait(delay, id) {
        return new Promise((resolve) => {
            if (delay === 0) return resolve();

            this.timers[id].timeout = setTimeout(() => resolve(), delay);
        });
    }

    stopTimer(timerID) {
        if (!this.timers[timerID]) return;
        if (this.timers[timerID].timeout > -1)
            clearTimeout(this.timers[timerID].timeout);
        if (this.timers[timerID].interval > -1)
            clearInterval(this.timers[timerID].interval);

        this.timers[timerID] = null;
    }
}

class DeviceRuntimeCoreMock {
    version = "1.0.1-zepp-player";

    constructor(runtime, placement) {
        this.runtime = runtime;
        this.placement = placement;
        this.HmUtils = new HmUtilsMock(runtime);
    }

    WidgetFactory = class {
        constructor(a1, a2, a3) { }
    }

    HmDomApi = class {
        constructor(a1, a2) { }
    }

    HmLogger = class {
        static getLogger(name) {
            return {
                log: (data) => console.log("hmLogger", "[" + name + "]", data)
            }
        }
    }

    App(config: typeof BaseApp) {
        const defTemplate = {
            __globals__: {},
            _options: config,
            onCreate: () => { }
        }

        return {
            ...defTemplate,
            ...config
        }
    }

    WatchFace(config) {
        this.placement.currentApp.current.module = config;
        return config;
    }

    Page(config: BasePage) {
        this.placement.currentApp.current.module = config;
        return config;
    }
}

class HmApp {
    constructor(runtime) {
        this.runtime = runtime;
        this.timers = [];

        if (runtime instanceof ZeppRuntime) runtime.onDestroy.push(() => {
            for (const a of this.timers) try {
                clearTimeout(a);
            } catch (e) { }
        })
    }


    alarmNew(options) {
        let delta = options.delay ? options.delay : options.date - (Date.now() / 1000);
        delta = Math.floor(delta);
        if (delta <= 0) return -1;

        const id = setTimeout(() => {
            this.runtime.requestPageSwitch(options);
        }, delta * 1000);
        this.timers.push(id)
        return id;
    }

    alarmCancel() { }

    startApp(options) {
        const appId = this.runtime.player.appConfig.app.appId;
        if (options.appid === appId) return this.gotoPage(options);
        this.runtime.onConsole("device", ["startApp", options]);
    }

    gotoPage(conf) {
        console.log("gotoPage", conf)
        if (!conf.url) return;

        this.runtime.requestPageSwitch(conf);
    }

    reloadPage(conf) {
        return this.gotoPage(conf);
    }

    getLayerY = () => {
        return -this.runtime.player.config.renderScroll;
    }

    setLayerY = (y) => {
        this.runtime.player.config.renderScroll = -y;
    }

    exit() { }

    gotoHome() {
        this.runtime.onConsole("ZeppPlayer", [
            "gotoHome requested"
        ])
    }

    goBack() {
        this.runtime.back();
    }

    setScreenKeep() { }
    packageInfo() {
        const data = this.runtime.appConfig.app;
        return {
            type: data.appType,
            appId: data.appId,
            name: data.name,
            version: data.version.name,
            icon: data.icon,
            description: data.description,
            vendor: data.vendor,
            pages: []
        }
    }

    key = {
        BACK: "back",
        SHORTCUT: "shortcut",
        SELECT: "select",
        UP: "up",
        DOWN: "down",
        HOME: "home",
    }

    action = {
        CLICK: "click",
        LONG_PRESS: "long_press",
        DOUBLE_CLICK: "double_click",
        PRESS: "press",
        RELEASE: "release",
    }

    gesture = {
        UP: "up",
        LEFT: "left",
        RIGHT: "right",
        DOWN: "down"
    }

    registerGestureEvent(callback) {
        this.runtime.appGestureHandler = callback;
    }

    unregisterGestureEvent() {
        this.runtime.appGestureHandler = () => false;
    }

    registerKeyEvent() { }
    unregisterKeyEvent() { }

    registerSpinEvent() { }
    unregisterSpinEvent() { }
}
