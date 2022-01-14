import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ViewDailyResults extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dailyResults: [],
        };
    }

    async componentDidMount() {
        let response = await makeAPICall("dailyresults", {});

        let tempDailyResults = [];
        for (let key in response.data) {
            tempDailyResults.push(response.data[key]);
        }
        this.setState({ dailyResults: tempDailyResults });
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let dailyResultsRow = this.state.dailyResults.map((item) => (
            <tr key={item.process_date + " " + item.num_tests}>
                <td>{moment(item.process_date).format("M/D/YYYY")}</td>
                <td>{item.num_tests}</td>
                <td>{item.pos_tests}</td>
                <td>{Number(item.pos_percent).toFixed(2) + "%"}</td>
            </tr>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">View Daily Results</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Date</td>
                                    <td>Tests Processed</td>
                                    <td>Positive Count</td>
                                    <td>Positive Percent</td>
                                </tr>
                            </thead>
                            <tbody>{dailyResultsRow}</tbody>
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

export default ViewDailyResults;
