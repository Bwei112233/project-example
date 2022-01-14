import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ExploreTestResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.test_id,
            test: [],
        };
    }

    async componentDidMount() {
        const { testid } = this.props.match.params;
        this.setState({ id: testid });

        let response = await makeAPICall("exploretestresult", {
            test_id: testid,
        });

        if (response.data) {
            let temp = [];
            for (let key in response.data) {
                temp.push(response.data[key]);
            }
            this.setState({ test: temp });

            console.log(temp);
        }
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let row = this.state.test.map((item) => (
            <tr key={item.test_id}>
                <td>{item.test_id}</td>
                <td>{item.test_date === null ? null : moment(item.test_date).format("M/D/YYYY")}</td>
                <td>{item.timeslot}</td>
                <td>{item.testing_location}</td>
                <td>{item.date_processed === null ? null : moment(item.date_processed).format("M/D/YYYY")}</td>
                <td>{item.pooled_result}</td>
                <td>{item.individual_result}</td>
                <td>{item.processed_by}</td>
            </tr>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Explore Test Result</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Test ID#</td>
                                    <td>Date Tested</td>
                                    <td>Timeslot</td>
                                    <td>Testing Location</td>
                                    <td>Date Processed</td>
                                    <td>Pooled Result</td>
                                    <td>Individual Result</td>
                                    <td>Processed By</td>
                                </tr>
                            </thead>
                            <tbody>{row}</tbody>
                        </table>
                    </div>
                    <br />
                    <br />
                    <Link to="/home">Back (Home)</Link>
                </div>
            </div>  
        );
    }
}

export default ExploreTestResult;