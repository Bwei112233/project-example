import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ViewPools extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Pools: [],
            originalOrder: [],
            lastSorted: "",
            all_pool_status: [],
            all_lab_techs: [],
            filter_pool_status: "All",
            filter_processed_by: "Anyone",
            start_date: "",
            end_date: "",
        };

        this.onColumnClicked = this.onColumnClicked.bind(this);
        this.onPoolStatusChange = this.onPoolStatusChange.bind(this);
        this.onLabTechChange = this.onLabTechChange.bind(this);
        this.onStartDateChange = this.onStartDateChange.bind(this);
        this.onEndDateChange = this.onEndDateChange.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.reset = this.reset.bind(this);
    }

    async componentDidMount() {
        await this.onFilter();

        // get all labtechs
        let allLabTechs = await makeAPICall("labtechs", {});

        let tempLabTechs = [];
        for (let key in allLabTechs.data.labTechs) {
            tempLabTechs.push(allLabTechs.data.labTechs[key]);
        }
        tempLabTechs.unshift("Anyone");
        this.setState({ all_lab_techs: tempLabTechs });

        // get all pool status
        let allPoolStatus = [];
        allPoolStatus.push("positive");
        allPoolStatus.push("negative");
        allPoolStatus.push("pending");
        allPoolStatus.unshift("All");
        this.setState({ all_pool_status: allPoolStatus });
    }

    onColumnClicked(columnName) {
        if (columnName === "dateProcessed") {
            let pool = this.state.Pools;

            if (!this.state.lastSorted.includes("dateProcessed")) {
                pool.sort(
                    (a, b) => this.sort(a.date_processed === null ? a.date_processed : moment(a.date_processed), b.date_processed === null ? b.date_processed : moment(b.date_processed)));
                this.setState({ lastSorted: "dateProcessed" });
                this.setState({ Pools: pool });
            } else if (this.state.lastSorted === "dateProcessed") {
                pool.sort(
                    (a, b) => this.sort(b.date_processed === null ? b.date_processed : moment(b.date_processed), a.date_processed === null ? a.date_processed : moment(a.date_processed)));
                this.setState({ lastSorted: "dateProcessed-desc" });
                this.setState({ Pools: pool });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ Pools: this.state.originalOrder.slice() });
            }
        } else if (columnName === "processedBy") {
            console.log("starting test site sort");
            console.log("last sorted is " + this.state.lastSorted);

            let pool = this.state.Pools;

            if (!this.state.lastSorted.includes("processedBy")) {
                pool.sort((a, b) => this.sort(a.processed_by, b.processed_by));
                this.setState({ lastSorted: "processedBy" });
                this.setState({ Pools: pool });
            } else if (this.state.lastSorted === "processedBy") {
                pool.sort((a, b) => this.sort(b.processed_by, a.processed_by));
                this.setState({ lastSorted: "processedBy-desc" });
                this.setState({ Pools: pool });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ Pools: this.state.originalOrder.slice() });
            }
        } else if (columnName === "poolStatus") {
            let pool = this.state.Pools;

            if (!this.state.lastSorted.includes("poolStatus")) {
                pool.sort((a, b) => this.sort(a.pool_status, b.pool_status));
                this.setState({ lastSorted: "poolStatus" });
                this.setState({ Pools: pool });
            } else if (this.state.lastSorted === "poolStatus") {
                pool.sort((a, b) => this.sort(b.pool_status, a.pool_status));
                this.setState({ lastSorted: "poolStatus-desc" });
                this.setState({ Pools: pool });
            } else {
                this.setState({ lastSorted: "" });
                this.setState({ Pools: this.state.originalOrder.slice() });
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

    onPoolStatusChange(event) {
        event.preventDefault();
        this.setState({ filter_pool_status: event.target.value });
    }

    onLabTechChange(event) {
        event.preventDefault();
        this.setState({ filter_processed_by: event.target.value });
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
        let response = await makeAPICall("viewpools", {
            begin_process_date:
                this.state.start_date === "" ? null : this.state.start_date,
            end_process_date:
                this.state.end_date === "" ? null : this.state.end_date,
            pool_status:
                this.state.filter_pool_status === "" ||
                this.state.filter_pool_status === "All"
                    ? null
                    : this.state.filter_pool_status,
            processed_by:
                this.state.filter_processed_by === "" ||
                this.state.filter_processed_by === "Anyone"
                    ? null
                    : this.state.filter_processed_by,
        });

        let tempPools = [];
        for (let key in response.data) {
            tempPools.push(response.data[key]);
        }
        this.setState({ Pools: tempPools });
        // save the original order for when sorting is unselected
        this.setState({ originalOrder: tempPools.slice() });
    }

    async reset() {
        this.setState(
            {
                filter_pool_status: "All",
                filter_processed_by: "Anyone",
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

        let PoolsRow = this.state.Pools.map((item) => (
            <tr key={item.pool_id}>
                <td>
                    <Link
                        to={
                            item.date_processed
                                ? "/explore-pool-result/" + item.pool_id
                                : "/process-pool/" + item.pool_id
                        }
                        className="theme-link"
                    >
                        {item.pool_id}
                    </Link>
                </td>
                <td>{item.test_ids}</td>
                <td>{item.date_processed === null ? null : moment(item.date_processed).format("M/D/YYYY")}</td>
                <td>{item.processed_by}</td>
                <td>{item.pool_status}</td>
            </tr>
        ));

        let poolStatusOptions = this.state.all_pool_status.map((item) => (
            <option key={item}>{item}</option>
        ));

        let labTechOptions = this.state.all_lab_techs.map((item) => (
            <option key={item}>{item}</option>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">View Pools</div>
                    <div className="filter-wrapper">
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
                        <div>
                            <div>Pool Status</div>
                            <select
                                onChange={this.onPoolStatusChange}
                                value={this.state.filter_pool_status}
                            >
                                {poolStatusOptions}
                            </select>
                        </div>
                        <div>
                            <div>Processed By</div>
                            <select
                                onChange={this.onLabTechChange}
                                value={this.state.filter_processed_by}
                            >
                                {labTechOptions}
                            </select>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Pool ID</td>
                                    <td>Test Ids</td>
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
                                            this.onColumnClicked(
                                                "dateProcessed"
                                            );
                                        }}
                                    >
                                        Date Processed
                                    </td>
                                    <td
                                        className={
                                            "sortable" +
                                            (this.state.lastSorted ===
                                            "processedBy"
                                                ? " sortable_asc"
                                                : "") +
                                            (this.state.lastSorted ===
                                            "processedBy-desc"
                                                ? " sortable_desc"
                                                : "")
                                        }
                                        onClick={() => {
                                            this.onColumnClicked("processedBy");
                                        }}
                                    >
                                        Processed By
                                    </td>
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
                                            this.onColumnClicked("poolStatus");
                                        }}
                                    >
                                        Pool Status
                                    </td>
                                </tr>
                            </thead>
                            <tbody>{PoolsRow}</tbody>
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

export default ViewPools;
