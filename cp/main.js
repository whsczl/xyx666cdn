"use strict";
window.boot=function(){
   if(window._CCSettings.server.split(",").length==1){
    window.booted();
    return;
  }
               
   window.startTestServer(0,function(server){
      var settings = window._CCSettings;
      //window._CCSettings = undefined;
      window._CCSettings.server=server;      
      cc.whsczlServer=server;  
      window.booted();
   });  
   
}

window.startTestServer=function(i,success){
  var settings = window._CCSettings;
  //window._CCSettings = undefined;

var servers=settings.server.split(",");
i=i%servers.length;
var server=servers[i];
wx.request({
  url: server+'/online.txt',
  timeout:1000,
  success:res=>{
            if(res.statusCode==404){
              window.startTestServer(i+1,success);  
            } 
            else{
              console.log(res.statusCode+"success:"+server);
              success(server) ; 
            }
  },
  fail:function(){
    console.log("fail:"+server);
          window.startTestServer(i+1,success);  
  }
})

}

window.booted = function () {
  var settings = window._CCSettings;
  window._CCSettings = undefined;

  var onStart = function onStart() {
    cc.view.enableRetina(true);
    cc.view.resizeWithBrowserSize(true);
    var launchScene = settings.launchScene; // load scene

    cc.director.loadScene(launchScene, null, function () {
      console.log('Success to load scene: ' + launchScene);
    });
  };

  var isSubContext = cc.sys.platform === cc.sys.WECHAT_GAME_SUB;
  var option = {
    id: 'GameCanvas',
    debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
    showFPS: !isSubContext && settings.debug,
    frameRate: 60,
    groupList: settings.groupList,
    collisionMatrix: settings.collisionMatrix
  };
  cc.assetManager.init({
    bundleVers: settings.bundleVers,
    subpackages: settings.subpackages,
    remoteBundles: settings.remoteBundles,
    server: settings.server,
    subContextRoot: settings.subContextRoot
  });
  var _cc$AssetManager$Buil = cc.AssetManager.BuiltinBundleName,
      RESOURCES = _cc$AssetManager$Buil.RESOURCES,
      INTERNAL = _cc$AssetManager$Buil.INTERNAL,
      MAIN = _cc$AssetManager$Buil.MAIN,
      START_SCENE = _cc$AssetManager$Buil.START_SCENE;
  var bundleRoot = [INTERNAL, MAIN];
  settings.hasStartSceneBundle && bundleRoot.push(START_SCENE);
  settings.hasResourcesBundle && bundleRoot.push(RESOURCES);
  var count = 0;

  function cb(err) {
    if (err) return console.error(err.message, err.stack);
    count++;

    if (count === bundleRoot.length + 1) {
      cc.game.run(option, onStart);
    }
  } // load plugins


  cc.assetManager.loadScript(settings.jsList.map(function (x) {
    return 'src/' + x;
  }), cb); // load bundles

  for (var i = 0; i < bundleRoot.length; i++) {
    cc.assetManager.loadBundle(bundleRoot[i], cb);
  }
};