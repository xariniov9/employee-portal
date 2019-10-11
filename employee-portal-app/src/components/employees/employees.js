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
          console.log("error in auth");
        } else {
          this.setState({searchResults: result.data});
          console.log(result.data);
        }
      }).catch(err => {
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
                    First Name : 
                    <input type="text" name="FirstName" value={this.state.FirstName} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    
                    <label>
                    Last Name : 
                    <input type="text" name="LastName" value={this.state.LastName} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    
                    <label>
                    Email : 
                    <input type="text" name="Email" value={this.state.Email} onChange={this.handleChange}/>
                    </label>

                    <br></br>

                    <label>
                    Department Name : 
                    <input type="text" name="DepartmentName" value={this.state.DepartmentName} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    <label>
                    Joining Date After: 
                    <input type="text" name="StartDate" value={this.state.StartDate} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    <label>
                    Joining Date Before: 
                    <input type="text" name="EndDate" value={this.state.EndDate} onChange={this.handleChange}/>
                    </label>

                    <input type="submit" value="Submit" />
                </form>
            </div>
        
        </div>
        <div className="LBContentCard">
            <div className = "MainContentCardTitle">
                  <div className="titleText lbTitle">Search Results</div>
                  <div className = "lighterText1">Employees</div>
            </div>
            <hr></hr>

            <div className="MainContentCardBody scrollableArea">
              {
                this.state.searchResults[0] && (
                    <div>
                    <table style={{width:"100%", "fontFamily":"Roboto"}}>
                    <tbody className="small-light">
                      <tr className="row-header"><td>Name</td><td>Email</td></tr>
                      {
                        
                        this.state.searchResults.map(function (i) {
                          return (<tr>
                            <td key={i.employeeid.toString()} className="bolder hvr">{i.firstname + " " + i.lastname}</td>
                            <td>{i.email}</td>
                          </tr>);

                        })
                      }
                    </tbody>
                    </table>
                    <div  className= "xsmalllight smallInfo">click on notices for details</div>
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
