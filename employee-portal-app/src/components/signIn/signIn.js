import React, { Component } from 'react';
import './signIn.css';
import axios from 'axios';

class SignIn extends Component{
  _isMounted= false;
  constructor(props) {

    super(props);
    this.state = {
        Email: "",
        Password: "",
        validationError: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateAndSignInUser = this.validateAndSignInUser.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
    validateAndSignInUser = (values) => {
        const _this = this;
        const payload = axios.post(`http://localhost:3001/api/auth`, values)
            .then((result) => {
          // Note: Error's "data" is in result.payload.response.data (inside "response")
          // success's "data" is in result.payload.data
          if(_this._isMounted) {
                this.setState({Email: "", Password: ""})
          }
          if (result.response && result.response.status !== 200) {
            //signInUserFailure(result.payload.response.data);
            console.log("error in auth");

          } else {
              console.log(result.data);
              sessionStorage.setItem('jwtToken', result.data.token);
              //dispatch(signInUserSuccess(result.payload.data)); //ps: this is same as dispatching RESET_USER_FIELDS
              if(_this._isMounted) {
                  _this.props.OnSuccessSignIn(result.data); 
              }
            }
            
        }).catch(err => {
            console.log(err)
        });
    };

  handleSubmit(event) {
    this.validateAndSignInUser({Email: this.state.Email, Password: this.state.Password});
    event.preventDefault();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
		return (
        <div className="FormCard addProblemCard">
            <div className="FormCardTitle">
                <p>Sign In</p>
            </div>
            <div className="centerAlign">
                <hr className="coloredBar"></hr>
            </div>
            <div className = "FormCardBody">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    Email : 
                    <input type="text" name="Email" value={this.state.Email} onChange={this.handleChange}/>
                    </label>

                    <br></br>

                    <label>
                    Password : 
                    <input type="text" name="Password" value={this.state.Password} onChange={this.handleChange}/>
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    )
  }
}

export default SignIn;
