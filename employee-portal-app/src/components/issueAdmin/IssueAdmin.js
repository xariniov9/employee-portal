import React, { Component } from 'react';
import Modal from 'react-responsive-modal';
import axios from 'axios';

class IssueAdmin extends Component{
  constructor(props) {

    super(props);
    this.state = {
        AssignedTo: "",
        Comments:"",
        Status: 0,
        validationError: "",
        status : [{display: "OPEN", value: 1},
                      {display: "WIP", value: 2},
                      {display: "CLOSED", value: 3}
        ],
        user: {

        },
        _isMounted: false
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
      console.log(values);
      /*const payload = axios.post(`http://localhost:3001/api/createIssue`, values)
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
      });*/
  };

  handleSubmit(event) {
     const token = sessionStorage.jwtToken;

    this.validateFieldsAndRaiseIssue({token: token, Comments: this.state.Comments, Status: this.state.Status, AssignedTo: this.state.AssignedTo});
    event.preventDefault();
  }
  onCloseModal() {
      this.setState({_isMounted: false});
  }
  componentDidMount() {
    this.setState({_isMounted :this.props.show, Issue: this.props.Issue});
  }
  componentWillUnmount() {
    this.setState({_isMounted :false});
  }
  render() {
		return (

          <Modal className="roundedBorder" open={this.state._isMounted} onClose={this.onCloseModal} closeIconSize={14} center>
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
                      Comments : 
                      <input type="text" name="Comments" value={this.state.Comments} onChange={this.handleChange}/>
                    
                    </div>
                    </label>

                    
                    <label>
                    <div className="form-field"> 
                    Assign To : 
                    <textarea rows={8} cols={16} type="text" name="AssignedTo" value={this.state.AssignedTo} onChange={this.handleChange}/>
                    </div>
                    </label>


                    <label>
                    <div className="form-field"> 
                    Status : 
                    <select value={this.state.Status} 
                    onChange={(e) => this.setState({Status: e.target.value, validationError: e.target.value === "" ? "Select Status" : ""})}>
                        {this.state.status.map((topic) => <option key={topic.value} value={topic.value}>{topic.display}</option>)}
                    </select>
                    </div>
                    </label>

                    <br></br>

                    <input className="submit-btn-retro" type="submit" value="Submit" />

                </form>
            </div>
        
        </div>
        </div>
        </Modal>
    )
  }
}

export default IssueAdmin;
