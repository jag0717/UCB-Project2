var listOfStates;
var selectedStates = [];

// populate the drop down of our html
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

}

function getPerCapitaForSelectedStates(){
    for (i = 0; i < selectedStates.length; i++) { 
        url = "/statesPerCapita/"+selectedStates[i];
        Plotly.d3.json(url, function (error, response) {
            console.log("state gdp resp: ", response);
        });
    }
}


//populate drop down for the first time
populateYears()
populateStates()


