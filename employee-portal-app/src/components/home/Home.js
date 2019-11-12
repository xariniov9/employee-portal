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
    
    var prevtab = document.getElementById("tab-"+this.state.selectedTab);
    prevtab.classList.remove("selected-tab");
    this.setState({selectedTab:1});

    console.log("logout successful!");

  }
  componentWillUnmount() {
    var prevtab = document.getElementById("tab-"+this.state.selectedTab);
    prevtab.classList.remove("selected-tab");
    this.setState({selectedTab:1});
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

            <div id="header-greet"><span className="col-hello">Hello,</span> {" " + this.state.user.firstName + " " + this.state.user.lastName}</div>
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
                <div className="tab-div">

                  <div className="info-card">
                    <div className="info-title">
                    Issues
                    </div>
                    <br></br>
                    You can post your issues here and like a responsible and cool organisation that we are, we will take care of you! <br></br>
                    Issues may be anything ranging from water bottle to medicine. HR issues to counselling sessions. Extra chilled AC to annoying co-worker.
                    You can post just about anything that bothers you.<br></br>
                    Your issues are automatically picked up by our super hard-working admins. You can also track the progress of your issues.
                  </div>
                  <div className="info-card">
                  <div className="info-title">
                    Employees
                  </div>
                    <br></br>
                    Need to find some colleague but all you know about them is their department or first name or just email? <br></br> Don't worry, find them in Employees section.
                    You will be able to send message right from here in the future.
                  </div>
                  <div className="info-card">
                  <div className="info-title">
                    Notices
                  </div>
                    <br></br>
                    Ever missed some important announcement or a notice regarding the celebrations in the cafetaria. <br></br> We have developed a notice board where you can find all the
                    important information posted from time to time. <br></br> This information ranges from company growth to fun activities. Jokes from the CEO to client stories. 
                    This is the playground of our leaders.
                  </div>
                  <div className="info-card">
                  <div className="info-title">
                    My Profile
                  </div>
                    <br></br>
                    You can now edit your personal details as many times as you want. No need to contact HR department for typos in your information. You can now also change your password!
                  </div>

                </div>
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
