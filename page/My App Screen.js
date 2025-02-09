/// App Entrypoint 

function app() {
  var number = 10;

  // Setup function to create UI
  function create_view() {    
    hmUI.setLayerScrolling(false);
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 194,
      h: 492,
      color: 0x2C71C0
    })
    const numDisplay = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 100,
      w: 194,
      h: 100,
      text: `${number}`,
      color: 0xf1a213,
      text_size: 60,
      text_style: hmUI.text_style.NONE,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: 0,
      y: 318,
      w: 194,
      h: 180,
      text: "Increment",
      text_size: 30,
      color: 0x050800,
      press_color: 0xdd4d5,
      normal_color: 0xc3c4c5,
      click_func: function () {
        number++;
        numDisplay.setProperty(hmUI.prop.TEXT, `${number}`)
      },
    });
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: 0,
      y: 250,
      w: 194,
      h: 50,
      text: "Decrement",
      text_size: 23,
      color: 0x050800,
      press_color: 0xdd4d5,
      normal_color: 0xc3c4c5,
      click_func: function () {
        number--;
        numDisplay.setProperty(hmUI.prop.TEXT, `${number}`)
      },
    });
    timer.createTimer(1000, 750, () => {
      number-=1;
      numDisplay.setProperty(hmUI.prop.TEXT, `${number}`)
    })
  }

  // Export App module to  device
  var __$$app$$__ = __$$hmAppManager$$__.currentApp;
  var __$$module$$__ = __$$app$$__.current;
  // set logger
  new DeviceRuntimeCore.WidgetFactory(
    new DeviceRuntimeCore.HmDomApi(__$$app$$__, __$$module$$__),
    "drink",
  );
  DeviceRuntimeCore.HmLogger.getLogger("sanjiao");
  // an app seems to be of type "Page", I've also seen "WatchFace"
  __$$module$$__.module = DeviceRuntimeCore.Page(		
    {    
      onInit: function () {
        console.log("index page.js on init invoke");
        create_view();
      },
      onReady: function () {
        console.log("index page.js on ready invoke");
      },
      onShow: function () {
        console.log("index page.js on show invoke");
      },
      onHide: function () {
        console.log("index page.js on hide invoke");
      },
      onDestory: function () {
        console.log("index page.js on destory invoke"),
          hmApp.unregisterGestureEvent();
      },
    }
	);  
};

try {
  app();
} catch (f) {
  console.log(f);
}

