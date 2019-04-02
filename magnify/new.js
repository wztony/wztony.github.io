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
    '#64b5f6', '#b3e5fc', '#4dd0e1', '#00838f',
    '#c62828', '#e57373', '#f8bbd0', '#ec407a',
    '#8e24aa', '#b39ddb', '#5c6bc0', '#283593',
    '#80cbc4', '#c8e6c9', '#4caf50', '#8bc34a',
    '#eeff41', '#fbc02d'];
var colorScale = d3.scaleOrdinal()
    .range(colors);
const MARGINS = { top:10, right:10, bottom:60, left: 60};

const polyR = 7;
const polyRScale = 2;

//we can use object initializer to create object
//or use constructor function

var Scatterplot = function(){
    this.data;
    this.width = 800;
    this.height = 500;

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
            .style("text-anchor", "middle")
            .text("Languages Supported")
        ;

        //y-axis label
        this.svgContainer.append("text")
            .attr("x", MARGINS.left)
            .attr("y", this.height/2)
            .attr("transform", `rotate(-90, ${MARGINS.left/3}, ${this.height/2})`)
            .style("text-anchor", "middle")
            .text("Average Rating")
        ;
    }


    this.setupScale = function(xDomain, xRange, yDomain, yRange){
        this.xAxisScale = d3.scaleLinear().domain(xDomain).range(xRange);
        this.yAxisScale = d3.scaleLinear().domain(yDomain).range(yRange);
    }


    this.createCircles = function(){
        //create circle for every data point and put it into "datapoint" variable
        this.datapoint = this.svgContainer.selectAll("circle")
            .data(this.data.filter(function(d){
                return d.ARL_Count == 1;
            }))                    //bind data to circle
            .enter()                            //allow access to data
            .append("circle")                  //append circle to document
            .attr("r", 2)
            .attr("cx", function(d){
                return _vis.xAxisScale(d["LanguagesSupported"]);
            })
            .attr("cy", function(d){
                return _vis.yAxisScale(d["AverageRating"]);
            })
            .on("mouseover", function(d){
                //d3.select(this).style("fill", "blue");
                onMouseOver(d);
            })
            .on("mouseout", function(d){
                onMouseOut(d);
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
            .attr("width", 4)
            .attr("height", 4)
            .attr("x", function(d){
                return _vis.xAxisScale(d["LanguagesSupported"]) - 2;
            })
            //.attr("cx", function(d){return x;})   d is the data we are currently in
            .attr("y", function(d){
                return _vis.yAxisScale(d["AverageRating"]) - 8 + 4*d["ARL_Serial"];
            })
            .on("mouseover", function(d){
                //d3.select(this).style("fill", "blue");
                onMouseOver(d);
            })
            .on("mouseout", function(d){
                onMouseOut(d);
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
                onMouseOver(d);
            })
            .on("mouseout", function(d){
                onMouseOut(d);
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
    _vis.width = _vis.svgContainer.node().getBoundingClientRect().width === undefined ? 800 : _vis.svgContainer.node().getBoundingClientRect().width;
    _vis.height = _vis.svgContainer.node().getBoundingClientRect().height;
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
        _vis.setupScale([0,80],[MARGINS.left,_vis.width-MARGINS.left],[0,5.2],[_vis.height-MARGINS.bottom, MARGINS.top]);
        _vis.setupAxes();
        _vis.createCircles();
        _vis.createRectangles();
        _vis.createTriangles();
    });
}


function onMouseOver(data){
    _vis.svgContainer.selectAll("circle")
        .select(function(d){
            return d === data ? this : null;
        })
        .attr("r", 8)
        //.style("fill", "red")
    ;
    _vis.svgContainer.selectAll("rect")
        .select(function(d){
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            return d === data ? this : null;
        })
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", function(d){
            return _vis.xAxisScale(d["LanguagesSupported"]) - 8;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function(d){
            return _vis.yAxisScale(d["AverageRating"]) - 32 + 16*d["ARL_Serial"];
        })
        //.style("fill", "red")
    ;
    _vis.svgContainer.selectAll("polygon")
        .select(function(d){
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            return d === data ? this : null;
        })
        .attr("points", function(d){
            return [[0,0].join(",")
                ,[-Math.sin(360/d.ARL_Count/2*Math.PI/180)*polyR*polyRScale,+Math.cos(360/d.ARL_Count/2*Math.PI/180)*polyR*polyRScale].join(",")
                ,[Math.sin(360/d.ARL_Count/2*Math.PI/180)*polyR*polyRScale,+Math.cos(360/d.ARL_Count/2*Math.PI/180)*polyR*polyRScale].join(",")].join(" ")
        })
        //.style("fill", "red")
    ;

}


function onMouseOut(data){
    _vis.svgContainer.selectAll("circle")
        .select(function(d){
            return d === data ? this : null;
        })
        .attr("r", 2)
        .style("fill", function(d){
            return colorScale(d.PrimaryGenre)
        })
    ;
    _vis.svgContainer.selectAll("rect")
        .select(function(d){
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            return d === data ? this : null;
        })
        .attr("width", 4)
        .attr("height", 4)
        .attr("x", function(d){
            return _vis.xAxisScale(d["LanguagesSupported"]) - 2;
        })
        //.attr("cx", function(d){return x;})   d is the data we are currently in
        .attr("y", function(d){
            return _vis.yAxisScale(d["AverageRating"]) - 8 + 4*d["ARL_Serial"];
        })
        .style("fill", function(d){
            return colorScale(d.PrimaryGenre)
        })
    ;
    _vis.svgContainer.selectAll("polygon")
        .select(function(d){
            //return d.ARL_Unique === data.ARL_Unique ? this : null;
            return d === data ? this : null;
        })
        .attr("points", function(d){
            return [[0,0].join(",")
                ,[-Math.sin(360/d.ARL_Count/2*Math.PI/180)*polyR,+Math.cos(360/d.ARL_Count/2*Math.PI/180)*polyR].join(",")
                ,[Math.sin(360/d.ARL_Count/2*Math.PI/180)*polyR,+Math.cos(360/d.ARL_Count/2*Math.PI/180)*polyR].join(",")].join(" ")
        })
        .style("fill", function(d){
            return colorScale(d.PrimaryGenre)
        })
    ;

}