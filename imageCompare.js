/*
    lib name :- before/after image view,
    version :- 0.0.1,
    developed data :- 24-Nov-2023 

*/

function imageCompare(el,options){
    this.parentElement = typeof el === "string" ? document.querySelector(el):el;
    this.renderCount = 0;
    this.width = options.width || window.innerWidth;
    this.height = options.height || window.innerHeight;
    this.captionStyle = options.captionStyle || null;
    this.captionText = options.caption || null;
    this.preImage = options.preImage || null;
    this.afterImage = options.afterImage || null;
    this.isDragElementEnable = options.isDragElementEnable || false;
    this.style = options.style || null;
    this.defaultView = options.defaultView || 50;
    this.events = [];
    this.dragElementStyle = options.dragElementStyle || null;
    this.eventsTypes = [
        {'drag-position':'drag-position'},
        {'get-drag-position':'get-drag-position'}
    ];
    this.mousePosition = {
        x:0,
        y:0,
        t:0,
        d:0
    }
    
       
}

imageCompare.prototype.init = function(){
    if(this.renderCount === 0){
        this.render();
        this.addCSS();
        this.setStyle();
        this.manageDragElementstyle();
        this.renderCount = 1;
    }
}

imageCompare.prototype.render = function(){
    this._pEL = document.createElement('div');
    let mapScale = document.createElement('div')
    this._pEL.className = 'before-after-image-container';
    mapScale.className = 'map-scale';
    this.caption = document.createElement('div');
    this.caption.className = 'caption';

    this._pEL.style.width = this.width + 'px';
    this._pEL.style.height = this.height + 'px';

    if(this.preImage && this.afterImage)
    {
        this.leftImage = document.createElement('div');
        this.leftImage.className = 'left-scaling sclimage';
        this.leftImage.innerHTML = `<img src='${this.preImage}' />`;
        this.leftImage.style.width = Math.abs(this.defaultView - 100) + '%';

        this.rightImage = document.createElement('div');
        this.rightImage.className = 'right-scalling sclimage';
        this.rightImage.innerHTML = `<img src='${this.afterImage}' />`;
        this.rightImage.style.width = Math.abs(this.defaultView) + '%';


        if(this.isDragElementEnable){
            this.dragElement = document.createElement('div');
            this.dragElement.className = 'drag-moving';
            this.dragElement.style.left = Math.abs(this.defaultView) + '%';
            this.dragElement.addEventListener('mousedown',(e) => this.onMoveDown(e));
            this.dragElement.addEventListener('touchstart',(e) => this.onMoveDown(e));
            mapScale.appendChild(this.dragElement);
        }

        mapScale.appendChild(this.leftImage);
        mapScale.appendChild(this.rightImage);
        this._pEL.appendChild(mapScale);

        this.caption && (this.caption.innerText = this.captionText, this._pEL.appendChild(this.caption));
        this.parentElement && this.parentElement.appendChild(this._pEL);

    }
    else
    {
        console.error('please add before and after image');
    }



}

imageCompare.prototype.addCSS = function(){
    let style = document.createElement('style');
    style.innerHTML = `
    .map-scale {
        width: 100%;
        height: 100%;
        position: relative;
        cursor: pointer;
        color: #f3f3f3;
    }
    .drag-moving {
        width: var(--drag-moving-width,5px);
        height: calc(100% + 20px);
        background-color: var(--drag-moving-background-color,#fff);
        position: absolute;
        z-index: 9;
        cursor: var(--drag-moving-cursor,col-resize);
        left: 0%;
    }
    .sclimage {
        position: absolute;
        height: 100%;
        display: inline-block;
        top: 0;
        overflow: hidden;
        -webkit-backface-visibility: hidden;
        z-index:0
    }
    .right-scalling.sclimage {
        left: 0;
        background-position: left;
    }
    .sclimage img {
        height: 100%;
        width: auto;
        position: absolute;
        margin-bottom: 0;
        max-height: none;
        max-width: none;
        max-height: initial;
        max-width: initial;
        z-index:0;
    }
    .right-scalling.sclimage img {
        left: 0;
    }
    .left-scaling.sclimage {
        right: 0;
        background-position: right;
    }
    .left-scaling.sclimage img {
        right: 0;
        bottom: 0;
    }
    .caption {
        text-align: left;
        padding: 6px;
        font-size: 16px;
    }
    .drag-moving::after {
        content: '';
        width: var(--drag-moving-circle-width,25px);
        height: var(--drag-moving-circle-height,25px);
        position: absolute;
        background-color: var(--drag-moving-circle-background-color,#fff);
        border-radius: var(--drag-moving-border-radius,100%);
        border: var(--drag-moving-border-width,3px) var(--drag-moving-border-style,solid) var(--drag-moving-border-color,#fe3e49);
        bottom: var(--drag-moving-bottom,-25px);
        left: var(--drag-moving-left,-12.5px);
    }
    `;

    document.body.appendChild(style);
}

imageCompare.prototype.styleProperty = function(property,element){
    Object.entries(property).map((prop)=>{
        element.style[prop[0]] = prop[1];
    });
}

imageCompare.prototype.setStyle = function(){
    if(this.style){
        this.styleProperty(this.style,this._pEL);
        this.width = this._pEL.clientWidth;
    }
    if(this.captionStyle){
        this.styleProperty(this.captionStyle,this.caption);
    }
}

imageCompare.prototype.getCurrentHandlerType = function(type){
    return this.events.filter((f)=> f.type == type)[0];
}

imageCompare.prototype.setDragMove = function(dragEvent){
    if(dragEvent){
        this.rightImage.style.width = Math.abs(dragEvent) + '%';
        this.dragElement.style.left = Math.abs(dragEvent) + '%';
        this.leftImage.style.width = Math.abs((dragEvent - 100)) + '%';
        let {handler} =  this.getCurrentHandlerType(this.eventsTypes[0]["drag-position"]);
        handler.apply(this,[Math.abs(dragEvent).toFixed(2),Math.abs((dragEvent - 100)).toFixed(2)]);
    }
}

imageCompare.prototype.on = function(type,handler){
    this.events.push({type,handler})
}

imageCompare.prototype.moveImage = function(position){
    this.rightImage.style.width = Math.abs(position) + 'px';
    this.leftImage.style.width = Math.abs((position - this.width)) + 'px';
    let {handler} =  this.getCurrentHandlerType(this.eventsTypes[0]["drag-position"]);
    let pxToPercantage = (position / this.width) * 100;
    handler.apply(this,[Math.abs(pxToPercantage).toFixed(2),Math.abs((pxToPercantage - 100)).toFixed(2)]);
}

imageCompare.prototype.onMove = function(e){
    if (e.type === "touchmove"){
        this.mousePosition.x = this.mousePosition.t - e.touches[0].clientX;
        this.mousePosition.t = e.touches[0].clientX;
    }   
    else
    {
        this.mousePosition.x = this.mousePosition.t - e.clientX;
        this.mousePosition.t = e.clientX;
    }
   
   let currentPos = (Math.abs(this.dragElement.offsetLeft) - this.mousePosition.x);
   if(currentPos >= 0 && currentPos <= this.width){
    this.dragElement.style.left = currentPos + 'px';
    this.moveImage(currentPos);
   }
}

imageCompare.prototype.onMoveDown = function(e){
    e = e || window.event;
    if (e.type === "touchstart"){this.mousePosition.t = e.touches[0].clientX;}
    else{this.mousePosition.t = e.clientX;}
    document.onmouseup = (e) => {this.onMoveUp(e)};
    document.ontouchend = (e) => {this.onMoveUp(e)};
    document.onmousemove = (e) => {this.onMove(e)};
    document.ontouchmove = (e) => {this.onMove(e)};
}

imageCompare.prototype.onMoveUp = function(e){
    document.onmouseup = null;
    document.onmousemove = null;
}

imageCompare.prototype.setProperty = function(checkProperty,property,propertydata){
    this.dragElementStyle.hasOwnProperty(checkProperty) && (
        document.documentElement.style.setProperty(property, propertydata)
    );
}

imageCompare.prototype.manageDragElementstyle = function(){
    if(this.dragElementStyle){
        this.setProperty('lineWidth',"--drag-moving-width",this.dragElementStyle.lineWidth + 'px');
        this.setProperty('lineColor',"--drag-moving-background-color",this.dragElementStyle.lineColor);
        this.setProperty('cursorType',"--drag-moving-cursor",this.dragElementStyle.cursorType);
        this.setProperty('circleWidth',"--drag-moving-circle-width",this.dragElementStyle.circleWidth + 'px');
        this.setProperty('circleWidth',"--drag-moving-circle-height",this.dragElementStyle.circleWidth + 'px');
        this.setProperty('circleWidth',"--drag-moving-left",-(this.dragElementStyle.circleWidth / 2) + 'px');
        this.setProperty('circleBackgroundColor',"--drag-moving-circle-background-color",this.dragElementStyle.circleBackgroundColor);
        this.setProperty('circleBorderColor',"--drag-moving-border-color",this.dragElementStyle.circleBorderColor);
        this.setProperty('circleBorderWidth',"--drag-moving-border-width",this.dragElementStyle.circleBorderWidth + 'px');
        this.setProperty('circleBorderType',"--drag-moving-border-style",this.dragElementStyle.circleBorderType);
    }
}

