from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, MetaData, Table,Column
from flask import Flask, jsonify, render_template
import pandas as pd
import numpy as np
#################################################
# Flask Setup
#################################################
app = Flask(__name__)
#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///healthcare.db")
print("Connected to DB")

metadata = MetaData()
metadata.reflect(engine)
Base = automap_base()
Base.prepare(engine, reflect=True)

# Create our session (link) from Python to the DB
session = Session(bind=engine) 

# Print all the tables
print(Base.classes.keys())

# mapped classes are ready
US_PER_CAPITA =  Base.classes.US_PER_CAPITA
US_POPULATION = Base.classes.US_POPULATION
US_TOTAL_SPENDING = Base.classes.US_TOTAL_SPENDING

PHI_PER_CAPITA =  Base.classes.PHI_PER_CAPITA
PHI_POPULATION = Base.classes.PHI_POPULATION
PHI_TOTAL_SPENDING = Base.classes.PHI_TOTAL_SPENDING

MEDICARE_PER_CAPITA =  Base.classes.MEDICARE_PER_CAPITA
MEDICARE_POPULATION = Base.classes.MEDICARE_POPULATION
MEDICARE_TOTAL_SPENDING = Base.classes.MEDICARE_TOTAL_SPENDING

MEDICAID_PER_CAPITA =  Base.classes.MEDICAID_PER_CAPITA
MEDICAID_POPULATION = Base.classes.MEDICAID_POPULATION
MEDICAID_TOTAL_SPENDING = Base.classes.MEDICAID_TOTAL_SPENDING

ALL_STATES_PER_CAPITA_GDP =  Base.classes.ALL_STATES_PER_CAPITA_GDP
ALL_STATES_GDP = Base.classes.ALL_STATES_GDP
COUNTRIES_HEALTHCARE_SPENDING = Base.classes.COUNTRIES_HEALTHCARE_SPENDING


def getYearPop(table_name, year):
    query = 'SELECT * from ' + table_name
    results = engine.execute(query).fetchall()
    tot_pop_df = pd.DataFrame(results, columns=['Item','State_Name', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014', 'Avg'])
    tot_pop_df = tot_pop_df[['State_Name',year]]
    tot_pop_df.set_index('State_Name', inplace=True)
    population = tot_pop_df.to_dict()
    temp_dict = population[year]
    total_pop = 0
    for key, value in temp_dict.items():
        total_pop += np.asscalar(value)
    return total_pop

def getYearStatePop(table_name, year, state):
    query = 'SELECT * from ' + table_name
    results = engine.execute(query).fetchall()
    tot_pop_df = pd.DataFrame(results, columns=['Item','State_Name', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014', 'Avg'])
    tot_pop_df = tot_pop_df[['State_Name',year]]
    tot_pop_df.set_index('State_Name', inplace=True)
    population = tot_pop_df.to_dict()
    temp_dict = population[year]
    state_pop = 0
    for key, value in temp_dict.items():
        if(key == state):
            state_pop = value
    return state_pop

@app.route("/")
def home():
    """Render Home Page."""
    #return render_template("index.html")
    return render_template("index.html")
    
@app.route('/years')
def years():
    samples = metadata.tables['US_PER_CAPITA'].columns.keys()
    names = samples[2: len(samples)-1]
    return jsonify(names)
    
@app.route('/states')
def states():
    samples = session.query(US_PER_CAPITA.State_Name).all()
    states = [x[0] for x in samples ]
    return jsonify(states)

@app.route('/statesPerCapita/<state>')
def getStatesPerCapita(state):
    s1 = session.query(US_PER_CAPITA).filter(US_PER_CAPITA.State_Name == state).first()
    state_info = vars(s1)
    state_info.pop('_sa_instance_state', None)
    state_info.pop('Average_Annual_Percent_Growth', None)
    state_info.pop('Item', None)
    return jsonify(state_info)

@app.route('/yearlyStatesPerCapita/<year>')
def getYearlyStatesPerCapita(year):
    results = engine.execute('SELECT * from US_PER_CAPITA').fetchall()
    gdp_df = pd.DataFrame(results, columns=['Item','State_Name', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014', 'Avg'])
    gdp_df = gdp_df[['State_Name',year]]
    gdp_df.set_index('State_Name', inplace=True)
    perCapita = gdp_df.to_dict()
    temp_dict = perCapita[year]
    response_dict = {}
    for key, value in temp_dict.items():
        response_dict[key] = np.asscalar(value)
    return jsonify(response_dict)

@app.route('/yearlyStatesPopulation/<year>')
def getYearlyStatesPopulation(year):
    results = engine.execute('SELECT * from US_POPULATION').fetchall()
    gdp_df = pd.DataFrame(results, columns=['Item','State_Name', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014', 'Avg'])
    gdp_df = gdp_df[['State_Name',year]]
    gdp_df.set_index('State_Name', inplace=True)
    perCapita = gdp_df.to_dict()
    temp_dict = perCapita[year]
    response_dict = {}
    for key, value in temp_dict.items():
        response_dict[key] = np.asscalar(value)
    return jsonify(response_dict)

@app.route('/yearlyInsuredPopulation/<year>')
def getYearlyInsuredPopulation(year):
    total_us_pop = getYearPop("US_POPULATION", year)
    total_phi_pop = getYearPop("PHI_POPULATION", year)
    total_medicaid_pop = getYearPop("MEDICAID_POPULATION", year)
    total_medicare_pop = getYearPop("MEDICARE_POPULATION", year)
    total_uninsured_pop = total_us_pop - total_phi_pop - total_medicaid_pop - total_medicare_pop
    response_dict = {'PHI_POPULATION' :  total_phi_pop, 'MEDICAID_POPULATION':  total_medicaid_pop,\
                     'MEDICARE_POPULATION': total_medicare_pop, 'UNINSURED_POPULATION': total_uninsured_pop}
    return jsonify(response_dict)

@app.route('/yearlyInsuredPopulationByState/<year>/<state>')
def getYearlyInsuredPopulationByState(year,state):
    total_us_pop = getYearStatePop("US_POPULATION", year, state)
    total_phi_pop = np.asscalar(getYearStatePop("PHI_POPULATION", year, state))
    total_medicaid_pop = np.asscalar(getYearStatePop("MEDICAID_POPULATION", year, state))
    total_medicare_pop = np.asscalar(getYearStatePop("MEDICARE_POPULATION", year, state))
    total_uninsured_pop = np.asscalar(total_us_pop - total_phi_pop - total_medicaid_pop - total_medicare_pop)
    if total_uninsured_pop < 0:
        total_uninsured_pop = 0
    
    response_dict = {'PHI_POPULATION' :  total_phi_pop, 'MEDICAID_POPULATION':  total_medicaid_pop,\
                     'MEDICARE_POPULATION': total_medicare_pop, 'UNINSURED_POPULATION': total_uninsured_pop}
    return jsonify(response_dict)

if __name__ == '__main__':
    app.run(debug=True)