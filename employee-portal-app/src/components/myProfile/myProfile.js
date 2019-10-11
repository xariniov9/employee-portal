import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-responsive-modal';

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
    this.setState({formData: {FirstName: this.state.user.firstName, LastName: this.state.user.lastName, NewPassword: "", ConfirmPassword:"", OldPassword:""}}) 
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
        <div className="LBmaincard">
          <a onClick = {(e) => _this.onOpenModal(e)}>My Profile</a>
          
          <Modal className="roundedBorder" open={this.state.modalOpen} onClose={this.onCloseModal} closeIconSize={14} center>
            <form onSubmit={this.handleSubmit}>
                    <label>
                    First Name : 
                    <input type="text" name="FirstName" value={this.state.formData.FirstName} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    
                    <label>
                    Last Name : 
                    <input type="text" name="LastName" value={this.state.formData.LastName} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    <label>
                    New Password : 
                    <input type="text" name="NewPassword" value={this.state.formData.NewPassword} onChange={this.handleChange}/>
                    </label>

                    <br></br>

                    <label>
                    Confirm Password : 
                    <input type="text" name="ConfirmPassword" value={this.state.formData.ConfirmPassword} onChange={this.handleChange}/>
                    </label>

                    <br></br>

                    <label>
                    Old Password : 
                    <input type="text" name="OldPassword" value={this.state.formData.OldPassword} onChange={this.handleChange}/>
                    </label>

                    <input type="submit" value="Update" />
                </form>
          </Modal>
        </div>
      )
  }
}

export default MyProfile;
