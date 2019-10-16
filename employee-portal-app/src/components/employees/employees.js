import React, { Component } from 'react';
import axios from 'axios';

class SearchEmployees extends Component{
  constructor(props) {
    super(props);
    this.state = {
        Email: "",
        FirstName: "",
        LastName: "",
        StartDate: "",
        EndDate: "",
        DepartmentName: "",
        Email: "",
        validationError: "",
        topics: [],
        user: {

        },
        searchResults: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.searchEmployees = this.searchEmployees.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
  searchEmployees = (values) => {
      const _this = this;
      const payload = axios.post(`http://localhost:3001/api/searchEmployees`, values)
          .then((result) => {
        if (result.response && result.response.status !== 200) {
          this.setState({searchResults: []});
          console.log("error in auth");
        } else {
          this.setState({searchResults: result.data});
          console.log(result.data);
        }
      }).catch(err => {
          this.setState({searchResults: []});
          console.log(err)
      });
  };

  handleSubmit(event) {
    const token = sessionStorage.jwtToken;
    this.searchEmployees({DepartmentName: this.state.DepartmentName, Email: this.state.Email, FirstName: this.state.FirstName, LastName: this.state.LastName, StartDate: this.state.StartDate, EndDate: this.state.EndDate, token: token});
    event.preventDefault();
  }

  componentDidMount() {
    this._isMounted = true;
    const _this = this;
    const token = sessionStorage.jwtToken;
    const values = {token: token};
    axios.post('http://localhost:3001/api/getAllDepartments',values).then((result) => {
      if(result.response && result.response.status !== 200) {
        console.log("failed to load departments in search Employee!")
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
            <div className="titleText lbTitle">Search Employees</div>
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
                    Email : 
                    <input type="text" name="Email" value={this.state.Email} onChange={this.handleChange}/>
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
                    Joining Date After: 
                    <input type="text" name="StartDate" value={this.state.StartDate} onChange={this.handleChange}/>
                    </div>
                    </label>

                    <label>
                    <div className="form-field"> 
                    Joining Date Before: 
                    <input type="text" name="EndDate" value={this.state.EndDate} onChange={this.handleChange}/>
                    </div>
                    </label>

                    <br></br>
                    <input className="submit-btn-retro" type="submit" value="Submit" />
                </form>
            </div>
            
            
            <hr></hr>

            <div className="MainContentCardBody scrollableArea">
              {
                this.state.searchResults[0] && (
                    <div>
                    <table style={{width:"100%"}}>
                    <tbody className="small-light">
                      <tr className="row-header"><td>Name</td><td>Email</td><td>Department</td></tr>
                      {
                        
                        this.state.searchResults.map(function (i) {
                          return (<tr>
                            <td key={i.employeeid.toString()} className="bolder hvr">{i.firstname + " " + i.lastname}</td>
                            <td>{i.email}</td>
                            <td>{i.departmentname}</td>
                          </tr>);

                        })
                      }
                    </tbody>
                    </table>
                   
                    </div>
                  )
              }
              {
                !this.state.searchResults[0] && (
                  <div className="no-results">No Results</div>
                )
              }
             
            </div>
          
        </div>

        </div>
    )
  }
}

export default SearchEmployees;
