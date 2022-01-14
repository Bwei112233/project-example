import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";
import moment from "moment";

class ExplorePoolResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pool_id: 0,
            pool_meta: {},
            tests_in_pool: [],
        };
    }

    async componentDidMount() {
        const { poolid } = this.props.match.params;

        this.setState({ pool_id: poolid });

        let response = await makeAPICall("poolmetadata", {
            pool_id: poolid,
        });

        if (response.data) {
            this.setState({ pool_meta: response.data[0] });

            let testsResponse = await makeAPICall("testsinpool", {
                pool_id: poolid,
            });

            let tests = [];
            for (let key in testsResponse.data) {
                tests.push(testsResponse.data[key]);
            }

            this.setState({ tests_in_pool: tests });
        }
    }

    render() {
        if (!isLoggedInLocally() || this.state.pool_meta == null) {
            return <Redirect push to="/home" />;
        }

        let date_processed = moment(this.state.pool_meta.date_processed);
        let testRows = this.state.tests_in_pool.map((item) => (
            <tr key={item.test_id}>
                <td>{item.test_id}</td>
                <td>{moment(item.date_tested).format("M/D/YYYY")}</td>
                <td>{item.testing_site}</td>
                <td>
                    {item.test_result != null &&
                        item.test_result.charAt(0).toUpperCase() +
                            item.test_result.slice(1)}
                </td>
            </tr>
        ));

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Explore Pool Result</div>

                    <div className="table-name">Pool Metadata</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pool ID</th>
                                    <th>{this.state.pool_id}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Date Processed</td>
                                    <td>
                                        {date_processed.format("M/DD/YYYY")}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Pooled Result</td>
                                    <td>
                                        {this.state.pool_meta.pooled_result !=
                                            null &&
                                            this.state.pool_meta.pooled_result
                                                .charAt(0)
                                                .toUpperCase() +
                                                this.state.pool_meta.pooled_result.slice(
                                                    1
                                                )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Processed By</td>
                                    <td>{this.state.pool_meta.processed_by}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <br />
                    <br />

                    <div className="table-name">Tests in Pool</div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Test ID#</th>
                                    <th>Date Tested</th>
                                    <th>Testing Site</th>
                                    <th>Test Result</th>
                                </tr>
                            </thead>
                            <tbody>{testRows}</tbody>
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

export default ExplorePoolResult;
