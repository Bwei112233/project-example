import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ProcessPools extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_pool: "1",
            date_processed: "",
            pool_status: "negative",
            pools: [],
            tests: [],
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectedPool = this.handleSelectedPool.bind(this);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleDateProcessed = this.handleDateProcessed.bind(this);
        this.handleGetTests = this.handleGetTests.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSelectedPool(event) {
        event.preventDefault();
        console.log("pool selected is " + event.target.value);

        this.setState({ selected_pool: event.target.value }, () =>
            console.log("selected_pool is " + this.state.selected_pool)
        );

        this.handleGetTests(event.target.value);
    }

    handleStatusChange(event) {
        this.setState({ pool_status: event.target.value });
    }

    handleInputChange(testID, event) {
        let value = event.target.value;
        let tests = this.state.tests;
        for (let i = 0; i < tests.length; i++) {
            if (tests[i].test_id === testID) {
                tests[i].input = value;
                // console.log("test with test id " + tests[i].test_id + " changed to " + value);
                return;
            }
        }
    }

    handleDateProcessed(event) {
        this.setState({ date_processed: event.target.value });
    }

    async handleGetTests(poolID) {
        let response = await makeAPICall("testsinpool", { pool_id: poolID });

        let tempTests = [];
        let selectedTests = response.data;
        for (let key in selectedTests) {
            let test = selectedTests[key];
            // add input tracker
            test.input = "negative";

            tempTests.push(test);
        }

        this.setState({ tests: tempTests });
    }

    // process the pool
    async handleSubmit(event) {
        event.preventDefault();
        let pool_id = this.state.selected_pool;
        console.log("start processing pool " + pool_id);

        if (this.state.date_processed === "") {
            alert("enter a valid date");
            return;
        }
        let poolStatus = this.state.pool_status;
        let tests = this.state.tests;

        // assumming page is only accessable by lab technician
        let labTech = localStorage.getItem("username");

        console.log("lab tech is " + labTech);
        console.log("input date is " + this.state.date_processed);
        console.log("pool status is " + poolStatus);

        // check if date is valid
        for (let i = 0; i < tests.length; i++) {
            console.log(tests[i]);
            console.log(
                "test id " +
                    tests[i].test_id +
                    " will be changed to " +
                    tests[i].input
            );
            console.log("appt date is " + tests[i].date_tested);
            if (
                moment(this.state.date_processed) -
                    moment(tests[i].date_tested) <=
                0
            ) {
                alert("cannot process before last test conducted");
                return;
            }
        }

        // check if at least one test is positive
        let foundPositve = false;
        console.log("checking if pool has at least one positive test");
        for (let i = 0; i < tests.length; i++) {
            if (tests[i].input === "positive") {
                foundPositve = true;
                break;
            }
        }
            
        if (!foundPositve && poolStatus === "positive") {
            alert("positive pool must have at least one positive test");
            return;
        }

        if (foundPositve && poolStatus === "negative") {
            alert("negative pool cannot have positve test");
            return;
        }

        // update pool data
        let update_pool = await makeAPICall("processpool", {
            pool_id: pool_id,
            pool_status: poolStatus,
            process_date: this.state.date_processed,
            processed_by: labTech,
        });

        console.log("start updating tests");
        console.log("pool status is " + poolStatus);
        // start updating tests
        for (let i = 0; i < tests.length; i++) {
            // if pool_status is negative, update tests all to be negative
            if (poolStatus === "negative") {
                console.log("all will be updated to be negative");
                let updateTest = await makeAPICall("processtest", {
                    test_id: tests[i].test_id,
                    test_status: "negative",
                });
            } else {
                let updateTest = await makeAPICall("processtest", {
                    test_id: tests[i].test_id,
                    test_status: tests[i].input,
                });
            }
        }
        this.props.history.push("/home");
    }

    // get sites that appointments can be sceduled at
    async componentDidMount() {
        let temp = window.location.href.split("/");
        let poolid = temp[temp.length - 1];

        console.log("selected pool is " + poolid);

        this.setState({ selected_pool: poolid });

        let response = await makeAPICall("allpools", {});

        let poolData = response.data;

        let tempPools = [];

        for (let key in poolData.pools) {
            let data = poolData.pools[key];
            tempPools.push(data);
        }
        if (tempPools.length > 0) {
            this.handleGetTests(tempPools[0].pool_id);
        }

        if (poolid != null) {
            this.handleGetTests(poolid);
        }

        this.setState({ pools: tempPools });
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let poolRow = this.state.tests.map((item) => (
            <tr key={item.test_id}>
                <td>{item.test_id}</td>
                <td>{moment(item.date_tested).format("M/D/YYYY")}</td>
                <td>{item.test_result}</td>
                <td>
                    <select
                        onChange={(e) =>
                            this.handleInputChange(item.test_id, e)
                        }
                    >
                        <option key="negative1"> negative </option>
                        <option key="positive1"> positive </option>
                    </select>
                </td>
            </tr>
        ));

        let poolIDs = this.state.pools.map((item) => (
            <option
                name={item.pool_id}
                key={"pool_id" + item.pool_id}
                value={item.pool_id}
            >
                {item.pool_id}
            </option>
        ));

        return (
            <div className="screen-wrapper" onSubmit={this.handleSubmit}>
                <div className="panel-wrapper">
                    <div className="form-title">
                        Process Pool {this.state.selected_pool}
                    </div>
                    <div>Date</div>
                    <input
                        type="date"
                        onChange={this.handleDateProcessed}
                        className="small-date-input"
                        value={this.state.date_processed}
                    />{" "}
                    <div>
                        <div> Update Pool Status </div>
                        <select
                            onChange={this.handleStatusChange}
                            value={this.state.pool_status}
                        >
                            <option key="negative"> negative </option>
                            <option key="positive"> positive </option>
                        </select>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Test ID</td>
                                    <td>Test Date</td>
                                    <td>Test Result</td>
                                    <td>Change Result</td>
                                </tr>
                            </thead>
                            <tbody>{poolRow}</tbody>
                        </table>
                    </div>
                    <br />
                    <br />
                    <div className="form-submit-wrapper">
                        <Link to="/home">Back (Home)</Link>
                        <button
                            className="theme-button"
                            onClick={this.handleSubmit}
                        >
                            Process Pool
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProcessPools;
