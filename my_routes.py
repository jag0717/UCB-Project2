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

@app.route('/statesGdpThs/<state>')
def getStatesGdpThs(state):
    gdp_query = "SELECT * FROM ALL_STATES_GDP where State_Name = '" + state +"'"
    results = engine.execute(gdp_query).fetchall()
    gdp_df = pd.DataFrame(results, columns=['State_Name', 'Component', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014'])
    gdp_df.set_index('State_Name', inplace=True, )
    gdp_df = gdp_df[['2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014']]
    # gdp_df.head()
    nhs_query = "SELECT * FROM US_TOTAL_SPENDING where State_Name = '" + state +"'"
    results = engine.execute(nhs_query).fetchall()
    nhs_df = pd.DataFrame(results, columns=['Item', 'State_Name', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','annual_growth_perentage'])
    nhs_df.set_index('State_Name', inplace=True, )
    nhs_df = nhs_df[['2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014']]
    # nhs_df.head()
    tmp_gdp_df = gdp_df.iloc[0]
    tmp_gdp_df = tmp_gdp_df.pct_change()
    tmp_gdp_df = list(tmp_gdp_df[1:len(tmp_gdp_df)])
    tmp_nhs_df = nhs_df.iloc[0]
    tmp_nhs_df = tmp_nhs_df.pct_change()
    tmp_nhs_df = list(tmp_nhs_df[1:len(tmp_nhs_df)])
    state_trend = {}
    state_trend['gdp'] = tmp_gdp_df
    state_trend['ths'] = tmp_nhs_df
    return jsonify(state_trend)

@app.route('/countryTrend')	
def getCountryTrend():
    country_list = "('Canada','United Kingdom','United States','Switzerland','Sweden','Australia')"
    query = "SELECT * FROM COUNTRIES_HEALTHCARE_SPENDING where Country IN " + country_list
    results = engine.execute(query).fetchall()
    country_df = pd.DataFrame(results, columns=['Country', '2000', '2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016'])
    country_df.set_index('Country', inplace=True)
    country_list = country_df.index
    country_trend = {}
    for i in range(len(country_list)):
        country_trend[country_df.index[i]] = list(country_df.iloc[i])
        
    print(country_trend)
    return jsonify(country_trend)

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
    
if __name__ == '__main__':
    app.run(debug=True)