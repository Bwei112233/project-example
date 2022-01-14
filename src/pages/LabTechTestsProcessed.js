import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ViewTestsProcessed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            testsProcessed: [],
            originalOrder: [],
            lastSorted: "",
            all_test_results: [],
            filter_test_result: "All",
            start_date: "",
            end_date: "",
        };

        this.onColumnClicked = this.onColumnClicked.bind(this);
        this.onTestResultChange = this.onTestResultChange.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.reset = this.reset.bind(this);
    }

    async componentDidMount() {
        await this.onFilter();

        //get all test results
        let allTestResults = [];
        allTestResults.push("positive");
        allTestResults.push("negative");
        allTestResults.unshift("All");
        this.setState({ all_test_results: allTestResults});
    }

    onColumnClicked(columnName) {
        if ( columnName === "dateTested") {
            let tes = this.state.testsProcessed;

            if (!this.state.lastSorted.includes("dateTested")) {
                tes.sort((a, b) => this.sort(moment(a.test_date), moment(b.test_date)));
                this.setState({ lastSorted: "dateTested"});
                this.setState({ testsProcessed: tes});
            } else if (this.state.lastSorted === "dateTested") {
                tes.sort((a, b) => this.sort(moment(b.test_date), moment(a.test_date)));
                this.setState({ lastSorted: "dateTested-desc"});
                this.setState({ testsProcessed: tes});
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ testsProcessed: this.state.originalOrder.slice(),});
            }
        } else if (columnName === "dateProcessed") {
            let tes = this.state.testsProcessed;

            if (!this.state.lastSorted.includes("dateProcessed")) {
                tes.sort((a, b) => this.sort(moment(a.process_date), moment(b.process_date)));
                this.setState({ lastSorted: "dateProcessed"});
                this.setState({ testsProcessed: tes});
            } else if (this.state.lastSorted === "dateProcessed") {
                tes.sort((a, b) => this.sort(moment(b.process_date), moment(a.process_date)));
                this.setState({ lastSorted: "dateProcessed-desc"});
                this.setState({ testsProcessed: tes});
            } else {
                this.setState({ lastSorted: ""});
                this.setState({ testsProcessed: this.state.originalOrder.slice(),});
            }
        } else if (columnName === "testResult") {
            let tes = this.state.testsProcessed;

            if (!this.state.lastSorted.includes("testResult")) {
                tes.sort((a, b) => this.sort(a.test_status, b.test_status));
                this.setState({ lastSorted: "testResult"});
                this.setState({ testsProcessed: tes});
            } else if (this.state.lastSorted === "testResult") {
                tes.sort((a, b) => this.sort(b.test_status, a.test_status));
                this.setState({ lastSorted: "testResult-desc"});
                this.setState({ testsProcessed: tes});
            } else {
                this.setState({ lastSorted: ""});
                this.setState({ testsProcessed: this.state.originalOrder.slice(),});
            }
        }
    }

    sort(a, b) {
        if (a == null) {
            return 1;
        }

        if (b == null) {
            return -1;
        }

        if (a < b) {
            return -1;
        }

        if (a > b) {
            return 1;
        }

        return 0;
    }

    onTestResultChange(event) {
        event.preventDefault();
        this.setState({ filter_test_result: event.target.value });
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
        let response = await makeAPICall("testsprocessed", {
            start_date:
                this.state.start_date === "" ? null : this.state.start_date,
            end_date:
                this.state.end_date === "" ? null : this.state.end_date,
            test_status:
                this.state.filter_test_result === "" ||
                this.state.filter_test_result === "All"
                    ? null
                    : this.state.filter_test_result,
            lab_tech_username: 
                localStorage.getItem("username")
        });

        let tempTestsProcessed = [];
        for (let key in response.data) {
            tempTestsProcessed.push(response.data[key]);
        }
        this.setState({ testsProcessed: tempTestsProcessed});
        // save the original order for when sorting is unselected?
        this.setState({ originalOrder: tempTestsProcessed.slice() });
    }

    async reset() {
        this.setState(
            {
                filter_test_result: "All",
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

        // if not a labtech thennnnnnnn push home
        if (!localStorage.getItem("roles").includes("labtech")) {
            return <Redirect push to="/home" />;
        }

        let testsProcessedRow = this.state.testsProcessed.map((item) => (
            <tr key={item.test_id}>
                <td>{item.test_id}</td>
                <td>
                    <Link
                        to={
                            "/explore-pool-result/" + item.pool_id
                        }
                        className="theme-link"
                    >
                        {item.pool_id}
                    </Link>
                </td>
                <td>{moment(item.test_date).format("M/D/YYYY")}</td>
                <td>{moment(item.process_date).format("M/D/YYYY")}</td>
                <td>{item.test_status}</td>
            </tr>
        ));

        let testResultOptions = this.state.all_test_results.map((item) => (
            <option key={item}>{item}</option>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Lab Tech Tests Processed</div>
                    <div className="filter-wrapper">
                        <div>
                            <div>Date Tested (YYYY-MM-DD)</div>
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
                        <div>
                            <div>Test Result</div>
                            <select
                                onChange={this.onTestResultChange}
                                value={this.state.filter_test_result}
                            >
                                {testResultOptions}
                            </select>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Test ID#</td>
                                    <td>Pool ID</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted === "dateTested"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted === "dateTested-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("dateTested");
                                        }}>Date Tested</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted === "dateProcessed"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted === "dateProcessed-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("dateProcessed");
                                        }}>Date Processed</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted === "testResult"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted === "testResult-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("testResult");
                                        }}>Result</td>
                                </tr>
                            </thead>
                            <tbody>{testsProcessedRow}</tbody>
                        </table>
                    </div>
                    <div className="form-submit-wrapper">
                        <Link to="/home">Back (Home)</Link>
                        <button className="theme-button" onClick={this.reset}>
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
        );
    }
}

export default ViewTestsProcessed;
