import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import isLoggedInLocally from "../util/LoginCheck";

class Home extends Component {
    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/Login" />;
        }

        let roles = JSON.parse(localStorage.getItem("roles"));

        return (
            <div className="screen-wrapper" id="home-screen-wrapper">
                <h2>Home</h2>

                {roles.includes("labtech") && (
                    <Link to="/create-pool">Create Pool</Link>
                )}

                {roles.includes("labtech") && (
                    <Link to="/view-pools">View Pools / Process Pools</Link>
                )}

                {roles.includes("labtech") && (
                    <Link to="/view-my-tests-processed">
                        View My Processed Tests
                    </Link>
                )}

                {roles.includes("sitetester") && (
                    <Link to="/tester-change-testing-site">
                        Change Testing Site
                    </Link>
                )}

                {roles.includes("student") && (
                    <Link to="/view-test-results">View My Results</Link>
                )}

                {(roles.includes("student") ||
                    roles.includes("labtech") ||
                    roles.includes("admin") ||
                    roles.includes("sitetester")) && (
                    <Link to="/view-aggregatte-results">
                        View Aggregate Results
                    </Link>
                )}

                {roles.includes("student") && (
                    <Link to="/sign-up-for-a-test">Sign Up for a Test</Link>
                )}

                {(roles.includes("sitetester") || roles.includes("admin")) && (
                    <Link to="/create-appointment">Create Appointment</Link>
                )}

                {(roles.includes("sitetester") || roles.includes("admin")) && (
                    <Link to="/view-appointments">View Appointments</Link>
                )}

                {roles.includes("admin") && (
                    <Link to="/reassign-tester">Reassign Tester</Link>
                )}

                {roles.includes("admin") && (
                    <Link to="/create-testing-site">Create Testing Site</Link>
                )}
                {/*
                <Link to="/explore-pool-result/1">
                    Explore Pool Result - Pool ID = 1
                </Link>

                <Link to="/explore-pool-result/5">
                    Explore Pool Result - Pool ID = 5
                </Link> */}

                {(roles.includes("student") ||
                    roles.includes("labtech") ||
                    roles.includes("admin") ||
                    roles.includes("sitetester")) && (
                    <Link to="/view-daily-results">View Daily Results</Link>
                )}

                <Link to="/logout">Log Out</Link>
            </div>
        );
    }
}

export default Home;