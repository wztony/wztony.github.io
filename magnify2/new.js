/**
 * Call our functions on window load event
 */
window.onload = function(){
    setup();
};

/**
 * Global variables
 */
var _vis;
var colors = [
    '#c62828', '#e57373', '#f8bbd0', '#ec407a',
    '#f9e79f', '#ffeb3b', '#fbc02d', '#d35400',
    '#bcaaa4', '#795548',
    '#80cbc4', '#4caf50', '#8bc34a', '#e6ee9c',
    '#64b5f6', '#b3e5fc', '#4dd0e1', '#00838f',
    '#8e24aa', '#b39ddb', '#5c6bc0', '#283593'];
var colorScale = d3.scaleOrdinal()
    .range(colors);
const MARGINS = { top:10, right:150, bottom:60, left: 60, infoRight: 600, infoBottom: 280, info: 20, legTop: 150};

const rwh = 5;
const polyR = rwh*2;
const polyRScale = 3;

const scale = 10;

var selection = false;

var genre = ["Book", "Business", "Catelogs", "Education", "Entertainment", "Finance", "Food & Drink",
    "Games", "Health & Fitness", "Lifestyle", "Music", "Navigation", "News", "Photo & Video", "Productivity",
    "Reference", "Shopping", "Social Networking", "Sports", "Travel", "Utilities", "Weather"];


//we can use object initializer to create object
//or use constructor function

var Scatterplot = function(){
    this.data;
    this.width = 800;
    this.height = 650;

    this.svgContainer;      //have an SVG container, for <svg> element from the document
    this.datapoint;         //circles

    this.xAxisScale;
    this.yAxisScale;

    this.xAxis;
    this.yAxis;

    this.setupAxes = function(){
        this.xAxis = d3.axisBottom(this.xAxisScale).tickSize(-5);
        this.svgContainer.append("g").attr("transform", `translate(0, ${this.height-MARGINS.bottom})`).call(this.xAxis);                    //append a group into svg
        this.yAxis = d3.axisLeft(this.yAxisScale).tickSize(-5);
        this.svgContainer.append("g").attr("transform", `translate(${MARGINS.left}, 0)`).call(this.yAxis);                    //append a group into svg

        //x-axis label
        this.svgContainer.append("text")
            .attr("x", this.width/2)
            .attr("y", this.height-MARGINS.bottom/2)
            .attr("font-size", 20)
            .style("text-anchor", "middle")
            .text("Languages Supported")
        ;

        //y-axis label
        this.svgContainer.append("text")
            .attr("x", MARGINS.left)
            .attr("y", this.height/2)
            .attr("transform", `rotate(-90, ${MARGINS.left/3}, ${this.height/2})`)
            .attr("font-size", 20)
            .style("text-anchor", "middle")
            .text("Average Rating")
        ;
    }


    this.setupScale = function(xDomain, xRange, yDomain, yRange){
        this.xAxisScale = d3.scaleLinear().domain(xDomain).range(xRange);
        this.yAxisScale = d3.scaleLinear().domain(yDomain).range(yRange);
    }

    this.setupInfoBox = function(){
        var i;
        for(i = 0; i<genre.length;i++){
            this.svgContainer.append("line")
                .attr("class", "legendColor")
                .attr("x1", this.width-MARGINS.right-10)
                .attr("y1", MARGINS.legTop+20*i)
                .attr("x2", this.width-MARGINS.right)
                .attr("y2", MARGINS.legTop+20*i)
                .style("stroke-width", 10)
                .style("stroke", function(){
                    return colorScale(genre[i]);
                })
            ;
            this.svgContainer.append("text")
                .attr("x", this.width-MARGINS.right+10)
                .attr("y", MARGINS.legTop+20*i+5)
                .text(genre[i])
        }
        this.svgContainer.append("text")
            .attr("class", "CURRENTSELECTION")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+MARGINS.info)
            .attr("font-size", 20)
            .style("text-anchor", "left")
            .text("")
        ;
        this.svgContainer.append("text")
            .attr("class", "APPNAME")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+2*MARGINS.info)
            .style("text-anchor", "left")
            //.text("App Name: ")
            .text("")
        ;
        this.svgContainer.append("text")
            .attr("class", "NoRATINGS")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+3*MARGINS.info)
            .style("text-anchor", "left")
            //.text("No. of Ratings: ")
            .text("")
        ;
        this.svgContainer.append("text")
            .attr("class", "AveRATING")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+4*MARGINS.info)
            .style("text-anchor", "left")
            //.text("Average Rating: ")
            .text("")
        ;
        this.svgContainer.append("text")
            .attr("class", "PRIMARYGENRE")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+5*MARGINS.info)
            .style("text-anchor", "left")
            //.text("Primary Genre: ")
            .text("")
        ;
        this.svgContainer.append("text")
            .attr("class", "NoLANGUAGES")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+6*MARGINS.info)
            .style("text-anchor", "left")
            //.text("Languages Supported: ")
            .text("")
        ;
        this.svgContainer.append("text")
            .attr("class", "SIZE")
            .attr("x", this.width-MARGINS.infoRight)
            .attr("y", this.height-MARGINS.infoBottom+7*MARGINS.info)
            .style("text-anchor", "left")
            //.text("Size in Bytes: ")
            .text("")
        ;
    }

    _dispatcherMDown = d3.dispatch("mousedown");
    _dispatcherMDown.on("mousedown", onMouseDown);
    _dispatcherMOver = d3.dispatch("mouseover");
    _dispatcherMOver.on("mouseover", onMouseOver);
    _dispatcherMOut = d3.dispatch("mouseout");
    _dispatcherMOut.on("mouseout", onMouseOut);

    this.createCircles = function(){
        //create circle for every data point and put it into "datapoint" variable
        this.datapoint = this.svgContainer.selectAll("circle")
            .data(this.data.filter(function(d){
                return d.ARL_Count == 1;
            }))                    //bind data to circle
            .enter()                            //allow access to data
            .append("circle")                  //append circle to document
            .attr("class", function(d){
                return d.ARL_Unique;
            })
            .attr("r", rwh)
            .attr("cx", function(d){
                return _vis.xAxisScale(d["LanguagesSupported"]);
            })
            .attr("cy", function(d){
                return _vis.yAxisScale(d["AverageRating"]);
            })
            .on("mouseover", function(d){
                //d3.select(this).style("fill", "blue");
                //onMouseOver(d);
                _dispatcherMOver.call("mouseover", this, d);
            })
            .on("mouseout", function(d){
                //onMouseOut(d);
                _dispatcherMOut.call("mouseout", this, d);
            })
            .on("mousedown", function(d){
                _dispatcherMDown.call("mousedown", this, d, "selected");
            })
            .style("fill", function(d){
                return colorScale(d.PrimaryGenre)
            })
            //.style("stroke", "black")
            .append("svg:title")
            .text(function(d){
                return d.AppName;
            })
        ;
    }

    this.arrangeCircles = function(){
        this.datapoint = this.svgContainer.selectAll("circle")
            .data(this.data)
            .enter()
            .attr("cx", 0)
            .attr("cy", 0)
        ;

    }

    this.createRectangles = function(){
        //create circle for every data point and put it into "datapoint" variable
        this.datapoint = this.svgContainer.selectAll("rect")
            .data(this.data.filter(function(d){
                return d.ARL_Count == 2;
            }))                    //bind data to circle
            .enter()                            //allow access to data
            .append("rect")                  //append circle to document
            .attr("class", function(d){
                return d.ARL_Unique;
            })
            .attr("width", rwh*2)
            .attr("height", rwh*2)
            .attr("x", function(d){
                return _vis.xAxisScale(d["LanguagesSupported"]) - rwh;
            })
            //.attr("cx", function(d){return x;})   d is the data we are currently in
            .attr("y", function(d){
                return _vis.yAxisScale(d["AverageRating"]) - rwh*4 + rwh*2*d["ARL_Serial"];
            })
            .on("mouseover", function(d){
                //d3.select(this).style("fill", "blue");
                //onMouseOver(d);
                _dispatcherMOver.call("mouseover", this, d);
            })
            .on("mouseout", function(d){
                //onMouseOut(d);
                _dispatcherMOut.call("mouseout", this, d);
            })
            .on("mousedown", function(d){
                _dispatcherMDown.call("mousedown", this, d, "selected");
            })
            .style("fill", function(d){
                return colorScale(d.PrimaryGenre)
            })
            //.style("stroke", "black")
            .append("svg:title")
            .text(function(d){
                return d.AppName;
            })
        ;
    }

    this.createTriangles = function(){
        this.datapoint = this.svgContainer.selectAll("polygon")
            .data(this.data.filter(function(d){
                return d.ARL_Count >= 3;
            }))
            .enter()
            .append("polygon")
            .attr("class", function(d){
                return d.ARL_Unique;
            })
            .attr("points", function(d){
                return [[0,0].join(",")
                    ,[-Math.sin(360/d.ARL_Count/2*Math.PI/180)*polyR,+Math.cos(360/d.ARL_Count/2*Math.PI/180)*polyR].join(",")
                    ,[Math.sin(360/d.ARL_Count/2*Math.PI/180)*polyR,+Math.cos(360/d.ARL_Count/2*Math.PI/180)*polyR].join(",")].join(" ")
            })
            .attr("transform", function(d){
                return "translate(" + _vis.xAxisScale(d["LanguagesSupported"]) + "," + _vis.yAxisScale(d["AverageRating"]) + ")rotate(" + 360/d["ARL_Count"]*d["ARL_Serial"] + ")"
            })
            .on("mouseover", function(d){
                //d3.select(this).style("fill", "blue");
                //onMouseOver(d);
                _dispatcherMOver.call("mouseover", this, d);
            })
            .on("mouseout", function(d){
                //onMouseOut(d);
                _dispatcherMOut.call("mouseout", this, d);
            })
            .on("mousedown", function(d){
                _dispatcherMDown.call("mousedown", this, d, "selected");
            })
            .style("fill", function(d){
                return colorScale(d.PrimaryGenre)
            })
            //.style("stroke", "black")
            .append("svg:title")
            .text(function(d){
                return d.AppName;
            })
    }


}

/**
 * Function setup: sets up our visualization environment.
 * You can change the code to not have static paths and elementID's
 */
function setup(){
    //init visualization
    _vis = new Scatterplot();               //create an instance of Scatterplot object
    _vis.svgContainer = d3.select("#vis");  //select object with id "vis", ie. <svg id="vis" class="svg_boxes"></svg> in index.html
    _vis.width = _vis.svgContainer.node().getBoundingClientRect().width === undefined ? 700 : _vis.svgContainer.node().getBoundingClientRect().width;
    _vis.height = _vis.svgContainer.node().getBoundingClientRect().height === undefined ? 1800 : _vis.svgContainer.node().getBoundingClientRect().height;
    //D3 is a declarative language, vs imparative language Java
    //*********declarative language: you tell the computer what to do, not how to do
    //that's why you will rarely see for-loops in D3


    loadData("AppleStore1000SamplesCSV.csv");
}

/**
 * Function loadData: loads data from a given CSV file path/url
 * @param path string location of the CSV data file
 */
function loadData(path){
    // call D3's loading function for CSV and load the data to our global variable _data
    d3.csv(path).then(function(data){
        _vis.data = data;
        _vis.setupScale([0,80],[MARGINS.left,_vis.width-MARGINS.left-MARGINS.right],[0,5.2],[_vis.height-MARGINS.bottom, MARGINS.top]);
        _vis.setupAxes();
        _vis.setupInfoBox();
        _vis.createCircles();
        _vis.createRectangles();
        _vis.createTriangles();
    });
}


function onMouseOver(data){
    if(d3.select(this).attr("class") !== "selected") {
        enlargeShapes(data);
    }
}

function enlargeShapes(data){
    var arl_unique = "";
    _vis.svgContainer.selectAll("circle")
        .select(function (d) {
            if(d === data){
                arl_unique = d.ARL_Unique;
                return this;
            }
            else
                return null;
        })
        .attr("r", scale)
    //.style("fill", "red")
    //.style("stroke", "black")
    ;
    _vis.svgContainer.selectAll("rect")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d === data){
                arl_unique = d.ARL_Unique;
                return this;
            }
            else
                return null;
        })
        .attr("width", scale*2)
        .attr("height", scale*2)
        .attr("x", function (d) {
            return _vis.xAxisScale(d["LanguagesSupported"]) - scale;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function (d) {
            return _vis.yAxisScale(d["AverageRating"]) - scale*4 + scale*2 * d["ARL_Serial"];
        })
    //.style("fill", "red")
    //.style("stroke", "black")
    ;
    _vis.svgContainer.selectAll("polygon")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d === data){
                arl_unique = d.ARL_Unique;
                return this;
            }
            else
                return null;
        })
        .attr("points", function (d) {
            return [[0, 0].join(",")
                , [-Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale].join(",")
                , [Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale].join(",")].join(" ")
        })
    //.style("fill", "red")
    //.style("stroke", "black")
    ;

    _vis.svgContainer.selectAll("circle")
        .select(function (d) {
            if(d.ARL_Unique == arl_unique){
                return this;
            }
            else
                return null;
        })
        .attr("r", scale)
    //.style("fill", "red")
    //.style("stroke", "black")
    ;
    _vis.svgContainer.selectAll("rect")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d.ARL_Unique == arl_unique){
                return this;
            }
            else
                return null;
        })
        .attr("width", scale*2)
        .attr("height", scale*2)
        .attr("x", function (d) {
            return _vis.xAxisScale(d["LanguagesSupported"]) - scale;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function (d) {
            return _vis.yAxisScale(d["AverageRating"]) - scale*4 + scale*2 * d["ARL_Serial"];
        })
    //.style("fill", "red")
    //.style("stroke", "black")
    ;
    _vis.svgContainer.selectAll("polygon")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d.ARL_Unique == arl_unique){
                return this;
            }
            else
                return null;
        })
        .attr("points", function (d) {
            return [[0, 0].join(",")
                , [-Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale].join(",")
                , [Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * scale * polyRScale].join(",")].join(" ")
        })
    //.style("fill", "red")
    //.style("stroke", "black")
    ;
}





function onMouseOut(data){
    if(d3.select(this).attr("class") !== "selected") {
        shrinkShapes(data);
    }
}

function shrinkShapes(data){
    var arl_unique = "";
    _vis.svgContainer.selectAll("circle")
        .select(function (d) {
            if(d === data){
                arl_unique = d.ARL_Unique;
                return this;
            }
            else
                return null;
        })
        .attr("r", rwh)
        .style("fill", function (d) {
            return colorScale(d.PrimaryGenre)
        })
        .style("stroke", "none")
    ;
    _vis.svgContainer.selectAll("rect")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d === data){
                arl_unique = d.ARL_Unique;
                return this;
            }
            else
                return null;
        })
        .attr("width", rwh * 2)
        .attr("height", rwh * 2)
        .attr("x", function (d) {
            return _vis.xAxisScale(d["LanguagesSupported"]) - rwh;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function (d) {
            return _vis.yAxisScale(d["AverageRating"]) - rwh * 4 + rwh * 2 * d["ARL_Serial"];
        })
        .style("fill", function (d) {
            return colorScale(d.PrimaryGenre)
        })
        .style("stroke", "none")
    ;
    _vis.svgContainer.selectAll("polygon")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d === data){
                arl_unique = d.ARL_Unique;
                return this;
            }
            else
                return null;
        })
        .attr("points", function (d) {
            return [[0, 0].join(",")
                , [-Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")
                , [Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")].join(" ")
        })
        .style("fill", function (d) {
            return colorScale(d.PrimaryGenre)
        })
        .style("stroke", "none")
    ;


    _vis.svgContainer.selectAll("circle")
        .select(function (d) {
            if(d.ARL_Unique == arl_unique){
                return this;
            }
            else
                return null;
        })
        .attr("r", rwh)
        .style("fill", function (d) {
            return colorScale(d.PrimaryGenre)
        })
        .style("stroke", "none")
    ;
    _vis.svgContainer.selectAll("rect")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d.ARL_Unique == arl_unique){
                return this;
            }
            else
                return null;
        })
        .attr("width", rwh * 2)
        .attr("height", rwh * 2)
        .attr("x", function (d) {
            return _vis.xAxisScale(d["LanguagesSupported"]) - rwh;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function (d) {
            return _vis.yAxisScale(d["AverageRating"]) - rwh * 4 + rwh * 2 * d["ARL_Serial"];
        })
        .style("fill", function (d) {
            return colorScale(d.PrimaryGenre)
        })
        .style("stroke", "none")
    ;
    _vis.svgContainer.selectAll("polygon")
        .select(function (d) {
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            if(d.ARL_Unique == arl_unique){
                return this;
            }
            else
                return null;
        })
        .attr("points", function (d) {
            return [[0, 0].join(",")
                , [-Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")
                , [Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")].join(" ")
        })
        .style("fill", function (d) {
            return colorScale(d.PrimaryGenre)
        })
        .style("stroke", "none")
    ;
}

function onMouseDown(data, type){
    if(d3.select(this).attr("class") === "selected"){
        type = "selected";
        var arl_unique = "";
        _vis.svgContainer.selectAll("circle")
        //.attr("r", rwh)
            .classed("selected", false)
            .style("stroke", "none")
        ;
        _vis.svgContainer.selectAll("rect")
        /*.attr("width", rwh * 2)
        .attr("height", rwh * 2)
        .attr("x", function (d) {
            return _vis.xAxisScale(d["LanguagesSupported"]) - rwh;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function (d) {
            return _vis.yAxisScale(d["AverageRating"]) - rwh * 4 + rwh * 2 * d["ARL_Serial"];
        })*/
            .classed("selected", false)
            .style("stroke", "none")
        ;
        _vis.svgContainer.selectAll("polygon")
        /*.attr("points", function (d) {
            return [[0, 0].join(",")
                , [-Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")
                , [Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")].join(" ")
        })*/
            .classed("selected", false)
            .style("stroke", "none")
        ;
        _vis.svgContainer.selectAll(".CURRENTSELECTION")
            .text("")
        ;
        _vis.svgContainer.selectAll(".APPNAME")
            .text("")
        ;
        _vis.svgContainer.selectAll(".AveRATING")
            .text("")
        ;
        _vis.svgContainer.selectAll(".NoRATINGS")
            .text("")
        ;
        _vis.svgContainer.selectAll(".PRIMARYGENRE")
            .text("")
        ;
        _vis.svgContainer.selectAll(".NoLANGUAGES")
            .text("")
        ;
        _vis.svgContainer.selectAll(".SIZE")
            .text("")
        ;
    }
    else{
        _vis.svgContainer.selectAll("circle")
            .attr("r", rwh)
            .classed("selected", false)
            .style("stroke", "none")
        ;
        _vis.svgContainer.selectAll("rect")
            .attr("width", rwh * 2)
            .attr("height", rwh * 2)
            .attr("x", function (d) {
                return _vis.xAxisScale(d["LanguagesSupported"]) - rwh;
            })
            //.attr("cx", function(d){return x;})   d is the data we are currently in
            .attr("y", function (d) {
                return _vis.yAxisScale(d["AverageRating"]) - rwh * 4 + rwh * 2 * d["ARL_Serial"];
            })
            .classed("selected", false)
            .style("stroke", "none")
        ;
        _vis.svgContainer.selectAll("polygon")
            .attr("points", function (d) {
                return [[0, 0].join(",")
                    , [-Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")
                    , [Math.sin(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR, +Math.cos(360 / d.ARL_Count / 2 * Math.PI / 180) * polyR].join(",")].join(" ")
            })
            .classed("selected", false)
            .style("stroke", "none")
        ;

        var appName = "";
        var aveRating = "";
        var noRating = "";
        var primaryGenre = "";
        var langSupported = "";
        var size = "";

        _vis.svgContainer.selectAll("circle")
            .select(function(d){
                if(d === data){
                    console.log("circle selected");
                    enlargeShapes(d);
                    arl_unique = d.ARL_Unique;
                    appName = d.AppName;
                    aveRating = d.AverageRating;
                    noRating = d.RatingCount;
                    primaryGenre = d.PrimaryGenre;
                    langSupported = d.LanguagesSupported;
                    size = d.SizeBytes;
                    return this;
                }
                else
                    return null;
            })
            .attr("class", type)
            .style("stroke", "black")
        ;
        _vis.svgContainer.selectAll("rect")
            .select(function(d){
                if(d === data){
                    console.log("rect selected");
                    enlargeShapes(d);
                    arl_unique = d.ARL_Unique;
                    appName = d.AppName;
                    aveRating = d.AverageRating;
                    noRating = d.RatingCount;
                    primaryGenre = d.PrimaryGenre;
                    langSupported = d.LanguagesSupported;
                    size = d.SizeBytes;
                    return this;
                }
                else
                    return null;
            })
            .attr("class", type)
            .style("stroke", "black")
        ;
        _vis.svgContainer.selectAll("polygon")
            .select(function(d){
                if(d === data){
                    console.log("polygon selected");
                    enlargeShapes(d);
                    arl_unique = d.ARL_Unique;
                    appName = d.AppName;
                    aveRating = d.AverageRating;
                    noRating = d.RatingCount;
                    primaryGenre = d.PrimaryGenre;
                    langSupported = d.LanguagesSupported;
                    size = d.SizeBytes;
                    return this;
                }
                else
                    return null;
            })
            .attr("class", type)
            .style("stroke", "black")
        ;
        _vis.svgContainer.selectAll(".CURRENTSELECTION")
            .text("Current Selection")
        ;
        _vis.svgContainer.selectAll(".APPNAME")
            .text("App Name: " + appName)
        ;
        _vis.svgContainer.selectAll(".AveRATING")
            .text("Average Rating: " + aveRating)
        ;
        _vis.svgContainer.selectAll(".NoRATINGS")
            .text("No. of Ratings: " + noRating)
        ;
        _vis.svgContainer.selectAll(".PRIMARYGENRE")
            .text("Primary Genre: " + primaryGenre)
        ;
        _vis.svgContainer.selectAll(".NoLANGUAGES")
            .text("Languages Supported: " + langSupported)
        ;
        _vis.svgContainer.selectAll(".SIZE")
            .text("Size in Bytes: " + size)
        ;
    }
}