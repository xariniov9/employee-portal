import React, { Component } from 'react';
import axios from 'axios';

class CreateEmployee extends Component{
  _isMounted= false;
  constructor(props) {

    super(props);
    this.state = {
        Email: "",
        Password: "",
        FirstName: "",
        LastName: "",
        DateOfJoining: "",
        IsAdmin: false,
        DepartmentName: "",
        validationError: "",
        topics : [],
        user: {

        }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateFieldsAndCreateUser = this.validateFieldsAndCreateUser.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
    validateFieldsAndCreateUser = (values) => {
        const _this = this;
        

        const payload = axios.post(`http://localhost:3001/api/users`, values)
            .then((result) => {
          // Note: Error's "data" is in result.response.data (inside "response")
          // success's "data" is in result.data
          
          this.setState({Email: "", Password: ""})
          
          if (result.response && result.response.status !== 200) {
            //signInUserFailure(result.response.data);
            console.log(result.response.data);
            console.log("error in auth");
          } else {
            console.log("Employee Created")
          }
        }).catch(err => {
            console.log(err)
        });
    };

  handleSubmit(event) {
    const token = sessionStorage.jwtToken;
    this.validateFieldsAndCreateUser({token: token, Email: this.state.Email, Password: this.state.Password, IsAdmin: this.state.IsAdmin, DepartmentName: this.state.DepartmentName, FirstName: this.state.FirstName, LastName: this.state.LastName, DateOfJoining: this.state.DateOfJoining});
    event.preventDefault();
  }

  componentDidMount() {
    this._isMounted = true;
    const _this = this;
    const token = sessionStorage.jwtToken;
    const values = {token: token};
    axios.post('http://localhost:3001/api/getAllDepartments',values).then((result) => {
      if(result.response && result.response.status !== 200) {
        console.log("failed to load departments in create Employee!")
      } else {
         let topicsFromApi = result.data.map(topic => { return {value: topic.departmentname, display: topic.departmentname} });
        _this.setState({ topics: [{value: '', display: 'Select Department'}].concat(topicsFromApi) });
      }
    })
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
		return (
      <div className="LBmaincard">
          <div className="LBContentCard">
          <div className = "MainContentCardTitle">
            <div className="titleText lbTitle">Create Employee</div>
            <div className="lbbtnClrd lborange1">New</div>
            <div className = "lighterText1">Fill Details</div>
          </div>
          <hr></hr>
        
            <div className = "FormCardBody">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    <div className="form-field"> 
                    First Name : 
                    <input type="text" name="FirstName" value={this.state.FirstName} onChange={this.handleChange}/>
                    </div>
                    </label>

                    
                    <label>
                    <div className="form-field"> 
                    Last Name : 
                    <input type="text" name="LastName" value={this.state.LastName} onChange={this.handleChange}/>
                    </div>
                    </label>

                    

                    <label>
                    <div className="form-field"> 
                    Department Name : 
                    <select value={this.state.topic} 
                    onChange={(e) => this.setState({DepartmentName: e.target.value, validationError: e.target.value === "" ? "You must select a topic" : ""})}>
                        {this.state.topics.map((topic) => <option key={topic.value} value={topic.value}>{topic.display}</option>)}
                    </select>
                    </div>
                    </label>

                    <label>
                    <div className="form-field"> 
                    Joining Date: 
                    <input type="text" name="DateOfJoining" value={this.state.DateOfJoining} onChange={this.handleChange}/>
                    </div>
                    </label>


                    <label>
                    <div className="form-field"> 
                    Email : 
                    <input type="text" name="Email" value={this.state.Email} onChange={this.handleChange}/>
                    </div>
                    </label>


                    <label>
                    <div className="form-field"> 
                    Password : 
                    <input type="text" name="Password" value={this.state.Password} onChange={this.handleChange}/>
                    </div>
                    </label>

                    <label>
                    <div> 
                    Is Admin?
                    <input className="chkbox" type="checkbox" name="IsAdmin" value={this.state.IsAdmin} onChange={this.handleChange}/>
                    </div>
                    </label>
                    <br></br>
                    <input className="submit-btn-retro" type="submit" value="Submit" />
                </form>
            </div>
        
        </div>
        </div>
    )
  }
}

export default CreateEmployee;
