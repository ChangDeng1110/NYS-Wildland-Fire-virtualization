var width = 800,
    height = 500,
    centered;

var lineScale = d3.scale.sqrt().domain([1,10000]).range([10,100])
// Define color scale
var color = d3.scale.linear()
  .domain([1, 20])
  .clamp(true)
  .range(['#fff', '#409A99']);

var projection = d3.geo.mercator()
  .scale(2800)
  // Customize the projection to make the center of Thailand become the center of the map
  //.rotate([-100.6331, -13.2])
  .translate([width+3300, height+2025]);

var path = d3.geo.path()
  .projection(projection);

// Set svg width & height
var svg = d3.select("body").append('svg')
  .attr('width', width)
  .attr('height', height)
  .style("fill","white")

var svg1 = d3.select('body')
    .append('svg')
    .attr('width',350)
    .attr('height',500)
//var g1 = svg1.append('g')
var p = null
var initialText = "New York is a state in the Northeastern, United States. New York was one of the,original thirteen colonies that formed, the United States. With an estimated, 19.54 million residents in 2018, it is the fourth most populous state., In order to distinguish the state from the, city with the same name it is sometimes, referred to as New York State."
//var rect = g1.append('rect').attr('width',40).attr('height',40)
var strs = initialText.split(",")
var text = svg1.append('text')
.style('font-size', '0px')
.attr('x', 150)
.attr('y', 40)
.text(strs)
.attr('fill','black')
.attr('text-anchor', 'middle')

var texts = text.selectAll("tspan")
            .data(strs)
            .enter()
            .append("tspan")
            .style('font-size', '18px')
            .attr("x",text.attr("x"))
            .attr("dy","1.5em")
            .text(function(d){return d})

//var text = svg1.append("text").append("g")


// Add background
svg.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)
  .on('click', clicked);

var g = svg.append('g');

var effectLayer = g.append('g')
  .classed('effect-layer', true);

var mapLayer = g.append('g')
  .classed('map-layer', true);

/*
var dummyText = g.append('text')
  .classed('dummy-text', true)
  .attr('x', 10)
  .attr('y', 30)
  .style('opacity', 0);

var bigText = g.append('text')
  .classed('big-text', true)
  .attr('x', 20)
  .attr('y', 45);

*/

// Load map data
d3.json('cty.json', function(error, mapData) {
  //console.log(mapData)
  var features = mapData.features;
  //console.log(features)
  // Update color scale domain based on data
  color.domain([0, d3.max(features, nameLength)]);

  // Draw each province as a path
  mapLayer.selectAll('path')
      .data(features)
      .enter().append('path')
      .attr('d', path)
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', fillFn)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('click', clicked);
});

// Get province name
function nameFn(d){
  return d && d.properties ? (d.properties.POP2000) : null;
}

// Get province name length
function nameLength(d){
  var n = nameFn(d);
  return n;
}

// Get province color
function fillFn(d){
  return color(nameLength(d));
}

// When clicked, zoom in
function clicked(d) {
    console.log(d)
    p = d
    var x, y, k;

    // Compute centroid of the selected path
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    // Highlight the clicked province
    mapLayer.selectAll('path')
        .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});

    // Zoom
    g.transition()
        .duration(750)
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');

    
    if(p == undefined){
    svg1.selectAll("*").remove()
    //var strs = initialText.split(",")
    //console.log(strs)
    text = svg1.append('text')
        .style('font-size', '0px')
        .attr('x', 150)
        .attr('y', 40)
        .text(strs)
        .attr('fill','black')
        .attr('text-anchor', 'middle')
    //console.log(text)
    texts = text.selectAll("tspan")
            .data(strs)
            .enter()
            .append("tspan")
            .style('font-size', '18px')
            .attr("x",text.attr("x"))
            .attr("dy","1.5em")
            .text(function(d){return d})
    //console.log(text)
    }else{
        svg1.selectAll("*").remove()
        var stringNew = returnContent(d).split(",")
        //var strs = initialText.split(",")
        //console.log(stringNew)
        text = svg1.append('text')
            .style('font-size', '0px')
            .attr('x', 150)
            .attr('y', 40)
            .text(stringNew)
            .attr('fill','black')
            .attr('text-anchor', 'middle')
    
        texts = text.selectAll("tspan")
                .data(stringNew)
                .enter()
                .append("tspan")
                .style('font-size', '18px')
                .attr("x",text.attr("x"))
                .attr("dy","1.5em")
                .text(function(d){return d})
    
    }
}

function mouseover(d){
  // Highlight hovered province
  d3.select(this).style('fill', 'orange');
  
  // Draw effects
  //textArt(nameFn(d));
}

function mouseout(d){
  // Reset province color
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});

  // Remove effect text
  effectLayer.selectAll('text').transition()
    .style('opacity', 0)
    .remove();

  // Clear province name
  //bigText.text('');
}

function returnContent(d){
    if(d != null){
    return ("County name: " + d.properties.NAME + ",State: New York State" + ",Population: "+d.properties.POP2000+",Households: " + d.properties.HOUSEHOLDS + ",Families: "+ d.properties.FAMILIES)
    }
}
