import React, { Component } from 'react';
import SignIn from '../signIn/signIn';
import axios from 'axios';
import Notices from '../notices/notices';
import CreateEmployee from '../createEmployee/CreateEmployee';
import CreateNotice from '../notices/createNotice';
import MyProfile from '../myProfile/myProfile';
import SearchEmployees from '../employees/employees';
import MyIssues from '../myIssues/myIssues';
import RaiseIssue from '../raiseIssue/raiseIssue';

import './Home.css';

class Home extends Component{
  constructor(props) {
    super(props);
    this.state = {
    	user: {},
   		isAuth: false,
   		isAdmin: false,
      selectedTab : 1
    };
    this.validateToken = this.validateToken.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleSuccessSignIn = this.handleSuccessSignIn.bind(this);
    this.changeTab = this.changeTab.bind(this);
  }
  validateToken = (token) => {
    const _this = this;
    const payload = axios.post(`http://localhost:3001/api/authWithToken`, token)
        .then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in auth");
      } else {
          sessionStorage.setItem('jwtToken', result.data.token);
          _this.handleSuccessSignIn(result.data);
        }
    }).catch(err => {
        console.log(err)
    });
  };
  componentDidMount() {
  	var token = sessionStorage.jwtToken;
  	if(token) {
  		this.validateToken({token: token});
  	}
  }
  handleSuccessSignIn(data) {
  	this.setState({user: data.user, isAdmin: data.user.isAdmin, isAuth: true});
  }
  handleLogOut() {
  	this.setState({user:{}, isAdmin:false, isAuth:false});
  	sessionStorage.jwtToken = '';
  	console.log("logout successful!");
  }
  changeTab(event) {
    var prevtab = document.getElementById("tab-"+this.state.selectedTab);
    prevtab.classList.remove("selected-tab");
    this.setState({selectedTab: parseInt(event.target.id.substr(4, 1))})
    event.target.classList.add("selected-tab");
  }
  render() {
  		if(!this.state.isAuth) {
			return (
				<SignIn OnSuccessSignIn={this.handleSuccessSignIn}/>
	    	)
		} else {
			return (
				<div>
          <div className = "header">

            <div>Hello {" " + this.state.user.firstName + " " + this.state.user.lastName}</div>
            
            <button style = {{width: "100px", height:"50px"}} className="submit-btn-retro-sml" onClick={this.handleLogOut}>Log Out</button>
          </div>
          <div className="header-tabs">
            <div className="tab-btn-retro selected-tab" id="tab-1" onClick={this.changeTab}>Home</div>
            <div className="tab-btn-retro" id="tab-2" onClick={this.changeTab}>My Issues</div>
            <div className="tab-btn-retro" id="tab-3" onClick={this.changeTab}>Employees</div>
            <div className="tab-btn-retro" id="tab-4" onClick={this.changeTab}>Notices</div>
            <div className="tab-btn-retro" id="tab-5" onClick={this.changeTab}>My Profile</div>
          </div>

          <div className="main-page">
            {
              this.state.selectedTab === 1 &&
              (
                <div className="tab-div">Hello this is the landing page!</div>
              )
            }
            {
              this.state.selectedTab === 2 && 
              (
                <div className="tab-div"> 
                  <MyIssues user={this.state.user}></MyIssues>
                  <RaiseIssue/>
                </div>
              )
            }
            {
              this.state.selectedTab === 3 && 
              (
                <div className="tab-div"> 
                <SearchEmployees/>
                {this.state.user.isAdmin && <CreateEmployee/>}          
                </div>
              )
            }

            {
              this.state.selectedTab === 4 && 
              (
                <div className="tab-div"> 
                {this.state.user.isAdmin && <CreateNotice/>}
                <Notices user={this.state.user}></Notices>
                </div>
              )
            }
            {
            this.state.selectedTab === 5 && 
              (
                <div className="tab-div"> 
                <MyProfile user={this.state.user} callback={this.handleLogOut}/>
                </div>
              )
            }
          </div>

				</div>

			)
		}
  }
}

export default Home;
