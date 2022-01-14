import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";


class CreatePool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pool_id : "",
            tests : [],
            lastSorted : "",
            originalOrder : []
        };
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePoolID = this.handlePoolID.bind(this);
        this.handleDateSort = this.handleDateSort.bind(this);
    }

    selectPool(test_id) {
        let tests = this.state.tests;
        for (let i = 0; i < tests.length; i++) {
            if (test_id === tests[i]["test_id"]) {
                console.log("marked for pool");
                tests[i]["selected"] = !tests[i]["selected"];
                console.log("include test " + tests[i]["test_id"] + " in pool: " + tests[i]["selected"]);
                return;
            }
        }
    }


    handleDateSort() {
        let testsTemp = this.state.tests;

        if (!this.state.lastSorted.includes("date")) {
            testsTemp.sort((a, b) => moment(a.appt_date) - moment(b.appt_date));
            this.setState({ lastSorted: "date" });
            this.setState({ tests: testsTemp });
        } else if (this.state.lastSorted === "date") {
            testsTemp.sort((a, b) => moment(b.appt_date) - moment(a.appt_date));
            this.setState({ lastSorted: "date-desc" });
            this.setState({ tests : testsTemp });
        } else {
            this.setState({ lastSorted: "" });
            this.setState({
                tests : this.state.originalOrder.slice(),
            });
        }
    }


    handlePoolID(event) {
        this.setState({ pool_id : event.target.value });
    }

    // functions to handle changes in input data
    async handleSubmit(event) {
        event.preventDefault();

        console.log("starting to create pool ......");

        let tests_added = [];
        let tests = this.state.tests;

        if (this.state.pool_id === "" || isNaN(this.state.pool_id) || this.state.pool_id.length > 10) {
            alert("enter valid pool id");
            return;
        }

        // check to see if poolid is valid
        let pools = await makeAPICall("allpools", {});
        let poolData = pools.data;
        for (let key in poolData.pools) {
            let poolInfo = poolData.pools[key];
            if (poolInfo.pool_id === this.state.pool_id) {
                alert("pool id is not unique.");
                return;
            }
        }

        for (let i = 0; i < tests.length; i++) {
            if (tests[i]["selected"]) {
                console.log(tests[i]["test_id"] + " will be included in curr pool");
                tests_added.push(
                    tests[i]["test_id"]
                );
            } 
        }

        if (tests_added.length <= 0 || tests_added.length > 7) {
            alert("can only add between 1 & 7 tests to pool");
            return;
        }

        // seems like there is no constraint on who can make a pool on pdf

        //stuff used for testing ignore
        // console.log("submiting request");
        // return;

        // create pool and push in first test
        let response = await makeAPICall("createpool", {
            pool_id : this.state.pool_id,
            test_id : tests_added[0],
        });

        // push any remaining tests into the pool just created
        for (let i  = 1; i < tests_added.length; i++) {
            console.log("pool id is " + this.state.pool_id);
            console.log("test id to add is " + tests_added[i]);

            let added = await makeAPICall("assigntesttopool", {
                pool_id: this.state.pool_id,
                test_id: tests_added[i],
            });

            if (!added.data.success) {
                console.log("error adding test");
                return;
            }
        }

        if (response.data.success) {
            console.log("success");
            // redirect to home
            this.props.history.push("/home");
        } else {
            console.log("failed");
        }
    }

    // get sites that appointments can be sceduled at
    async componentDidMount() {
        console.log("starting to get tests");

        let response = await makeAPICall("unusedtests", {});

        let testData = response.data;

        let tempTests = [];
        

        console.log("got tests");
        console.log(testData);

        for (let key in testData.tests) {
            let data = testData.tests[key];

            data["selected"] = false;
            tempTests.push(data);
        }
        let orig = tempTests.slice();
        this.setState({originalOrder : orig});
        this.setState({tests: tempTests});
    }


    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let testRow = this.state.tests.map((item) => (
            <tr key={item.test_id}>
                <td>{item.test_id}</td>
                <td>{moment(item.appt_date).format("M/D/YYYY")}</td>
                <td>
                        <input
                            type="checkbox"
                            onChange={() => this.selectPool(item.test_id)}
                        ></input>
                    </td>
            </tr>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Create New Pool</div>
                    
                    <div>Pool Id</div>
                    <input
                            type = "text"
                            name = "pool-id"
                            onChange = {this.handlePoolID}
                            value = {this.state.pool_id}
                        ></input>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Test ID</td>
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
                                            this.handleDateSort();
                                        }}
                                    >   Test Date

                                        </td>
                                    <td>Include In Pool</td>
                                </tr>
                            </thead>
                            <tbody>{testRow}</tbody>
                        </table>
                    </div>
                    <br />
                    <br />
                    <div className="form-submit-wrapper">
                            <Link to="/home">Back (Home)</Link>
                            <button className="theme-button" onClick={this.handleSubmit}>
                            Create Pool
                            </button>
                        </div>
                </div>
            </div>
        );
    }
}

export default CreatePool;
