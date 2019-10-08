import React, { Component } from 'react';
import SignIn from '../signIn/signIn';
import axios from 'axios';
import Notices from '../notices/notices';
import CreateEmployee from '../createEmployee/CreateEmployee';
import CreateNotice from '../notices/createNotice';

class Home extends Component{
  constructor(props) {
    super(props);
    this.state = {
    	user: {},
   		isAuth: false,
   		isAdmin: false
    };
    this.validateToken = this.validateToken.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleSuccessSignIn = this.handleSuccessSignIn.bind(this);
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
  render() {
  		if(!this.state.isAuth) {
			return (
				<SignIn OnSuccessSignIn={this.handleSuccessSignIn}/>
	    	)
		} else {
			return (
				<div>
					<div>Authenticated User</div>
					<div>{this.state.user.firstName}</div>
					<button onClick={this.handleLogOut}>Log Out</button>
          <CreateEmployee/>
          <CreateNotice/>
          <Notices user={this.state.user}></Notices>
				</div>

			)
		}
  }
}

export default Home;
