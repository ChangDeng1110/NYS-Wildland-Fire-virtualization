var width_1 = 800
var height_1 = 500
var centered

var radiusScale = d3.scale.sqrt().domain([1,3000]).range([1,20])

var projection = d3.geo.mercator()
    .center([-73.94, 40.70])
    .scale(7000)
    .translate([(width_1-350), (height_1+250)]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width_1)
    .attr("height", height_1)
    .style("fill","white")

svg.append('rect')
    .attr('id', 'background')
    .attr('width', width_1)
    .attr('height', height_1)

var g = svg.append('g');

/*
var svg1 = d3.select("body").append("svg")
    .attr("width", width/2)
    .attr("height", height)
    .style("fill","white")

var g1 = svg1.append('g');
*/

d3.json('cty.json', function(error, mapData) {
    //console.log(mapData)
    var selectionName = []
    for (var i = 0; i < mapData.features.length; i ++){
        //console.log(mapData.features[i].properties.NAME)
        selectionName.push(mapData.features[i].properties.NAME)
    }

function unique(array) {
    var res = [];
    for (var i = 0, len = array.length; i < len; i++) {
        var current = array[i];
        if (res.indexOf(current) === -1) {
            res.push(current)
        }
    }
    return res;
}

selectionName = (unique(selectionName))
//console.log(selectionName)
var select = d3.select('body')
  .append('select')
    .attr('class','select')
    //.property("selected", function(d){ return d == "Clinton";})
    .on('change',onchange)

select
  .selectAll('option')
	.data(selectionName).enter()
	.append('option')
        .text(function (d) { return d; });
        
onchange()

function onchange(){
    selectValue = d3.select('select').property('value')
    svg.selectAll("#map-layer").remove()
    //svg.selectAll("map-layer").remove()
    //console.log(selectValue)
    console.log(mapData.features.length)
    for (var i = 0; i < mapData.features.length; i ++){
        var find = []
        if(selectValue == mapData.features[i].properties.NAME){
            var calValue = mapData.features[i]
            find = [calValue]
            //console.log(mapData.features)
            //console.log(find)

            var mapLayer = g.append('g')
                .attr("id",'map-layer')
                .attr("fill","rgb(192, 231, 231)")
                .attr("stroke","black")

            if (calValue && centered !== calValue) {
                var centroid = path.centroid(calValue);
                x = centroid[0];
                y = centroid[1];
                k = 2;
                centered = calValue;
            } else {
                x = width_1/ 2;
                y = height_1 / 2;
                k = 1;
                centered = null;
            }
            
            mapLayer
                .selectAll("path")
                .data(find)
                .enter().append("path")
                .attr("d", path)

            g.transition()
                .duration(750)
                .attr('transform', 'translate(' + width_1 / 2 + ',' + height_1 / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');


            d3.csv("number_table.csv", function(error, data) {
                //console.log(data)
                //console.log(selectValue)
                var datasetPoint = []
                for(var i = 0; i < data.length; i ++){
                    if(data[i].County == selectValue){
                    datasetPoint.push(data[i])
                    }
                }
                //console.log(datasetPoint)
                mapLayer.selectAll("circle")
                    .data(datasetPoint) 
                   .enter()
                    .append("circle")
                   .attr("class","point")  
                   .attr("cx",function(d){
                    //console.log(d)
                    //console.log(d.Latitude)
                        var positionx = projection([d.Longitude,d.Latitude])[0]
                        //console.log(positionx)
                        return positionx
                   })
                   .attr("cy",function(d){
                        var positiony = projection([d.Longitude,d.Latitude])[1]
                        //console.log(positiony)
                        return positiony
                   })  
                   .attr("r",function(d){
                        return (radiusScale(d.Acreage))
                   })
                   .attr("fill","red")
                   .on("mouseover",mouseI)
                   .on("mouseout",mouseO)
                   .on("click",clicked)
                
            })
        }
    }		
}
})

function mouseI(){
    svg.selectAll("circle")
    .transition().duration(500)
        .attr("opacity", 0.1)

        
    d3.select(this)
        //.style('fill', 'orange')
        .transition().duration(500)
        .attr("opacity", 1);

}

function mouseO(){
    svg.selectAll("circle")
    .transition().duration(500)
        .attr("opacity", 1)
        //.attr("fill","black")
}
//dataInital = [[{axis: "Fatalities", value: 5},{axis: "Homes Lost", value: 5},{axis: "oil", value: 6},{axis: "duration", value: 5},{axis: "Complex level", value: 4}]]
function clicked(d){
    console.log(d)
    var dataInput = [[]]
    elem1 = {"axis":"Fatalities", "value":parseFloat(d["Fatalities"])}
    //elem2 = {"axis":"Acreage", "value":parseFloat(d["Acreage"])}
    elem3 = {"axis":"Homes Lost", "value":parseFloat(d["Homes Lost"])}
    elem4 = {"axis":"oil", "value":parseFloat(d["oil"])}
    elem5 = {"axis":"duration", "value":parseFloat(d["duration"])}
    elem6 = {"axis":"Complex level", "value":parseFloat(d["Complex Type"])}
    //console.log(elem1)
    dataInput = [[elem1,elem3,elem4,elem5,elem6]]
    //console.log(d["Other Structures Lost"])
    
    console.log(dataInput)
    RadarChart(".radarChart", dataInput, radarChartOptions);
}

/*
var svg = d3.select(id).append("svg")
.attr("width",  4000)
.attr("height", 4000)
.attr("class", "radar"+id);
//Append a g element		
var g = svg.append("g")
.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
*/

var radarChartOptions = {
	w: width,
	h: height,
	margin: margin,
	maxValue: 0.5,
	levels: 5,
	roundStrokes: true,
	color: color
  };


var margin = {top: 100, right:100, bottom: 100, left: 100},
	width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);


var color = d3.scale.ordinal()
	.range(["#EDC951"]);

dataInital = [[{axis: "Fatalities", value: 0},{axis: "Homes Lost", value: 0},{axis: "oil", value: 0},{axis: "duration", value: 0},{axis: "Complex level", value: 0}]]
RadarChart(".radarChart", dataInital, radarChartOptions);
//////////////////////////radar chart/////////////////////////




function RadarChart(id, data, options) {
	var cfg = {
	 w: 350,				//Width of the circle
	 h: 350,				//Height of the circle
	 margin: {top: 10, right: 10, bottom: 10, left: 10}, //The margins of the SVG
	 levels: 5,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 4, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 2, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10()	//Color function
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format(''),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  4000)
			.attr("height", 4000)
			.attr("class", "radar"+id);
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/1.5+100 + cfg.margin.left) + "," + (cfg.h/1.5+10 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper")
		//.transition().duration(1000);
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)")
		.transition().duration(1000);		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
	
}//RadarChart