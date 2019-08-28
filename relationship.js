var timeSet = []
function unique5(array){
    var r = [];
    for(var i = 0, l = array.length; i < l; i++) {
      for(var j = i + 1; j < l; j++)
        if (array[i] === array[j]) j = ++i;
      r.push(array[i]);
    }
    return r;
  }

var temp = {}

function draw(ID){

    var width = 400,
    height = 400,
    margin = 40;

    $("#bubbleChart").empty();
    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);

    
    d3.select("#bubbleChart")
        .append("svg")
        .attr("stroke","black")
        .attr("stroke-width",2)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "primarySVG")
    
    // step one: get all the circles to the middle
    // step two: dont let them collide
    var color = d3.scaleLinear()
        .domain([1, 100])
        .clamp(true)
        .range(['#fff', '#409A99']);
    //var color = d3.scaleOrdinal(d3.schemeCategory20c); 
    
    var radiusScale = d3.scaleSqrt().domain([1,3000]).range([1,200])
    var simulation = d3.forceSimulation()
        .force("x",d3.forceX(width/2).strength(0.1))
        .force("y",d3.forceY(height/2).strength(0.1))
        .force("collide",d3.forceCollide(function(d){
            return radiusScale(d["values"]["length"]) + 5
    }))



 
    d3.csv("ten_table.csv", function(error, data) {
        console.log(data)
    var svg1 = d3.select("#bubbleChart")
        .append("svg")
        .attr("stroke","black")
        .attr("stroke-width",0.5)
        .style("fill","black")
        .attr("width", 650)
        .attr("height", height)
        .append("g")
        .attr("id", "secondSVG")
        .attr("width", 650)
        .attr("height", 600)
        .attr("transform", "translate(" + width+ "," + height / 2 + ")")
        

      svg1.append("g")
        .attr("class", "slices")
        .attr("width", 650)
        .attr("height", height)


        timeSet = []
        for (var i = 0; i < data.length; i ++){
            timeSet[i] = data[i]["year"]
        }
        timeSet = unique5(timeSet)
        //console.log(timeSet)
        var svg = d3.select("#primarySVG")
        var padding = 4;
    var sumstat = d3.nest() 
        .key(function(d) { 
            if (ID == "Ownership"){
                return d["Ownership"]
            }else if (ID == "NFFL-Fuel-Model"){
                return d['NFFL-Fuel-Model']
            }else{
                return d["Fire-Report-Method"]
            }
        })
        .entries(data); 

    
    //console.log(sumstat)
    
    function ticked(){
        circles.attr("cx",function(d){
            return d.x
        })
        .attr("cy",function(d){
            return d.y
        })
    }
    
    simulation.nodes(sumstat)
    .on("tick",ticked)

    pieChart(sumstat[0],svg1)

    var circles = svg.selectAll(".owner")
        .data(sumstat)
        .enter()
        .append("circle")
        .attr("class","owner")
        .attr("r",function(d){
        return radiusScale(d["values"]["length"])
        })
        .attr("fill", function(d) {
            var sum = 0
            for(var i = 0; i < d.values.length; i ++){
                sum = sum + parseFloat(d.values[i].Acreage)
            }
            //console.log(sum/d.values.length)
            return color(sum/d.values.length)
        })
        .on("click",function(d){
            console.log(d)
            pieChart(d,svg1)
          })

        .on("mouseover",function(thisElement){
            svg.selectAll("circle")
                .attr("opacity", 0.3)

            d3.select(this) // hightlight the on hovering on
                .attr("opacity", 1)


            tooltip.html("Type: "+thisElement.key+"<br />"+"Fire Number: "+thisElement.values.length)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity",1.0);
        })
        .on("mouseout", function(d, index){
          svg.selectAll("circle")
              .attr("opacity", 1) // grey out all circles
            tooltip.style("opacity",0.0);

        })

    //console.log(sumstat[2])
    })
    ///////////////////////////////////////pie chart////////////////////
}



var margin = {top: 5, right: 5, bottom: 5, left: 5},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var radius = Math.min(width, height) / 2;
var key = function(d){ return d.data.label; };
var arc = d3.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

var outerArc = d3.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

//svg1.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
var checkInside = ["Equipment", "Prescribed Fire", "Miscellaneous", "Debris Burning",
"Smoking", "Lightning","Power line","Incendiary","Railroad","Children","Campfire","Fireworks","Structure"]

var color1 = d3.scaleOrdinal()
    .domain(["Equipment", "Prescribed Fire", "Miscellaneous", "Debris Burning",
        "Smoking", "Lightning","Power line","Incendiary","Railroad","Children","Campfire","Fireworks","Structure"])
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00","#ecf4ef","#e3d4d4","#450e3e","#ffffd0","#b2b5b8","#ff9ca6"]);
    
function pieChart(data,picture){
    var inputData = data.values

    //var width = 450
    //height = 450
    //margin = 40

    var dataset1 = d3.nest() 
        .key(function(d) {return d.Cause;})
        .entries(inputData);
    
    for (var i = 0; i < dataset1.length; i ++){
        dataset1[i].value = dataset1[i].values.length
    }

    //console.log(dataset1)
    var keysFound = []
    var examData = {}
    for(var i = 0; i < dataset1.length; i++){
        examData[(dataset1[i].key)] = dataset1[i].value
    }
    keysFound = Object.keys(examData)
    valuesFound = Object.values(examData)
    var newInputIn =[]
    for(var i = 0; i < keysFound.length; i++){
        var newnew = {}
        //console.log(keysFound[i])
        newnew.label = keysFound[i]
        newnew.value = valuesFound[i]
        newInputIn.push(newnew)
    }

    //console.log(keysFound)
    //console.log(newInputIn)
    var finalInputValue = newInputIn
    for(var k = 0; k < 13; k ++){
        //console.log(checkInside)
        //console.log(keysFound[k])
        var returnValue = false
        var newnew = {}
        for(var j = 0; j < keysFound.length; j ++){
            //console.log(checkInside[j])
            //console.log(keysFound[k])
            if(checkInside[k] == keysFound[j]){
                //console.log(checkInside[j])
                //console.log(keysFound[k])
                returnValue = true
                break;
            }
        }
        //console.log(returnValue)
        if(returnValue == false){
            newnew.label = checkInside[k]
            newnew.value = 0
            finalInputValue.push(newnew)
        }
        //console.log(newnew)
    }
    //console.log(finalInputValue)



    change(finalInputValue,picture)
}

    var pie = d3.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

    function change(data,svg1) {
    
        /* ------- PIE SLICES -------*/
        //console.log(pie(data))
        var slice = svg1.select(".slices").selectAll("path.slice")
            .data(pie(data),key);

        var tooltip1 = d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);

        slice.enter()
            .insert("path")
            .style("stroke-width", "1.5px")
            .style("stroke", function(d){
                return "black"
            })
            .style("fill", function(d) { return color1(d.data.label); })
            .attr("class", "slice")
            .on("mouseover",function(d){
                console.log(d)
                svg1.selectAll("path")
                .attr("opacity", 0.1)

                d3.select(this) // hightlight the on hovering on
                    .attr("opacity", 1)

                tooltip1.html("Fire Cause: "+d.data.label+"<br />"+"Fire Number: "+d.data.value)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity",1.0);
                
            })
            .on("mouseout", function(d, index){
                svg1.selectAll("path")
                    .attr("opacity", 1) // grey out all circles

                tooltip1.style("opacity",0.0);
      
              }); 
    
        slice		
            .transition().duration(1000)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return arc(interpolate(t));
                };
            })
    
        slice.exit()
            .remove();
    };
    
draw("Ownership")
$("label.ratingBtn").click(function() {
    draw(this.id);
});