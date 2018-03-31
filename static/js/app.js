var listOfStates;
var selectedStates = [];
var selectedYear = 2001;
var stateSelection;

// populate the drop down of our years 
function populateYears(){

    $mySelection = Plotly.d3.select("#selYear");
    url = "/years";
    Plotly.d3.json(url, function (error, response) {
        
            console.log(response);

            var data = response
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


