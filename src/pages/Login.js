import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";

let loginInformation = {
    student: {
        username: "mgeller3",
        password: "password19",
    },
    labtech: {
        username: "cforte58",
        password: "password8",
    },
    sitetester: {
        username: "mgrey91",
        password: "password15",
    },
    admin: {
        username: "jlionel666",
        password: "password1",
    },
};

class Login extends Component {
    constructor(props) {
        super(props);
        // admin
        this.state = {
            username: "",
            password: "",
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.login = this.login.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    async handleSubmit(event) {
        event.preventDefault();

        let response = await makeAPICall("login", {
            username: this.state.username,
            password: this.state.password,
        });
        console.log(response);

        if (response.data && response.data.success) {
            console.log("success");
            // this.setState({ loginSuccess: true });

            localStorage.setItem("username", this.state.username);

            // store user roles
            let roles = await makeAPICall("userrole", {
                username: this.state.username,
            });

            localStorage.setItem("roles", JSON.stringify(roles.data.roles));

            // redirect to home
            this.props.history.push("/home");
        } else {
            alert("Invalid credentials!");
        }
    }

    login(type) {
        this.setState({ username: loginInformation[type].username });
        this.setState({ password: loginInformation[type].password });
    }

    render() {
        // if (isLoggedInLocally()) {
        //     return <Redirect push to="/home" />;
        // }

        return (
            <div className="screen-wrapper" onSubmit={this.handleSubmit}>
                <div id="login-wrapper">
                    <div className="screen-title">GT COVID-19 Testing</div>

                    <form id="login-form">
                        <div id="username-wrapper">
                            <div>Username</div>
                            <input
                                type="text"
                                name="username"
                                onChange={this.handleUsernameChange}
                                value={this.state.username}
                            ></input>
                        </div>
                        <div id="password-wrapper">
                            <div>Password</div>
                            <input
                                type="password"
                                name="password"
                                onChange={this.handlePasswordChange}
                                value={this.state.password}
                            ></input>
                        </div>
                        <div id="login-submit-wrapper">
                            <input
                                id="login-submit"
                                type="submit"
                                value="Login"
                            />
                            <Link to="/register">Register</Link>
                        </div>
                        <div
                            className="theme-button"
                            onClick={() => {
                                this.login("student");
                            }}
                        >
                            Fill in Student Info
                        </div>
                        <div
                            className="theme-button"
                            onClick={() => {
                                this.login("labtech");
                            }}
                        >
                            Fill in Lab Tech Info
                        </div>
                        <div
                            className="theme-button"
                            onClick={() => {
                                this.login("sitetester");
                            }}
                        >
                            Fill in Site Tester Info
                        </div>
                        <div
                            className="theme-button"
                            onClick={() => {
                                this.login("admin");
                            }}
                        >
                            Fill in Admin Info
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Login;
