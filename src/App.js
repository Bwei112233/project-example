import "./App.css";

import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";

import Login from "./pages/Login";
import LogOut from "./pages/LogOut";
import Home from "./pages/Home";
import Register from "./pages/Register";

import ViewAggregateResults from "./pages/AggregateTestResults";
import StudentViewTestResults from "./pages/StudentViewTestResults";
import ExploreTestResult from "./pages/ExploreTestResult";
import SignUpForATest from "./pages/SignupForATest";
import LabTechTestsProcessed from "./pages/LabTechTestsProcessed";
import ViewPools from "./pages/ViewPools";

import CreateTestingSite from "./pages/CreateTestingSite";
import ExplorePoolResult from "./pages/ExplorePoolResult";
import TesterChangeTestingSite from "./pages/TesterChangeTestingSite";
import ViewDailyResults from "./pages/ViewDailyResults";

import CreateAppt from "./pages/CreateAppt";
import CreatePool from "./pages/CreatePool";
import ViewAppointments from "./pages/ViewAppointments";
import ProcessPools from "./pages/ProcessPools";
import ReassignTester from "./pages/ReassignTester";

function App() {
    return (
        <Router>
            <Switch>
                {/* Screen 1 */}
                <Route path="/login" component={Login} />
                <Route path="/logout" component={LogOut} />
                <Route path="/home" component={Home} />
                {/* Screen 2 */}
                <Route path="/register" component={Register} /> {/* Screen 4 */}
                <Route
                    path="/view-test-results"
                    component={StudentViewTestResults}
                />{" "}
                {/* Screen 5 */}
                <Route
                    path="/explore-test-result/:testid"
                    component={ExploreTestResult}
                />{" "}
                {/* Screen 6 */}
                <Route
                    path="/view-aggregatte-results"
                    component={ViewAggregateResults}
                />{" "}
                {/* Screen 7 */}
                <Route
                    path="/sign-up-for-a-test"
                    component={SignUpForATest}
                />{" "}
                {/* Screen 8 */}
                <Route
                    path="/view-my-tests-processed"
                    component={LabTechTestsProcessed}
                />{" "}
                {/* Screen 9 */}
                <Route path="/view-pools" component={ViewPools} />{" "}
                {/* Screen 10 */}
                <Route path="/create-pool" component={CreatePool} />{" "}
                {/* Screen 11 */}
                <Route path="/process-pool" component={ProcessPools} />{" "}
                {/* Screen 12 */}
                <Route path="/create-appointment" component={CreateAppt} />{" "}
                {/* Screen 13 */}
                <Route path="/view-appointments" component={ViewAppointments} />
                {/* Screen 14 */}
                <Route path="/reassign-tester" component={ReassignTester} />
                {/* Screen 15 */}
                <Route
                    path="/create-testing-site"
                    component={CreateTestingSite}
                />{" "}
                {/* Screen 16 */}
                <Route
                    path="/explore-pool-result/:poolid"
                    component={ExplorePoolResult}
                />{" "}
                {/* Screen 17 */}
                <Route
                    path="/tester-change-testing-site"
                    component={TesterChangeTestingSite}
                />{" "}
                {/* Screen 18 */}
                <Route
                    path="/view-daily-results"
                    component={ViewDailyResults}
                />{" "}
                {/* Defaults */}
                <Route path="/" component={Login} />
                <Redirect to="/" />
            </Switch>
        </Router>
    );
}

export default App;
