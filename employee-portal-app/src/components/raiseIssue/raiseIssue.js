import React, { Component } from 'react';
import axios from 'axios';

class RaiseIssue extends Component{
  _isMounted= false;
  constructor(props) {

    super(props);
    this.state = {
        Title: "",
        Description:"",
        Priority:"",
        validationError: "",
        priorities : [{display: "NORMAL", value: 1},
                      {display: "URGENT", value: 2},
                      {display: "IMMEDIATE", value: 3}
        ],
        user: {

        }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateFieldsAndRaiseIssue = this.validateFieldsAndRaiseIssue.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
  validateFieldsAndRaiseIssue = (values) => {
      const _this = this;
      values.Priority = (values.Priority === null ? 1 : values.Priority);
      const payload = axios.post(`http://localhost:3001/api/createIssue`, values)
          .then((result) => {
                  if (result.response && result.response.status !== 200) {
                    console.log("error in auth");
                  } else {
                    this.setState({Title: "",
                          Description:"",
                          Priority: "",

                          validationError: ""});
                    console.log("Issue Created")
        }
      }).catch(err => {
          console.log(err)
      });
  };

  handleSubmit(event) {
     const token = sessionStorage.jwtToken;

    this.validateFieldsAndRaiseIssue({token: token, Title: this.state.Title, Description: this.state.Description, Priority: this.state.Priority});
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
            <div className="titleText lbTitle">Raise Issue</div>
            <div className="lbbtnClrd lborange1">New</div>
            <div className = "lighterText1">Fill Details</div>
          </div>
          <hr></hr>
        
            <div className = "FormCardBody">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    <div className="form-field"> 
                      Title : 
                      <input type="text" name="Title" value={this.state.Title} onChange={this.handleChange}/>
                    
                    </div>
                    </label>

                    
                    <label>
                    <div className="form-field"> 
                    Description : 
                    <textarea rows={8} cols={16} type="text" name="Description" value={this.state.Description} onChange={this.handleChange}/>
                    </div>
                    </label>


                    <label>
                    <div className="form-field"> 
                    Priority : 
                    <select value={this.state.priority} 
                    onChange={(e) => this.setState({Priority: e.target.value, validationError: e.target.value === "" ? "You must select a topic" : ""})}>
                        {this.state.priorities.map((topic) => <option key={topic.value} value={topic.value}>{topic.display}</option>)}
                    </select>
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

export default RaiseIssue;
