var listOfStates;
var selectedStates = [];
var selectedYear = 2001;
var stateSelection;

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

    getPerCapitaForSelectedStates();
    displayInsuredPopulationByState();
    getStateGdpThsForSelectedStates(); // Jagatha


}

// state dropdown updated
function updatedStateSelection(state){
    stateSelection = state;

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

function getPerCapitaForSelectedStates(){
    for (i = 0; i < selectedStates.length; i++) { 
        url = "/statesPerCapita/"+selectedStates[i];
        Plotly.d3.json(url, function (error, response) {
            console.log("state gdp resp: ", response);
        });
    }
}


// year dropdown updated
// Jagatha changes Start
// Get GDP and Total Health Spending (THS) data for the selected state 
function getStateGdpThsForSelectedStates(){
        url = "/statesGdpThs/"+ selectedStates[selectedStates.length - 1] ;
        Plotly.d3.json(url, function (error, response) {
            console.log("state gdp total health speanding: ", response);
            updateGdpLinePlot(response);

        });
}

// Plot GDP and THS trend 
function updateGdpLinePlot(data)
{
	var plot = document.getElementById('plot');

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
		
        var layout = { title: '<b>'+ selectedStates[selectedStates.length - 1] + '</b>' + 
                               ' - Growth in State Health Expenditures and <br>' +
                              'Gross Domestic Product (GDP), 2001 - 2014',
                       xaxis: { range: years, title: '<b> Calendar Years </b>' },
                       yaxis: { title: '<b> Annual Percentage Change </b>', linewidth:1 },
                       height: 600
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

    displayInsuredPopulation(year);
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
        popUrl = "/yearlyInsuredPopulationByState/" + selectedYear + "/"+ selectedStates[selectedStates.length - 1];
        Plotly.d3.json(popUrl, function (error, res) {
            
                console.log("year Insured Population by state response", res);
                // update Pie chart  with population
                displayDonutChart(res)
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
            position: "bottom",
            align:"center",
            text: 'Insured Population (Thousands)'
          },
          legend: {
            display: true,
            position: 'right',
            
          }
        }
    });
    
}


var anchors = document.getElementsByTagName("a");

for (var i = 0; i < anchors.length ; i++) {
    anchors[i].addEventListener("click", 
        function (event) {
            event.preventDefault();
            console.log(event.target.attributes[2].nodeValue)
            var anchorID = event.target.attributes[2].nodeValue;
            var stateCheckboxes = Plotly.d3.select(".myStateCheckboxes");
            var stateDropdowns = Plotly.d3.select(".myStateDropdown");

            switch(anchorID){
                case("an1"):
                    displayMap();
                    break;
                case("an2"):
                    displayTrendGraph();
                    break;
                case("an3"):
                    //displayPieChart
                    stateCheckboxes.attr
                    console.log("selectedYear ", selectedYear);
                    displayInsuredPopulation(selectedYear);
                    break;
                case("an4"):
                    displayGDP();
                    break;
                case("an0"):
                    displayTable();

                    break;
                default:
                    console.log("in default case");
                    break;
            }

        }, 
        false);
}



//populate drop down for the first time

populateYears();
populateStates();
poopulateStatesDropdown();
changedYear(selectedYear);
populateCountryTrend() // Jagatha




