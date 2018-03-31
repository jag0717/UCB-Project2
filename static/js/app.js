var listOfStates;
var selectedStates = [];
var years = []; // Jagatha

// populate the drop down of our html
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

        d3.select("#myStateList").selectAll("input")
        .data(myData)
        .enter()
        .append('label')
            .attr('for',function(d,i){ return 'a'+i; })
            .text(function(d) { return d; })
            .attr("style", "display: block")                
        .append("input")
            .attr("type", "checkbox")
            .attr("id", function(d,i) { return 'a'+i; })
            .attr("onClick", "changedState(this)")
            .attr('isChecked', "false");
  
    });    
}

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
    getStateGdpThsForSelectedStates(); // Jagatha

}

function getPerCapitaForSelectedStates(){
    for (i = 0; i < selectedStates.length; i++) { 
        url = "/statesPerCapita/"+selectedStates[i];
        Plotly.d3.json(url, function (error, response) {
            console.log("state gdp resp: ", response);
        });
    }
}

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
    console.log(" selected year ", year);
    url = "/yearlyStatesPerCapita/" + year;
   
    Plotly.d3.json(url, function (error, response) {
        
            console.log("year response", response);
            // update US Map
  
    });    
}


//populate drop down for the first time
populateYears()
populateStates()
populateCountryTrend() // Jagatha