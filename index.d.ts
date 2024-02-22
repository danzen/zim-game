
import {Container, Rectangle, Container, Label, Stage, DisplayObject, Point, Tile, Shape, Arrow} from "zimjs"

declare namespace zim {

    export class LeaderBoard extends Container {
        constructor(config_or_data?:string|[{player:string, score:number}], title?:string, width?:number, height?:number, corner?:number, backgroundColor?:string, titleColor?:string, colors?:{
            rankColor?:string,
            rankBackgroundColor?:string,
            currentRankColor?:string,
            currentRankBackgroundColor?:string,      
            nameColor?:string,
            nameBackgroundColor?:string,
            currentNameColor?:string,
            currentNameBackgroundColor?:string,      
            scoreColor?:string,
            scoreBackgroundColor?:string,
            currentScoreColor?:string,
            currentScoreBackgroundColor?:string}, total?:number, scoreWidth?:number, scorePlaces?:number, scoreZeros?:boolean, spacing?:number, arrows?:boolean, borderColor?:string, borderWidth?:number, shadowColor?:string, shadowBlur?:number, reverse?:boolean, allowZero?:boolean, font?:string, fontSize?:number, nameShift?:number, scoreShift?:number, rankShift?:number)
        constructor(config:{data?:string|[{player:string, score:number}], title?:string, width?:number, height?:number, corner?:number, backgroundColor?:string, titleColor?:string, colors?:{
            rankColor?:string,
            rankBackgroundColor?:string,
            currentRankColor?:string,
            currentRankBackgroundColor?:string,      
            nameColor?:string,
            nameBackgroundColor?:string,
            currentNameColor?:string,
            currentNameBackgroundColor?:string,      
            scoreColor?:string,
            scoreBackgroundColor?:string,
            currentScoreColor?:string,
            currentScoreBackgroundColor?:string}, total?:number, scoreWidth?:number, scorePlaces?:number, scoreZeros?:boolean, spacing?:number, arrows?:boolean, borderColor?:string, borderWidth?:number, shadowColor?:string, shadowBlur?:number, reverse?:boolean, allowZero?:boolean, font?:string, fontSize?:number, nameShift?:number, scoreShift?:number, rankShift?:number})
        score(score:number):number
        save():this
        cancel():this
        startTime():this
        stopTime():this
        redraw(newData:[{player:string, score:number}], newWinner?:number):this
        readonly winner:number
        readonly place:number
        readonly backing:Rectangle
        readonly backdrop:Rectangle
        readonly filled:boolean
        readonly grid:Container
        readonly titleText:Label
        readonly dataSource:string|[{player:string, score:number}]
        readonly key:string

    }

    export class Meter extends Label {
        constructor(config_or_stage?:Stage, vertical?:boolean, horizontal?:boolean, color?:number, textColor?:color, padding?:number, decimals?:number, alpha?:number, skew?:number)
        constructor(config:{stage?:Stage, vertical?:boolean, horizontal?:boolean, color?:number, textColor?:color, padding?:number, decimals?:number, alpha?:number, skew?:number})
        position():this 
    }

    interface filter {
        data?:any,
        notData?:any,
        color?:string,
        notColor?:string,
        icon?:string,
        notIcon?:string,
        item?:any,
        notItem?:any,
        col?:number,
        notCol?:number,
        row?:number,
        notRow?:number
    }    

    export class Board extends Container {
        constructor(config_or_size?:number, cols?:number, rows?:number, backgroundColor?:string, rollBackgroundColor?:string, borderColor?:string, borderWidth?:number, icon?:DisplayObject, isometric?:boolean, indicatorColor?:string, indicatorBorderColor?:string, indicatorBorderWidth?:number, indicatorSize?:number, indicatorType?:string, arrows?:boolean, arrowColor?:string, arrowRollColor?:string, swipe?:boolean, info?:number, labels?:boolean, color?:string, scaleMin?:number, scaleMax?:number, buffer?:number)
        constructor(config:{size?:number, cols?:number, rows?:number, backgroundColor?:string, rollBackgroundColor?:string, borderColor?:string, borderWidth?:number, icon?:DisplayObject, isometric?:boolean, indicatorColor?:string, indicatorBorderColor?:string, indicatorBorderWidth?:number, indicatorSize?:number, indicatorType?:string, arrows?:boolean, arrowColor?:string, arrowRollColor?:string, swipe?:boolean, info?:number, labels?:boolean, color?:string, scaleMin?:number, scaleMax?:number, buffer?:number})
        positionBoard(i:number, j:number):this
        moveCamera(dir:string):this
        addCol(index?:number):this
        addRow(index?:number):this
        update():this
        getTile(col?:number, row?:number):Container
        getRandomTile(filter?:filter):Container
        getIndexes(tile:Container):[number]
        getPoint(a?:number,b?:number):Point
        getGlobalPoint(a?:number,b?:number):Point
        getInfo(a?:number,b?:number):{data?:any, color?:string, items?:[]}
        getData(a?:number,b?:number):any
        getColor(a?:number,b?:number):string
        getIcon(a?:number,b?:number):DisplayObject
        getItems(a?:number,b?:number):[]
        getAllItems(filter?:filter):[]
        getTilesAround(a?:number,b?:number):[Container]
        setData(tile:Container, value:any):this
        setColor(tile:Container, color:string):this
        setIcon(tile:Container, icon:DisplayObject):this
        clearInfo(filter?:filter):this
        clearData(filter?:filter):this
        clearColors(filter?:filter):this
        clearIcons(filter?:filter):this
        clearItems(filter?:filter):this
        setArrows():this
        removeArrows():this
        setArrowHover():this
        setDepth():this
        add(obj?:DisplayObject, col?:number, row?:number, data?:any, color?:string, icon?:DisplayObject):this
        remove(obj:DisplayObject):this
        position(obj?:DisplayObject, col?:number, row?:number):this
        move(obj?:DisplayObject, col?:number, row?:number, time?:number):this        
        moveTo(obj?:DisplayObject, col?:number, row?:number, time?:number):this
        clearPath():this
        followPath(obj:DisplayObject, path:[[x:number,y:number]|{x:number,y:number}], time?:number, animation?:number, buffer?:number):this
        stopFollowPath():this
        shiftPath(lastStartX?:number, startX?:number, lastStartY?:number, startY?:number, obj?:DisplayObject):this
        addKeys(obj?:DisplayObject, type?:string, filter?:filter):this
        removeKeys(type):this
        readonly tiles:Tile
        readonly pieces:Container
        readonly num:number
        readonly size:number
        readonly info:[]
        readonly data:[]
        readonly numCols:number
        readonly numRows:number
        startCol:number
        startRow:number
        buffer:number
        arrows:boolean
        isometric:boolean
        readonly currentTile:Container
        readonly lastTile:Container
        readonly path:Container

    }

    export class Person extends Container {
        constructor(config_or_shirt?:string, pants?:string, head?:string, outline?:boolean, player?:boolean, cache?:boolean)
        constructor(config:{shirt?:string, pants?:string, head?:string, outline?:boolean, player?:boolean, cache?:boolean})
        readonly boardCol:number
        readonly boardRow:number
        readonly moving:boolean
        readonly boardTile:Container
        readonly square:string
    }

    export class Orb extends Container {
        constructor(config_or_radius?:number, color?:string, color2?:string, accentColor?:string, accentColor2?:string, flat?:boolean, alpha?:number, time?:number, delay?:number)
        constructor(config:{radius?:number, color?:string, color2?:string, accentColor?:string, accentColor2?:string, flat?:boolean, alpha?:number, time?:number, delay?:number})
        readonly boardCol:number
        readonly boardRow:number
        readonly moving:boolean
        readonly boardTile:Container
        readonly square:string
    }

    export class Tree extends Container {
        constructor()
        readonly boardCol:number
        readonly boardRow:number
        readonly moving:boolean
        readonly boardTile:Container
        readonly square:string
    }

    export class Timer extends Label {
        constructor(config_or_time?:number, step?:number, colon?:boolean, down?:boolean, isometric?:string, startPaused?:boolean, size?:number, font?:string, color?:string, backgroundColor?:string, borderColor?:string, borderWidth?:number, align?:string, valign?:string, bold?:boolean, italic?:boolean, variant?:boolean, width?:number, height?:number, decimals?:number)
        constructor(config:{time?:number, step?:number, colon?:boolean, down?:boolean, isometric?:string, startPaused?:boolean, size?:number, font?:string, color?:string, backgroundColor?:string, borderColor?:string, borderWidth?:number, align?:string, valign?:string, bold?:boolean, italic?:boolean, variant?:boolean, width?:number, height?:number, decimals?:number})
        start(time?:number):this
        pause(state?:boolean):this
        stop():this
        time:number
        readonly totalTime:number
        paused:boolean
        isometric:string
        readonly intervalID:any
    }

    export class Scorer extends Label {
        constructor(config_or_score?:number, isometric?:string, size?:number, font?:string, color?:string, backgroundColor?:string, borderColor?:string, borderWidth?:number, align?:string, valign?:string, bold?:boolean, italic?:boolean, variant?:boolean, width?:number, height?:number)
        constructor(config:{time?:number, isometric?:string, size?:number, font?:string, color?:string, backgroundColor?:string, borderColor?:string, borderWidth?:number, align?:string, valign?:string, bold?:boolean, italic?:boolean, variant?:boolean, width?:number, height?:number})
        score:number
        isometric:string
    }   

    export class Dialog extends Container {
        constructor(config_or_width?:number, height?:number, words?:string|[string], dialogType?:string, tailType?:string, fill?:boolean, size?:number, font?:string, color?:string, backgroundColor?:string, borderColor?:string, borderWidth?:number, align?:string, valign?:string, corner?:number, shadowColor?:string, shadowBlur?:number, padding?:number, paddingH?:number, paddingV?:number, shiftH?:number, shiftV?:number, slantLeft?:number, slantRight?:number, slantTop?:number, slantBottom?:number, tailH?:string, tailV?:string, tailShiftH?:number, tailShiftV?:number, tailShiftAngle?:number, arrows?:boolean, arrowsInside?:boolean, arrowsFlip?:boolean, selectedIndex?:number)
        constructor(config: {width?:number, height?:number, words?:string|[string], dialogType?:string, tailType?:string, fill?:boolean, size?:number, font?:string, color?:string, backgroundColor?:string, borderColor?:string, borderWidth?:number, align?:string, valign?:string, corner?:number, shadowColor?:string, shadowBlur?:number, padding?:number, paddingH?:number, paddingV?:number, shiftH?:number, shiftV?:number, slantLeft?:number, slantRight?:number, slantTop?:number, slantBottom?:number, tailH?:string, tailV?:string, tailShiftH?:number, tailShiftV?:number, tailShiftAngle?:number, arrows?:boolean, arrowsInside?:boolean, arrowsFlip?:boolean, selectedIndex?:number})
        setWords(words:string|[string], selectedIndex?:number):this
        next():this
        prev():this
        color:string
        backgroundColor:string
        borderColor:string
        readonly backingContainer:Container
        readonly backing:Shape
        readonly backingShadow:Container
        readonly label:Label
        readonly labels:[Label]
        readonly words:[]
        readonly tail:DisplayObject
        readonly arrows:Container
        readonly arrowNext:Arrow
        readonly arrowPrev:Arrow
    }

}

export = zim