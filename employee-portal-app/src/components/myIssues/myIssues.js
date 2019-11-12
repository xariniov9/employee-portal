import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-responsive-modal';

class MyIssues extends Component{
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
      selectedIssueHistory: [],
      user: {},
      modalOpen: false,
      selectedIssue: {},
      formData: {},
      updateMode: false,
      priorities : [{display: "NORMAL", value: 1},
                      {display: "URGENT", value: 2},
                      {display: "IMMEDIATE", value: 3}
        ]
    };
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onOpenModal = this.onOpenModal.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.getMyIssues = this.getMyIssues.bind(this);
    this.onUpdateIssue = this.onUpdateIssue.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.cancelUpdate = this.cancelUpdate.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.getPriority = this.getPriority.bind(this);
  }

  componentDidMount() {
    this.setState({user: this.props.user});
    const _this = this;
    setTimeout(function() {
      _this.getMyIssues();
    })
  }
  onOpenModal(event,data) {
    this.setState({selectedIssue: data});
    const token = sessionStorage.jwtToken;
    const _this = this;
    if(!!token) {
      const values = {
        token: token,
        IssueId: data.issueid
      } 
      console.log(values);
      axios.post(`http://localhost:3001/api/getIssueHistoryByIssueId`, values).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in getting notices");
      } else {
          console.log(result.data);
          _this.setState({selectedIssueHistory: result.data});
          _this.setState({modalOpen: true, updateMode:false});
        }
      }).catch(err => {
          console.log(err)
      });
    }
    
  }

  onCloseModal() {
    this.setState({modalOpen: false, selectedIssue: {}, updateMode:false });
  }
 
  onUpdateIssue() {
    console.log(this.state.selectedIssue);
    this.setState({updateMode: true, formData: {IssueId: this.state.selectedIssue.issueid, Title: this.state.selectedIssue.title, Description: this.state.selectedIssue.description, Priority: this.state.selectedIssue.priority}});
  }

  cancelUpdate() {
    this.setState({updateMode: false});
  }
  getMyIssues() {
    const token = sessionStorage.jwtToken;
    const _this = this;
    if(!!token) {
      console.log(this.state.user);
      const values = {
        token: token,
        EmployeeId: this.state.user.employeeId
      } 
      axios.post(`http://localhost:3001/api/getAllIssuesByEmployeeId`, values).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in getting issues");
      } else {
          _this.setState({issues: result.data});
        }
      }).catch(err => {
          console.log(err)
      });
    } 
  }

  handleChange(evt) {
    var formData = this.state.formData;
    formData[evt.target.name] = evt.target.value;
    this.setState({ formData: formData });
  }

  handleUpdate(event) {
    const token = sessionStorage.jwtToken;
    const _this = this;
    console.log(this.state.formData);
    
    axios.post(`http://localhost:3001/api/updateMyIssue`, { IssueId: this.state.formData.IssueId, 
                                                            token: token, 
                                                            Title: this.state.formData.Title, 
                                                            Description: this.state.formData.Description, 
                                                            Priority: this.state.formData.Priority}).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in updating issue");
      } else {
          _this.setState({modalOpen: false, selectedIssue: {}, updateMode: false});
          _this.getMyIssues();
            console.log(result.data);
        }
    });
    event.preventDefault();
  }
  handleDelete(event) {
    const token = sessionStorage.jwtToken;
    const _this = this;
    // axios.post(`http://localhost:3001/api/deleteNotice`, {NoticeId: this.state.selectedNotice.noticeid, token: token}).then((result) => {
    //   if (result.response && result.response.status !== 200) {
    //     console.log("error in deleting notice");
    //   } else {
    //       var notices = this.state.notices;
    //       var pos = 0;
    //       for(var i = notices.length-1; i>=0; i--) {
    //         if(notices[i].noticeid === this.state.selectedNotice.noticeid) {
    //           pos = i;
    //           break;
    //         }
    //       }
    //       notices.splice(pos, 1);
    //       _this.setState({modalOpen: false,selectedNotice: {}, notices: notices});
    //       console.log(result.data);
    //     }
    // }); 
    event.preventDefault();
  }

  formatDate(d) {
    if(d)
      return d.substr(0, 10);
    return "";
  }

  getStatus(status) {
    if(status === 1) return "OPEN";
    if(status === 2) return "WIP";
    if(status === 3) return "CLOSED"
    return "CLOSED";
  }

  getPriority(status) {
    if(status === 1) return "NORMAL";
    if(status === 2) return "URGENT";
    if(status === 3) return "IMMEDIATE";
    return "NORMAL";
  }
  render() {
    var _this = this;
		return (
        <div className="LBmaincard">
          <div className="LBContentCard ContentCardNotice">
            <div className = "MainContentCardTitle">
                  <div className="titleText lbTitle">My Issues</div>
                  <div className = "lighterText1">Issues Raised By Me</div>
            </div>
            <hr></hr>
            <div className="MainContentCardBody scrollableArea">
              <table style={{width:"100%"}}>
              <tbody className="small-light">
                <tr className="row-header"><td>Title</td><td>Status</td><td>Priority</td><td>Assigned To</td></tr>
                {
                  
                  this.state.issues.map(function (i) {
                    return (<tr>
                      <td key={i.issueid.toString()} className="bolder hvr"><a onClick = {(e) => _this.onOpenModal(e, i)}>{i.title}</a></td>
                      <td>{_this.getStatus(i.status)}</td>
                      <td>{_this.getPriority(i.priority)}</td>
                      <td>{i.assignedtoname}</td>
                    </tr>);
                  })
                }
              </tbody>
              </table>
              <div  className= "xsmalllight smallInfo">click on issues for details</div>
            </div>
          </div>
          <Modal className="roundedBorder" open={this.state.modalOpen} onClose={this.onCloseModal} closeIconSize={14} center>
            <br></br>
            {
              !this.state.updateMode ?
                (
                  <div>
                  <div className="lbmodal-title">{this.state.selectedIssue.title}</div>
                  <div className="modal-header meta-data"> By <strong>{" " + this.state.selectedIssue.postedbyname + " "}</strong></div>
                  <div className="modal-header meta-data"> Currently Assigned To <strong>{" " + this.state.selectedIssue.assignedtoname + " "}</strong></div>
                  <div className="modal-header"><strong>{this.getPriority(this.state.selectedIssue.priority)}</strong></div>
                  <br></br>
                  <div className="small-lighter">
                    <div>                      
                      <div className="notice-desc">{this.state.selectedIssue.description}</div>
                      <br></br>              
                    </div>
                  </div>
                   <div>
                      <button className="submit-btn-retro-sml" onClick={this.onUpdateIssue}>Update</button>
                      <button className="submit-btn-retro-sml" onClick={this.handleDelete}>Delete</button>
                    </div>
                    <hr></hr>
                  <div className="MainContentCardBody scrollableArea">
                    <table style={{width:"100%", "textAlign": "center"}}>
                    <tbody className="small-light">
                      <tr className="row-header">
                      
                      <td>Modified By</td>
                      <td>Modified On</td>
                      <td>Assigned To</td>
                      <td>Status</td>
                      <td>Comments</td>
                      </tr>
                      
                      {
                        this.state.selectedIssueHistory.map(function (i) {
                          return (<tr>
                            <td>{i.modifiedby}</td>
                            <td>{_this.formatDate(i.modifiedon)}</td>
                            <td>{i.assignedtoname}</td>
                            <td>{_this.getStatus(i.status)}</td>
                            <td>{!(i.comments) ? "--" : i.comments }</td>
                          </tr>);
                        })
                      }
                    </tbody>
                    </table>
                </div>
                  </div>
                ) :( <div>Update My Issue

                    <form onSubmit={this.handleUpdate}>
                      <label>
                      <div className="form-field"> 
                      Title : 
                      <input type="text" name="Title" value={this.state.formData.Title} onChange={this.handleChange}/>
                      </div>
                      </label>

                      
                      <label>
                      <div className="form-field"> 
                      Description : 
                      <textarea rows={5} cols={16} type="text" name="Description" value={this.state.formData.Description} onChange={this.handleChange}/>
                      </div>
                      </label>


                      <label>
                      <div className="form-field"> 
                      Priority : 
                      <select value={this.state.priority} 
                        onChange={(e) => {
                          var formData = this.state.formData;
                          formData["Priority"] = e.target.value;
                          this.setState({ formData: formData });
                        } 
                      }                
                      >
                          {this.state.priorities.map((topic) => <option key={topic.value} value={topic.value}>{topic.display}</option>)}
                      </select>
                      </div>
                      </label>

                      <input className="submit-btn-retro" type="submit" value="Submit" />
                      <button onClick={this.cancelUpdate} className="submit-btn-retro">Cancel</button>
                  </form>
                </div> ) 
            }
            
          </Modal>
        </div>
      )
  }
}

export default MyIssues;
