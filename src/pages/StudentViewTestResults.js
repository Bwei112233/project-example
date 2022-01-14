import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class StudentViewTestResults extends Component {
    constructor(props) {
        super(props);
        this.state = {
            testResults: [],
            originalOrder: [],
            lastSorted: "",
            status: "All",
            startDate: "",
            endDate: "",
        };

        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.sortColumn = this.sortColumn.bind(this);
        this.filter = this.filter.bind(this);
        this.reset = this.reset.bind(this);
    }

    async componentDidMount() {
        await this.filter();
    }

    async handleStatusChange(event) {
        event.preventDefault();
        this.setState({ status: event.target.value });
        let response = await makeAPICall("studentviewresults", {
            username: localStorage.getItem("username"),
            test_status:
                event.target.value === "" ||
                    event.target.value === "All"
                    ? null
                    : event.target.value,
            start_date:
                this.state.startDate === "" ? null : this.state.startDate,
            end_date:
                this.state.endDate === "" ? null : this.state.endDate,
        });

        let temp = [];
        for (let key in response.data) {
            temp.push(response.data[key]);
        }
        this.setState({ testResults: temp });
        this.setState({ originalOrder: temp.slice() });
    }

    async handleStartDateChange(event) {
        event.preventDefault();
        this.setState({ startDate: event.target.value });
        let response = await makeAPICall("studentviewresults", {
            username: localStorage.getItem("username"),
            test_status:
                this.state.status === "" ||
                    this.state.status === "All"
                    ? null
                    : this.state.status,
            start_date:
                event.target.value === "" ? null : event.target.value,
            end_date:
                this.state.endDate === "" ? null : this.state.endDate,
        });

        let temp = [];
        for (let key in response.data) {
            temp.push(response.data[key]);
        }
        this.setState({ testResults: temp });
        this.setState({ originalOrder: temp.slice() });
    }

    async handleEndDateChange(event) {
        event.preventDefault();
        this.setState({ endDate: event.target.value });
        let response = await makeAPICall("studentviewresults", {
            username: localStorage.getItem("username"),
            test_status:
                this.state.status === "" ||
                    this.state.status === "All"
                    ? null
                    : this.state.status,
            start_date:
                this.state.startDate === "" ? null : this.state.startDate,
            end_date:
                event.target.value === "" ? null : event.target.value,
        });

        let temp = [];
        for (let key in response.data) {
            temp.push(response.data[key]);
        }
        this.setState({ testResults: temp });
        this.setState({ originalOrder: temp.slice() });
    }

    sortColumn(col) {
        if (col === "timeslot") {
            let results = this.state.testResults;

            if (!this.state.lastSorted.includes("timeslot")) {
                results.sort(
                    (a, b) => this.sort(a.timeslot_date, b.timeslot_date));
                this.setState({ lastSorted: "timeslot" });
                this.setState({ testResults: results });
            } else if (this.state.lastSorted === "timeslot") {
                results.sort(
                    (a, b) => this.sort(b.timeslot_date, a.timeslot_date));
                this.setState({ lastSorted: "timeslot-desc" });
                this.setState({ testResults: results });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ testResults: this.state.originalOrder.slice() });
            }
        } else if (col === "dateProcessed") {

            let results = this.state.testResults;

            if (!this.state.lastSorted.includes("dateProcessed")) {
                results.sort(
                    (a, b) => this.sort(a.date_processed === null ? a.date_processed : moment(a.date_processed), b.date_processed === null ? b.date_processed : moment(b.date_processed)));
                this.setState({ lastSorted: "dateProcessed" });
                this.setState({ testResults: results });
            } else if (this.state.lastSorted === "dateProcessed") {
                results.sort(
                    (a, b) => this.sort(b.date_processed === null ? b.date_processed : moment(b.date_processed), a.date_processed === null ? a.date_processed : moment(a.date_processed)));
                this.setState({ lastSorted: "dateProcessed-desc" });
                this.setState({ testResults: results });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ testResults: this.state.originalOrder.slice() });
            }
        } else if (col === "poolStatus") {
            let results = this.state.testResults;

            if (!this.state.lastSorted.includes("poolStatus")) {
                results.sort((a, b) => this.sort(a.pool_status, b.pool_status));
                this.setState({ lastSorted: "poolStatus" });
                this.setState({ testResults: results });
            } else if (this.state.lastSorted === "poolStatus") {
                results.sort((a, b) => this.sort(b.pool_status, a.pool_status));
                this.setState({ lastSorted: "poolStatus-desc" });
                this.setState({ testResults: results });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ testResults: this.state.originalOrder.slice() });
            }
        } else if (col === "status") {
            let results = this.state.testResults;

            if (!this.state.lastSorted.includes("status")) {
                results.sort((a, b) => this.sort(a.test_status, b.test_status));
                this.setState({ lastSorted: "status" });
                this.setState({ testResults: results });
            } else if (this.state.lastSorted === "status") {
                results.sort((a, b) => this.sort(b.test_status, a.test_status));
                this.setState({ lastSorted: "status-desc" });
                this.setState({ testResults: results });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ testResults: this.state.originalOrder.slice() });
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

    async filter() {
        let response = await makeAPICall("studentviewresults", {
            username: localStorage.getItem("username"),
            test_status:
                this.state.status === "" ||
                    this.state.status === "All"
                    ? null
                    : this.state.status,
            start_date:
                this.state.startDate === "" ? null : this.state.startDate,
            end_date:
                this.state.endDate === "" ? null : this.state.endDate,
        });

        let temp = [];
        for (let key in response.data) {
            temp.push(response.data[key]);
        }
        this.setState({ testResults: temp });
        this.setState({ originalOrder: temp.slice() });
    }

    async reset() {
        this.setState(
            {
                status: "All",
                startDate: "",
                endDate: "",
            },
            () => {
                this.filter();
            }
        );
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let row = this.state.testResults.map((item) => (
            <tr key={item.test_id}>
                <td>
                    <Link
                        to={
                            item.date_processed
                                ? "/explore-test-result/" + item.test_id
                                : "/view-test-results"
                        }
                        className="theme-link"
                    >
                        {item.test_id}</Link>
                    </td>
                <td>{item.timeslot_date === null ? null : moment(item.timeslot_date).format("M/D/YYYY")}</td>
                <td>{item.date_processed === null ? null : moment(item.date_processed).format("M/D/YYYY")}</td>
                <td>{item.pool_status}</td>
                <td>{item.test_status}</td>
            </tr>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Student View Test Results</div>
                    <div className="filter-wrapper">
                        <div>
                            <div>Status</div>
                            <select
                                onChange={this.handleStatusChange}
                                value={this.state.status}
                            >
                                <option value="All">All</option>
                                <option value="negative">Negative</option>
                                <option value="positive">Positive</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div>
                            <div>Timeslot Date</div>
                            <input
                                type="date"
                                onChange={this.handleStartDateChange}
                                max={
                                    this.state.endDate === ""
                                        ? ""
                                        : this.state.endDate
                                }
                                className="small-date-input"
                                value={this.state.startDate}
                            />{" "}
                            -{" "}
                            <input
                                type="date"
                                onChange={this.handleEndDateChange}
                                min={
                                    this.state.startDate === ""
                                        ? ""
                                        : this.state.startDate
                                }
                                className="small-date-input"
                                value={this.state.endDate}
                            />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Test ID#</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                                "timeslot"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                                "timeslot-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.sortColumn(
                                                "timeslot"
                                            );
                                        }}
                                    >Timeslot Date</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                                "dateProcessed"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                                "dateProcessed-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.sortColumn(
                                                "dateProcessed"
                                            );
                                        }}
                                    >Date Processed</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                                "poolStatus"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                                "poolStatus-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.sortColumn(
                                                "poolStatus"
                                            );
                                        }}
                                    >Pool Status</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                                "status"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                                "status-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.sortColumn(
                                                "status"
                                            );
                                        }}
                                    >Status</td>
                                </tr>
                            </thead>
                            <tbody>{row}</tbody>
                        </table>
                    </div>
                    <br />
                    <br />
                    <div className="form-submit-wrapper">
                        <Link to="/home">Back (Home)</Link>
                        <button className="theme-button" onClick={this.reset}>
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default StudentViewTestResults;
