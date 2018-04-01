var listOfStates;
var selectedStates = [];
var selectedYear = 2001;
var stateSelection = "Alabama";

var years = []; // Jagatha


// populate the drop down of our years 
function populateYears(){

    $mySelection = Plotly.d3.select("#selYear");
    url = "/years";
    Plotly.d3.json(url, function (error, response) {
        
            console.log(response);

            var data = response
            years = response;
            for( i =0; i< data.length; i++){
                $mySelection.append('option').text(data[i]).property('value', data[i]);
            }

    });        
}

// populate the page with the states and checkboxes
function populateStates(){
    url = "/states";
    $myState = Plotly.d3.select("#myStateList");
    Plotly.d3.json(url, function (error, response) {
        
        console.log(response);
        
        var myData = response;
        listOfStates = response;
        // append United States to topp of the array
        listOfStates.unshift("United States");

        // add check boxes using d3
        d3.select("#myStateList").selectAll("input")
        .data(myData)
        .enter()
        .append('label')
            .attr('for',function(d,i){ return 'a'+i; })
            .text(function(d) { return d; })
            .attr("style", "display: block")
            .attr("class", "myCheckBoxeLabels")                
        .append("input")
            .attr("type", "checkbox")
            .attr("id", function(d,i) { return 'a'+i; })
            .attr("onClick", "changedState(this)")
            .attr('isChecked', "false")
            .attr("class", "myCheckBoxes");
  
    });    
}

// state checkboxes updated
function changedState(val){
    //get id of selected checkbox
    var myId = '#'+val.id;

    //if it is already checked,get the state from listOfStates, uncheck it and remove it from the array of selected states
    if(d3.select(myId).attr('isChecked') == "true"){
        d3.select(myId).attr('isChecked', "false");
        var deSelectedVal = listOfStates[val.id.substr(1)];
        console.log(" deselected state", deSelectedVal);
        var index = selectedStates.indexOf(deSelectedVal);
        if(index > -1){
            selectedStates.splice(index, 1);
        }
        console.log(" selectedStates :");
        console.log(selectedStates);
    }else{
    //else check it, get the state from listOfStates and add it to array of selected states
        d3.select(myId).attr('isChecked', "true");
        console.log(" val ", val);
        var selectedVal = listOfStates[val.id.substr(1)];
        console.log(" selected state", selectedVal);
        selectedStates.push(selectedVal);

        console.log(" selectedStates :");
        console.log(selectedStates);
    }

   // getPerCapitaForSelectedStates();
    displayInsuredPopulationByState();
    getStateGdpThsForSelectedStates(); // Jagatha


}

// state dropdown updated
function updatedStateSelection(state){
    stateSelection = state;
    getStateGdpThsForSelectedStates();
    getPerCapitaForSelectedStates();
    displayInsuredPopulationByState();

}

// populate states dropdown
function poopulateStatesDropdown(){
    $stateSelection = Plotly.d3.select("#selState");
    url = "/states";
    Plotly.d3.json(url, function (error, response) {
        
            console.log("states dropdown" , response);

            var data = response
            for( i =0; i< data.length; i++){
                $stateSelection.append('option').text(data[i]).property('value', data[i]);
            }

    }); 
}



// year dropdown updated
// Jagatha changes Start
// Get GDP and Total Health Spending (THS) data for the selected state 
function getStateGdpThsForSelectedStates(){
        //url = "/statesGdpThs/"+ selectedStates[selectedStates.length - 1] ;
        url = "/statesGdpThs/"+ stateSelection;
        Plotly.d3.json(url, function (error, response) {
            console.log("state gdp total health speanding: ", response);
            updateGdpLinePlot(response);

        });
}

// Plot GDP and THS trend 
function updateGdpLinePlot(data)
{
	var plot = document.getElementById('gdpPlot');

    var trace1 =
		{
			x: years,
			y: data['gdp'],
			mode: 'lines+markers',
            type: 'scatter',
            name: 'GDP',
            marker: { symbol: 1, color: 'red' }
        };
        
    var trace2 =
		{
			x: years,
			y: data['ths'],
			mode: 'lines+markers',
            type: 'scatter',
            name: 'Total Health Spending',
            marker: { symbol: 1, color: 'blue' }
		};
	
		var data = [trace1, trace2];
		
        var layout = { title: '<b>'+ stateSelection + '</b>' + 
                               ' - Growth in State Health Expenditures and <br>' +
                              'Gross Domestic Product (GDP), 2001 - 2014',
                       xaxis: { range: years, title: '<b> Calendar Years </b>' },
                       yaxis: { title: '<b> Annual Percentage Change </b>', linewidth:1 },
                       height: 600,
                       width: 900
                     };

		Plotly.newPlot(plot, data, layout);
}

// populate Country trend 
function populateCountryTrend()
{    
        url = "/countryTrend";
        Plotly.d3.json(url, function (error, response) {
                console.log(response);
                updateCountryTrend(response);
        });        
}

// Plot the history of health care spending for Selected Countries
function updateCountryTrend(data)
{
    var plot = document.getElementById('countryTrend');
    i = 0; trace = [];

    cntryPlotYears = ['2000', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016'];    
    for (const key in data) {
        console.log('country :'+ data[key]);
        trace[i] = {
			x: cntryPlotYears,
			y: data[key],
			mode: 'lines+markers',
            type: 'scatter',
            name: key,
            marker: { symbol: 1 }
        }; 
        i = i+1;      
    }
		var data = trace;
		
        var layout = { title: '<b>'+ 'The History of Health Care Spending, 2000 - 2016' + '</b>',
                       xaxis: { range: cntryPlotYears, title: '<b> Calendar Years </b>', linewidth:1 },
                       yaxis: { title: '<b> Per Capita Spending </b>', linewidth:1 },
                       height: 600,
                       width: 900
                     };

		Plotly.newPlot(plot, data, layout);
}
// Jagatha changes End

function changedYear(year){
    selectedYear = year;
    console.log(" selected year ", year);
    /*
    url = "/yearlyStatesPerCapita/" + year;
   
    Plotly.d3.json(url, function (error, response) {
        
            console.log("year PerCapita response", response);
            // update US Map with percapita
  
    });  
    popUrl = "/yearlyStatesPopulation/" + year;
    Plotly.d3.json(popUrl, function (error, res) {
        
            console.log("year Population response", res);
            // update US Map with population
  
    }); 
    */
    svg_remove();
    buildmaps(year);
    displayInsuredPopulationByState();
    displayTable();
    
    //displayInsuredPopulation(year);
}

function displayInsuredPopulation(year){
    popUrl = "/yearlyInsuredPopulation/" + year;
    Plotly.d3.json(popUrl, function (error, res) {
        
            console.log("year Insured Population response", res);
            // update Pie chart with population
            displayDonutChart(res);
    });
}

function displayInsuredPopulationByState(){
    //for (i = 0; i < selectedStates.length; i++) { 
        popUrl = "/yearlyInsuredPopulationByState/" + selectedYear + "/"+ stateSelection;
        Plotly.d3.json(popUrl, function (error, res) {
            
                console.log("year Insured Population by state response", res);
                // update Pie chart  with population
                displayDonutChart(res);
        });
    //}
}

function displayDonutChart(res){
    var myDataSet = res;

    var myChart = document.getElementById("donut-chart");
    new Chart(myChart, {
        type: 'doughnut',
        data: {
          labels: Object.keys(myDataSet),
          datasets: [{
            label: "Population (Thousands)",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],
            data: Object.values(myDataSet)
          }]
        },
        options: {
          title: {
            display: true,
            position: "top",
            align:"left",
            text: 'Insured Population (Thousands)'
          },
          legend: {
            display: true,
            position: 'right',
            
          }
        }
    });
    
}



/////////////////////////////////////////////////////// display map /////////////////////////////////////////////////

function buildmaps(year) {

    d3.csv("/static/data/US_PER_CAPITA.csv", function(err, data) {

        url = "/years";
        Plotly.d3.json(url, function (error, response) {
        
            // console.log(response);

            var year = response
            for( i =1; i< data.length; i++){
                return data[i];
            }

    });
 
        console.log("data", data);
        var config = {"color1":"#c3e2ff","color2":"#08306B","stateDataColumn":"State_Name","valueDataColumn":year}
        
        var WIDTH = 1000, HEIGHT = 500;
      
        var COLOR_COUNTS = 9;
        
        var SCALE = 0.7;
    
        
        function Interpolate(start, end, steps, count) {
            var s = start,
                e = end,
                final = s + (((e - s) / steps) * count);
            return Math.floor(final);
        }
        
        function Color(_r, _g, _b) {
            var r, g, b;
            var setColors = function(_r, _g, _b) {
                r = _r;
                g = _g;
                b = _b;
            };
        
            setColors(_r, _g, _b);
            this.getColors = function() {
                var colors = {
                    r: r,
                    g: g,
                    b: b
                };
                return colors;
            };
        }
        
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        
        var COLOR_FIRST = config.color1, COLOR_LAST = config.color2;
        
        var rgb = hexToRgb(COLOR_FIRST);
        
        var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);
        
        rgb = hexToRgb(COLOR_LAST);
        var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);
        
        var MAP_CATEGORY = config.stateDataColumn;
        var MAP_VALUE = config.valueDataColumn;
        
        var width = WIDTH,
            height = HEIGHT;
        
        var valueById = d3.map();
        
        var startColors = COLOR_START.getColors(),
            endColors = COLOR_END.getColors();
        
        var colors = [];
        
        for (var i = 0; i < COLOR_COUNTS; i++) {
          var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
          var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
          var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
          colors.push(new Color(r, g, b));
        }
        
        var quantize = d3.scale.quantize()
            .domain([0, 1.0])
            .range(d3.range(COLOR_COUNTS).map(function(i) { return i }));
        
        var path = d3.geo.path();
        
        var svg = d3.select("#canvas-svg").append("svg")
            .attr("width", width)
            .attr("height", height);
        
        d3.tsv("https://s3-us-west-2.amazonaws.com/vida-public/geo/us-state-names.tsv", function(error, names) {
        
        name_id_map = {};
        id_name_map = {};
    
        
        for (var i = 0; i < names.length; i++) {
          name_id_map[names[i].name] = names[i].id;
          id_name_map[names[i].id] = names[i].name;
        }
        console.log("data", data);
        data.forEach(function(d) {
          var id = name_id_map[d[MAP_CATEGORY]];
          valueById.set(id, +d[MAP_VALUE]); 
        });
        
        quantize.domain([d3.min(data, function(d){ return +d[MAP_VALUE] }),
          d3.max(data, function(d){ return +d[MAP_VALUE] })]);
        
        function makeMap(us) {
          svg.append("g")
              .attr("class", "categories-choropleth")
            .selectAll("path")
              .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
              .attr("transform", "scale(" + SCALE + ")")
              .style("fill", function(d) {
                if (valueById.get(d.id)) {
                  var i = quantize(valueById.get(d.id));
                  var color = colors[i].getColors();
                  return "rgb(" + color.r + "," + color.g +
                      "," + color.b + ")";
                } else {
                  return "";
                }
              })
    
              .attr("d", path)
              .on("mousemove", function(d) {
                  var html = "";
        
                  html += "<div class=\"tooltip_kv\">";
                  html += "<span class=\"tooltip_key\">";
                  html += id_name_map[d.id];
                  html += "</span>";
                  html += ": Per_Capita is ";
                  //html += "<span class=\"tooltip_value\">";
                  html += (valueById.get(d.id) ? valueById.get(d.id) : "");
                  html += "";
                  html += "</span>";
                  html += "</div>";
                  
                  $("#tooltip-container").html(html);
                  $(this).attr("fill-opacity", "0.8");
                  $("#tooltip-container").show();
                  
                  var coordinates = d3.mouse(this);
                  
                  var map_width = $('.categories-choropleth')[0].getBoundingClientRect().width;
                  
                  if (d3.event.pageX < map_width / 2) {
                    d3.select("#tooltip-container")
                      .style("top", (d3.event.pageY + 15) + "px")
                      .style("left", (d3.event.pageX + 15) + "px");
                  } else {
                    var tooltip_width = $("#tooltip-container").width();
                    d3.select("#tooltip-container")
                      .style("top", (d3.event.pageY + 15) + "px")
                      .style("left", (d3.event.pageX - tooltip_width - 30) + "px");
                  }
              })
              .on("mouseout", function() {
                      $(this).attr("fill-opacity", "1.0");
                      $("#tooltip-container").hide();
                  });
        
    //               function draw(){
    
    // }
          svg.append("path")
              .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
              .attr("class", "categories")
              .attr("transform", "scale(" + SCALE + ")")
              .attr("d", path);
        }
        
        d3.json("https://s3-us-west-2.amazonaws.com/vida-public/geo/us.json", function(error, us) {
          makeMap(us);
        });
        
        });
      });

  }

  function svg_remove(){
    d3.select("svg").remove();
    // d3.select("#canvas-svg").attr("style", "display: none");
  }



/////////////////////////////////////////////////////// display table /////////////////////////////////////////////////

function displayTable(year) {

    d3.csv("/static/data/US_PER_CAPITA.csv", function(err, data) {

        url = "/years";
        Plotly.d3.json(url, function (error, response) {
        
        var year = response
            for( i =1; i< data.length; i++){
                return data[i];
            }
    
    }); 
    
        console.log(data);
        var sortAscending = true;
            
        function tabulate(data, columns) {
                                    
            var margin = {top: 50, right: 50, bottom: 50, left: 50},
                width = 500 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            var svg = d3.select("body")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("text")
                    .attr("class", "title")
                    .attr("x", (width / 2))             
                    .attr("y", 0 - (margin.top / 2))
                    .attr("text-anchor", "middle")  
                    .style("font-size", "16px") 
                    .style("text-decoration", "underline")  
                    .text("Health Spending Per Capita")
                .append("g")
                    .attr("transform", 
                    "translate(" + margin.left + "," + margin.top + ")");
                             
            var table = d3.select('#perCapitaTable')
                .append('table')
                // .append("foreignObject")
                .attr("width", 400)
                .attr("height", 500)
                .attr("style", "margin-top: 100px")
                .attr("class", "table table-condensed table-striped")
                .style("border-collapse", "collapse")         
                .style("border", "2px black solid"),
                thead = table.append("thead");
            
            var caption = table.append("caption").text("Health Spending Per Capita");
            
            var header = d3.select("svg").append("div").attr("class", "well");
            header.append("h5").text("Dynamic D3 Array of Tables Demo");
            
            var tbody = table.append("tbody");
            
            // append the header row
            var headers = thead.append('tr')
              .selectAll('th')
              .data(columns)
              .enter()
              .append('th')
                .text(function (column) { return column; })
              .on('click', function (d) {
                headers.attr('class', 'header');
                  if (sortAscending) {
                      rows.sort(function(a, b) { return d3.ascending(b[d], a[d]); });
                      sortAscending = false;
                      this.className = 'aes';
                  } else {
                      rows.sort(function(a, b) { return d3.descending(b[d], a[d]); });
                      sortAscending = true;
                      this.className = 'des';
                  }  
                });  
    
            // create a row for each object in the data
            var rows = table.append('tbody').selectAll('tr')
              .data(data).enter()
              .append('tr');

            rows.selectAll('td')
              .data(data, function(d) {
                  return d.name;   
              });

            rows.enter()
              .append('td');
              
            // create a cell in each row for each column
            var cells = rows.selectAll('td')
              .data(function (row) {
                return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })

            cells.enter()
                .append('td')
                .attr("colspan", "1")
                .text(function (d) { return d.value; });
    
          return table;
        
        }      
        // render the table(s)
        tabulate(data, ['State_Name', selectedYear]); // 2 column table 
        });
}

////////////////////////////////////////////// Trend Line graph //////////////////////////////////////////////


function getPerCapitaForSelectedStates(){
 
    var ctx = document.getElementById("lineChart").getContext("2d");
    var state = stateSelection;
    console.log(state)

        url = "/statesPerCapita/" + state
        Plotly.d3.json(url, function (error, response) {
            console.log("state gdp resp: ", response);
            var obj = response
            delete response.State_Name;
            console.log(obj)

           // Random color
            var dynamicColors = function() {
                var r = Math.floor(Math.random() * 255);
                var g = Math.floor(Math.random() * 255);
                var b = Math.floor(Math.random() * 255);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
            
            if (lineChart) {
                lineChart.Destroy()
            }

            var lineChart = new Chart(ctx, {
                type: 'line',
                options: {
                    title: {
                        display: true,
                        fontSize: 14,
                        text: 'Health Care Expenditures per Capita by State of Residence'
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return "$" + Number(tooltipItem.yLabel).toFixed(0).replace(/./g, function(c, i, a) {
                                    return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
                                });
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: function(value, index, values) {
                                    if(parseInt(value) >= 1000){
                                      return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    } else {
                                      return '$' + value;
                                    }
                                }
                            }
                        }]
                    },
                },    
                data: {
                    labels: Object.keys(obj),
                    datasets: [{
                        label: state,
                        fill: false,
                        lineTension: 0,
                        backgroundColor: dynamicColors(),
                        borderColor: dynamicColors(),
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJointStyle: 'miter',
                        data: Object.values(obj),
                    }]                    
                }                
            })  
     });       
}

/////////////////////////////////////////////// anchor elements control//////////////////////////////////////


var anchors = document.getElementsByTagName("a");

for (var i = 0; i < anchors.length ; i++) {
    anchors[i].addEventListener("click", 
        function (event) {
            event.preventDefault();
            console.log(event.target.attributes[2].nodeValue)
            var anchorID = event.target.attributes[2].nodeValue;
            var stateCheckboxes = Plotly.d3.select(".myStateCheckboxes");
            var stateDropdowns = Plotly.d3.select(".myStateDropdown");
            var donut = Plotly.d3.select("#donut-chart");
            var countryTrend = Plotly.d3.select("#countryTrend");
            var gdpPlot = Plotly.d3.select("#gdpPlot");
            var map = Plotly.d3.select("#canvas-svg");
            var lineChart = Plotly.d3.select("#lineChart");
            var perCapitaTable = Plotly.d3.select("#perCapitaTable");


            switch(anchorID){
                case("an1"):
                    // display map
                    map.attr("style", "display: inline");

                    lineChart.attr("style", "display: none");
                    donut.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    buildmaps(selectedYear);
                    svg_remove();
                    break;
                case("an2"):
                    lineChart.attr("style", "display: inline");

                    map.attr("style", "display: none");
                    donut.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    getPerCapitaForSelectedStates();
                    svg_remove();
                    break;
                case("an3"):
                    //displayPieChart

                    donut.attr("style", "display: inline");
                    perCapitaTable.attr("style", "display: none");
                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");

                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    console.log("selectedYear ", selectedYear);
                    displayInsuredPopulation(selectedYear);
                    svg_remove();
                    break;
                case("an4"):
                    //gdp 
                    countryTrend.attr("style", "display: inline");
                    gdpPlot.attr("style", "display: inline");
                    perCapitaTable.attr("style", "display: none");
                    donut.attr("style", "display: none");
                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");

                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    populateCountryTrend();
                    getStateGdpThsForSelectedStates(); 
                    svg_remove();
                    break;
                case("an0"):
                    perCapitaTable.attr("style", "display: inline");
                    stateCheckboxes.attr("style", "display: block");
                    stateDropdowns.attr("style", "display: none");
                    donut.attr("style", "display: none");
                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    displayTable();
                    svg_remove();
                    break;
                default:
                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    donut.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    console.log("in default case");
                    break;
            }

        }, 
        false);
}




//populate drop down for the first time

populateYears();
//populateStates();
poopulateStatesDropdown();
//changedYear(selectedYear);
//populateCountryTrend() // Jagatha




