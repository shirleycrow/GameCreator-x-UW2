/**
 * 档案管理
 * Created by 黑暗之神KDS on 2020-09-15 17:17:25.
 */
class GUI_SaveFileManager {
    /**
     * 当前档案的目录信息
     */
    static currentSveFileIndexInfo: { indexInfo: SaveFileListCustomData, id: number, now: number };
    /**
     * 游戏内读档重启方式直接进入档案的标识符
     */
    static onceInSceneLoadGameSign = "gc_rpg_greenFeather_" + window.location.href;
    /**
     * 已读档后的自定义数据
     */
    private static currentSaveFileCustomData: any;
    /**
     * 是否读档中
     */
    private static isLoading: boolean = false;
    //------------------------------------------------------------------------------------------------------
    // 存档和读档
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化档案列表
     * @param list 档案列表组件
     */
    static initSaveFileList(list: UIList, saveMode: boolean = false) {
        // 标准化list
        GUI_Manager.standardList(list);
        list.on(EventObject.DISPLAY, this, GUI_SaveFileManager.onSaveFileListDisplay, [list]);
        list.onCreateItem = Callback.New(GUI_SaveFileManager.onCreateSaveFileItem, GUI_SaveFileManager, [saveMode]);
        list.on(UIList.ITEM_CLICK, this, GUI_SaveFileManager.onListItemClick, [list, saveMode]);
    }
    /**
     * 存档
     * @param id 档案ID
     * @param executeEvent [可选] 默认值=true 是否执行「存档完毕事件」
     * @param onFin [可选] 默认值=null 存档完毕后回调
     * @param waitEventCompleteCallback [可选] 默认值=true 存档完毕后回调是否等待「存档完毕事件」执行完成后回调
     */
    static saveFile(id: number, executeEvent: boolean = true, onFin: Callback = null, waitEventCompleteCallback: boolean = true) {
        // -- 储存
        SinglePlayerGame.saveGame(id, Callback.New((success: boolean) => {
            if (executeEvent) {
                if (onFin && !waitEventCompleteCallback) onFin.run();
                if (success) {
                    var saveUI: GUI_5 = GameUI.get(5) as any;
                    if (saveUI) GUI_SaveFileManager.refreshSaveFileItem(saveUI.list);
                    CommandPage.startTriggerFragmentEvent(WorldData.saveSuccessEvent, Game.player.sceneObject, Game.player.sceneObject, Callback.New((onFin: Callback) => {
                        onFin && onFin.run();
                    }, this, [waitEventCompleteCallback ? onFin : null]));
                }
                else {
                    CommandPage.startTriggerFragmentEvent(WorldData.saveFailEvent, Game.player.sceneObject, Game.player.sceneObject, Callback.New((onFin: Callback) => {
                        onFin && onFin.run();
                    }, this, [waitEventCompleteCallback ? onFin : null]));
                }
            }
            else {
                if (onFin) onFin.run();
            }
        }, this), this.getCustomSaveIndexInfo());
    }
    /**
     * 读档
     * @param id 档案编号 
     * @param onFin [可选] 默认值=null 读档完毕后回调
     */
    static loadFile(id: number, onFin: Callback = null) {
        // 读取中的情况不再能够读取
        if (GUI_SaveFileManager.isLoading) return;
        GUI_SaveFileManager.isLoading = true;
        // 如果已在游戏内的话则进行一次性重启读档
        if (Game.currentScene != ClientScene.EMPTY) {
            if (SinglePlayerGame.getSaveInfoByID(id) == null) return;
            LocalStorage.setJSON(GUI_SaveFileManager.onceInSceneLoadGameSign, { id: id });
            window.location.reload();
            return;
        }
        // 读取存档，失败的话调用失败时事件处理
        SinglePlayerGame.loadGame(id, Callback.New((success: boolean, customData: any) => {
            // 成功时回调
            if (success) {
                // 监听实际进入游戏场景后取消读取进度中的状态
                EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(() => {
                    if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                        GUI_SaveFileManager.isLoading = false;
                    }
                }, this));
            }
            else {
                CommandPage.startTriggerFragmentEvent(WorldData.loadGameFailEvent, Game.player.sceneObject, Game.player.sceneObject);
                GUI_SaveFileManager.isLoading = false;
            }
            GUI_SaveFileManager.currentSaveFileCustomData = customData;
            if (onFin) onFin.runWith([success]);
        }, this));
    }
    //------------------------------------------------------------------------------------------------------
    // 私有函数-档案界面显示处理
    //------------------------------------------------------------------------------------------------------
    /**
     * 当档案列表所属的界面显示时
     * @param list 列表
     */
    private static onSaveFileListDisplay(list: UIList) {
        // 设置焦点到List
        UIList.focus = list;
        // 刷新档案列表
        this.refreshSaveFileItem(list);
    }
    /**
     * 当列表项显示对象点击时
     * @param saveMode 
     */
    private static onListItemClick(list: UIList, saveMode: boolean) {
        // 未选中任何项的话忽略
        var selectedIndex = list.selectedIndex;
        if (selectedIndex < 0) return;
        // 存档
        if (saveMode) {
            GUI_SaveFileManager.saveFile(selectedIndex + 1);
        }
        else {
            // 不存在档案数据的话则忽略
            var saveFileData: { indexInfo: SaveFileListCustomData, id: number, now: number } = list.selectedItem.data;
            if (!saveFileData) return;
            // 读取存档，失败的话调用失败时事件处理
            GUI_SaveFileManager.currentSveFileIndexInfo = saveFileData;
            GUI_SaveFileManager.loadFile(selectedIndex + 1)
        }
    }
    /**
     * 当每创建一个档案项时回调函数
     * @param ui 档案项界面
     * @param data 档案项数据
     * @param index 档案项索引
     */
    private static onCreateSaveFileItem(saveMode: boolean, ui: GUI_1001, data: ListItem_1001, index: number) {
        var saveFileData: { indexInfo: SaveFileListCustomData, id: number, now: number } = data.data;
        // 如果没有档案数据则删除按钮和缩略图都隐藏
        if (ui.screenshotImg) ui.screenshotImg.visible = (saveFileData ? true : false);
        if (ui.delBtn) {
            ui.delBtn.on(EventObject.MOUSE_DOWN, this, (e: EventObject) => { e.stopPropagation(); });
            if (saveFileData) {
                ui.delBtn.visible = true;
                ui.delBtn.commandInputMessage = [saveFileData.id];
            }
            else {
                ui.delBtn.visible = false;
            }
        }
    }
    /**
     * 刷新存档数据显示
     * @param list 档案列表组件 
     */
    static refreshSaveFileItem(list: UIList) {
        if (!list) return;
        var saveInfo = SinglePlayerGame.getSaveInfo();
        var items = [];
        for (var i = 1; i <= WorldData.saveFileMax; i++) {
            var saveFile: { indexInfo: SaveFileListCustomData, id: number, now: number } = ArrayUtils.matchAttributes(saveInfo, { id: i }, true)[0];
            var itemData = new ListItem_1001();
            itemData.no = i.toString();
            // 存在档案数据的情况
            if (saveFile) {
                itemData.data = saveFile;
                itemData.screenshotImg = saveFile.indexInfo.screenshotImg;
                itemData.mapName = saveFile.indexInfo.mapName;
                itemData.gameTimeStr = ProjectUtils.timerFormat(saveFile.indexInfo.gameTime);
                itemData.dateStr = ProjectUtils.dateFormat("YYYY-mm-dd HH:MM", new Date(saveFile.now));
            }
            else {
                itemData.screenshotImg = "";
                itemData.mapName = "空";
                itemData.gameTimeStr = "----/----";
                itemData.dateStr = "----/----";
            }
            items.push(itemData);
        }
        list.items = items;
    }
    //------------------------------------------------------------------------------------------------------
    // 私有函数-获取存档相关数据
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取自定义档案目录数据
     * -- 截图
     * -- 场景名称
     * -- 游戏时间
     */
    private static getCustomSaveIndexInfo() {
        // -- 游戏截图：隐藏界面后截图，先全屏再缩放后截一次
        var per = 0.1;
        var oldUILayerVisible = Game.layer.uiLayer.visible;
        Game.layer.uiLayer.visible = false;
        var fullScreenTex = AssetManager.drawToTexture(Game.layer, stage.width, stage.height);
        Game.layer.uiLayer.visible = oldUILayerVisible;
        var screenRoot = new GameSprite();
        var screenBitmap = new UIBitmap;
        screenBitmap.texture = fullScreenTex;
        screenRoot.addChild(screenBitmap);
        screenBitmap.scaleX = screenBitmap.scaleY = per;
        var smallScreenTex = AssetManager.drawToTexture(screenRoot, MathUtils.int(stage.width * per), MathUtils.int(stage.height * per));
        fullScreenTex.dispose();
        var smallScreenTexBase64 = AssetManager.textureToBase64(smallScreenTex);
        smallScreenTex.dispose();
        var customSaveIndexInfo = new SaveFileListCustomData;
        customSaveIndexInfo.screenshotImg = smallScreenTexBase64;
        customSaveIndexInfo.gameTime = new Date().getTime() - ProjectGame.gameStartTime.getTime();
        customSaveIndexInfo.mapName = Game.currentScene.name;
        return customSaveIndexInfo;
    }
}
/**
 * 档案目录追加的自定义数据
 * 档案目录使用GC-LifeData，是一种全局数据，在游戏启动时会自动读取
 * 该模板追加了一些自定义的档案目录数据，以便在读档前即可查看档案的一些缩略资料（目录）
 * 
 * Created by 黑暗之神KDS on 2020-09-15 13:09:31.
 */
class SaveFileListCustomData {
    /**
     * 截图：base64字符串，Web版游戏本存在存档容量限定，所以缩略截图尽可能小
     */
    screenshotImg: string;
    /**
     * 地图名
     */
    mapName: string;
    /**
     * 总游戏时间（毫秒）
     */
    gameTime: number;
}