var listOfStates;
var selectedStates = [];
var selectedYear = 2001;
var stateSelection = "Alabama";

var years = []; // Jagatha
var tableData = []; 
// var perCapitaTable = Plotly.d3.select("#perCapitaTable"); 
//    perCapitaTable.attr("style", "display: none");  // Not to display table on page load                  
var $tbody = document.querySelector('tbody');

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
    getInsuredPopulationByState();
    getHCSpendingByState();
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
                       yaxis: { title: '<b> Per Capita Spending (in $) </b>', linewidth:1 },
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
    getInsuredPopulationByState();
    getHCSpendingByState();
    displayTable(selectedYear);

    
}
/*
function displayInsuredPopulation(year){
    popUrl = "/yearlyInsuredPopulation/" + year;
    Plotly.d3.json(popUrl, function (error, res) {
        
            console.log("year Insured Population response", res);
            // update Pie chart with population
            displayDonutChart(res);
    });
}
*/
//////////////////////////////////////////////////// HC Stats //////////////////////////////////////////////

function getInsuredPopulationByState(){
    popUrl = "/yearlyInsuredPopulationByState/" + selectedYear + "/"+ stateSelection;
    Plotly.d3.json(popUrl, function (error, pop_resp) {
        
            console.log("year Insured Population by state response", pop_resp);
            popUrl = "/yearlyPerCapitaByState/" + selectedYear + "/"+ stateSelection;
            Plotly.d3.json(popUrl, function (error, pc_resp) {
                
                    console.log("year Per capita by state response", pc_resp);
                    // update Pie chart  with population and percapita
                displayHCStatsChart(pop_resp, pc_resp);
            });
            
    }); 
}

function displayHCStatsChart(pop_resp, pc_resp){
    //var myDataSet = res;
    console.log("pop_resp ", pop_resp);
    console.log("pc_resp ", pc_resp);
    
    var myChart = document.getElementById("hc-summary-chart");
    var trace1 =
    {
        x: [0.5, 1.5, 2.5],
        y: Object.values(pop_resp),
        text: ['Population', 'Population', 'Population'],
        hoverinfo : "y+text",
        type: 'bar',
        //width: [0.8, 0.8, 0.8],
        name: 'Population',
        marker: { symbol: 1, color: 'red' , opacity: 0.6}
    };
    
    var trace2 =
    {
        x: [1, 2, 3],
        y: Object.values(pc_resp),
        text: ['Per Capita', 'Per Capita', 'Per Capita'],
        yaxis: "y2",
        hoverinfo : "y+text",
        type: 'bar',
        name: 'Per Capita',
        marker: { symbol: 1, color: 'blue' , opacity: 0.6}
    };

    var data = [trace1, trace2];
    
    var layout = { title: '<b>'+"Population and Per Capita Spending for <br>"+ stateSelection+" in the year "+ selectedYear +'</b><br>',
                   height: 600,
                   width: 900,
                   barmode: 'group',
                   bargap: 0.5,
                   bargroupgap: 0.05,
                   legend: {
                    x: 1000,
                    y: 1.1
                   },
                   xaxis: {showticklabels: true, tickvals:["0.75", "1.8", "2.75"],ticktext: ["Medicaid", "Medicare", "Private"]},
                   yaxis: {title: " Population (in thousands)"},
                   yaxis2: {
                     title: "Per capita spending ($)",
                     overlaying: "y",
                     side: "right"
                   }
                 };
    
    Plotly.newPlot(myChart, data, layout);   
    
}

function getHCSpendingByState(){
    popUrl = "/yearlyHCSpendingByState/" + selectedYear + "/"+ stateSelection;
    Plotly.d3.json(popUrl, function (error, hcspending_resp) {
        
            console.log("year HCSpending by state response", hcspending_resp);
            displayHCSpendingPieChart(hcspending_resp);
           
            
    }); 
}

function displayHCSpendingPieChart(hcspending_resp){
    console.log("hcspending_resp ", hcspending_resp);
    var total_spending = hcspending_resp['TOTAL'];
    delete hcspending_resp['TOTAL'];
    var myChart = document.getElementById("hc-spending-chart");
    
    var trace1 =
    {
        labels: Object.keys(hcspending_resp),
        values: Object.values(hcspending_resp),
        type: 'pie',
        textfont: {
            size: 18,
            color: 'white'
        },
        marker: {
            colors: ['rgb(0, 76, 153)', 'rgb(0, 128, 255)', 'rgb(153, 204, 255)'],
            opacity: 0.6
          }
    };

    var data = [trace1];
    
    var layout = { 
                   title: "<b> Total Health Care Spending : $"+ total_spending+"  (in Millions) <br> for " +  stateSelection+" in the year "+ selectedYear +'</b><br>',
                   height: 600,
                   width: 900
                 };

    Plotly.newPlot(myChart, data, layout);   
    
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

          svg.append("path")
              .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
              .attr("class", "categories")
              .attr("transform", "scale(" + SCALE + ")")
              .attr("d", path);

          svg.append("text")
              .attr("x", width/2.7 )
              .attr("y", height - 10)
              .style("font-weight", "bold")
              .style("font-size", "18px")
              .style("text-anchor", "middle")
              .text("'Healthcare per capita' of each state in US - " + year);
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
 
           var lineChart = new Chart(ctx, {
                 type: 'line',
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
                         data: Object.values(obj)
                     }]                    
                },
                 options: {
                     title: {
                         display: true,
                         fontSize: 15,
                         text: 'Personal Health Care Expenditures per Capita by State 2001 - 2014 Trend'
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
                             },
                             scaleLabel: {
                                 display: true,
                                 labelString: 'Health Spending per Capita ($M)',
                                 fontStyle: 'bold',
                                 fontSize: '12',
                               }
                         }],
                         xAxes: [{
                             scaleLabel: {
                                 display: true,
                                 labelString: 'Years',
                                 fontStyle: 'bold',
                                 fontSize: '12',
                               }
                         }]
                      }
                 }  
            })
     });
     
 }
/*
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

           // Create our number formatter.
            var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            });

           var lineChart = new Chart(ctx, {
                type: 'line',
                options: {
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
                        data: Object.values(obj)
                    }]                    
                }
            })
    });
    
}
*/

/////////////////////////////////////////////////////// display table /////////////////////////////////////////////////

function displayTable(year) {
    
        url = "/yearlyStatesPerCapita/" + year;
        text = "";
        Plotly.d3.json(url, function (error, response)
        {     
            console.log("year PerCapita response", response);
            tableData = response;          
            $tbody.innerHTML = '';
            console.log("Table Data: " + tableData);
                for (var i = 0; i < tableData.length; i++)
                {
                    // Get get the current data object and its fields
                    var data = tableData[i];
                    var fields = Object.keys(data);
                    // Create a new row in the tbody, set the index to be i + startingIndex
                    var $row = $tbody.insertRow(i);
                    for (var j = 0; j < fields.length; j++) {
                      // For every field in the data object, create a new cell at set its inner text to be the current value 
                      var field = fields[j];
                      var $cell = $row.insertCell(j);
                      $cell.innerText = data[field];
                    }
                }
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
            var countryTrend = Plotly.d3.select("#countryTrend");
            var gdpPlot = Plotly.d3.select("#gdpPlot");
            var map = Plotly.d3.select("#canvas-svg");
            var lineChart = Plotly.d3.select("#lineChart");
            var hcSummaryChart = Plotly.d3.select("#hc-summary-chart");
            var hcSpendingChart = Plotly.d3.select("#hc-spending-chart");
            var perCapitaTable = Plotly.d3.select("#perCapitaTable"); 
            
            switch(anchorID){
                case("an-map"):
                    // display map
                    map.attr("style", "display: inline");

                    lineChart.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    hcSummaryChart.attr("style", "display: none");
                    hcSpendingChart.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    
                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    buildmaps(selectedYear);
                    svg_remove();
                    break;
                case("an-trend"):
                    lineChart.attr("style", "display: inline");

                    map.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    hcSummaryChart.attr("style", "display: none");
                    hcSpendingChart.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    
                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    getPerCapitaForSelectedStates();
                    svg_remove();
                    break;
                case("an-stats"):
                    //displayPieChart

                    hcSummaryChart.attr("style", "display: inline");
                    hcSpendingChart.attr("style", "display: inline");

                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    
                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    getInsuredPopulationByState();
                    getHCSpendingByState();
                    svg_remove();
                    break;
                case("an-gdp"):
                    //gdp 
                    countryTrend.attr("style", "display: inline");
                    gdpPlot.attr("style", "display: inline");

                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    hcSummaryChart.attr("style", "display: none");
                    hcSpendingChart.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    
                    stateCheckboxes.attr("style", "display: none");
                    stateDropdowns.attr("style", "display: inline");
                    populateCountryTrend();
                    getStateGdpThsForSelectedStates(); 
                    svg_remove();
                    break;
                case("an-table"):
                    stateCheckboxes.attr("style", "display: block");
                    stateDropdowns.attr("style", "display: none");
                    displayTable(selectedYear);

                    perCapitaTable.attr("style", "display: inline");
                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");              

                    break;
                default:
                    lineChart.attr("style", "display: none");
                    map.attr("style", "display: none");
                    countryTrend.attr("style", "display: none");
                    gdpPlot.attr("style", "display: none");
                    hcSummaryChart.attr("style", "display: none");
                    hcSpendingChart.attr("style", "display: none");
                    perCapitaTable.attr("style", "display: none");
                    
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
displayTable(selectedYear);