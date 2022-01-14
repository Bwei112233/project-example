import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";

class TesterChangeTestingSite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            full_name: "",
            original_assigned_sites: [],
            assigned_sites: [],
            all_sites: [],
            remove: [],
            add: [],
            selected_add_site: "",
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeSite = this.removeSite.bind(this);
        this.addSite = this.addSite.bind(this);
        this.handleSiteChange = this.handleSiteChange.bind(this);
    }

    async removeSite(name) {
        let numAtSite = await makeAPICall("peopleatsite", {
            site_name: name,
        });

        if (numAtSite.data.people_at_site <= 1) {
            alert(
                "Cannot remove this site because you are the last tester there."
            );
            return;
        }

        let tempRemove = this.state.remove;
        const removeIndex = tempRemove.indexOf(name);
        if (removeIndex > -1) {
            tempRemove.splice(removeIndex, 1);
        }
        this.setState({ remove: tempRemove });

        let tempAssignedSites = this.state.assigned_sites;
        const assignedIndex = tempAssignedSites.indexOf(name);
        if (assignedIndex > -1) {
            tempAssignedSites.splice(assignedIndex, 1);
        }
        this.setState({ assigned_sites: tempAssignedSites });

        // set the selected add site to the next available one
        for (let i = 0; i < this.state.all_sites.length; i++) {
            if (!tempAssignedSites.includes(this.state.all_sites[i])) {
                this.setState({ selected_add_site: this.state.all_sites[i] });
                break;
            }
        }
    }

    addSite() {
        let tempAssignedSites = [];
        let tempAdd = this.state.add;
        tempAdd.push(this.state.selected_add_site);
        this.setState({ add: tempAdd });

        tempAssignedSites = this.state.assigned_sites;
        tempAssignedSites.push(this.state.selected_add_site);
        this.setState({ assigned_sites: tempAssignedSites });

        // set the selected add site to the next available one
        for (let i = 0; i < this.state.all_sites.length; i++) {
            if (!tempAssignedSites.includes(this.state.all_sites[i])) {
                this.setState({ selected_add_site: this.state.all_sites[i] });
                break;
            }
        }
    }

    handleSiteChange(event) {
        event.preventDefault();
        this.setState({ selected_add_site: event.target.value });
    }

    async handleSubmit(event) {
        event.preventDefault();

        let orig = this.state.original_assigned_sites;
        let sites = this.state.assigned_sites;

        // to remove
        for (let key in orig) {
            if (!sites.includes(key)) {
                await makeAPICall("unassigntester", {
                    tester_username: localStorage.getItem("username"),
                    site_name: orig[key],
                });
            }
        }

        // to add
        for (let key in sites) {
            if (!orig.includes(key)) {
                await makeAPICall("assigntester", {
                    tester_username: localStorage.getItem("username"),
                    site_name: sites[key],
                });
            }
        }

        // redirect to home
        this.props.history.push("/home");
    }

    async componentDidMount() {
        let fullNameResponse = await makeAPICall("viewtesters", {});

        for (let key in fullNameResponse.data) {
            if (
                fullNameResponse.data[key].username ===
                localStorage.getItem("username")
            ) {
                this.setState({ full_name: fullNameResponse.data[key].name });
            }
        }

        let assignedSitesResponse = await makeAPICall("testerassignedsites", {
            tester_username: localStorage.getItem("username"),
        });

        let assignedSites = [];
        for (let key in assignedSitesResponse.data) {
            assignedSites.push(assignedSitesResponse.data[key].site_name);
        }
        this.setState({
            original_assigned_sites: JSON.parse(JSON.stringify(assignedSites)),
        });
        this.setState({ assigned_sites: assignedSites });

        let allSitesResponse = await makeAPICall("testsitenames", {});

        if (allSitesResponse.data) {
            let allSites = [];
            let first = true;
            for (let key in allSitesResponse.data.sites) {
                if (
                    first &&
                    !assignedSites.includes(allSitesResponse.data.sites[key])
                ) {
                    first = false;
                    this.setState({
                        selected_add_site: allSitesResponse.data.sites[key],
                    });
                }
                allSites.push(allSitesResponse.data.sites[key]);
            }
            this.setState({ all_sites: allSites });
        }
    }

    render() {
        if (!isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        // if not a tester thennnnnnnn push home
        if (!localStorage.getItem("roles").includes("sitetester")) {
            return <Redirect push to="/home" />;
        }

        let assigned_sites_jsx = this.state.assigned_sites.map((item) => (
            <tr key={item}>
                <td>
                    <button
                        onClick={(event) => {
                            event.preventDefault();
                            this.removeSite(item);
                        }}
                    >
                        x
                    </button>
                </td>
                <td>{item}</td>
            </tr>
        ));

        let dropdown_jsx = this.state.all_sites.map(
            (item) =>
                !this.state.assigned_sites.includes(item) && (
                    <option name={item} key={item}>
                        {item}
                    </option>
                )
        );

        return (
            <div className="screen-wrapper">
                <div className="panel-wrapper">
                    <div className="form-title">Tester Change Testing Site</div>
                    <form onSubmit={this.handleSubmit}>
                        <br />
                        <div className="table-wrapper">
                            <table id="tester-change-testing-site-table">
                                <tbody>
                                    <tr>
                                        <td>Username</td>
                                        <td>
                                            {localStorage.getItem("username")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Full Name</td>
                                        <td>{this.state.full_name}</td>
                                    </tr>
                                    <tr>
                                        <td>Assigned Sites</td>
                                        <td>
                                            <table id="assigned-sites-table">
                                                <tbody>
                                                    {assigned_sites_jsx}
                                                    <tr>
                                                        <td>
                                                            <button
                                                                onClick={(
                                                                    event
                                                                ) => {
                                                                    event.preventDefault();
                                                                    this.addSite();
                                                                }}
                                                                id="add-site-button"
                                                            >
                                                                +
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <select
                                                                onChange={
                                                                    this
                                                                        .handleSiteChange
                                                                }
                                                                value={
                                                                    this.state
                                                                        .selected_add_site
                                                                }
                                                            >
                                                                {dropdown_jsx}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
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

export default TesterChangeTestingSite;
