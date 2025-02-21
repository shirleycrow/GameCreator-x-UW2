var KeyboardControl = (function () {
    function KeyboardControl() {
    }
    KeyboardControl.init = function () {
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        stage.on(EventObject.KEY_UP, this, this.onKeyUp);
    };
    KeyboardControl.start = function () {
        if (!this.onKeyUpdateCB)
            this.onKeyUpdateCB = Callback.New(this.update, this);
        os.add_ENTERFRAME(this.update, this);
        Game.player.sceneObject.off(ProjectSceneObject_1.MOVE_OVER, this, this.update);
        Game.player.sceneObject.on(ProjectSceneObject_1.MOVE_OVER, this, this.update);
    };
    KeyboardControl.stop = function () {
        os.remove_ENTERFRAME(this.update, this);
        KeyboardControl.clearKeyDown();
        if (Game.player.sceneObject)
            Game.player.sceneObject.off(ProjectSceneObject_1.MOVE_OVER, this, this.update);
    };
    KeyboardControl.setDirKeyDown = function (dir) {
        var arr = [
            null,
            [0, 2],
            [0],
            [0, 3],
            [2],
            null,
            [3],
            [1, 2],
            [1],
            [1, 3]
        ];
        var dirs = arr[dir];
        this.clearKeyDown();
        for (var i in dirs) {
            this.dirKeyDown[dirs[i]] = true;
        }
        this.updateDir();
    };
    KeyboardControl.onKeyDown = function (e) {
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            if (GameDialog.isInDialog) {
                if (GameDialog.isPlaying) {
                    Callback.CallLaterBeforeRender(GameDialog.showall, GameDialog);
                }
                else {
                    Callback.CallLaterBeforeRender(GameDialog.skip, GameDialog);
                }
                return;
            }
            else {
                if (Roguelike.current_map == 'world_map') {
                    if (Roguelike.Main.map != null) {
                        Roguelike.Main.refresh_shadow();
                    }
                    var p = GameUtils.getGridPostion(Game.player.sceneObject.pos);
                    var x = p.x + Roguelike.world_map_ox;
                    var y = p.y + Roguelike.world_map_oy;
                    for (var i_1 = 0; i_1 < 130; ++i_1) {
                        var meta_1 = hash_ports_meta_data[i_1 + 1];
                        if (Math.abs(x - meta_1.x) < 4 && Math.abs(y - meta_1.y) < 4) {
                            Roguelike.toPort(i_1);
                            break;
                        }
                    }
                    if (Roguelike.current_map == 'world_map') {
                        for (var i = 0; i < 98; ++i) {
                            var meta = Roguelike.villages_json[i + 1];
                            if (Math.abs(x - meta.x) < 4 && Math.abs(y - meta.y) < 4) {
                                if (Roguelike.discoveries[i] == null) {
                                    Roguelike.discoveries[i] = true;
                                    Game.player.variable.setString(1, "你发现了 " + i18n.chinese[meta.name]);
                                    GameCommand.startCommonCommand(1);
                                    Game.player.variable.setString(1, i18n.chinese[meta.description]);
                                    GameCommand.startCommonCommand(1);
                                    GameAudio.playSE("asset/audio/_uwol/se/discover.ogg");
                                }
                                else {
                                    Game.player.variable.setString(1, "这里是 " + i18n.chinese[meta.name]);
                                    GameCommand.startCommonCommand(1);
                                }
                                break;
                            }
                        }
                    }
                }
                else if (Roguelike.current_map == "port") {
                    var meta_2 = hash_ports_meta_data[Roguelike.port_id + 1];
                    if (Roguelike.port_id > 100)
                        meta_2 = hash_ports_meta_data[100 + 1];
                    var p = GameUtils.getGridPostion(Game.player.sceneObject.pos);
                    var x = p.x;
                    var y = p.y;
                    var name = ["", "market", "bar", "dry dock", "harbor", "inn", "palace", "job house", "misc", "bank",
                        "item shop", "church", "fortune house"];
                    if (x == 95 || x == 0 || y == 95 || y == 0) {
                        Game.player.variable.setString(1, "是否出城？");
                        GameCommand.startCommonCommand(2);
                    }
                    else {
                        for (var i_2 = 1; i_2 <= 12; ++i_2) {
                            if (meta_2.buildings[i_2] == null)
                                continue;
                            if (Math.abs(x - meta_2.buildings[i_2].x) < 3 && Math.abs(y - meta_2.buildings[i_2].y) < 3) {
                                if (name[i_2] == "dry dock") {
                                    GameCommand.startCommonCommand(3);
                                    alert(1);
                                }
                                else if (name[i_2] == "harbor") {
                                    meta_2 = hash_ports_meta_data[Roguelike.port_id + 1];
                                    Roguelike.on_ocean = true;
                                    Roguelike.toWorldMap(meta_2.x + 1, meta_2.y + 1);
                                }
                                else if (name[i_2] == "misc") {
                                    if (Roguelike.story == "访问老师") {
                                        GameCommand.startCommonCommand(8002);
                                        Roguelike.story = "出发";
                                    }
                                }
                                else if (name[i_2] == "palace") {
                                    GameAudio.playBGM("asset/audio/_uwol/building/palace.mp3");
                                    if (Roguelike.story == "谒见公爵") {
                                        GameCommand.startCommonCommand(8003);
                                        Roguelike.story = "访问老师";
                                    }
                                }
                                else if (name[i_2] == "bar") {
                                    Game.player.toScene(9, 20 * 16, 20 * 16);
                                    GameAudio.playBGM("asset/audio/_uwol/building/bar.mp3");
                                }
                                else if (name[i_2] == "church") {
                                    GameAudio.playBGM("asset/audio/_uwol/building/church.mp3");
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (Controller.inSceneEnabled) {
            this.dirKeyDownTrue(e.keyCode, true);
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
                Callback.CallLaterBeforeRender(KeyboardControl.tryTriggerSceneObjectClickEvent, KeyboardControl);
            }
        }
    };
    KeyboardControl.onKeyUp = function (e) {
        if (Controller.ctrlStart) {
            this.dirKeyDownTrue(e.keyCode, false);
        }
    };
    KeyboardControl.tryTriggerSceneObjectClickEvent = function () {
        var d = Game.player.sceneObject.avatarOri;
        if (this.dirOffsetArr[d] == null)
            return;
        if (!Game.currentScene)
            return;
        var sceneUtils = Game.currentScene.sceneUtils;
        var playerGridPos = Game.player.sceneObject.posGrid;
        if (sceneUtils.isOutsideByGrid(playerGridPos))
            return;
        var myPosRect = Game.player.sceneObject.posRect;
        var intersectionMin = Config.SCENE_GRID_SIZE / 4;
        var soLen = Game.currentScene.sceneObjects.length;
        for (var i = 0; i < soLen; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (so == null || !so.inScene || so == Game.player.sceneObject || !so.hasCommand[0])
                continue;
            var intersectionRect = so.posRect.intersection(myPosRect);
            if (intersectionRect && intersectionRect.width >= intersectionMin && intersectionRect.height > intersectionMin) {
                Controller.startSceneObjectClickEvent(so);
                return;
            }
        }
        var halfGrid = (Config.SCENE_GRID_SIZE / 2) * (Config.SCENE_GRID_SIZE / 2);
        var myPoTest = new Point(Game.player.sceneObject.x, Game.player.sceneObject.y);
        myPoTest.x += this.dirOffsetArr[d][0] / 2 * Config.SCENE_GRID_SIZE;
        myPoTest.y += this.dirOffsetArr[d][1] / 2 * Config.SCENE_GRID_SIZE;
        for (var i = 0; i < soLen; i++) {
            so = Game.currentScene.sceneObjects[i];
            if (so == null || !so.inScene || so == Game.player.sceneObject || !so.hasCommand[0])
                continue;
            var dis2 = Point.distanceSquare2(so.x, so.y, myPoTest.x, myPoTest.y);
            if (dis2 <= halfGrid) {
                Controller.startSceneObjectClickEvent(so);
                return;
            }
        }
    };
    KeyboardControl.update = function () {
        if (!Controller.inSceneEnabled)
            return;
        var toX;
        var toY;
        if (this.dir == 0) {
            if (Controller.inputState == 1) {
                Controller.inputState = 0;
                if (!ClientWorld.data.moveToGridCenter) {
                    Game.player.sceneObject.stopMove();
                }
                else {
                    var pCenter = GameUtils.getGridCenter(Game.player.sceneObject.pos);
                    if (Game.player.sceneObject.x == pCenter.x && Game.player.sceneObject.y == pCenter.y) {
                        Game.player.sceneObject.stopMove();
                    }
                }
            }
            return;
        }
        Controller.inputState = 1;
        this.isChangeDir = false;
        var xGrid = Math.floor(Game.player.sceneObject.x / Config.SCENE_GRID_SIZE) + this.dirOffsetArr[this.dir][0];
        var yGrid = Math.floor(Game.player.sceneObject.y / Config.SCENE_GRID_SIZE) + this.dirOffsetArr[this.dir][1];
        if (ClientWorld.data.moveToGridCenter) {
            toX = xGrid;
            toY = yGrid;
        }
        else {
            toX = Game.player.sceneObject.x + this.dirOffsetArr[this.dir][0] * Config.SCENE_GRID_SIZE * 2;
            toY = Game.player.sceneObject.y + this.dirOffsetArr[this.dir][1] * Config.SCENE_GRID_SIZE * 2;
        }
        if (!ClientWorld.data.moveToGridCenter) {
            if (this.lastDx != this.dirOffsetArr[this.dir][0] || this.lastDy != this.dirOffsetArr[this.dir][1]) {
                this.lastDx = this.dirOffsetArr[this.dir][0];
                this.lastDy = this.dirOffsetArr[this.dir][1];
            }
            else if (Game.player.sceneObject.isMoving) {
                return;
            }
            this.moveDirect(toX, toY);
        }
        else if (!Game.player.sceneObject.isMoving) {
            this.moveDirectGrid(xGrid, yGrid);
        }
        if (Roguelike.Main.map != null) {
            Roguelike.Main.refresh_shadow();
        }
    };
    KeyboardControl.clearKeyDown = function () {
        for (var i in this.dirKeyDown) {
            this.dirKeyDown[i] = false;
        }
        this.dir = 0;
    };
    KeyboardControl.dirKeyDownTrue = function (keyCode, isDown) {
        if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
            this.lastKeyDown = 0;
            this.dirKeyDown[0] = isDown;
            this.updateDir();
            return true;
        }
        else if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.UP)) {
            this.lastKeyDown = 1;
            this.dirKeyDown[1] = isDown;
            this.updateDir();
            return true;
        }
        else if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            this.lastKeyDown = 2;
            this.dirKeyDown[2] = isDown;
            this.updateDir();
            return true;
        }
        else if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            this.lastKeyDown = 3;
            this.dirKeyDown[3] = isDown;
            this.updateDir();
            return true;
        }
        return false;
    };
    KeyboardControl.updateDir = function () {
        var oldDir = this.dir;
        this.dir = 0;
        if (this.leftDown && this.upDown) {
            this.dir = 7;
        }
        else if (this.rightDown && this.upDown) {
            this.dir = 9;
        }
        else if (this.rightDown && this.downDown) {
            this.dir = 3;
        }
        else if (this.leftDown && this.downDown) {
            this.dir = 1;
        }
        else if (this.leftDown) {
            this.dir = 4;
        }
        else if (this.rightDown) {
            this.dir = 6;
        }
        else if (this.downDown) {
            this.dir = 2;
        }
        else if (this.upDown) {
            this.dir = 8;
        }
        if (ClientWorld.data.moveDir4) {
            if (this.dir == 7)
                this.dir = this.lastKeyDown == 2 ? 4 : 8;
            if (this.dir == 9)
                this.dir = this.lastKeyDown == 3 ? 6 : 8;
            if (this.dir == 3)
                this.dir = this.lastKeyDown == 3 ? 6 : 2;
            if (this.dir == 1)
                this.dir = this.lastKeyDown == 2 ? 4 : 2;
        }
        this.isChangeDir = this.dir != oldDir;
        if (Roguelike.Main.player != null) {
            var H = {};
            H[2] = 4;
            H[4] = 6;
            H[6] = 2;
            H[8] = 0;
            if (H[this.dir] != null) {
                Roguelike.Main.turn_and_refresh_shadow(H[this.dir]);
            }
        }
    };
    Object.defineProperty(KeyboardControl, "leftDown", {
        get: function () {
            return this.dirKeyDown[2];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyboardControl, "rightDown", {
        get: function () {
            return this.dirKeyDown[3];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyboardControl, "downDown", {
        get: function () {
            return this.dirKeyDown[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyboardControl, "upDown", {
        get: function () {
            return this.dirKeyDown[1];
        },
        enumerable: true,
        configurable: true
    });
    KeyboardControl.moveDirectGrid = function (xGrid, yGrid) {
        var scene = Game.currentScene;
        var oldDir = Game.player.sceneObject.avatarOri;
        if (!Game.player.sceneObject.fixOri)
            Game.player.sceneObject.avatarOri = this.dir;
        Game.player.sceneObject.ignoreCantMove = true;
        Game.player.sceneObject.keepMoveActWhenCollsionObstacleAndIgnoreCantMove = true;
        var toX = xGrid * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
        var toY = yGrid * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
        Game.player.sceneObject.autoFindRoadMove(toX, toY, 2, Game.oneFrame);
    };
    KeyboardControl.moveDirect = function (x, y, trySingleDir) {
        if (trySingleDir === void 0) { trySingleDir = true; }
        var xGrid = Math.floor(x / Config.SCENE_GRID_SIZE);
        var yGrid = Math.floor(y / Config.SCENE_GRID_SIZE);
        var scene = Game.currentScene;
        Game.player.sceneObject.ignoreCantMove = true;
        Game.player.sceneObject.keepMoveActWhenCollsionObstacleAndIgnoreCantMove = true;
        if (trySingleDir) {
            var oldDir = Game.player.sceneObject.avatarOri;
            if (this.dir != 0 && !Game.player.sceneObject.fixOri)
                Game.player.sceneObject.avatarOri = this.dir;
        }
        var oldX = Game.player.sceneObject.x;
        var oldY = Game.player.sceneObject.y;
        Game.player.sceneObject.startMove([[x, y]], Game.oneFrame);
        if (Game.player.sceneObject.x == oldX && Game.player.sceneObject.y == oldY) {
            if (trySingleDir) {
                if (x != Game.player.sceneObject.x && y != Game.player.sceneObject.y) {
                    var newX = Game.player.sceneObject.x;
                    var newY = Game.player.sceneObject.y + (y - Game.player.sceneObject.y < 0 ? -Config.SCENE_GRID_SIZE : Config.SCENE_GRID_SIZE);
                    if (!this.moveDirect(newX, newY, false)) {
                        newX = Game.player.sceneObject.x + (x - Game.player.sceneObject.x < 0 ? -Config.SCENE_GRID_SIZE : Config.SCENE_GRID_SIZE);
                        newY = Game.player.sceneObject.y;
                        if (!this.moveDirect(newX, newY), false) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
                else {
                    if (Game.player.sceneObject.lastTouchObjects.length == 0) {
                        var dx = x - Game.player.sceneObject.x;
                        var dy = y - Game.player.sceneObject.y;
                        if (dx != 0)
                            dx = dx < 0 ? -1 : 1;
                        if (dy != 0)
                            dy = dy < 0 ? -1 : 1;
                        var dGridP = new Point(Game.player.sceneObject.posGrid.x + dx, Game.player.sceneObject.posGrid.y + dy);
                        if (!Game.currentScene.sceneUtils.isFixedObstacleGrid(dGridP)) {
                            var newToP = GameUtils.getGridCenterByGrid(dGridP);
                            Game.player.sceneObject.autoFindRoadMove(newToP.x, newToP.y, 0, Game.oneFrame, true, false, true);
                        }
                    }
                }
            }
            return false;
        }
        return true;
    };
    KeyboardControl.dir = 0;
    KeyboardControl.isChangeDir = false;
    KeyboardControl.dirKeyDown = [false, false, false, false];
    KeyboardControl.dirOffsetArr = [
        null,
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 0],
        null,
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1]
    ];
    KeyboardControl.clickNpc3Mode = [
        null,
        [new Point(0, 1), new Point(-1, 0)],
        [new Point(1, 1), new Point(-1, 1)],
        [new Point(1, 0), new Point(0, 1)],
        [new Point(-1, 1), new Point(-1, -1)],
        null,
        [new Point(1, 1), new Point(1, -1)],
        [new Point(-1, 0), new Point(0, -1)],
        [new Point(-1, -1), new Point(1, -1)],
        [new Point(0, -1), new Point(1, 0)]
    ];
    return KeyboardControl;
}());
//# sourceMappingURL=KeyboardControl.js.map