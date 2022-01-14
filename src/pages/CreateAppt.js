import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";



class CreateAppt extends Component {
    constructor(props) {
        super(props);
        this.state = {
            site_names: [],
            date: "",
            start_time_hour:"",
            start_time_minute: "",
            selected_site: "Bobby Dodd Stadium"
        };

        // this.state = {
        //     site_name: "stamps",
        //     date: "1/20/2012",
        //     time:"12:30"
        // };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handleSelectedSite = this.handleSelectedSite.bind(this);
        this.onStartTimeHourChange = this.onStartTimeHourChange.bind(this);
        this.onStartTimeMinuteChange = this.onStartTimeMinuteChange.bind(this);
    }

    // functions to handle changes in input data
    onStartTimeHourChange(event) {
        this.setState({start_time_hour : event.target.value});
    }

    onStartTimeMinuteChange(event) {
        this.setState({start_time_minute : event.target.value});
    }

    handleDateChange(event) {
        this.setState({ date : event.target.value })
    } 

    handleTimeChange(event) {
        this.setState({ time : event.target.value })
    }

    handleSelectedSite(event) {
        this.setState({selected_site : event.target.value})
    }


    async handleSubmit(event) {
        event.preventDefault();

        console.log("starting create appointment");

        const dateString = this.state.date; 
        const timeString = this.state.start_time_hour + ":" + this.state.start_time_minute;

        if (dateString === "" || timeString.length != 5) {
            alert("entered invalid field");
            this.props.history.push("/home");
            return;
        }

        console.log(this.state.selected_site);
        console.log(timeString);
        console.log(dateString);
        
        // TODO need to check if they're an admin!!!
        let response = await makeAPICall("createappointment", {
            site_name: this.state.selected_site,
            date: dateString,
            time: timeString
        });

        if (response.data.success) {
            console.log("success");
            // redirect to home
            this.props.history.push("/home");
        } else {
            console.log("failed");
            alert("failed to create appointment. Might already exist or exceed constraints");
            this.props.history.push("/home");
        }
    }

    // get sites that appointments can be sceduled at
    async componentDidMount() {

        console.log("starting mount");
        console.log("person logged in is " + localStorage.getItem("username"));
        console.log("role is " + localStorage.getItem("roles"));

        let response;
        let username1 = localStorage.getItem("username");

        // add once we get roles working
        if (localStorage.getItem("roles").includes("admin")) {
            response = await makeAPICall("testsitenames", {});
        } else {
            response = await makeAPICall("testsitefortester", {username : username1});
        }
        
        // remove once we get roles working
        // response = await makeAPICall("testsitenames", {});

        let foundSites = response.data.sites;
        console.log(foundSites);
        let tempSites = [];
        
        for (let i = 0; i < foundSites.length; i++) {
            tempSites.push(foundSites[i]);
        }

        this.setState({ site_names: tempSites });
    }

    render() {

        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }


        // if (localStorage.getItem("roles").includes("student")) {
        //     alert("cannot create appointment as student!");
        //     return <Redirect push to="/home" />;
        // }

        // creates array of possible sites to choose from dropdown menu
        let siteOptions = this.state.site_names.map((item) => (
            <option name={item} key={item} value={item}>
                {item}
            </option>
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
            <div className="screen-wrapper" onSubmit={this.handleSubmit}>
                <div className="panel-wrapper">
                    <form>
                        <div className="form-title">Create an Appointment</div>

                        <div>Site Name</div>
                        <select
                            name = "first-site-name"
                            onChange = {this.handleSelectedSite}
                            value = {this.state.selected_site}
                        >
                            {siteOptions}
                        </select>


                        <div> Date </div>
                        <input
                                type="date"
                                onChange={this.handleDateChange}
                                max={
                                    this.state.end_date === ""
                                        ? ""
                                        : this.state.end_date
                                }
                                className="small-date-input"
                                value={this.state.start_date}
                            />{" "}

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
                        </div>

                        <div className="form-submit-wrapper">
                            <Link to="/home">Back (Home)</Link>
                            <input
                                className="form-submit-button"
                                type="submit"
                                value="Create Appointment"
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default CreateAppt;
