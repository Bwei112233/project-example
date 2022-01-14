import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class SignUpForATest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            availableAppointments: [],
            originalOrder: [],
            lastSorted: "",
            all_sites: [],
            all_users_with_pending_tests: [],
            filter_testing_site: "All",
            start_date: "",
            end_date: "",
            start_time_hour: "",
            start_time_minute: "",
            end_time_hour: "",
            end_time_minute: "",
        };

        this.selectRow = this.selectRow.bind(this);
        this.onColumnClicked = this.onColumnClicked.bind(this);
        this.onTestingSiteChange = this.onTestingSiteChange.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onStartTimeHourChange = this.onStartTimeHourChange.bind(this);
        this.onStartTimeMinuteChange = this.onStartTimeMinuteChange.bind(this);
        this.onEndTimeHourChange = this.onEndTimeHourChange.bind(this);
        this.onEndTimeMinuteChange = this.onEndTimeMinuteChange.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.reset = this.reset.bind(this);
        this.signup = this.signup.bind(this);
    }

    async componentDidMount() {
        await this.onFilter();

        // get all site names
        let allSiteNames = await makeAPICall("testsitenames", {});

        let tempSites = [];
        for (let key in allSiteNames.data.sites) {
            tempSites.push(allSiteNames.data.sites[key]);
        }
        tempSites.unshift("All");
        this.setState({ all_sites: tempSites });

        let pendingTestsResponse = await makeAPICall("pendingtests", {});
        let pendingTests = [];
        for (let key in pendingTestsResponse.data.usersWithPendingTests) {
            pendingTests.push(pendingTestsResponse.data.usersWithPendingTests[key]);
        }
        this.setState({ all_users_with_pending_tests: pendingTests });
    }

    selectRow(index) {
        let appt = this.state.availableAppointments;
        for (let key in appt) {
            if (appt[key].index === index) {
                appt[key].selected = true;
            } else {
                appt[key].selected = false;
            }
        }
        this.setState({ availableAppointments: appt });
    }

    onColumnClicked(columnName) {
        if (columnName === "date") {
            let appt = this.state.availableAppointments;

            if (!this.state.lastSorted.includes("date")) {
                appt.sort((a, b) => this.sort(moment(a.appt_date), moment(b.appt_date)));
                this.setState({ lastSorted: "date" });
                this.setState({ availableAppointments: appt });
            } else if (this.state.lastSorted === "date") {
                appt.sort((a, b) => this.sort(moment(b.appt_date), moment(a.appt_date)));
                this.setState({ lastSorted: "date-desc" });
                this.setState({ availableAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    availableAppointments: this.state.originalOrder.slice(),
                });
            }
        } else if (columnName === "time") {
            let appt = this.state.availableAppointments;

            if (!this.state.lastSorted.includes("time")) {
                appt.sort(
                    (a, b) =>
                        moment("20000620" + a.appt_time, "YYYYMMDDhh:mm") -
                        moment("20000620" + b.appt_time, "YYYYMMDDhh:mm")
                );
                this.setState({ lastSorted: "time" });
                this.setState({ availableAppointments: appt });
            } else if (this.state.lastSorted === "time") {
                appt.sort(
                    (a, b) =>
                        moment("20000620" + b.appt_time, "YYYYMMDDhh:mm") -
                        moment("20000620" + a.appt_time, "YYYYMMDDhh:mm")
                );
                this.setState({ lastSorted: "time-desc" });
                this.setState({ availableAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    availableAppointments: this.state.originalOrder.slice(),
                });
            }
        } else if (columnName === "testsite") {
            let appt = this.state.availableAppointments;

            if (!this.state.lastSorted.includes("testsite")) {
                appt.sort((a, b) => this.sort(a.site_name, b.site_name));
                this.setState({ lastSorted: "testsite" });
                this.setState({ availableAppointments: appt });
            } else if (this.state.lastSorted === "testsite") {
                appt.sort((a, b) => this.sort(b.site_name, a.site_name));
                this.setState({ lastSorted: "testsite-desc" });
                this.setState({ availableAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    availableAppointments: this.state.originalOrder.slice(),
                });
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

    onTestingSiteChange(event) {
        event.preventDefault();
        this.setState({ filter_testing_site: event.target.value });
    }

    onStartDateChange(event) {
        event.preventDefault();
        this.setState({ start_date: event.target.value });
    }

    onEndDateChange(event) {
        event.preventDefault();
        this.setState({ end_date: event.target.value });
    }

    onStartTimeHourChange(event) {
        event.preventDefault();
        this.setState({ start_time_hour: event.target.value });
        if (this.state.start_time_minute === "") {
            this.setState({ start_time_minute: "00" });
        }
    }

    onStartTimeMinuteChange(event) {
        event.preventDefault();
        this.setState({ start_time_minute: event.target.value });
    }

    onEndTimeHourChange(event) {
        event.preventDefault();
        this.setState({ end_time_hour: event.target.value });
        if (this.state.end_time_minute === "") {
            this.setState({ end_time_minute: "00" });
        }
    }

    onEndTimeMinuteChange(event) {
        event.preventDefault();
        this.setState({ end_time_minute: event.target.value });
    }

    async onFilter() {
        let response = await makeAPICall("testsignupfilter", {
            username: localStorage.getItem("username"),
            testing_site:
                this.state.filter_testing_site === "" ||
                this.state.filter_testing_site === "All"
                    ? null
                    : this.state.filter_testing_site,
            start_date:
                this.state.start_date === "" ? null : this.state.start_date,
            end_date: this.state.end_date === "" ? null : this.state.end_date,
            start_time:
                this.state.start_time_hour === ""
                    ? null
                    : this.state.start_time_hour +
                      ":" +
                      this.state.start_time_minute +
                      ":00",
            end_time:
                this.state.end_time_hour === ""
                    ? null
                    : this.state.end_time_hour +
                      ":" +
                      this.state.end_time_minute +
                      ":00",
        });

        let tempavailableAppointments = [];
        for (let key in response.data) {
            tempavailableAppointments.push(response.data[key]);
            tempavailableAppointments[
                tempavailableAppointments.length - 1
            ].selected = key === "0";
            // index associated with row because it will get rearranged eventually
            tempavailableAppointments[
                tempavailableAppointments.length - 1
            ].index = key;
        }
        this.setState({ availableAppointments: tempavailableAppointments });
        // save the original order for when sorting is unselected?
        this.setState({ originalOrder: tempavailableAppointments.slice() });
    }

    async reset() {
        this.setState(
            {
                filter_testing_site: "All",
                start_date: "",
                end_date: "",
                start_time_hour: "",
                start_time_minute: "",
                end_time_hour: "",
                end_time_minute: "",
            },
            () => {
                // have to do this in a callback or else you
                // might refilter before all the states are set rip
                this.onFilter();
            }
        );
    }

    async signup() {
        // check if student has any pending tests
        if (this.state.all_users_with_pending_tests.includes(localStorage.getItem("username"))) {
            alert("You have a pending test.  You can't sign up for another one.");
            return;
        }
        // get new id
        let newIDResponse = await makeAPICall("newtestid", {});
        let newID = newIDResponse.data.newID;

        for (let key in this.state.availableAppointments) {
            let curr = this.state.availableAppointments[key];
            if (curr.selected) {
                let response = await makeAPICall("testsignup", {
                    username: localStorage.getItem("username"),
                    site_name: curr.site_name,
                    appt_date: moment(curr.appt_date).format("YYYY-MM-DD"),
                    appt_time: curr.appt_time,
                    test_id: newID,
                });

                break;
            }
        }

        // redirect to home
        this.props.history.push("/home");
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        // if not a student thennnnnnnn push home
        if (!localStorage.getItem("roles").includes("student")) {
            return <Redirect push to="/home" />;
        }

        let availableAppointmentsRow = this.state.availableAppointments.map(
            (item) => (
                <tr
                    key={
                        item.appt_date +
                        " " +
                        item.appt_time +
                        " " +
                        item.site_name
                    }
                >
                    <td>{moment(item.appt_date).format("M/D/YYYY")}</td>
                    <td>{item.appt_time}</td>
                    <td>{item.street}</td>
                    <td>{item.site_name}</td>
                    <td>
                        <input
                            type="radio"
                            checked={item.selected ? "checked" : ""}
                            onChange={() => this.selectRow(item.index)}
                        ></input>
                    </td>
                </tr>
            )
        );

        let testingSiteOptions = this.state.all_sites.map((item) => (
            <option key={item}>{item}</option>
        ));

        let hourOptions = [...Array(25).keys()].map((item) => (
            <option key={item}>
                {item.toString().length === 1
                    ? "0" + item.toString()
                    : item.toString()}
            </option>
        ));
        hourOptions.unshift(<option key="none"></option>);

        let minuteOptions = [...Array(60).keys()].map((item) => (
            <option key={item}>
                {item.toString().length === 1
                    ? "0" + item.toString()
                    : item.toString()}
            </option>
        ));
        minuteOptions.unshift(<option key="none"></option>);

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Signup for a Test</div>
                    <div className="filter-wrapper">
                        <div>
                            <div>Testing Site</div>
                            <select
                                onChange={this.onTestingSiteChange}
                                value={this.state.filter_testing_site}
                            >
                                {testingSiteOptions}
                            </select>
                        </div>
                        <div>
                            <div>Date (YYYY-MM-DD)</div>
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
                            <div>Time</div>
                            <select
                                onChange={this.onStartTimeHourChange}
                                className="small-dropdown"
                                value={this.state.start_time_hour}
                            >
                                {hourOptions}
                            </select>
                            <select
                                onChange={this.onStartTimeMinuteChange}
                                className="small-dropdown"
                                value={this.state.start_time_minute}
                            >
                                {minuteOptions}
                            </select>
                            to{" "}
                            <select
                                onChange={this.onEndTimeHourChange}
                                className="small-dropdown"
                                value={this.state.end_time_hour}
                            >
                                {hourOptions}
                            </select>
                            <select
                                onChange={this.onEndTimeMinuteChange}
                                className="small-dropdown"
                                value={this.state.end_time_minute}
                            >
                                {minuteOptions}
                            </select>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted === "date"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                            "date-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("date");
                                        }}
                                    >
                                        Date
                                    </td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted === "time"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                            "time-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("time");
                                        }}
                                    >
                                        Time
                                    </td>
                                    <td>Site Address</td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                            "testsite"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                            "testsite-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("testsite");
                                        }}
                                    >
                                        Test Site
                                    </td>
                                    <td>Sign Up</td>
                                </tr>
                            </thead>
                            <tbody>{availableAppointmentsRow}</tbody>
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
                        <button className="theme-button" onClick={this.signup}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SignUpForATest;
