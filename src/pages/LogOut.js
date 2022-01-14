import React, { Component } from "react";
import { Redirect } from "react-router-dom";
// import "../css/activities.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

class LogOut extends Component {
    constructor(props) {
        super(props);

        localStorage.clear();
    }
    render() {
        return <Redirect push to="/Login" />;
    }
}

export default LogOut;
