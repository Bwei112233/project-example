import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../css/stylesheet.css";
import { makeAPICall } from "../util/DataAccess";
import isLoggedInLocally from "../util/LoginCheck";

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            confirmPassword: "",
            fname: "",
            lname: "",
            email: "",
            housing: "Student Housing",
            location: "East",
            phone: "",
            student: true,
            siteTester: true,
            labTech: true,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleHousingChange = this.handleHousingChange.bind(this);
        this.handleLocationChange = this.handleLocationChange.bind(this);
        this.handlePhoneChange = this.handlePhoneChange.bind(this);
        this.handleStudentChange = this.handleStudentChange.bind(this);
        this.handleEmployeeChange = this.handleEmployeeChange.bind(this);
        this.handleTesterChange = this.handleTesterChange.bind(this);
        this.handleLabTechChange = this.handleLabTechChange.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleConfirmPasswordChange(event) {
        this.setState({ confirmPassword: event.target.value });
    }

    handleFirstNameChange(event) {
        this.setState({ fname: event.target.value });
    }

    handleLastNameChange(event) {
        this.setState({ lname: event.target.value });
    }

    handleEmailChange(event) {
        this.setState({ email: event.target.value });
    }

    handleHousingChange(event) {
        this.setState({ housing: event.target.value });
    }

    handleLocationChange(event) {
        this.setState({ location: event.target.value });
    }

    handlePhoneChange(event) {
        this.setState({ phone: event.target.value });
    }

    handleStudentChange(event) {
        event.preventDefault();
        this.setState({ student: true });
        var i, tab, tablinks;
        tab = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tab.length; i++) {
            tab[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById("Student").style.display = "block";
        event.currentTarget.className += " active";
    }

    handleEmployeeChange(event) {
        event.preventDefault();
        this.setState({ student: false });
        var i, tab, tablinks;
        tab = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tab.length; i++) {
            tab[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById("Employee").style.display = "block";
        event.currentTarget.className += " active";
    }

    handleTesterChange(event) {
        this.setState({ siteTester: event.target.checked });
    }

    handleLabTechChange(event) {
        this.setState({ labTech: event.target.checked });
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.state.password !== this.state.confirmPassword) {
            alert("Password and Confirm Password do not match!");
            return;
        }
        if (this.state.username === "") {
            alert("Missing username!");
            return;
        }
        if (this.state.fname === "") {
            alert("Missing first name!");
            return;
        }
        if (this.state.lname === "") {
            alert("Missing last name!");
            return;
        }
        if (!this.state.student && this.state.phone !== "" && this.state.phone.length !== 10) {
            alert("Invalid phone number!");
            return;
        }
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.state.email)) {
            alert("Invalid email!");
            return;
        }
        let response;

        if (this.state.student) {
            response = await makeAPICall("registerstudent", {
                username: this.state.username,
                email: this.state.email,
                fname: this.state.fname,
                lname: this.state.lname,
                location: this.state.location,
                housing_type: this.state.housing,
                password: this.state.password
            });
            console.log(response);
        }
        else {
            var lt = 0;
            var st = 0;
            if (this.state.labTech) {
                lt = 1;
            }
            if (this.state.siteTester) {
                st = 1;
            }
            response = await makeAPICall("registeremployee", {
                username: this.state.username,
                email: this.state.email,
                fname: this.state.fname,
                lname: this.state.lname,
                phone: this.state.phone,
                labtech: lt,
                sitetester: st,
                password: this.state.password
            });
            console.log(response);
        }

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
        }

        else {
            console.log("registration failed");
            alert("Registration failed! Your username may be taken or there may be someone else with the same full name. Your email must also be between 5 and 25 characters.");
        }
    }

    async componentDidMount() {
        document.getElementById("defaultOpen").click();
    }

    render() {
        if (isLoggedInLocally()) {
            return <Redirect push to="/home" />;
        }

        let pwdConfirm, pwdLen, checkboxes;

        if (this.state.password !== this.state.confirmPassword) {
            pwdConfirm = <p className="errormessage">Does not match password</p>
        }
        else {
            pwdConfirm = <p className="errormessage"></p>
        }
        if (this.state.password.length < 8) {
            pwdLen = <p className="errormessage">Password must be at least 8 characters long</p>
        }
        else {
            pwdLen = <p className="errormessage"></p>
        }
        if (!this.state.student && !this.state.labTech && !this.state.siteTester) {
            checkboxes = <p className="errormessage">Employee must have at least one of these roles</p>
        }
        else {
            checkboxes = <p className="errormessage"></p>
        }

        return (
            <div className="screen-wrapper" onSubmit={this.handleSubmit}>
                <div className="register-wrapper">
                    <div className="screen-title">Register</div>

                    <form id="register-form">
                        <div id="username-wrapper">
                            <div>Username</div>
                            <input
                                type="text"
                                name="username"
                                onChange={this.handleUsernameChange}
                                value={this.state.username}
                            ></input>
                        </div>
                        <div id="username-wrapper">
                            <div>Email</div>
                            <input
                                type="email"
                                name="email"
                                onChange={this.handleEmailChange}
                                value={this.state.email}
                            ></input>
                        </div>
                        <div id="username-wrapper">
                            <div>First Name</div>
                            <input
                                type="text"
                                name="fname"
                                onChange={this.handleFirstNameChange}
                                value={this.state.fname}
                            ></input>
                        </div>
                        <div id="username-wrapper">
                            <div>Last Name</div>
                            <input
                                type="text"
                                name="lname"
                                onChange={this.handleLastNameChange}
                                value={this.state.lname}
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
                            {pwdLen}
                        </div>
                        <div id="password-wrapper">
                            <div>Confirm Password</div>
                            <input
                                type="password"
                                name="password"
                                onChange={this.handleConfirmPasswordChange}
                                value={this.state.confirmPassword}
                            ></input>
                            {pwdConfirm}
                        </div>

                        <div class="tab">
                            <button class="tablinks" onClick={this.handleStudentChange} id="defaultOpen">Student</button>
                            <button class="tablinks" onClick={this.handleEmployeeChange}>Employee</button>
                        </div>
                        <div id="Student" class="tabcontent">
                            <label for="housing">Housing Type</label>
                            <select name="housing" id="housing" value={this.state.housing} onChange={this.handleHousingChange} >
                                <option value="Student Housing">Student Housing</option>
                                <option value="Greek Housing">Greek Housing</option>
                                <option value="Off-campus House">Off-Campus Housing</option>
                                <option value="Off-campus Apartment">Off-Campus Apartments</option>
                            </select>
                            <label for="location">Location</label>
                            <select name="location" id="location" value={this.state.location} onChange={this.handleLocationChange} >
                                <option value="East">East</option>
                                <option value="West">West</option>
                            </select>
                        </div>
                        <div id="Employee" class="tabcontent">
                            <div>Phone No.</div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="1234567890"
                                pattern="[0-9]{10}" required
                                onChange={this.handlePhoneChange}
                                value={this.state.phone}
                            ></input>
                            Site Tester?<input type="checkbox" id="siteTester" defaultChecked={this.state.siteTester} onChange={this.handleTesterChange}></input>
                            Lab Tech?<input type="checkbox" id="LabTech" defaultChecked={this.state.labTech} onChange={this.handleLabTechChange}></input>
                            {checkboxes}
                        </div>

                        <div>
                            <Link to="/login">Back to Login</Link>
                            <input
                                id="register-submit"
                                type="submit"
                                value="Register"
                                onClick={this.handleSubmit}
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default Register;