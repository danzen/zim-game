// ZIM - https://zimjs.com - Code Creativity!
// JavaScript Canvas Framework for General Interactive Media
// free to use - donations welcome of course! https://zimjs.com/donate

// ZIM GAME - see https://zimjs.com/code#libraries for examples

// ~~~~~~~~~~~~~~~~~~~~~~~~
// DESCRIPTION - LeaderBoard coded in 2017, Board in 2019 (c) ZIM
// Helper code for making games on the HTML Canvas with JavaScript
// ZIM already has a number of functions and classes that can help with games for example:
// well... just about everthing in ZIM ;-)  Okay, here are a list of common ones:
// hitTestPoint, hitTestReg, hitTestRect, hitTestCircle, hitTestGrid
// Sprite, Dynamo, Scroller, Accelerator, loadAssets and asset
// animate, move, Ticker, GamePad, MotionController
// Label, Button, Slider, Dial, Tabs, Pane, ColorPicker, Swipe, Swiper, Indicator
// scale, scaleTo, center, centerReg, addTo, removeFrom
// Circle, Rectangle, Triangle
// constrain, Damp, ProportionDamp

// The Game Module has LeaderBoard(), Meter(), Board(), Person(), Orb(), Tree(), Timer(), Scorer(), and Dialog()

// DOCS
// Docs are provided at https://zimjs.com/docs.html
// See GAME MODULE at bottom
// ~~~~~~~~~~~~~~~~~~~~~~~~


import zim from "zimjs";

// note - removed the ES5 module pattern as we are getting zim from import
// ~~~~~~~~~~~~~~~~~~~~~~~~

var WW = window||{};

zim.LeaderBoard = function(data, title, width, height, corner, backgroundColor, titleColor, colors, total, scoreWidth, scorePlaces, scoreZeros, spacing, arrows, borderColor, borderWidth, shadowColor, shadowBlur, reverse, allowZero, font, fontSize, nameShift, scoreShift, rankShift) {
    var sig = "data, title, width, height, corner, backgroundColor, titleColor, colors, total, scoreWidth, scorePlaces, scoreZeros, spacing, arrows, borderColor, borderWidth, shadowColor, shadowBlur, reverse, allowZero, font, fontSize, nameShift, scoreShift, rankShift";
    var duo; if (duo = zob(zim.LeaderBoard, arguments, sig, this)) return duo;
    this.arguments = arguments;

    if (zot(data)) data = "localStorage";
    if (zot(width)) width = 400;
    if (zot(height)) height = 600;
    this.super_constructor(width, height);
    if (zot(corner)) corner = 20;
    if (zot(backgroundColor)) backgroundColor = "white";
    if (zot(titleColor)) titleColor = "#222";
    if (zot(total)) total = 10;
    if (zot(scoreWidth)) scoreWidth = 300;
    if (zot(scorePlaces)) scorePlaces = 6;
    if (zot(scoreZeros)) scoreZeros = false;
    if (zot(spacing)) spacing = 10;
    if (zot(arrows)) arrows = false;
    if (!zot(borderColor) && zot(borderWidth)) borderWidth = 2;
    if (zot(shadowColor)) shadowColor="rgba(0,0,0,.3)";
    if (zot(shadowBlur)) shadowBlur=14;
    if (zot(reverse)) reverse=false;
    if (zot(allowZero)) allowZero=false;
    if (zot(font)) font = "courier";
    if (zot(fontSize)) fontSize = 60;
    if (zot(nameShift)) nameShift = 0;
    if (zot(scoreShift)) scoreShift = 0;
    if (zot(rankShift)) rankShift = 0;

    if (typeof frame == "undefined" || zot(frame)) var frame = zimDefaultFrame;

    var backing = this.backing = new zim.Rectangle(width, height, backgroundColor, borderColor, borderWidth, corner);
    backing.mouseEnabled = false;
    var backingEvent = backing.on("click", function(){});
    backing.off("click", backingEvent);
    backing.off("click", backingEvent);
    this.addChild(backing);
    this.setBounds(0,0,width,height);
    this.backdrop = new Rectangle(2000, 1000, "rgba(0,0,0,.01)").center(this, 0);
    if (typeof frame == "undefined" && typeof zimDefaultFrame != "undefined") {var frame = zimDefaultFrame;}
    var stage = frame.stage;
    this.backdrop.on("mousedown", function() {
        stage = that.stage;
        that.removeFrom();
        that.dispatchEvent("close");
        if (stage) stage.update();
    });
    this.filled = false;
    this.info = {reverse:reverse, total:total, allowZero:allowZero, type:gameSaved}; // ES6 to fix
    if (shadowColor != -1 && shadowBlur > 0) backing.shadow = new createjs.Shadow(shadowColor, 3, 3, shadowBlur);

    var grid = this.grid = new zim.Container();
    var row;
    var stepper;
    var rank;
    var score;
    var that = this;

    var c = {
        rankBackgroundColor: zim.darker,
        rankColor: zim.light,
        currentRankBackgroundColor: zim.pink,
        currentRankColor: "white",

        nameBackgroundColor: zim.lighter,
        nameColor: zim.darker,
        currentNameBackgroundColor: "#f0d2e8",
        currentNameColor: zim.darker,

        scoreBackgroundColor: zim.light,
        scoreColor: zim.darker,
        currentScoreBackgroundColor: "#f0d2e8",
        currentScoreColor: zim.darker
    }
    var c = zim.merge(c, colors);

    var fakeText = zim.decimals(8,-scorePlaces,true); // force text to 000008 to start
    var winSteppers;
    var gameSaved;
    var button;
    var winRow;

    if (data == "localStorage") {
        initLocalStorage();
    } else if (!Array.isArray(data)) { // data is a key to get the data from the ZIM Game Database
        that.dataSource = "database";
        that.key = data;
        zim.async("https://zimjs.com/gamedata.php?id="+data, gameData);
        function gameData(d){
            if (d == "error") {
                var e = new createjs.Event("error");
                e.type = "data";
                that.dispatchEvent(e);
                initLocalStorage(); // drop to localStorage
                return;
            }
            if (d == "noscores") {
                d = [];
            }
            data=d;
            makeGrid();
        }

    } else {
        that.dataSource = "custom";
        makeGrid();
    }

    function initLocalStorage() {
        // localStorage.clear();
        that.dataSource = "localStorage";
        if (localStorage && localStorage.gameData) {
            data = JSON.parse(localStorage.gameData);
        } else {
            data = [];
        }
        makeGrid();
    }

    var keydownEvent;

    function makeGrid() {			
        scaleStart = that.scaleX;
        that.sca(1);
        that.filled = false;
        frame.off("keydown", keydownEvent);
        if (!zot(title)) {
            var titleText = that.titleText = new zim.Label({
                text:title,
                size:fontSize,
                color:titleColor,
                align:"center",
                font:font
            }).addTo(grid);
            titleText.x = titleText.width/2;
            titleText.mouseEnabled = false;
        }

        var winCheck;
        if (!zot(that.winner)) winSteppers = [];
        backing.mouseEnabled = false;
        backing.off("click", backingEvent);
        for (var j=0; j<total; j++) {
            winCheck = j==that.winner;
            var p, s;
            if (data[j]) {
                p = data[j].player;
                s = data[j].score;
            } else {
                p = s = "   ";
            }
            row = new zim.Container();
            rank = new zim.Label({
                text:(j+1),
                size:50,
                color:j==that.winner?c.currentRankColor:c.rankColor,
                align:"center",
                valign:"center",
                backing:new zim.Rectangle(100,100,winCheck?c.currentRankBackgroundColor:c.rankBackgroundColor),
            });
            rank.reg(-rank.width/2,-rank.height/2);
            rank.label.regY = -rankShift;
            rank.addTo(row);
            if (arrows && !zot(that.winner)) {
                rank.mov(0,j>=that.winner?50:0)
                    .mov(0,j>that.winner?50:0)
            }
            for (var i=0; i<3; i++) {
                stepper = new zim.Stepper({
                    list:winCheck?"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-*_".split(""):p[i],
                    width:70,
                    continuous:true,
                    label:new zim.Label({text:"", font:font, color:j==that.winner?c.currentNameColor:c.nameColor, size:fontSize, align:"center", shiftV:-5-nameShift}),
                    backgroundColor:winCheck?c.currentNameBackgroundColor:c.nameBackgroundColor,
                    vertical:false,
                    arrows:false,
                    arrows2:(winCheck&&arrows),
                    corner:0,
                    shadowBlur:0
                }).sca(100/60);
                if (winCheck) {
                    backing.mouseEnabled = true;
                    backing.on("click", backingEvent);
                    if (frame.tabOrder) frame.tabOrder.push(stepper);
                    winSteppers.push(stepper);
                    stepper.currentValue = "_";
                    stepper.on("change", function(e) {	
                        if (e.target.text != "_") {
                            e.target.label.y = 19-nameShift;
                            e.target.stage.update();
                        }						
                        var done = zim.loop(winSteppers, function(s) {
                            if (s.currentValue == "_") return false;
                        });		
                        if (done) {
                            that.filled = true;
                            winScore.text = "";
                            button.loc(winScore.backing).addTo(winRow);
                            if (that.stage) that.stage.update();
                        }
                        that.dispatchEvent("change");
                    });
                    if (i==0) stepper.keyFocus = true;
                } else {
                    stepper.label.y = 19-nameShift;
                }
                // stepper.label.reg(0,-2-nameShift)
                // stepper.label.mov(0,2+nameShift)
                stepper.x = rank.width + spacing + i*(stepper.width+spacing);
                if (arrows && !zot(that.winner)) {
                    stepper.mov(0,j>=that.winner?50:0).mov(0,j>that.winner?50:0);
                }
                // stepper.enabled = winCheck;
                row.addChild(stepper);

                var scoreText = new zim.Label({
                    text:fakeText,
                    color:winCheck?c.currentScoreColor:c.scoreColor,
                    font:font,
                    size:fontSize+4,
                    align:"right",
                    valign:"center",
                    backing:new zim.Rectangle(scoreWidth,100,winCheck?c.currentScoreBackgroundColor:c.scoreBackgroundColor)
                });
                scoreText.text = scoreZeros?zim.decimals(s, -scorePlaces, true):s;
                scoreText.reg(-scoreText.width/2,-scoreText.height/2)
                scoreText.label.regY = -4 - scoreShift;
                scoreText.label.skewX = 10;
                row.addChild(scoreText);
                scoreText.x = rank.width + spacing + 3*(stepper.width+spacing)+60;
                // scoreText.outline()
                if (arrows && !zot(that.winner)) {
                    scoreText.mov(0,j>=that.winner?50:0)
                        .mov(0,j>that.winner?50:0);
                }
            }
            if (winCheck) {
                winRow = row;
                var winScore = scoreText;
                button = that.button = new zim.Button({
                    label:new zim.Label({text:"SAVE", size:50, align:"center", color:c.currentRankColor, rollColor:c.currentRankBackgroundColor}),
                    width:scoreText.width,
                    backgroundColor:c.currentRankBackgroundColor,
                    rollBackgroundColor:c.currentRankColor,
                    height:100,
                    corner:0,
                    shadowBlur:0
                });
                // button.x = scoreText.x-60;
                // button.y = scoreText.y;
                if (frame.tabOrder) frame.tabOrder.push(button);
                button.on("mousedown", that.submitScore);

                keydownEvent = frame.on("keydown", function(e) {
                    if (!that.stage) return;
                    if (button.focus && e.keyCode == 13) { // enter key
                        submitScore();
                        e.preventDefault();
                    }
                });
            }
            row.addTo(grid)
            row.x = 0;
            row.y = (zot(title)?0:(titleText.height + spacing*2)) + j*(100 + spacing);
            row.mouseChildren = winCheck;
            row.mouseEnabled = winCheck;

        }
        if (!zot(title)) {titleText.center(grid); titleText.y=0;}
        grid.scaleTo(that, 95, 95)
            .center(that);
        that.sca(scaleStart);
        if (stage) stage.update();
    }

    this.submitScore = function() {
        button.text = that.dataSource=="localStorage"?"LOCAL":"SENT";
        winRow.mouseChildren = false;
        winRow.mouseEnbabled = false;
        that.stage.update();
        if (zot(data[that.winner])) data[that.winner] = {};
        data[that.winner].player = winSteppers[0].currentValue + winSteppers[1].currentValue + winSteppers[2].currentValue;
        var e = new createjs.Event("press");
        var player = e.player = data[that.winner].player;
        var score = e.score = data[that.winner].score;
        e.key = that.key;
        e.info = that.info;
        that.dispatchEvent(e);

        if (that.dataSource == "custom") return;
        if (zim.decimals(score, null, null, null, null, null, e)) that.save();
        return that;
    }

    this.score = function(score) {

        if (!Array.isArray(data)) {
            timeout(.1, function(){that.score(score)});
            return;
        }
        
        if (!zot(that.pendingIndex)) that.cancel();			

        var position;
        if (data.length == 0) {
            position = 0;
            data.push({player: "", score: score});
        } else {
			position = zim.loop(data, function(s, i) {
                if ((!reverse && s.score <= score) || (reverse && s.score >= score)) {
                    data.splice(i, 0, {player:"", score:score});
                    return i;
                }
            });
        }
        if (position===true && (allowZero || score > 0) && (data.length == 0 || data.length < total)) {
             data.push({player:"", score:score});
             position = data.length-1;
        }
        if (position!==true) {
            that.pendingIndex = position;
            that.redraw(null, position);
        }
        return position!==true?position:null;
    }

    this.save = function() {
        if (zot(that.pendingIndex))  return that;
        if (that.dataSource == "database") {
            var player = data[that.pendingIndex].player;
            var score = data[that.pendingIndex].score;
            zim.async("https://zimjs.com/gamedata.php?id="+that.key+"&player="+player+"&score="+score+"&reverse="+reverse+"&total="+total+"&allowZero="+allowZero, gameSaved);
        }
        if (that.dataSource == "localStorage") {
            that.pendingIndex = null;
            if (localStorage) localStorage.gameData = JSON.stringify(data);
            setTimeout(function() {
                button.text = "DONE";
                if (that.stage) that.stage.update();
            }, 500);
            setTimeout(function() {that.redraw();}, 1500);
        }
        return that;
    }

    function gameSaved(d){
        if (d == "error") {
            var e = new createjs.Event("error");
            e.type = "save";
            that.dispatchEvent(e);
            button.text = "ERROR";
            data.splice(that.pendingIndex, 1);
        } else {
            var e = new createjs.Event("save");
            e.data = data = d;
            that.dispatchEvent(e);
            button.text = "DONE";
        }
        that.pendingIndex = null;
        if (that.stage) that.stage.update();
        setTimeout(function() {that.redraw();}, 1000);
    }

    this.startTime = function() {
        zim.async("https://zimjs.com/gamedata.php?id="+that.key+"&command=start", timeReply);
        return that;
    }
    this.stopTime = function() {
        zim.async("https://zimjs.com/gamedata.php?id="+that.key+"&command=stop", timeReply);
        return that;
    }
    function timeReply(data){};

    this.cancel = function() {
        if (zot(that.pendingIndex)) return that;
        data.splice(that.pendingIndex, 1);
        that.pendingIndex = null;
        that.redraw();
        var e = new createjs.Event("cancel");
        e.data = data;
        that.dispatchEvent(e);
        return that;
    }
    var scaleStart = that.scaleX;
    this.redraw = function(newData, newWinner) {
        if (newData) data = newData;
        scaleStart = that.scaleX;
        that.dispose();
        if (zot(newWinner)) {that.winner = null} else {that.winner = newWinner;}
        grid.removeAllChildren();
        makeGrid();
        if (that.stage) that.stage.update();
        return that;
    }

    this.dispose = function() {
        if (winSteppers) {
            var ind;
            zim.loop(winSteppers, function(s) {
                if (frame.tabOrder) {
                    var ind = frame.tabOrder.indexOf(s);
                    if (ind > -1) frame.tabOrder.splice(ind, 1);
                }
                s.dispose();
            });
            if (frame.tabOrder) {
                ind = frame.tabOrder.indexOf(button);
                if (ind > -1) frame.tabOrder.splice(ind, 1);
            }
            if (button) button.dispose();
        }
    }
}
zim.extend(zim.LeaderBoard, zim.Container);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Meter = function(stage, vertical, horizontal, color, textColor, padding, decimals, alpha, skew) {
    var sig = "stage, vertical, horizontal, color, textColor, padding, decimals, alpha, skew";
    var duo; if (duo = zob(zim.Meter, arguments, sig, this)) return duo;
    this.arguments = arguments;

    if (zot(vertical)) vertical = "bottom";
    if (zot(horizontal)) horizontal = "left";
    if (zot(padding)) padding = 20;
    if (zot(decimals)) decimals = 0;
    if (zot(color)) color = "#acd241"; // frame.green
    if (zot(textColor)) textColor = "black"; // frame.green
    if (zot(alpha)) alpha = .6;
    if (zot(skew)) skew = 10;

    this.super_constructor("", 30, null, textColor, null, null, null, "center", "center", null, null, null, null, null, new zim.Rectangle(100,40,color));
    var that = this;
    var meterFunction;
    var initFunction;
    if (zot(stage)) {initFunction = that.on("added", init);} else {init();}
    var fps = new zim.Label({text:"FPS", size:18, color:textColor}).rot(-90).addTo(that).alp(.5)
    fps.x = 59;
    fps.y = 17;
    function init() {
        if (zot(stage)) stage = that.stage;
        if (zot(stage)) return;
        that.off("added", initFunction);
        stage.addChild(that);
        that.alpha = alpha;
        that.skewX = skew;
        that.setBounds(null);
        that.pos(padding, padding, horizontal, vertical);
        // that.x = horizontal=="left"?padding+skew/2+50:stage.getBounds().width-that.width-padding-skew/2+50;
        // that.y = vertical=="top"?padding:stage.getBounds().height-that.height-padding;
        meterFunction = zim.Ticker.add(function() {
            that.text = zim.decimals(createjs.Ticker.getMeasuredFPS(), decimals, true);
            if (stage) stage.update();
        }, stage);
    }
    this.position = function(v, h) {
        if (!zot(v)) vertical = v;
        if (!zot(h)) horizontal = h;
        that.setBounds(null);
        // that.x = horizontal=="left"?padding+skew/2+50:stage.getBounds().width-that.width-padding-skew/2+50;
        // that.y = vertical=="top"?padding:stage.getBounds().height-that.height-padding;
        that.pos(padding, padding, horizontal, vertical);
        return that;
    }
    this.dispose = function () {
        zim.Ticker.remove(meterFunction);
    }
}
zim.extend(zim.Meter, zim.Label);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Board = function(size, cols, rows, backgroundColor, rollBackgroundColor, borderColor, borderWidth, icon, isometric, indicatorColor, indicatorBorderColor, indicatorBorderWidth, indicatorSize, indicatorType, arrows, arrowColor, arrowRollColor, swipe, info, labels, color, scaleMin, scaleMax, buffer) {
    var sig = "size, cols, rows, backgroundColor, rollBackgroundColor, borderColor, borderWidth, icon, isometric, indicatorColor, indicatorBorderColor, indicatorBorderWidth, indicatorSize, indicatorType, arrows, arrowColor, arrowRollColor, swipe, info, labels, color, scaleMin, scaleMax, buffer";
    var duo; if (duo = zob(zim.Board, arguments, sig, this)) return duo;
    this.arguments = arguments;

    if (zot(size)) size = 50;
    this.size = size;
    if (zot(cols)) cols = zot(rows) ? 8 : rows;
    if (zot(rows)) rows = cols;
    this.cols = cols;
    this.rows = rows;
    this.num = cols * rows;
    if (zot(backgroundColor)) backgroundColor = "#eee";
    if (zot(rollBackgroundColor)) rollBackgroundColor = "#aaa";
    if (zot(borderColor)) borderColor = "#111";
    if (zot(borderWidth)) borderWidth = 2;
    if (zot(isometric)) isometric = true;
    var isoFirst = isometric;
    if (zot(indicatorColor)) indicatorColor = null;
    if (zot(indicatorBorderColor)) indicatorBorderColor = "#111";
    if (zot(indicatorBorderWidth)) indicatorBorderWidth = 2;
    if (zot(indicatorType)) indicatorType = "circle";
    if (indicatorType != "circle") indicatorType = "rectangle";
    if (zot(indicatorSize)) indicatorSize = indicatorType == "rectangle" ? (size - indicatorBorderWidth) : size / 4;
    if (zot(arrows)) arrows = true;
    if (zot(arrowColor)) arrowColor = "rgba(0,0,0,.4)";
    if (zot(arrowRollColor)) arrowRollColor = "#fff";
    if (zot(swipe)) swipe = arrows;

    var timeType = typeof TIME == "undefined" ? "seconds" : TIME;

    function emptyInfo() {
        // info is rows (j) then cols (i)
        info = [];
        zim.loop(rows, function(j) {
            var inf = info[j] = [];
            zim.loop(cols, function(i) {
                inf[i] = {data: "x", color: backgroundColor, icon: icon ? icon.clone() : null, items: []};
            });
        });
    }
    if (zot(info)) {
        // create empty info if no provided info
        emptyInfo();
    } else if (typeof info == "string") {
        if (info.match(/zimon/) && typeof ZIMON !== 'undefined') info = ZIMON.parse(info);
        else emptyInfo();
    } else if (!Array.isArray(info) || info.length == 0) {
        emptyInfo();
    } else {
        // info are rows (j) then cols (i)
        var info2 = [];
        var i0 = 0;
        // get most cols
        zim.loop(Math.max(cols, info.length), function(j) {
            if (info[j] && info[j].length > i0) i0 = info[j].length;
        });
        zim.loop(Math.max(cols, info.length), function(j) {
            var inf = info2[j] = [];
            zim.loop(Math.max(rows, i0), function(i) {
                if (info[j] && !zot(info[j][i])) {
                    if (zot(info[j][i].data)) info[j][i].data = "x";
                    if (zot(info[j][i].color)) info[j][i].color = backgroundColor;
                    if (zot(info[j][i].icon)) info[j][i].icon = icon ? icon.clone() : null;
                    if (zot(info[j][i].items)) info[j][i].items = [];
                    inf[i] = info[j][i];
                }
                else inf[i] = {data: "x", color: backgroundColor, icon: icon ? icon.clone() : null, items: []};
            });
        });
        info = copy(info2);
    }
    this.info = info;
    if (zot(labels)) labels = false;
    if (zot(color)) color = "#666";
    if (zot(scaleMin)) scaleMin = 1.2;
    if (zot(scaleMax)) scaleMax = 1.8;
    if (zot(swipe)) swipe = true;
    if (zot(buffer)) buffer = 2;
    this.super_constructor();
    this.type = "Board";
    this.buffer = buffer;

    var that = this;
    var holder = new zim.Container().addTo(this);
    var container = new zim.Container(size, size);
    new zim.Rectangle(size, size, zik(backgroundColor), zik(borderColor), zik(borderWidth)).addTo(container);
    // labels for debugging
    if (labels) new zim.Label({text: "", color: color, align: "center", valign: "center"}).center(container);
    var tiles = this.tiles = new zim.Tile(container.centerReg(), cols, rows);

    if (isometric) {
        tiles.rot(45)
            .centerReg(holder);
        holder.sca(2, 1);
    } else {
        tiles.centerReg(holder);
    }
    this.arrows = arrows;

    var startCol = 0;
    var startRow = 0;
    var lastStartCol = 0;
    var lastStartRow = 0;

    Object.defineProperty(this, 'numCols', {
        get: function() {
            return that.info[0].length;
        },
        set: function(value) {
            zog("zim.Board() - numCols is read only");
        }
    });

    Object.defineProperty(this, 'numRows', {
        get: function() {
            return that.info.length;
        },
        set: function(value) {
            zog("zim.Board() - numRows is read only");
        }
    });
    Object.defineProperty(this, 'startCol', {
        get: function() {
            return startCol;
        },
        set: function(value) {
            startCol = zim.constrain(value, 0, that.numCols - cols);
            if (startCol != lastStartCol) {
                that.update();
                that.shiftPath(lastStartCol, startCol); // no obj so for all pieces
            }
            lastStartCol = startCol;
        }
    });

    Object.defineProperty(this, 'startRow', {
        get: function() {
            return startRow;
        },
        set: function(value) {
            startRow = zim.constrain(value, 0, that.numRows - rows);
            if (startRow != lastStartRow) {
                that.update();
                that.shiftPath(null, null, lastStartRow, startRow); // no obj so for all pieces
            }
            lastStartRow = startRow;
        }
    });

    Object.defineProperty(this, 'data', {
        // gets board data only - not all data
        get: function() {
            var data = [];
            zim.loop(startRow + rows, function(j) {
                var d = [];
                data.push(d);
                zim.loop(startCol + cols, function(i) {
                    d.push(that.info[j][i].data);
                }, null, null, null, startCol);
            }, null, null, null, startRow);
            return data;
        },
        set: function(value) {
            zog("zim.Board() - data is read only - use setData(tile) or change info property and update()");
        }
    });

    Object.defineProperty(this, 'isometric', {
        get: function() {
            return isometric;
        },
        set: function(value) {
            if (value != isometric) {
                isometric = value;
                that.removeArrows();
                if (isometric) {
                    holder.removeAllChildren();
                    that.tiles.rot(45).centerReg(holder);
                    var ss = isoFirst ? 1 : 1.2;
                    holder.sca(2 / ss, 1 / ss).mov(0, (isoFirst ? 20 : 0));
                } else {
                    holder.removeAllChildren();
                    that.tiles.rot(0).centerReg(holder);
                    holder.sca(1 * (isoFirst ? 1.2 : 1)).mov(0, (isoFirst ? -20 : 0));
                }
                if (swipe) {
                    var swap = {left: "right", right: "left", up: "down", down: "up"};
                    if (that.swipeEvent) that.swipe.off("swipe", that.swipeEvent);
                    that.swipe = new zim.Swipe(that, null, null, isometric);
                    that.swipeEvent = that.swipe.on("swipe", function(e) {
                        if (e.target.direction == "none") return;
                        that.moveCamera(swap[e.target.direction]);
                    });
                }
                that.setArrows();
                that.update();
                if (that.stage) that.stage.update();
            }
        }
    });

    this.update = function() {
        // updates data, colors and pieces for currently visible board
        if (labels) {
            tiles.loop(function(tile) {
                tile.getChildAt(1).text = that.getData(tile);
            });
        }
        that.pieces.loop(function(piece) {
            piece.visible = false;
        });
        that.clearBoardColors();
        that.clearBoardIcons();

        zim.loop(rows + startRow, function(j) {
            zim.loop(cols + startCol, function(i) {
                var info = that.info[j][i];
                var tile = that.getTile(i - startCol, j - startRow);
                that.setColor(tile, info.color, true);
                if (info.icon) that.setIcon(tile, info.icon, true);
                zim.loop(info.items, function(item) {
                    that.add(item, i - startCol, j - startRow, null, null, null, true);
                });
            }, null, null, null, startCol);
        }, null, null, null, startRow);
        if (that.stage) that.stage.update();
        return that;
    };

    if (swipe) {
        this.swipe = new zim.Swipe(this, null, null, isometric);
        this.swipeEvent = this.swipe.on("swipe", function(e) {
            if (e.target.direction == "none") return;
            var swap = {left: "right", right: "left", up: "down", down: "up"};
            that.moveCamera(swap[e.target.direction]);
        });
    }

    this.moveCamera = function(dir) {
        // moves camera one square left, right, up or down
        // by setting startCol and startRow
        // which moves any items, paths and sets activeData
        if (dir == "left") {
            if (that.arrowRight && startCol == that.numCols - cols) that.arrowRight.hov(arrowRollColor);
            that.startCol = startCol - 1;
            if (that.arrowLeft && startCol == 0) that.arrowLeft.hov(-1);
        } else if (dir == "right") {
            if (that.arrowLeft && startCol == 0) that.arrowLeft.hov(arrowRollColor);
            that.startCol = startCol + 1;
            if (that.arrowRight && startCol == that.numCols - cols) that.arrowRight.hov(-1);
        } else if (dir == "up") {
            if (that.arrowDown && startRow == that.numRows - rows) that.arrowDown.hov(arrowRollColor);
            that.startRow = startRow - 1;
            if (that.arrowUp && startRow == 0) that.arrowUp.hov(-1);
        } else if (dir == "down") {
            if (that.arrowUp && startRow == 0) that.arrowUp.hov(arrowRollColor);
            that.startRow = startRow + 1;
            if (that.arrowDown && startRow == that.numRows - rows) that.arrowDown.hov(-1);
        }
        return that;
    };

    this.positionBoard = function(i, j) {
        // starts board off at provided location in info
        that.startCol = i;
        that.startRow = j;
        if (that.arrows) that.setArrowHover();
        return that;
    };

    this.setArrowHover = function() {
        if (that.arrowLeft) that.arrowLeft.hov(startCol == 0 ? -1 : arrowRollColor);
        if (that.arrowRight) that.arrowRight.hov(startCol == that.numCols - cols ? -1 : arrowRollColor);
        if (that.arrowUp) that.arrowUp.hov(startRow == 0 ? -1 : arrowRollColor);
        if (that.arrowDown) that.arrowDown.hov(startRow == that.numRows - rows ? -1 : arrowRollColor);
        return that;
    };

    this.addCol = function(index) {
        // adds info column at an index
        if (zot(index)) index = that.numCols;
        zim.loop(that.info, function(inf, i) {
            inf.splice(index, 0, {data: "x", color: backgroundColor, icon: icon ? icon.clone() : null, items: []});
        });
        if (that.arrows) {
            that.setArrows();
            that.setArrowHover();
        }
        that.update();
        return that;
    };

    this.addRow = function(index) {
        // adds info row at an index
        if (zot(index)) index = that.numRows;
        var inf = [];
        zim.loop(that.numCols, function() {
            inf.push({data: "x", color: backgroundColor, icon: icon ? icon.clone() : null, items: []});
        });
        that.info.splice(index, 0, inf);
        if (that.arrows) {
            that.setArrows();
            that.setArrowHover();
        }
        that.update();
        return that;
    };

    this.setArrows = function() {
        // sets arrows to handle shifting board
        if (!that.arrows) return;
        if (that.info.length > rows || that.info[0].length > cols) {
            if (!that.arrowUp) {
                that.arrowUp = new Triangle({color: arrowColor}).sca(.4).center(holder);
                if (isometric) {
                    that.arrowUp
                        .rot(45)
                        .mov(tiles.width / 2, tiles.width / 2 - 50);
                } else {
                    that.arrowUp
                        .mov(tiles.width / 2 + 40, -30);
                }
                that.arrowDown = new Triangle({color: arrowColor}).sca(.4).center(holder);
                if (isometric) {
                    that.arrowDown
                        .rot(+45 - 180)
                        .mov(tiles.width / 2 - 50, tiles.width / 2);
                } else {
                    that.arrowDown
                        .rot(-180)
                        .mov(tiles.width / 2 + 10, +30);
                }
                that.arrowUp.on("mousedown", function() {
                    that.moveCamera("up");
                    if (that.stage) that.stage.update();
                });
                that.arrowDown.on("mousedown", function() {
                    that.moveCamera("down");
                    if (that.stage) that.stage.update();
                });
            }
        } else { // may have removed data so no scroll is needed
            if (that.arrowUp) removeRowArrows();
        }
        var colArrows = zim.loop(that.info, function(d) {
            if (d.length > cols) return "yes";
        });
        if (colArrows == "yes") {
            if (!that.arrowLeft) {
                that.arrowLeft = new Triangle({color: arrowColor}).sca(.4).cur().center(holder);
                if (isometric) {
                    that.arrowLeft
                        .rot(+45 - 180 + 90)
                        .mov(-tiles.width / 2, tiles.width / 2 - 50);
                } else {
                    that.arrowLeft
                        .rot(-180 + 90)
                        .mov(-60, tiles.width / 2 + 40);
                }
                that.arrowRight = new Triangle({color: arrowColor}).sca(.4).center(holder);
                that.arrowRight.n = "b";
                if (isometric) {
                    that.arrowRight
                        .rot(45 + 90)
                        .mov(-tiles.width / 2 + 50, tiles.width / 2);
                } else {
                    that.arrowRight
                        .rot(+90)
                        .mov(0, tiles.width / 2 + 10);
                }
                that.arrowLeft.on("mousedown", function() {
                    that.moveCamera("left");
                });
                that.arrowRight.on("mousedown", function() {
                    that.moveCamera("right");
                });
                // FIX bounds so move camera not board
            }
            that.setArrowHover();
        } else {
            if (that.arrowLeft) removeColArrows();
        }
        return that;
    };
    that.setArrows();

    this.removeArrows = function() {
        removeColArrows();
        removeRowArrows();
        return that;
    };
    function removeColArrows() {
        if (!that.arrowLeft || !that.arrowRight) return;
        that.arrowLeft.removeAllEventListeners();
        that.arrowRight.removeAllEventListeners();
        that.arrowLeft.removeFrom();
        that.arrowLeft = null;
        that.arrowRight.removeFrom();
        that.arrowRight = null;
    }
    function removeRowArrows() {
        if (!that.arrowUp || !that.arrowDown) return;
        that.arrowUp.removeAllEventListeners();
        that.arrowDown.removeAllEventListeners();
        that.arrowUp.removeFrom();
        that.arrowUp = null;
        that.arrowDown.removeFrom();
        that.arrowDown = null;
    }

    that.lastTile = null;
    tiles.tap(function(e) {
        that.currentTile = e.target;
    });
    tiles.on("mouseover", function(e) {
        if (that.timeout) that.timeout.clear();
        e.target.lastColor = e.target.getChildAt(0).color;
        e.target.getChildAt(0).color = rollBackgroundColor;
        that.currentTile = e.target;
        if (e.target != that.lastTile) {that.dispatchEvent("change");}
        that.lastTile = e.target;
        if (that.stage) that.stage.update();
    });
    tiles.on("mouseout", outHandler);
    zimDefaultFrame.canvas.addEventListener("mouseleave", outHandler);
    function outHandler(e) {
        that.timeout = zim.timeout(timeType == "seconds" ? .05 : 50, function() {
            that.currentTile = null;
            that.lastTile = null;
            that.dispatchEvent("change");
        });
        if (e.target && e.target.getChildAt) e.target.getChildAt(0).color = e.target.lastColor;
        if (that.lastTile) that.lastTile.getChildAt(0).color = that.lastTile.lastColor;
        if (that.stage) that.stage.update();
    };


    this.getIndexes = function(tile) {
        // gets the row and col for a tile
        var n = tiles.getChildIndex(tile);
        var col = n % cols;
        var row = Math.floor(n / cols);
        return {col: col, row: row};
    };

    this.getInfo = function(a, b) {
        // gets the info object for a tile (or i,j info point)
        if (zot(a)) return;
        if (zot(b)) {
            var indexes = that.getIndexes(a);
            a = indexes.col + startCol;
            b = indexes.row + startRow;
        }
        if (a < 0 || a > that.numCols - 1 || b < 0 || b > that.numRows - 1) return;
        return that.info[b][a];
    };
    this.getData = function(a, b) {
        // gets items from info for a tile (or i,j info point)
        if (zot(a)) return;
        return that.getInfo(a, b).data;
    };
    this.getColor = function(a, b) {
        // gets the color data for a tile (or i,j info point)
        if (zot(a)) return;
        return that.getInfo(a, b).color;
    };
    this.getIcon = function(a, b) {
        // gets the icon for a tile (or i,j info point)
        if (zot(a)) return;
        return that.getInfo(a, b).icon;
    };
    this.getItems = function(a, b) {
        // gets items from info for a tile (or i,j info point)
        if (zot(a)) return;
        var i = that.getInfo(a, b);
        if (i) return that.getInfo(a, b).items;
    };
    this.getAllItems = function(filter) {
        // gets an array of all items - add optional filter
        var items = [];
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);
        zim.loop(that.info, function(rows, j) {
            zim.loop(rows, function(info, i) {
                if (!includeTest(i, j, filter)) return;
                zim.loop(info.items, function(item) {
                    items.push(item);
                });
            });
        });
        return items;
    };
    this.getTilesAround = function(a, b) {
        // gets tiles around a tile (or i,j info point)
        if (zot(a)) return;
        if (zot(b)) {
            var indexes = that.getIndexes(a);
            a = indexes.col + startCol;
            b = indexes.row + startRow;
        }
        if (a < 0 || a > that.numCols - 1 || b < 0 || b > that.numRows - 1) return [];
        return [
            that.getTile(a - 1, b - 1), that.getTile(a - 0, b - 1), that.getTile(a + 1, b - 1),
            that.getTile(a + 1, b - 0), that.getTile(a + 1, b + 1), that.getTile(a - 0, b + 1),
            that.getTile(a - 1, b + 1), that.getTile(a - 1, b - 0)
        ];
    };
    tiles.loop(function(t) {
        if (indicatorType == "circle") {
            t.indicator = new Circle(zik(indicatorSize), zik(indicatorColor), zik(indicatorBorderColor), indicatorBorderWidth).center(t).alp(0);
        } else {
            var size = zik(indicatorSize);
            t.indicator = new zim.Rectangle(size, size, zik(indicatorColor), zik(indicatorBorderColor), indicatorBorderWidth).centerReg(t).alp(0);
        }
        t.mouseChildren = false;
        var i = that.getIndexes(t);
        t.boardCol = i.col;
        t.boardRow = i.row;
        var icon = that.getInfo(t).icon;
        t.icon = icon;
        if (icon) icon.center(t.getChildAt(0));
    });

    this.getTile = function(col, row) {
        // gets tile at visible col and row
        if (col < 0 || row < 0 || col > that.cols - 1 || row > that.rows - 1) return;
        return tiles.getChildAt(row * cols + col);
    };

    this.setData = function(tile, value) {
        // updates a data entry for a tile
        that.getInfo(tile).data = value;
        return that.data;
    };

    this.setColor = function(tile, color, internal) {
        // adds a color to board and info for the color
        tile.lastColor = tile.getChildAt(0).color = color;
        if (zot(internal)) that.getInfo(tile).color = color;
        return that;
    };

    this.setIcon = function(tile, icon, internal) {
        if (zot(icon)) return;
        // adds an icon to board and info for the icon
        if (zot(internal)) that.getInfo(tile).icon = icon;
        if (tile.icon) tile.icon.removeFrom();
        tile.icon = icon;
        icon.center(tile.getChildAt(0));
        return that;
    };

    this.clearInfo = function(filter) {
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);
        // clears info for data, colors and items
        zim.loop(that.info, function(rows, j) {
            zim.loop(rows, function(inf, i) {
                if (!includeTest(i, j, filter)) return;
                inf.data = "x";
                zim.loop(inf.items, function(item) {
                    item.boardCol = null;
                    item.boardRow = null;
                    item.tile = null;
                    item.removeFrom();
                });
                inf.items = [];
                inf.icon = that.icon ? that.icon.clone() : null;
                inf.color = backgroundColor;
                var tile = that.getTile(i - startCol, j - startRow);
                if (tile) {
                    tile.getChildAt(0).color = backgroundColor;
                    if (inf.icon) inf.icon.center(tile.getChildAt(0));
                }
            });
        });
        return that;
    };
    this.clearData = function(filter) {
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);
        // clears data but leaves colors and items
        zim.loop(that.info, function(rows, j) {
            zim.loop(rows, function(info, i) {
                if (!includeTest(i, j, filter)) return;
                info.data = "x";
            });
        });
        return that;
    };
    this.clearItems = function(filter) {
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);
        // clears items but leaves data and colors
        zim.loop(that.info, function(rows, j) {
            zim.loop(rows, function(info, i) {
                if (!includeTest(i, j, filter)) return;
                zim.loop(info.items, function(item) {
                    item.boardCol = null;
                    item.boardRow = null;
                    item.tile = null;
                    item.removeFrom();
                });
                info.items = [];
            });
        });
        return that;
    };
    this.clearColors = function(filter) {
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);
        // clears color but leaves data and items
        zim.loop(that.info, function(rows, j) {
            zim.loop(rows, function(info, i) {
                if (!includeTest(i, j, filter)) return;
                info.color = backgroundColor;
                var tile = that.getTile(i - startCol, j - startRow);
                if (tile) tile.getChildAt(0).color = backgroundColor;
            });
        });
        return that;
    };
    this.clearBoardColors = function() {
        // clears board colors but leaves color info
        zim.loop(tiles, function(tile) {
            tile.getChildAt(0).color = backgroundColor;
        });
        return that;
    };
    this.clearIcons = function(filter) {
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);

        // clears color but leaves data and items
        zim.loop(that.info, function(rows, j) {
            zim.loop(rows, function(info, i) {
                if (!includeTest(i, j, filter)) return;
                if (info.icon) {
                    info.icon.removeFrom();
                    if (info.icon.dispose) info.icon.dispose();
                    info.icon = null;
                }
                info.icon = that.icon ? that.icon.clone() : null;
                var tile = that.getTile(i - startCol, j - startRow);
                if (tile && info.icon) info.icon.center(tile.getChildAt(0));
            });
        });
        return that;
    };
    this.clearBoardIcons = function() {
        // clears board icons but leaves icon info
        zim.loop(tiles, function(tile) {
            if (tile.icon) tile.icon.removeFrom();
            tile.icon = null;
        });
        return that;
    };

    this.getRandomTile = function(filter) {
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);

        // gets random visible tile
        var tile;
        var count = 0;
        while (!tile && count < 10000) {
            var i = zim.rand(0, cols - 1) + startCol;
            var j = zim.rand(0, rows - 1) + startRow;
            if (filter && includeTest(i, j, filter)) tile = that.getTile(i - startCol, j - startRow);
            count++;
        }
        return tile;
    };

    function normalizeFilter(filter) {
        if (filter.constructor != {}.constructor) {
            // assume filtering by data
            filter = {data: !Array.isArray(filter) ? [filter] : filter};
            return filter;
        }
        var types = ["data", "notData", "color", "notColor", "icon", "notIcon", "item", "notItem", "col", "notCol", "row", "notRow"];
        var wrong = ["datas", "notDatas", "colors", "notColors", "icons", "notIcons", "items", "notItems", "cols", "notCols", "rows", "notRows"];
        zim.loop(wrong, function(w, i) {
            if (filter[w]) filter[types[i]] = filter[w];
            delete filter[w];
        });
        zim.loop(types, function(type) {
            if (!zot(filter[type]) && !Array.isArray(filter[type])) filter[type] = [filter[type]];
        });
        return filter;
    }

    function includeTest(i, j, filter) {
        // test for there or not there and if wrong - then return false else return true
        if (!zot(filter.data) && filter.data.indexOf(that.info[j][i].data) == -1) return false;
        if (!zot(filter.notData) && filter.notData.indexOf(that.info[j][i].data) != -1) return false;
        if (!zot(filter.color) && filter.color.indexOf(that.info[j][i].color) == -1) return false;
        if (!zot(filter.notColor) && filter.notColor.indexOf(that.info[j][i].color) != -1) return false;
        if (!zot(filter.icon) && (!that.info[j][i].icon || filter.icon.indexOf(that.info[j][i].icon.type) == -1)) return false;
        if (!zot(filter.notIcon) && (that.info[j][i].icon && filter.notIcon.indexOf(that.info[j][i].icon.type) != -1)) return false;
        
        if (!zot(filter.item) || !zot(filter.notItem)) {
            var itemList = that.getItems(i, j);
            if (!zot(filter.item)) {
                var noMatch = zim.loop(itemList, function(it) {
                    if (filter.item.indexOf(it) != -1) return "yes";
                });
                // making it through the loop returns true and we are supposed to match something
                if (noMatch === true) return false;
            }
            if (!zot(filter.notItem)) {
                var match = zim.loop(itemList, function(it) {
                    if (filter.notItem.indexOf(it) != -1) return "yes";
                });
                // we matched something and we are not supposed to
                if (match == "yes") return false;
            }
        }
        if (!zot(filter.col) && filter.col.indexOf(i - startCol) == -1) return false;
        if (!zot(filter.row) && filter.row.indexOf(j - startRow) == -1) return false;
        if (!zot(filter.notCol) && filter.notCol.indexOf(i - startCol) != -1) return false;
        if (!zot(filter.notRow) && filter.notRow.indexOf(j - startRow) != -1) return false;

        return true;
    }

    this.getPoint = function(a, b) {
        // gets x and y of tile (or i,j) in items coordinates
        if (zot(a)) return;
        if (zot(b)) return tiles.localToLocal(a.x, a.y, that.pieces);
        return tiles.localToLocal((a - startCol) * size + size / 2, (b - startRow) * size + size / 2, that.pieces);
    };

    this.getGlobalPoint = function(a, b) {
        // gets x and y of tile (or i,j) in global coordinates
        if (zot(a)) return;
        if (zot(b)) return tiles.localToGlobal(a.x, a.y);
        return tiles.localToGlobal((a - startCol) * size + size / 2, (b - startRow) * size + size / 2);
    };

    this.pieces = new zim.Container().addTo(this);
    this.pieces.mouseChildren = false;
    this.pieces.mouseEnabled = false;

    this.setDepth = function() {
        var piecesArray = [];
        that.pieces.loop(function(piece) {
            piecesArray.push(piece);
        });
        piecesArray.sort(function(a, b) {return a.y - b.y;});
        loop(piecesArray, function(piece) {
            piece.addTo(that.pieces);
        });
        return that;
    };

    // col and row always refer to visible tile (unless startCol and startRow)
    this.position = function(obj, col, row, internal) {
        // positions object at visible row and col - no animation
        // called by place and when board arrows are used
        if (col < 0 || col > cols - 1 || row < 0 || row > rows - 1) obj.visible = false;
        else {
            if (obj.type == "Emitter") obj.particles.visible = true;
            else obj.visible = true;
        }
        var i = startCol + col;
        var j = startRow + row;
        i = zim.constrain(i, 0, that.numCols);
        j = zim.constrain(j, 0, that.numRows);
        var tile = this.getTile(i - startCol, j - startRow);
        if (!internal) {
            if (obj.boardItems) obj.boardItems.splice(obj.boardItems.indexOf(obj), 1);
            obj.boardItems = that.getItems(i, j);
            if (obj.boardItems) obj.boardItems.push(obj);
        } else {
            obj.boardItems = that.getItems(i, j);
        }

        obj.loc(that.getPoint(i, j), null, that.pieces);
        if (tile) {
            if (isometric) obj.sca(obj.proportion.convert(obj.y) * obj.startScaleX, obj.proportion.convert(obj.y) * obj.startScaleY);
            that.setDepth();
        }
        obj.boardCol = i - startCol;
        obj.boardRow = j - startRow;
        obj.boardTile = tile;
        obj.square = j + "-" + i;

        if (obj.dispatchEvent) obj.dispatchEvent("positioned");
        return this;
    };

    this.add = function(obj, col, row, data, color, icon, internal) {
        // adds object at board col and row (not data but actual visible col and row)
        if (zot(obj)) return this;
        if (zot(col)) col = 1;
        if (zot(row)) row = 1;
        obj.addTo(this.pieces);
        if (!obj.startScaleX) {
            obj.startScaleX = obj.scaleX;
            obj.startScaleY = obj.scaleY;
        }
        if (isometric && zot(obj.proportion)) obj.proportion = new zim.Proportion(-holder.height / 2, holder.height / 2, scaleMin, scaleMax);
        that.position(obj, col, row, internal);
        var tile = that.getTile(col, row);
        if (!zot(data)) that.setData(tile, data);
        if (!zot(color)) that.setColor(tile, color);
        
        if (!zot(icon)) that.setIcon(tile, icon);
        if (isometric && !obj.boardEvent) {
            obj.boardEvent = obj.on("animation", function() {
                if (obj.visible) obj.sca(obj.proportion.convert(obj.y) * obj.startScaleX, obj.proportion.convert(obj.y) * obj.startScaleY);
                if (obj.dispatchEvent) obj.dispatchEvent("moving");
            });
        }
        return this;
    };
    this.remove = function(obj) {
        // removes item from board and clears it from info
        if (obj.type == "Emitter") obj.particles.visible = true;
        else obj.visible = true; // so don't confuse coder if obj used elsewhere
        obj.removeFrom();
        if (obj.boardKeyType) that.removeKeys(obj.boardKeyType);
        if (obj.boardItems) obj.boardItems.splice(obj.boardItems.indexOf(obj), 1);
        return this;
    };

    that.update();

    this.moveTo = function(obj, col, row, time, type) {
        this.move(obj, col - obj.boardCol, row - obj.boardRow, time, type);
        return that;
    };
    this.move = function(obj, col, row, time, type) {
        // animates or places object a certain number of rows or cols
        // used by keyboard or called by app
        if (zot(col)) col = 0;
        if (zot(row)) row = 0;
        if (zot(time)) time = timeType == "seconds" ? .5 : 500;
        obj.visible = true;
        var newCol = zim.constrain(obj.boardCol + col, 0, cols - 1);
        var newRow = zim.constrain(obj.boardRow + row, 0, rows - 1);
        if (that["keyFilter" + type] && !includeTest(newCol + startCol, newRow + startRow, that["keyFilter" + type])) return;
        if (that.path) that.clearPath();
        var total = Math.abs(newCol - obj.boardCol) + Math.abs(newRow - obj.boardRow);
        var newLoc = this.getPoint(this.getTile(newCol, newRow));
        if (obj.boardCol != newCol || obj.boardRow != newRow) {
            obj.nextCol = newCol;
            obj.nextRow = newRow;
            var eve = new createjs.Event("movingstart");
            if (obj.boardCol > newCol) eve.dir = "left";
            else if (obj.boardCol < newCol) eve.dir = "right";
            else if (obj.boardRow > newRow) eve.dir = "up";
            else if (obj.boardRow < newRow) eve.dir = "down";
            if (obj.dispatchEvent && obj.dispatchEvent) obj.dispatchEvent(eve);
            obj.animate({
                props: {x: newLoc.x, y: newLoc.y},
                time: time * total,
                protect: true,
                call: function() {
                    if (that.buffer && that.buffer > 0) {
                        var left = (obj.boardCol > newCol && obj.boardCol <= that.buffer);
                        var right = (obj.boardCol < newCol && cols - obj.boardCol - 1 <= that.buffer);
                        var up = (obj.boardRow > newRow && obj.boardRow <= that.buffer);
                        var down = (obj.boardRow < newRow && rows - obj.boardRow - 1 <= that.buffer);
                    }
                    that.position(obj, newCol, newRow);
                    if (that.buffer && that.buffer > 0) {
                        if (left) that.moveCamera("left");
                        if (right) that.moveCamera("right");
                        if (up) that.moveCamera("up");
                        if (down) that.moveCamera("down");
                    }
                    that["keyCheck" + type] = true;
                    if (obj.dispatchEvent) obj.dispatchEvent("moved");
                    if (obj.dispatchEvent) obj.dispatchEvent("movingdone");
                },
                events: true
            });
        }
        return that;
    };
    this.addKeys = function(obj, type, filter) {
        // adds either arrows or wasd keys to move provided object
        if (zot(type)) type = "arrows";
        if (type != "arrows") type = "wasd";
        var moveCheck = true;
        zimDefaultFrame.off("keydown", that["keydown" + type]);
        zimDefaultFrame.off("keyup", that["keyup" + type]);
        that["keyCheck" + type] = true;
        that["keyOjbect" + type] = obj;
        if (zot(filter)) filter = {};
        else filter = normalizeFilter(filter);
        if (!zot(filter)) that["keyFilter" + type] = filter;
        obj.boardKeyType = type;
        that["keydown" + type] = zimDefaultFrame.on("keydown", function(e) {
            if (obj.moving) return;
            if (!that["keyCheck" + type]) return;
            if (e.keyCode == (type == "arrows" ? 37 : 65)) { // left
                that.move(obj, -1, 0, null, type);
            } else if (e.keyCode == (type == "arrows" ? 39 : 68)) {
                that.move(obj, 1, 0, null, type);
            } else if (e.keyCode == (type == "arrows" ? 38 : 87)) { // up
                that.move(obj, 0, -1, null, type);
            } else if (e.keyCode == (type == "arrows" ? 40 : 83)) {
                that.move(obj, 0, 1, null, type);
            }
            that["keyCheck" + type] = false;
        });
        that["keyup" + type] = zimDefaultFrame.on("keyup", function() {
            that["keyCheck" + type] = true;
        });
        return that;
    };
    this.removeKeys = function(type) {
        // removes either arrows or wasd keys
        if (zot(type)) type = "arrows";
        if (type != "arrows") type = "wasd";
        that["keyOjbect" + type].boardKeyType = null;
        that["keyOjbect" + type] = null;
        that["keyFilter" + type] = null;
        zimDefaultFrame.off("keydown", that["keydown" + type]);
        zimDefaultFrame.off("keyup", that["keyup" + type]);
        return that;
    };
    this.showPath = function(path, time) {
        // shows path indicators for a path [{x:col, y:row}, {etc.}, {etc.}]
        if (zot(time)) time = 0;
        that.clearPath();
        var easy = (path && path[0] && !zot(path[0].x));
        zim.loop(path, function(p, i) {
            var t = that.getTile(easy ? p.x : p[0], easy ? p.y : p[1]);
            if (!t) return;
            if (time == 0) that.getTile(easy ? p.x : p[0], easy ? p.y : p[1]).indicator.alp(1);
            else that.getTile(easy ? p.x : p[0], easy ? p.y : p[1]).indicator.animate({
                props: {alpha: 1},
                time: time,
                wait: i * time / 10,
            });
        });
        that.path = path;
        if (that.stage) that.stage.update();
        return that;
    };
    this.clearPath = function() {
        // hides path indicators
        that.path = null;
        that.tiles.loop(function(tile) {
            tile.indicator.alp(0);
        });
        if (that.stage) that.stage.update();
        return that;
    };
    this.followPath = function(obj, path, time, animation, buffer) {
        // animates object along a provided path [{x:col, y:row}, {etc.}, {etc.}]
        if (zot(path) || path.length == 0) {obj.moving = false; return; }
        obj.boardPath = zim.copy(path);
        if (zot(time)) time = timeType == "seconds" ? .6 : 600;
        if (zot(animation) || animate === true) animation = timeType == "seconds" ? .3 : 300;
        if (zot(buffer)) buffer = 0;
        obj.moving = true;
        that.moveObject = obj;
        obj.boardIntervalObj = zim.interval(time, function(o) {
            var d = obj.boardPath[o.count];
            // BREAK
            var tile = that.getTile(d.x, d.y);
            if (tile == obj.boardTile) return;
            var newCol;
            var newRow;
            if (tile) {
                var location = that.getPoint(that.getTile(d.x, d.y));
                var newCol = tile.boardCol;
                var newRow = tile.boardRow;
            }
            if (animation && tile) {
                var eve = new createjs.Event("movingstart");
                if (obj.boardCol > newCol) eve.dir = "left";
                else if (obj.boardCol < newCol) eve.dir = "right";
                else if (obj.boardRow > newRow) eve.dir = "up";
                else if (obj.boardRow < newRow) eve.dir = "down";
                if (obj.dispatchEvent && obj.dispatchEvent) obj.dispatchEvent(eve);
                obj.animate({
                    props: {x: location.x, y: location.y},
                    time: animation,
                    call: function() {
                        if (tile && buffer && buffer > 0) {
                            var left = (obj.boardCol > newCol && obj.boardCol <= buffer);
                            var right = (obj.boardCol < newCol && cols - obj.boardCol - 1 <= buffer);
                            var up = (obj.boardRow > newRow && obj.boardRow <= buffer);
                            var down = (obj.boardRow < newRow && rows - obj.boardRow - 1 <= buffer);
                        }
                        that.position(obj, d.x, d.y);
                        if (tile && buffer && buffer > 0) {
                            if (left) that.moveCamera("left");
                            if (right) that.moveCamera("right");
                            if (up) that.moveCamera("up");
                            if (down) that.moveCamera("down");
                        }
                        if (obj.dispatchEvent && obj.dispatchEvent) obj.dispatchEvent("moved");
                        if (!o.total) {
                            obj.moving = false;
                            obj.boardLastPath = obj.boardPath;
                            obj.boardPath = null;
                            that.clearPath();
                            setTimeout(function() {
                                if (!obj.moving && obj.dispatchEvent && obj.dispatchEvent) obj.dispatchEvent("movingdone");
                            }, 500);
                        }
                    },
                    events: true
                });
            } else {
                // BREAK - seems to take off but not add back on?
                that.position(obj, d.x, d.y);
                if (o.count == o.total - 1) {
                    obj.moving = false;
                    obj.boardLastPath = obj.boardPath;
                    obj.boardPath = null;
                    that.clearPath();
                    if (obj.dispatchEvent) obj.dispatchEvent("movingdone");
                }
                if (that.stage) that.stage.update();
            }
        }, path.length, true);
        return that;
    };
    this.stopFollowPath = function(obj) {
        // stops a path from next steps
        obj.moving = false;
        obj.boardIntervalObj.clear();
        return that;
    };
    this.shiftPath = function(lastStartX, startX, lastStartY, startY, obj) {
        if (obj) {
            if (!obj.boardPath) return;
            applyShift(-startX + lastStartX, -startY + lastStartY, obj);
        } else {
            that.pieces.loop(function(obj) {
                if (!obj.boardPath) return;
                applyShift(-startX + lastStartX, -startY + lastStartY, obj);
            });
        }
        return that;
    };
    function applyShift(difX, difY, obj) {
        zim.loop(obj.boardPath, function(step) {
            if (difX) step.x = step.x + difX;
            if (difY) step.y = step.y + difY;
        });
        that.showPath(obj.boardPath);
        return that;
    }
    this.record = function() {
        if (typeof ZIMON == 'undefined') return;
        if (!that.pane) {
            var pane = that.pane = new zim.Pane({
                container: that.stage,
                width: Math.min(500, that.stage.width - 20),
                height: Math.min(500, that.stage.height - 20),
                draggable: true,
            });
            var textArea = that.textArea = new zim.TextArea(Math.min(400, that.stage.width - 70), Math.min(400, that.stage.height - 70));
            textArea.tag.style.overflow = "auto";
            textArea.centerReg(pane);
        }
        that.textArea.text = "'" + ZIMON.stringify(that.info) + "'";
        that.pane.show();
        return that.textArea.text;
    };
};
zim.extend(zim.Board, zim.Container);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Person = function(shirt, pants, head, outline, player, cache) {
    var sig = "shirt, pants, head, outline, player, cache";
    var duo; if (duo = zob(zim.Person, arguments, sig, this)) return duo;
    this.arguments = arguments;

    var colors = zim.shuffle([zim.pink, zim.blue, zim.yellow, zim.green, zim.tin, zim.light, zim.purple, zim.orange]);
    var heads = zim.shuffle([zim.brown, "peru", "saddlebrown", "sandybrown", "wheat", "bisque", "rosybrown", "tan"])
    if (zot(shirt)) shirt = colors[0];
    if (zot(pants)) pants = colors[1];
    if (zot(head)) head = heads[0];
    if (zot(outline)) outline = "#333";
    if (zot(player)) player = false;
    if (zot(cache)) cache = false;
    shirt = zik(shirt);
    pants = zik(pants);
    head = zik(head);
    this.super_constructor();
    this.type = player?"Me":"Person";
    var feet = new zim.Circle(12, pants).sca(1,.5).addTo(this);
    this.centerReg(null,null,false).mov(0,80-25/.707); // 45 degee shadow
    var myBot = new zim.Rectangle(24,18,pants).loc(-12,-18,this);
    var myBelt = new zim.Circle(12, shirt, "rgba(0,0,0,.3)",2).sca(1,.5).loc(0,-18,this);
    var myTop = new zim.Rectangle(24,10,shirt).loc(-12,-28,this);
    var myNeck = new zim.Circle(12, shirt).sca(1,.5).loc(0,-28,this);
    var myHead = new zim.Circle(12, head, outline).loc(0,-40,this);
    if (cache) this.cache(-this.width/2-2,-this.height,this.width+4,this.height+10);
}
zim.extend(zim.Person, zim.Container);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Orb = function(radius, color, color2, accentColor, accentColor2, flat, alpha, time, delay) {
    var sig = "radius, color, color2, accentColor, accentColor2, flat, alpha, time, delay";
    var duo; if (duo = zob(zim.Orb, arguments, sig, this)) return duo;
    this.arguments = arguments;

    this.super_constructor();
    this.type = "Orb";
    if (zot(flat)) flat = true;
    if (zot(radius)) radius = flat ? 16 : 22;
    if (zot(color)) color = flat ? zim.blue : zim.purple;
    if (zot(color2)) color2 = flat ? zim.darker : null;
    if (zot(accentColor)) accentColor = flat ? null : zim.pink;
    if (zot(accentColor2)) accentColor2 = flat ? null : null;
    if (zot(alpha)) alpha = .5;
    var timeType = typeof TIME == "undefined" ? "seconds" : TIME;
    if (zot(time)) time = timeType == "seconds" ? 1 : 1000;
    if (zot(delay)) delay = timeType == "seconds" ? 1 : 1000;
    radius = zik(radius);
    color = zik(color);
    color2 = zik(color2);
    accentColor = zik(accentColor);
    accentColor2 = zik(accentColor2);

    var that = this;

    if (flat) {
        that.circle = new zim.Circle(radius, color, accentColor)
            .alp(.9)
            .sca(1, 1)
            .addTo(this)
            .animate({obj: {alpha: alpha}, time: time, loop: true, rewind: true});
        that.circle2 = new zim.Circle(7, color2, accentColor2).sca(1, 1).addTo(this);
        this.centerReg(null, null, false).reg(0, 2);
    } else {
        var circle = that.circle = new zim.Circle(radius).reg(null, 14 / 22 * radius).addTo(this);
        circle.colorCommand.radialGradient([color, accentColor], [0, .8], 0, 0, 22, 8, -8, 0);
        circle.cache();
        if (color2) {
            var circle2 = that.circle2 = new zim.Circle(radius * 1.3).reg(null, 14 / 22 * radius).addTo(this).alp(0);
            circle2.colorCommand.radialGradient([color2, accentColor2], [0, .8], 0, 0, 22, 8, -8, 0);
            circle2.cache();
            circle2.cache().animate({
                props: {alpha: alpha},
                wait: delay,
                loop: true,
                rewind: true,
                loopWait: delay,
                time: time
            });
        }
    }

    Object.defineProperty(this, 'color', {
        get: function() {
            return color;
        },
        set: function(value) {
            color = zik(value);
            that.circle.color = color;
        }
    });

    Object.defineProperty(this, 'color2', {
        get: function() {
            return color2;
        },
        set: function(value) {
            color2 = zik(value);
            that.circle2.color = color2;
        }
    });

};
zim.extend(zim.Orb, zim.Container);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Tree = function(cache) {
    var sig = "cache";
    var duo; if (duo = zob(zim.Tree, arguments, sig, this)) return duo;
    this.arguments = arguments;
    if (zot(cache)) cache = true;

    this.super_constructor();
    this.type = "Tree";
    var roots = new zim.Circle(10, zim.brown).sca(1,.5).addTo(this);
    this.centerReg(null,null,false);
    var trunk = new zim.Rectangle(20,50,zim.brown).loc(-10,-50,this);
    var leaves1 = new zim.Circle(zim.rand(35,45), zim.green).sca(1,.65).loc(0,-50,this);
    var leaves2 = new zim.Circle(zim.rand(20,30), zim.green).sca(1,1).loc(-5,-70,this);
    var leaves3 = new zim.Circle(zim.rand(15,20), zim.green).sca(1,1).loc(12,-72,this);
    if (cache) this.cache();
}
zim.extend(zim.Tree, zim.Container);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Timer = function(time, step, colon, down, isometric, startPaused, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, bold, italic, variant, width, height, decimals) {
    var sig = "time, step, colon, down, isometric, startPaused, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, bold, italic, variant, width, height, decimals";
    var duo; if (duo = zob(zim.Timer, arguments, sig, this)) return duo;
    this.arguments = arguments;

    if (zot(time)) time = 60;
    if (zot(step)) step = 1000;
    if (zot(colon)) colon = false;
    if (zot(down)) down = true;
    if (zot(color)) color = zim.black;
    if (zot(backgroundColor)) backgroundColor = zim.yellow;
    if (zot(width)) width = 150;
    if (zot(height)) height = 60;
    if (zot(align)) align = "center";
    if (zot(valign)) valign = "center";
    if (zot(borderColor)) borderColor = null;
    if (zot(borderWidth)) borderWidth = null;
    if (borderColor < 0 || borderWidth < 0) borderColor = borderWidth = null;
    else if (borderColor!=null && borderWidth==null) borderWidth = 1;
    this.zimLabel_constructor(colon?zim.decimals(time/60,2,2,1,null,true):time, size, font, color, null, null, null, align, valign, null, null, bold, italic, variant, new zim.Rectangle(width, height, backgroundColor, borderColor, borderWidth).centerReg({add:false}));
    this.type = "Timer";
    var that = this;
    that.totalTime = time;
    // if (isometric == "right") that.reg(that.getBounds().width);
    Object.defineProperty(this, 'isometric', {
        get: function() {
            return isometric;
        },
        set: function(value) {
            isometric = value;
            if (isometric) {
                if (isometric == true) isometric = "left";
                if (isometric == "left") {
                    that.ske(0,-26.5);
                } else {
                    that.ske(0,26.5);
                }
            } else {
                that.ske(0,0);
            }
        }
    });
    var paused = startPaused;
    Object.defineProperty(this, 'paused', {
        get: function() {
            return paused;
        },
        set: function(value) {
            if (value==paused) return;
            that.pause(value);
        }
    });
    this.isometric = isometric;
    Object.defineProperty(this, 'time', {
        get: function() {
            return time;
        },
        set: function(value) {
            time = value;
            if (colon) that.text = zim.decimals(time/60,2,2,1,null,true);
            else that.text = zim.decimals(value, zot(decimals)?1:decimals, step%1000==0?0:zot(decimals)?1:decimals, null, false);
        }
    });
    this.start = function(t) {
        if (!zot(t)) that.time = t;
        paused = false;
        clearInterval(that.intervalID);
        that.intervalID = setInterval(function () {
            that.time += down?-step/1000:step/1000;
            if (down && that.time <= 0) {
                that.time = 0;
                clearInterval(that.intervalID);
            }
            if (colon) that.text = zim.decimals(that.time/60,2,2,1,null,true);
            else that.text = zim.decimals(that.time, zot(decimals)?1:decimals, step%1000==0?0:zot(decimals)?1:decimals, null, false);
            that.dispatchEvent("step");
            if (down && that.time <= 0) that.dispatchEvent("complete");
            if (that.stage) that.stage.update();
        }, step);
        return that;
    }
    if (!startPaused) this.start();

    this.pause = function(state) {
        if (zot(state)) state = true;
        if (state) {
            clearInterval(that.intervalID);
            paused = true;
        } else {
            that.start(that.time);
        }
        return that;
    }

    this.stop = function() {
        clearInterval(that.intervalID);
        paused = null;
        return that;
    }

    this.dispose = function(a,b,disposing) {
        if (that.intervalID) clearInterval(that.intervalID);
        if (!disposing) this.zimLabel_dispose(true); 
    }        

}
zim.extend(zim.Timer, zim.Label, ["dispose"], "zimLabel", false);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

zim.Scorer = function(score, isometric, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, bold, italic, variant, width, height) {
    var sig = "score, isometric, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, bold, italic, variant, width, height";
    var duo; if (duo = zob(zim.Scorer, arguments, sig, this)) return duo;
    this.arguments = arguments;

    if (zot(score)) score = 0;
    if (zot(color)) color = zim.black;
    if (zot(backgroundColor)) backgroundColor = zim.green;
    if (zot(width)) width = 150;
    if (zot(height)) height = 60;
    if (zot(align)) align = "center";
    if (zot(valign)) valign = "center";
    if (zot(borderColor)) borderColor = null;
    if (zot(borderWidth)) borderWidth = null;
    if (borderColor < 0 || borderWidth < 0) borderColor = borderWidth = null;
    else if (borderColor!=null && borderWidth==null) borderWidth = 1;
    this.super_constructor(score, size, font, color, null, null, null, align, valign, null, null, bold, italic, variant, new zim.Rectangle(width, height, backgroundColor, borderColor, borderWidth).centerReg({add:false}));
    this.type = "Scorer";
    var that = this;
    // if (isometric == "right" || isometric == true) that.reg(that.getBounds().width);
    Object.defineProperty(this, 'isometric', {
        get: function() {
            return isometric;
        },
        set: function(value) {
            isometric = value;
            if (isometric == true) isometric = "right";
            if (isometric) {
                if (isometric == "left") {
                    that.ske(0,-26.5);
                } else {
                    that.ske(0,26.5);
                }
            } else {
                that.ske(0,0);
            }
        }
    });
    this.isometric = isometric;
    Object.defineProperty(this, 'score', {
        get: function() {
            return score;
        },
        set: function(value) {
            that.text = score = value;
            if (that.stage) that.stage.update();
        }
    });
}
zim.extend(zim.Scorer, zim.Label);
        
zim.Dialog = function(width, height, words, dialogType, tailType, fill, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, corner, shadowColor, shadowBlur, padding, paddingH, paddingV, shiftH, shiftV, slantLeft, slantRight, slantTop, slantBottom, tailH, tailV, tailShiftH, tailShiftV, tailShiftAngle, arrows, arrowsInside, arrowsFlip, selectedIndex) {
    var sig = "width, height, words, dialogType, tailType, fill, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, corner, shadowColor, shadowBlur, padding, paddingH, paddingV, shiftH, shiftV, slantLeft, slantRight, slantTop, slantBottom, tailH, tailV, tailShiftH, tailShiftV, tailShiftAngle, arrows, arrowsInside, arrowsFlip, selectedIndex";
    var duo; if (duo = zob(Dialog, arguments, sig, this)) return duo;
            
    if (zot(width)) width = 300;
    if (zot(height)) height = 200;      
    if (zot(dialogType)) dialogType = "slant";           
    if (zot(tailType)) tailType = "triangle";
    if (tailType == false) tailType = "none";
    if (tailType!="circles"&&tailType!="line"&&tailType!="none") tailType="triangle";        
    if (zot(tailH)) tailH = "left";
    if (zot(tailV)) tailV = "bottom";
    if (zot(tailShiftH)) tailShiftH = 0;
    if (zot(tailShiftV)) tailShiftV = 0;
    if (zot(tailShiftAngle)) tailShiftAngle = 0;
    if (zot(slantLeft)) slantLeft = -10;
    if (zot(slantRight)) slantRight = 10;
    if (zot(slantTop)) slantTop = -10;
    if (zot(slantBottom)) slantBottom = 10;          
    if (zot(fill)) fill = tailType!="none"; 
    if (zot(size)) size = 40; 
    if (zot(words)) words = ["Hello!"];
    if (!Array.isArray(words)) words = [words];                
    if (zot(corner)) corner = 0;
    if (zot(shadowColor)) shadowColor = "rgba(0,0,0,.3)";
    if (zot(shadowBlur)) shadowBlur = 10;
    if (zot(padding)) padding = 20;
    if (zot(paddingV)) paddingV = padding;
    if (zot(paddingH)) paddingH = padding;
    if (zot(font)) font = "verdana";
    if (zot(color)) color = zim.dark;
    if (zot(backgroundColor)) backgroundColor = zim.lighter;
    if (zot(borderColor)) borderColor = zim.dark;
    if (zot(borderWidth)) borderWidth = 3;
    if (borderColor==-1) borderWidth = 0;   
    if (zot(align)) align = "center";    
    if (zot(valign)) valign = "center";    
    if (zot(arrows)) arrows = true;
    if (zot(arrowsInside)) arrowsInside = false;
    if (zot(arrowsFlip)) arrowsFlip = false;
    if (zot(selectedIndex)) selectedIndex = 0;
    
    var that = this;
    that.words = words;       
    
    function makeSlant(width, height, backgroundColor) {
        var b = new zim.Shape(width, height);                          
        var adjustX = [slantLeft,slantRight,-slantRight,-slantLeft];
        var adjustY = [-slantTop,slantTop,slantBottom,-slantBottom];
        b.colorCommand = b.f(backgroundColor).command;
        b.mt(0+adjustX[0],0+adjustY[0]).lt(width+adjustX[1],0+adjustY[1]).lt(width+adjustX[2],height+adjustY[2]).lt(0+adjustX[3],height+adjustY[3]).cp();
        return b;
    }
    
    that.zimContainer_constructor(width,height);
    var bc = that.backingContainer = new zim.Container(width, height).addTo(that);
    if (dialogType == "slant") {
        this.backing = makeSlant(width, height, backgroundColor)
            .addTo(bc);  
    } else if (dialogType == "rectangle") {
        this.backing = new zim.Rectangle(width, height, backgroundColor, null, null, corner)
            .addTo(bc);
    } else if (dialogType == "poly") {
        this.backing = new zim.Poly(Math.max(width,height)/2, 12, .4, backgroundColor, null, null)
            .sca(1.3)
            .center(bc);
    } else {
        this.backing = new zim.Circle(200, backgroundColor, null, null, null, null, null, {ignoreScale:true})
            .siz(width, height)
            .center(bc);
    }       
    
    that.prev = function() {
        if (selectedIndex==0) return;
        that.selectedIndex--;  
        that.dispatchEvent("change"); 
        return that;         
    }
    that.next = function() {
        if (selectedIndex==words.length-1) return;
        that.selectedIndex++;  
        that.dispatchEvent("change");
        return that;
    }
    function makeArrows() {
        if (arrows && that.words.length > 1 && !that.arrows) {
            that.arrows = new Container(width, height).centerReg(that);
            that.arrowNext = new zim.Arrow(borderWidth>0?borderColor:backgroundColor, borderWidth>0?borderColor.lighten(.2):backgroundColor.lighten(.2)).sca(.8).pos(arrowsInside?25:-40,(dialogType=="oval"||dialogType=="poly")?0:20,RIGHT,(dialogType=="oval"||dialogType=="poly")?CENTER:arrowsFlip?TOP:BOTTOM,that.arrows).expand();
            that.arrowPrev = new zim.Arrow(borderWidth>0?borderColor:backgroundColor, borderWidth>0?borderColor.lighten(.2):backgroundColor.lighten(.2)).rot(180).sca(.8).pos(arrowsInside?25:-40,(dialogType=="oval"||dialogType=="poly")?0:20,LEFT,(dialogType=="oval"||dialogType=="poly")?CENTER:arrowsFlip?TOP:BOTTOM,that.arrows).expand();
            setArrows();
            if (arrowsFlip) that.arrows.rot(180);
            that.arrowNEvent = that.arrowNext.on("mousedown", that.next);      
            that.arrowPEvent = that.arrowPrev.on("mousedown", that.prev);            
        }    
        return that;  
    }
    makeArrows();     
    
    that.setWords = function(w, index) {
        if (zot(index)) selectedIndex = 0;
        that.labels = [];
        if (!Array.isArray(w)) w = [w];
        that.words = words = w;
        zim.loop(words, function(word,i) {
            that.labels[i]=new zim.Label({
                text:word,
                labelWidth:Math.max(10, width-paddingH*2),
                labelHeight:fill?Math.max(10,(height-paddingV*2)):null,
                color:color,
                font:font,
                size:size,
                align:align,
                valign:valign
            });
        });
        if (selectedIndex > that.labels.length-1) selectedIndex = that.labels.length-1;
        if (that.label) that.label.removeFrom();
        that.label = that.labels[selectedIndex].pos(align!="center"?paddingH:0,valign!="center"?paddingV:0,align,valign,that);
        makeArrows();
        if (that.arrowNext) setArrows();            
        if (that.stage) that.stage.update()
        return that;
    }
    that.setWords(words, selectedIndex);        

    if (valign == "top") this.label.pos(null, paddingV, null, "top");
    else if (valign == "bottom") this.label.pos(null, paddingV, null, "bottom");
    if (shiftH) this.label.mov(shiftH);
    if (shiftV) this.label.mov(null, shiftV);
    
    if (tailType == "triangle") {            
        that.tail = new zim.Triangle(200,200,90,backgroundColor,borderColor,borderWidth);                
    } else if (tailType == "line") {
        that.tail = new zim.Line(100,borderWidth>0?borderWidth:5,borderWidth>0?borderColor:backgroundColor);
    } else if (tailType == "circles") {
        that.tail = new zim.Container(90, 50);
        new zim.Circle(25, backgroundColor, borderColor, borderWidth).pos(0,0,"left","center",that.tail);
        new zim.Circle(15, backgroundColor, borderColor, borderWidth).pos(0,0,"right","center",that.tail);
    }    
    if (tailH == "center" && tailV == "center") tailType = "none"; 
    var tp = {
        triangle:{
            leftbottom:[5,-120,120],
            lefttop:[-50,-80,-145],
            rightbottom:[-50,-90,35],
            righttop:[-10,-130,-55],
            
            centertop:[-16,-70,-104],
            centerbottom:[16,-70,76],
            leftcenter:[-70,23,167],
            rightcenter:[-70,-18,-13]
        },
        line:{
            leftbottom:[5,-58,130],
            lefttop:[-40,-60,-140],
            rightbottom:[5,-70,45],
            righttop:[-10,-70,-45],
            
            centertop:[0,-70,90],
            centerbottom:[0,-70,90],
            leftcenter:[-70,0,0],
            rightcenter:[-70,0,0]
        },
        circles:{
            leftbottom:[5,-58,130],
            lefttop:[-10,-60,-140],
            rightbottom:[5,-70,45],
            righttop:[-10,-70,-45],
            
            centertop:[0,-70,-90],
            centerbottom:[0,-70,90],
            leftcenter:[-70,0,180],
            rightcenter:[-70,0,0]
        }
    }
    if (tailType != "none") {
        var td = tp[tailType][tailH+tailV]; 
        that.tail
            .rot(td[2])
            .pos(td[0],td[1],tailH,tailV,bc,0)
            .mov(tailShiftH, tailShiftV).rot(that.tail.rotation+tailShiftAngle);
    }
    
    if (borderWidth > 0 || (borderColor && borderColor != -1)) {
        if (dialogType == "slant") {
            that.backingBorder = makeSlant(width+borderWidth*2, height+borderWidth*2, borderColor)
                .addTo(bc,0).mov(-borderWidth, -borderWidth);  
        } else {
            that.backingBorder = this.backing.clone().addTo(bc,0).mov(-borderWidth, -borderWidth)
                .siz(this.backing.width+borderWidth*2, this.backing.height+borderWidth*2)
            if (dialogType=="poly") that.backingBorder.sca(1.3+borderWidth/50);
            that.backingBorder.center(bc,0);
            that.backingBorder.color = borderColor;
        }
    }
            
    if (shadowColor && shadowColor != -1) {
        that.underBacking = new zim.Container(width,height).addTo(bc,0);
        var clone = that.backing.clone().addTo(that.underBacking);
        clone.borderColor = zim.clear;
        if (that.tail) {
            var bt = that.tail.clone().addTo(that.underBacking);
            bt.borderColor = zim.clear;
        }
        that.underBacking.cache(-1000,-1000,2000,2000).sha(shadowColor, 10, 10, shadowBlur);
    }
    
    function setArrows() {
        if (!that.arrowPrev) return;
        if (words.length==0) {
            that.arrowPrev.vis(false);
            that.arrowNext.vis(false);
        }
        if (selectedIndex==0) that.arrowPrev.vis(false) 
        else that.arrowPrev.vis(true);
        if (selectedIndex==words.length-1) that.arrowNext.vis(false);
        else that.arrowNext.vis(true);
    }
    
    bc.resetBounds(null,null,null,null,borderWidth+10+(shadowColor!=-1 && shadowBlur!=-1?50:0));
    
    Object.defineProperty(this, 'selectedIndex', {
        get: function() {
            return selectedIndex;
        },
        set: function(value) {
            that.label.removeFrom();
            selectedIndex = constrain(Math.floor(value), 0, words.length-1);
            that.label=that.labels[selectedIndex].pos(align!="center"?paddingH:0,valign!="center"?paddingV:0,align,valign,that);
            setArrows();
            if (that.stage) that.stage.update();
        }
    });
    
    Object.defineProperty(this, 'length', {
        get: function() {
            return words.length;
        },
        set: function(value) {
            
        }
    });
    
    Object.defineProperty(this, 'color', {
        get: function() {
            return color;
        },
        set: function(value) {
            color = value;
            zim.loop(that.labels, function (label) {
                label.color = value;
            });
        }
    });
    
    Object.defineProperty(this, 'backgroundColor', {
        get: function() {
            return backgroundColor;
        },
        set: function(value) {                
            backgroundColor = value;
            if (dialogType=="slant") that.backing.colorCommand.style = value;
            else that.backing.color = value;
            if (tailType == "triangle" || tailType == "line") { 
                that.tail.color = value;  
            } else if (tailType == "circles") {
                that.tail.loop(function (tail) {
                    tail.color = value;
                });                    
            }    
        }
    });
    
    Object.defineProperty(this, 'borderColor', {
        get: function() {
            return borderColor;
        },
        set: function(value) {
            if (!that.backingBorder) return; // must start with border
            borderColor = value;
            if (dialogType=="slant" && that.backingBorder) that.backingBorder.colorCommand.style = value;
            else that.backing.borderColor = value;
            if (tailType == "triangle" || tailType == "line") { 
                that.tail.borderColor = value;  
            } else if (tailType == "circles") {
                that.tail.loop(function (tail) {
                    tail.borderColor = value;
                });                    
            }    
        }
    });
    
    this.clone = function() {
        return that.cloneProps(new zim.Dialog(width, height, that.words, dialogType, tailType, fill, size, font, color, backgroundColor, borderColor, borderWidth, align, valign, corner, shadowColor, shadowBlur, padding, paddingH, paddingV, shiftH, shiftV, slantLeft, slantRight, slantTop, slantBottom, tailH, tailV, tailShiftH, tailShiftV, tailShiftAngle, arrows, arrowsInside, arrowsFlip, selectedIndex));
    };
    this.dispose = function(a,b,disposing) {
        if (that.arrowNEvent) {
            that.arrowNext.off("mousedown", that.arrowNEvent);      
            that.arrowPrev.off("mousedown", that.arrowPEvent);  
        }
        if (!disposing) this.zimContainer_dispose(true); 
    }        
}    
zim.extend(zim.Dialog, zim.Container, ["clone","dispose"], "zimContainer", false);


if (!WW.zns) {
    WW.LeaderBoard = zim.LeaderBoard;
    WW.Meter = zim.Meter;
    WW.Board = zim.Board;
    WW.Person = zim.Person;
    WW.Orb = zim.Orb;
    WW.Tree = zim.Tree;
    WW.Timer = zim.Timer;
    WW.Scorer = zim.Scorer;
    WW.Dialog = zim.Dialog;
}

export const LeaderBoard = zim.LeaderBoard;
export const Meter = zim.Meter;
export const Board = zim.Board;
export const Person = zim.Person;
export const Orb = zim.Orb;
export const Tree = zim.Tree;
export const Timer = zim.Timer;
export const Scorer = zim.Scorer;
export const Dialog = zim.Dialog;
