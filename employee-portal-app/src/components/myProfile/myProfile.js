import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-responsive-modal';
import './myProfile.css';

class MyProfile extends Component{
  constructor(props) {
    super(props);
    this.state = {
      formData:{},
      user: {},
      modalOpen: false,
      selectedNotice: {}
    };
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onOpenModal = this.onOpenModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validateFieldsAndUpdateUser = this.validateFieldsAndUpdateUser.bind(this);
  }

  componentDidMount() {
    this.setState({user: this.props.user});
    const _this = this;
    setTimeout(function() {
      _this.setState({formData: {FirstName: _this.state.user.firstName, LastName: _this.state.user.lastName, NewPassword: "", ConfirmPassword:"", OldPassword:""}}) 
    });
  }
  onOpenModal(event,data) {
    this.setState({modalOpen: true, formData: {FirstName: this.state.user.firstName, LastName: this.state.user.lastName, NewPassword: "", ConfirmPassword:"", OldPassword:""}});
  }
  handleChange(evt) {
    var formData = this.state.formData;
    formData[evt.target.name] = evt.target.value;

    this.setState({ formData: formData });
  }
  onCloseModal() {
    this.setState({modalOpen: false, formData: {FirstName: this.state.user.firstName, LastName: this.state.user.lastName, NewPassword: "", ConfirmPassword:"", OldPassword:""}});
  }
  validateFieldsAndUpdateUser = (values) => {
      const _this = this;      
      const payload = axios.post(`http://localhost:3001/api/updateProfile`, values)
          .then((result) => {
        // Note: Error's "data" is in result.response.data (inside "response")
        // success's "data" is in result.data
        
        this.setState({modalOpen: false});
        
        if (result.response && result.response.status !== 200) {
          //signInUserFailure(result.response.data);
          console.log("error in auth");
        } else {
          console.log("Employee Updated")
          this.props.callback();
        }
      }).catch(err => {
          console.log(err)
      });
  };

  handleSubmit(event) {
    const token = sessionStorage.jwtToken;
    this.validateFieldsAndUpdateUser({FirstName: this.state.formData.FirstName,
     NewPassword: this.state.formData.NewPassword, 
     ConfirmPassword: this.state.formData.ConfirmPassword,
     OldPassword: this.state.formData.OldPassword, 
     LastName: this.state.formData.LastName,
     token: token});
    event.preventDefault();
  }
  render() {
    var _this = this;
		return (
        <div className="LBContentCard LBmaincard">
                
              <form onSubmit={this.handleSubmit}>
                    <label>
                    <div className="form-field"> 

                    First Name : 
                    <input type="text" name="FirstName" value={this.state.formData.FirstName} onChange={this.handleChange}/>
                    </div>
                    </label>

                    
                    <label>
                    <div className="form-field"> 
                    Last Name : 
                    <input type="text" name="LastName" value={this.state.formData.LastName} onChange={this.handleChange}/>
                    </div>
                    </label>

                    <label>
                    <div className="form-field"> 
                    Email : 
                    <input style={{"cursor": "not-allowed"}} type="text" name="Email" value={this.state.user.email} disabled={true}/>
                    </div>
                    </label>

                    <label>
                    <div className="form-field"> 
                    New Password : 
                    <input type="text" name="NewPassword" value={this.state.formData.NewPassword} onChange={this.handleChange}/>
                    </div>
                    </label>


                    <label>
                    <div className="form-field"> 
                    Confirm Password : 
                    <input type="text" name="ConfirmPassword" value={this.state.formData.ConfirmPassword} onChange={this.handleChange}/>
                    </div>
                    </label>


                    <label>
                    <div className="form-field"> 
                    Old Password : 
                    <input type="text" name="OldPassword" value={this.state.formData.OldPassword} onChange={this.handleChange}/>
                    </div>
                    </label>

                    <br></br>

                    <input className="submit-btn-retro" type="submit" value="Update" />
                </form>     
        </div>
      )
  }
}

export default MyProfile;
