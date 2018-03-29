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
    
if __name__ == '__main__':
    app.run(debug=True)