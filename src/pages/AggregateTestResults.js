import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";

let resultOptions = ["positive", "negative", "pending"];

class ViewAggregateTestResults extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aggregateTestResults: [],
            all_locations: [],
            all_housing_types: [],
            all_testing_sites: [],
            filter_location: "All",
            filter_housing_type: "All",
            filter_testing_sites: "All",
            start_date: "",
            end_date: "",
        };

        this.onLocationChange = this.onLocationChange.bind(this);
        this.onHousingTypeChange = this.onHousingTypeChange.bind(this);
        this.onTestingSiteChange = this.onTestingSiteChange.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.reset = this.reset.bind(this);
    }

    async componentDidMount() {
        await this.onFilter();

        // get all locations
        let allLocations = [];
        allLocations.push("East");
        allLocations.push("West");
        allLocations.unshift("All");
        this.setState({ all_locations: allLocations });

        // get all housing types
        let housingTypes = [];
        housingTypes.push("Student Housing");
        housingTypes.push("Greek Housing");
        housingTypes.push("Off-campus Appartment");
        housingTypes.push("Off-campus House");
        housingTypes.unshift("All");
        this.setState({ all_housing_types: housingTypes });

        // get all site names
        let allSiteNames = await makeAPICall("testsitenames", {});

        let tempSites = [];
        for (let key in allSiteNames.data.sites) {
            tempSites.push(allSiteNames.data.sites[key]);
        }
        tempSites.unshift("All");
        this.setState({ all_testing_sites: tempSites });
    }

    onLocationChange(event) {
        event.preventDefault();
        this.setState({ filter_location: event.target.value });
    }

    onHousingTypeChange(event) {
        event.preventDefault();
        this.setState({ filter_housing_type: event.target.value });
    }

    onTestingSiteChange(event) {
        event.preventDefault();
        this.setState({ filter_testing_sites: event.target.value });
    }

    onStartDateChange(event) {
        event.preventDefault();
        this.setState({ start_date: event.target.value });
    }

    onEndDateChange(event) {
        event.preventDefault();
        this.setState({ end_date: event.target.value });
    }

    async onFilter() {
        let response = await makeAPICall("aggregatetestresults", {
            location:
                this.state.filter_location === "" ||
                this.state.filter_location === "All"
                    ? null
                    : this.state.filter_location,
            housing:
                this.state.filter_housing_type === "" ||
                this.state.filter_housing_type === "All"
                    ? null
                    : this.state.filter_housing_type,
            testing_site:
                this.state.filter_testing_sites === "" ||
                this.state.filter_testing_sites === "All"
                    ? null
                    : this.state.filter_testing_sites,
            start_date:
                this.state.start_date === "" ? null : this.state.start_date,
            end_date: this.state.end_date === "" ? null : this.state.end_date,
        });

        let tempAggregateTestResults = [];
        for (let key in response.data) {
            tempAggregateTestResults.push(response.data[key]);
        }
        this.setState({ aggregateTestResults: tempAggregateTestResults });
    }

    async reset() {
        this.setState(
            {
                filter_location: "All",
                filter_housing_type: "All",
                filter_testing_sites: "All",
                start_date: "",
                end_date: "",
            },
            () => {
                // have to do this in a callback or else you
                // might refilter before all the states are set rip
                this.onFilter();
            }
        );
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        // add in missing rows if they were zero
        let results = {};

        this.state.aggregateTestResults.forEach((item) => {
            results[item.test_status] = item;
        });

        resultOptions.forEach((option) => {
            if (!results[option]) {
                results[option] = {
                    test_status: option,
                    num_of_test: 0,
                    percentage: 0,
                };
            }
        });

        let jsxResults = [
            results["positive"],
            results["negative"],
            results["pending"],
        ];

        let aggregateTestResultsRow = jsxResults.map((item) => (
            <tr key={item.test_status}>
                <td>{item.test_status}</td>
                <td>{item.num_of_test}</td>
                <td>{Number(item.percentage).toFixed(2) + "%"}</td>
            </tr>
        ));

        var totalTests = 0;
        var totalPercentage = 0;
        this.state.aggregateTestResults.map((item) => (
            <tr key={item.test_status}>
                {(totalTests += item.num_of_test)}
                {(totalPercentage += Number(item.percentage))}
            </tr>
        ));

        let locationOptions = this.state.all_locations.map((item) => (
            <option key={item}>{item}</option>
        ));

        let housingOptions = this.state.all_housing_types.map((item) => (
            <option key={item}>{item}</option>
        ));

        let testingSiteOptions = this.state.all_testing_sites.map((item) => (
            <option key={item}>{item}</option>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Aggregate Test Results</div>
                    <div className="filter-wrapper">
                        <div>
                            <div>Location</div>
                            <select
                                onChange={this.onLocationChange}
                                value={this.state.filter_location}
                            >
                                {locationOptions}
                            </select>
                        </div>

                        <div>
                            <div>Housing</div>
                            <select
                                onChange={this.onHousingTypeChange}
                                value={this.state.filter_housing_type}
                            >
                                {housingOptions}
                            </select>
                        </div>

                        <div>
                            <div>Testing Site</div>
                            <select
                                onChange={this.onTestingSiteChange}
                                value={this.state.filter_testing_sites}
                            >
                                {testingSiteOptions}
                            </select>
                        </div>

                        <div>
                            <div>Date Processed (YYYY-MM-DD)</div>
                            <input
                                type="date"
                                onChange={this.onStartDateChange}
                                max={
                                    this.state.end_date === ""
                                        ? ""
                                        : this.state.end_date
                                }
                                className="small-date-input"
                                value={this.state.start_date}
                            />{" "}
                            to{" "}
                            <input
                                type="date"
                                onChange={this.onEndDateChange}
                                min={
                                    this.state.start_date === ""
                                        ? ""
                                        : this.state.start_date
                                }
                                className="small-date-input"
                                value={this.state.end_date}
                            />
                        </div>

                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <td>Total</td>
                                        <td>{totalTests}</td>
                                        <td>
                                            {totalPercentage.toFixed(2) + "%"}
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>{aggregateTestResultsRow}</tbody>
                            </table>
                        </div>

                        <div className="form-submit-wrapper">
                            <Link to="/home">Back (Home)</Link>
                            <button
                                className="theme-button"
                                onClick={this.reset}
                            >
                                Reset
                            </button>
                            <button
                                className="theme-button"
                                onClick={this.onFilter}
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewAggregateTestResults;
