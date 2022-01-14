import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";

let usStates = [
    { name: "ALABAMA", abbreviation: "AL" },
    { name: "ALASKA", abbreviation: "AK" },
    { name: "AMERICAN SAMOA", abbreviation: "AS" },
    { name: "ARIZONA", abbreviation: "AZ" },
    { name: "ARKANSAS", abbreviation: "AR" },
    { name: "CALIFORNIA", abbreviation: "CA" },
    { name: "COLORADO", abbreviation: "CO" },
    { name: "CONNECTICUT", abbreviation: "CT" },
    { name: "DELAWARE", abbreviation: "DE" },
    { name: "DISTRICT OF COLUMBIA", abbreviation: "DC" },
    { name: "FEDERATED STATES OF MICRONESIA", abbreviation: "FM" },
    { name: "FLORIDA", abbreviation: "FL" },
    { name: "GEORGIA", abbreviation: "GA" },
    { name: "GUAM", abbreviation: "GU" },
    { name: "HAWAII", abbreviation: "HI" },
    { name: "IDAHO", abbreviation: "ID" },
    { name: "ILLINOIS", abbreviation: "IL" },
    { name: "INDIANA", abbreviation: "IN" },
    { name: "IOWA", abbreviation: "IA" },
    { name: "KANSAS", abbreviation: "KS" },
    { name: "KENTUCKY", abbreviation: "KY" },
    { name: "LOUISIANA", abbreviation: "LA" },
    { name: "MAINE", abbreviation: "ME" },
    { name: "MARSHALL ISLANDS", abbreviation: "MH" },
    { name: "MARYLAND", abbreviation: "MD" },
    { name: "MASSACHUSETTS", abbreviation: "MA" },
    { name: "MICHIGAN", abbreviation: "MI" },
    { name: "MINNESOTA", abbreviation: "MN" },
    { name: "MISSISSIPPI", abbreviation: "MS" },
    { name: "MISSOURI", abbreviation: "MO" },
    { name: "MONTANA", abbreviation: "MT" },
    { name: "NEBRASKA", abbreviation: "NE" },
    { name: "NEVADA", abbreviation: "NV" },
    { name: "NEW HAMPSHIRE", abbreviation: "NH" },
    { name: "NEW JERSEY", abbreviation: "NJ" },
    { name: "NEW MEXICO", abbreviation: "NM" },
    { name: "NEW YORK", abbreviation: "NY" },
    { name: "NORTH CAROLINA", abbreviation: "NC" },
    { name: "NORTH DAKOTA", abbreviation: "ND" },
    { name: "NORTHERN MARIANA ISLANDS", abbreviation: "MP" },
    { name: "OHIO", abbreviation: "OH" },
    { name: "OKLAHOMA", abbreviation: "OK" },
    { name: "OREGON", abbreviation: "OR" },
    { name: "PALAU", abbreviation: "PW" },
    { name: "PENNSYLVANIA", abbreviation: "PA" },
    { name: "PUERTO RICO", abbreviation: "PR" },
    { name: "RHODE ISLAND", abbreviation: "RI" },
    { name: "SOUTH CAROLINA", abbreviation: "SC" },
    { name: "SOUTH DAKOTA", abbreviation: "SD" },
    { name: "TENNESSEE", abbreviation: "TN" },
    { name: "TEXAS", abbreviation: "TX" },
    { name: "UTAH", abbreviation: "UT" },
    { name: "VERMONT", abbreviation: "VT" },
    { name: "VIRGIN ISLANDS", abbreviation: "VI" },
    { name: "VIRGINIA", abbreviation: "VA" },
    { name: "WASHINGTON", abbreviation: "WA" },
    { name: "WEST VIRGINIA", abbreviation: "WV" },
    { name: "WISCONSIN", abbreviation: "WI" },
    { name: "WYOMING", abbreviation: "WY" },
];

class CreateTestingSite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            site_name: "",
            street: "",
            city: "",
            state: "AL",
            zip: "",
            location: "East",
            first_tester_username: "akarev16",
            testers: [],
            all_sites: [],
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSiteNameChange = this.handleSiteNameChange.bind(this);
        this.handleStreetChange = this.handleStreetChange.bind(this);
        this.handleCityChange = this.handleCityChange.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleZipChange = this.handleZipChange.bind(this);
        this.handleLocationChange = this.handleLocationChange.bind(this);
        this.handleFirstTesterUsernameChange = this.handleFirstTesterUsernameChange.bind(
            this
        );
    }

    handleSiteNameChange(event) {
        this.setState({ site_name: event.target.value });
    }

    handleStreetChange(event) {
        this.setState({ street: event.target.value });
    }

    handleCityChange(event) {
        this.setState({ city: event.target.value });
    }

    handleStateChange(event) {
        this.setState({ state: event.target.value });
    }

    handleZipChange(event) {
        this.setState({ zip: event.target.value });
    }

    handleLocationChange(event) {
        this.setState({ location: event.target.value });
    }

    handleFirstTesterUsernameChange(event) {
        this.setState({ first_tester_username: event.target.value });
    }

    async handleSubmit(event) {
        event.preventDefault();

        // check if site name is unique
        if (this.state.all_sites.includes(this.state.site_name)) {
            alert("Site name is already taken!");
            return;
        }

        // check if zip code is 5 digits
        if (this.state.zip.toString().length !== 5) {
            alert("Zip code must be 5 digits");
            return;
        }

        // check if fields are blank
        if (
            this.state.site_name.trim() === "" ||
            this.state.city.trim() === "" ||
            this.state.street.trim() === ""
        ) {
            alert("Fields can't be blank.");
            return;
        }

        let response = await makeAPICall("createtestingsite", {
            site_name: this.state.site_name,
            street: this.state.street,
            city: this.state.city,
            state: this.state.state,
            zip: this.state.zip,
            location: this.state.location,
            first_tester_username: this.state.first_tester_username,
        });

        if (response.data.success) {
            console.log("success");
            // redirect to home
            this.props.history.push("/home");
        } else {
            console.log("failed");
        }
    }

    async componentDidMount() {
        let response = await makeAPICall("viewtesters", {});

        let tempTesters = [];
        for (let key in response.data) {
            tempTesters.push({
                name: response.data[key].name,
                username: response.data[key].username,
            });
        }
        this.setState({ testers: tempTesters });

        let sitesResponse = await makeAPICall("testsitenames", {});
        let allSites = [];
        for (let key in sitesResponse.data.sites) {
            allSites.push(sitesResponse.data.sites[key]);
        }
        this.setState({ all_sites: allSites });
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let stateOptions = usStates.map((item) => (
            <option name={item.abbreviation} key={item.abbreviation}>
                {item.abbreviation}
            </option>
        ));

        let testerOptions = this.state.testers.map((item) => (
            <option name={item.name} key={item.username} value={item.username}>
                {item.name}
            </option>
        ));

        return (
            <div className="screen-wrapper" onSubmit={this.handleSubmit}>
                <div className="panel-wrapper">
                    <form>
                        <div className="form-title">Create a Testing Site</div>
                        <div>Site Name</div>
                        <input
                            type="text"
                            name="site-name"
                            maxLength="40"
                            onChange={this.handleSiteNameChange}
                            value={this.state.site_name}
                        ></input>
                        <div>Street Address</div>
                        <input
                            type="text"
                            name="street"
                            maxLength="40"
                            onChange={this.handleStreetChange}
                            value={this.state.street}
                        ></input>
                        <div id="address-wrapper">
                            <div id="city-state-wrapper">
                                <div>
                                    <div>City</div>
                                    <input
                                        type="text"
                                        name="city"
                                        maxLength="40"
                                        onChange={this.handleCityChange}
                                        value={this.state.city}
                                    ></input>
                                </div>
                                <div>
                                    <div>State</div>
                                    <select
                                        name="state"
                                        onChange={this.handleStateChange}
                                        value={this.state.state}
                                    >
                                        {stateOptions}
                                    </select>
                                </div>
                            </div>
                            <div id="zip-location-wrapper">
                                <div>
                                    <div>Zip Code</div>
                                    <input
                                        type="number"
                                        maxLength="5"
                                        max="99999"
                                        name="zip"
                                        onChange={this.handleZipChange}
                                        value={this.state.zip}
                                    ></input>
                                </div>
                                <div>
                                    <div>Location</div>
                                    <select
                                        name="location"
                                        onChange={this.handleLocationChange}
                                        value={this.state.location}
                                    >
                                        <option value="east">East</option>
                                        <option value="West">West</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>Site Tester</div>
                        <select
                            name="first-tester-username"
                            onChange={this.handleFirstTesterUsernameChange}
                            value={this.state.first_tester_username}
                        >
                            {testerOptions}
                        </select>
                        <br />
                        <div className="form-submit-wrapper">
                            <Link to="/home">Back (Home)</Link>
                            <input
                                className="form-submit-button"
                                type="submit"
                                value="Create Site"
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default CreateTestingSite;
