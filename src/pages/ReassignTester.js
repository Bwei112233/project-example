import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";

class ReassignTester extends Component {
    constructor(props) {
        super(props);
        this.state = {
            testers: {},
            all_sites: [],
            remove: [],
            add: [],
            selected_add_site: "",
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.addSite = this.addSite.bind(this);
        this.removeSite = this.removeSite.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();

        console.log(this.state.testers);

        let testers = this.state.testers;

        for (let key in testers) {
            let tester = testers[key];

            let orig = tester.orig_assigned;
            let sites = tester.assigned;

            // to remove
            for (let key in orig) {
                if (!sites.includes(key)) {
                    await makeAPICall("unassigntester", {
                        tester_username: tester.username,
                        site_name: orig[key],
                    });
                }
            }

            // to add
            for (let key in sites) {
                if (!orig.includes(key)) {
                    await makeAPICall("assigntester", {
                        tester_username: tester.username,
                        site_name: sites[key],
                    });
                }
            }
        }

        // redirect to home
        this.props.history.push("/home");
    }

    addSite(username, site) {
        if (site) {
            console.log(username + " " + site);
            let testers = this.state.testers;
            testers[username].assigned.push(site);

            let newSelected;
            for (let key in this.state.all_sites) {
                if (
                    !testers[username].assigned.includes(
                        this.state.all_sites[key]
                    )
                ) {
                    newSelected = this.state.all_sites[key];
                    break;
                }
            }
            testers[username].selected_site = newSelected;
            this.setState({ testers: testers });
        }
    }

    async removeSite(username, site) {
        console.log(username + " " + site);

        let numAtSite = await makeAPICall("peopleatsite", {
            site_name: site,
        });

        console.log(numAtSite);

        if (numAtSite.data.people_at_site <= 1) {
            alert(
                "Cannot remove this site because you are the last tester there."
            );
            return;
        }

        let testers = this.state.testers;
        let index = testers[username].assigned.indexOf(site);

        if (index > -1) {
            testers[username].assigned.splice(index, 1);
        }

        let newSelected;
        for (let key in this.state.all_sites) {
            if (
                !testers[username].assigned.includes(this.state.all_sites[key])
            ) {
                newSelected = this.state.all_sites[key];
                break;
            }
        }
        testers[username].selected_site = newSelected;
        this.setState({ testers: testers });
    }

    onSelectChange(username, value) {
        console.log(username + " " + value);
        let testers = this.state.testers;
        testers[username].selected_site = value;
        this.setState({ testers: testers });
    }

    async componentDidMount() {
        // get all test sites in the system
        let allSitesResponse = await makeAPICall("testsitenames", {});
        let tempSites = [];
        if (allSitesResponse.data) {
            let allSites = allSitesResponse.data.sites;

            for (let key in allSites) {
                tempSites.push(allSites[key]);
            }
            this.setState({ all_sites: tempSites });
        }

        // get testers
        let fullNameResponse = await makeAPICall("viewtesters", {});

        let tempTesters = {};

        // put temp testers into array
        // also stores site locations
        for (let key in fullNameResponse.data) {
            let currentTester = fullNameResponse.data[key];

            tempTesters[currentTester.username] = {
                orig_assigned:
                    currentTester.assigned_sites != null
                        ? currentTester.assigned_sites.split(",")
                        : [],
                assigned:
                    currentTester.assigned_sites != null
                        ? currentTester.assigned_sites.split(",")
                        : [],
                username: currentTester.username,
                name: currentTester.name,
                phone_number: currentTester.phone_number,
                selected_site: "",
            };

            let selectedSite;
            for (let key in tempSites) {
                if (
                    !tempTesters[currentTester.username].assigned.includes(
                        tempSites[key]
                    )
                ) {
                    selectedSite = tempSites[key];
                    break;
                }
            }
            tempTesters[currentTester.username].selected_site = selectedSite;
        }

        console.log(tempTesters);

        this.setState({ testers: tempTesters });
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        // if not an admin thennnnnnnn push home
        if (!localStorage.getItem("roles").includes("admin")) {
            return <Redirect push to="/home" />;
        }

        // let testerRow = this.state.testers.map((item) => (
        //     <tr key={item.username}>
        //         <td>{item.username}</td>
        //         <td>{item.name}</td>
        //         <td>{item.phone_number}</td>
        //         <td>placeholder for assigned sites</td>
        //     </tr>
        // ));

        let testerRow = [];

        for (let key in this.state.testers) {
            let tester = this.state.testers[key];

            // create add/remove site table
            let assigned_sites = tester.assigned.map((item) => (
                <tr key={item}>
                    <td>
                        <button
                            onClick={(event) => {
                                event.preventDefault();
                                this.removeSite(tester.username, item);
                            }}
                        >
                            x
                        </button>
                    </td>
                    <td>{item}</td>
                </tr>
            ));

            let selectOptions = this.state.all_sites.map(
                (item) =>
                    !tester.assigned.includes(item) && (
                        <option key={item}>{item}</option>
                    )
            );

            // // check if selected site is not created yet
            // if (tester.selected_site === "") {
            //     for (let key in this.state.all_sites) {
            //         if (!tester.assigned.includes(this.state.all_sites[key])) {
            //             let tempTesters = this.state.testers;
            //             tempTesters[
            //                 tester.username
            //             ].selected_site = this.state.all_sites[key];
            //             this.setState({ testers: tempTesters });
            //             break;
            //         }
            //     }
            // }

            testerRow.push(
                <tr key={tester.username}>
                    <td>{tester.username}</td>
                    <td>{tester.name}</td>
                    <td>{tester.phone_number}</td>
                    <td>
                        <table id="assigned-sites-table">
                            <tbody>
                                {assigned_sites}
                                <tr>
                                    <td>
                                        <button
                                            onClick={(event) => {
                                                event.preventDefault();
                                                this.addSite(
                                                    tester.username,
                                                    tester.selected_site
                                                );
                                            }}
                                            id="add-site-button"
                                        >
                                            {" "}
                                            +{" "}
                                        </button>
                                    </td>
                                    <td>
                                        <select
                                            value={tester.selected_site}
                                            onChange={(event) => {
                                                this.onSelectChange(
                                                    tester.username,
                                                    event.target.value
                                                );
                                            }}
                                        >
                                            {selectOptions}
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            );
        }

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Reassign Tester</div>
                    <form onSubmit={this.handleSubmit}>
                        <br />
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <td>Username</td>
                                        <td>Name</td>
                                        <td>Phone Number</td>
                                        <td>Assigned Sites</td>
                                    </tr>
                                </thead>
                                <tbody>{testerRow}</tbody>
                            </table>
                        </div>
                        <br />
                        <div className="form-submit-wrapper">
                            <Link to="/home">Back (Home)</Link>
                            <input
                                className="form-submit-button"
                                type="submit"
                                value="Update"
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default ReassignTester;
