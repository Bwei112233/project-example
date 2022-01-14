import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ViewAppointments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allAppointments: [],
            displayAppointments: [],
            originalOrder: [],
            lastSorted: "",
            all_sites: [],
            filter_testing_site: "All",
            start_date: "01/01/1753",
            end_date: "12/31/9999",
            start_time_hour: "00",
            start_time_minute: "00",
            end_time_hour: "24",
            end_time_minute: "59",
            availability: "All",
        };

        this.onColumnClicked = this.onColumnClicked.bind(this);
        this.onTestingSiteChange = this.onTestingSiteChange.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onStartTimeHourChange = this.onStartTimeHourChange.bind(this);
        this.onStartTimeMinuteChange = this.onStartTimeMinuteChange.bind(this);
        this.onEndTimeHourChange = this.onEndTimeHourChange.bind(this);
        this.onEndTimeMinuteChange = this.onEndTimeMinuteChange.bind(this);
        this.reset = this.reset.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.onAvailabilityChange = this.onAvailabilityChange.bind(this);
    }

    async componentDidMount() {
        // get all site names
        let allApps = await makeAPICall("allappointments", {});

        let tempApps = [];
        for (let key in allApps.data.apps) {
            if (allApps.data.apps[key].username === null) {
                allApps.data.apps[key].username = "--";
            }
            tempApps.push(allApps.data.apps[key]);
        }

        let newArray = tempApps.slice();
        let newArrayOrder = tempApps.slice();

        this.setState({ allAppointments: tempApps });
        this.setState({ displayAppointments: newArray });
        this.setState({ originalOrder: newArrayOrder });

        // get all testing sites
        let allSiteNames = await makeAPICall("testsitenames", {});

        let tempSites = [];
        for (let key in allSiteNames.data.sites) {
            tempSites.push(allSiteNames.data.sites[key]);
        }
        tempSites.unshift("All");
        this.setState({ all_sites: tempSites });
    }

    // process sorting
    onColumnClicked(columnName) {
        if (columnName === "date") {
            let appt = this.state.displayAppointments;

            if (!this.state.lastSorted.includes("date")) {
                appt.sort((a, b) => moment(a.appt_date) - moment(b.appt_date));
                this.setState({ lastSorted: "date" });
                this.setState({ displayAppointments: appt });
            } else if (this.state.lastSorted === "date") {
                appt.sort((a, b) => moment(b.appt_date) - moment(a.appt_date));
                this.setState({ lastSorted: "date-desc" });
                this.setState({ displayAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    displayAppointments: this.state.originalOrder.slice(),
                });
            }
        } else if (columnName === "time") {
            let appt = this.state.displayAppointments;

            if (!this.state.lastSorted.includes("time")) {
                appt.sort(
                    (a, b) =>
                        moment("20000620" + a.appt_time, "YYYYMMDDhh:mm") -
                        moment("20000620" + b.appt_time, "YYYYMMDDhh:mm")
                );
                this.setState({ lastSorted: "time" });
                this.setState({ displayAppointments: appt });
            } else if (this.state.lastSorted === "time") {
                appt.sort(
                    (a, b) =>
                        moment("20000620" + b.appt_time, "YYYYMMDDhh:mm") -
                        moment("20000620" + a.appt_time, "YYYYMMDDhh:mm")
                );
                this.setState({ lastSorted: "time-desc" });
                this.setState({ displayAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    displayAppointments: this.state.originalOrder.slice(),
                });
            }
        } else if (columnName === "testsite") {
            console.log("starting test site sort");
            console.log("last sorted is " + this.state.lastSorted);

            let appt = this.state.displayAppointments;

            if (!this.state.lastSorted.includes("testsite")) {
                appt.sort((a, b) => this.sort(a.site_name, b.site_name));
                console.log("finisihed sort");
                this.setState({ lastSorted: "testsite" });
                this.setState({ displayAppointments: appt });
            } else if (this.state.lastSorted === "testsite") {
                appt.sort((a, b) => this.sort(b.site_name, a.site_name));
                this.setState({ lastSorted: "testsite-desc" });
                this.setState({ displayAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    displayAppointments: this.state.originalOrder.slice(),
                });
            }
        } else if (columnName === "location") {
            console.log("starting location sort");

            let appt = this.state.displayAppointments;

            if (!this.state.lastSorted.includes("location")) {
                appt.sort((a, b) => this.sort(a.location, b.location));
                this.setState({ lastSorted: "location" });
                this.setState({ displayAppointments: appt });
            } else if (this.state.lastSorted === "location") {
                appt.sort((a, b) => this.sort(b.location, a.location));
                this.setState({ lastSorted: "location-desc" });
                this.setState({ displayAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    displayAppointments: this.state.originalOrder.slice(),
                });
            }
        } else if (columnName === "user") {
            console.log("starting user sort");

            let appt = this.state.displayAppointments;

            if (!this.state.lastSorted.includes("user")) {
                appt.sort((a, b) => this.sort(a.username, b.username));
                this.setState({ lastSorted: "user" });
                this.setState({ displayAppointments: appt });
            } else if (this.state.lastSorted === "user") {
                appt.sort((a, b) => this.sort(b.username, a.username));
                this.setState({ lastSorted: "user-desc" });
                this.setState({ displayAppointments: appt });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({
                    displayAppointments: this.state.originalOrder.slice(),
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
        if (this.state.start_time_minute === "") {
            return;
        }
        this.setState({ filter_testing_site: event.target.value });
    }

    onStartDateChange(event) {
        event.preventDefault();
        if (this.state.start_time_minute === "") {
            return;
        }
        this.setState({ start_date: event.target.value });
    }

    onEndDateChange(event) {
        event.preventDefault();
        if (this.state.start_time_minute === "") {
            return;
        }
        this.setState({ end_date: event.target.value });
    }

    onStartTimeHourChange(event) {
        event.preventDefault();
        this.setState({ start_time_hour: event.target.value });
        if (event.target.value === "") {
            this.setState({ start_time_hour: "00" });
        }
    }

    onStartTimeMinuteChange(event) {
        event.preventDefault();
        console.log("event is " + event.target.value);
        if (event.target.value === "") {
            this.setState({ start_time_minute: "00" });
            return;
        }
        this.setState({ start_time_minute: event.target.value });
    }

    onEndTimeHourChange(event) {
        event.preventDefault();
        this.setState({ end_time_hour: event.target.value });
        if (event.target.value === "") {
            this.setState({ end_time_hour : "24" });
        }
    }

    onEndTimeMinuteChange(event) {
        event.preventDefault();
        if (event.target.value === "") {
            this.setState({ end_time_minute: "59" });
            return;
        }
        this.setState({ end_time_minute: event.target.value });
    }

    onAvailabilityChange(event) {
        event.preventDefault();
        this.setState({ availability: event.target.value });
    }

    async reset() {
        this.setState({
            filter_testing_site: "All",
            start_date: "01/01/1753",
            end_date: "12/31/9999",
            start_time_hour: "00",
            start_time_minute: "00",
            end_time_hour: "24",
            end_time_minute: "59",
            availability: "All",
        });

        let newArr = this.state.allAppointments.slice();
        let newArr1 = this.state.allAppointments.slice();
        this.setState({ displayAppointments: newArr });
        this.setState({ originalOrder: newArr1 });
    }

    async onFilter() {
        let tempApps = this.state.allAppointments;
        let newDisplayArr = [];
        let startDate = this.state.start_date;
        let endDate = this.state.end_date;

        for (let i = 0; i < tempApps.length; i++) {
            let currApp = tempApps[i];
            console.log("current name is " + currApp.site_name);
            console.log(
                "current sitename is " + this.state.filter_testing_site
            );
            // check test-site filter
            if (
                !(
                    this.state.filter_testing_site === "All" ||
                    this.state.filter_testing_site === currApp.site_name
                )
            ) {
                console.log("failed test site filter");
                continue;
            }

            // check date filter
            let currDate = currApp.appt_date;

            console.log(startDate);
            console.log(endDate);
            console.log(currDate);

            if (
                !(
                    moment(startDate) - moment(currDate) <= 0 &&
                    moment(currDate) - moment(endDate) <= 0
                )
            ) {
                console.log("failed date filter");
                continue;
            }

            // check time filer
            let currTime = currApp.appt_time;
            let startTime =
                this.state.start_time_hour +
                ":" +
                this.state.start_time_minute +
                ":00";
            let endTime =
                this.state.end_time_hour +
                ":" +
                this.state.end_time_minute +
                ":00";

            if (!(startTime <= currTime && currTime <= endTime)) {
                console.log("failed time filter");
                continue;
            }

            // check availability
            let availability = this.state.availability;
            if (availability === "Booked" && currApp.username === "--") {
                continue;
            } else if (
                availability === "Available" &&
                currApp.username !== "--"
            ) {
                continue;
            }

            console.log("passed filters");
            newDisplayArr.push(currApp);
        }

        console.log("finished filtering");
        let copyArr = newDisplayArr.slice();
        this.setState({ displayAppointments: newDisplayArr });
        this.setState({ originalOrder: copyArr });
    }

    render() {

        let availableAppointmentsRow = this.state.displayAppointments.map(
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
                    <td>{item.location}</td>
                    <td>{item.site_name}</td>
                    <td>{item.username}</td>
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
                    <div className="form-title">View Appointments</div>
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
                            <div> Availability </div>
                            <select
                                onChange={this.onAvailabilityChange}
                                value={this.state.availability}
                            >
                                <option key="all"> All </option>
                                <option key="available"> Available </option>
                                <option key="booked"> Booked</option>
                            </select>
                        </div>

                        <div>
                            <div>Date</div>
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

                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                            "location"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                            "location-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("location");
                                        }}
                                    >
                                        Location
                                    </td>

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

                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted === "user"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                            "user-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("user");
                                        }}
                                    >
                                        User
                                    </td>
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
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewAppointments;
