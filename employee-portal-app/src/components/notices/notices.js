import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-responsive-modal';
import './notices.css';
class Notices extends Component{
  constructor(props) {
    super(props);
    this.state = {
      notices: [],
      user: {},
      modalOpen: false,
      selectedNotice: {},
      formData: {},
      updateMode: false
    };
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onOpenModal = this.onOpenModal.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.getNotices = this.getNotices.bind(this);
    this.onUpdateNotice = this.onUpdateNotice.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.cancelUpdate = this.cancelUpdate.bind(this);
  }

  componentDidMount() {
    this.setState({user: this.props.user});
    var _this = this;
    setTimeout(function() {
      _this.getNotices();
    })
  }
  onOpenModal(event,data) {
    this.setState({modalOpen: true, selectedNotice: data, updateMode:false});
  }

  onCloseModal() {
    this.setState({modalOpen: false, selectedNotice: {}, updateMode:false });
  }
 
  onUpdateNotice() {
    console.log(this.state.selectedNotice);
    this.setState({updateMode: true, formData: {Title: this.state.selectedNotice.title, Description: this.state.selectedNotice.description, StartDate: "", ExpirationDate: ""}});
  }

  cancelUpdate() {
    this.setState({updateMode: false});
  }
  getNotices() {
    const token = sessionStorage.jwtToken;
    const _this = this;
    if(!!token) {
      axios.post(`http://localhost:3001/api/getAllNotices`, {token: token}).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in getting notices");
      } else {
          _this.setState({notices: result.data});
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
    
    axios.post(`http://localhost:3001/api/updateNotice`, { NoticeId: this.state.selectedNotice.noticeid, 
                                                            token: token, 
                                                            Title: this.state.formData.Title, 
                                                            Description: this.state.formData.Description, 
                                                            StartDate: this.state.formData.StartDate, 
                                                            ExpirationDate: this.state.formData.ExpirationDate}).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in updating notices");
      } else {
          _this.setState({modalOpen: false, selectedNotice: {}, updateMode: false});
          _this.getNotices();
            console.log(result.data);
        }
    });
    event.preventDefault();
  }
  handleDelete(event) {
    const token = sessionStorage.jwtToken;
    const _this = this;
    axios.post(`http://localhost:3001/api/deleteNotice`, {NoticeId: this.state.selectedNotice.noticeid, token: token}).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in deleting notice");
      } else {
          var notices = this.state.notices;
          var pos = 0;
          for(var i = notices.length-1; i>=0; i--) {
            if(notices[i].noticeid === this.state.selectedNotice.noticeid) {
              pos = i;
              break;
            }
          }
          notices.splice(pos, 1);
          _this.setState({modalOpen: false,selectedNotice: {}, notices: notices});
          console.log(result.data);
        }
    }); 
    event.preventDefault();
  }

  formatDate(d) {
    if(d)
      return d.substr(0, 10);
    return "";
  }
  render() {
    var _this = this;
		return (
        <div className="LBmaincard">
          <div className="LBContentCard">
            <div className = "MainContentCardTitle">
                  <div className="titleText lbTitle">Notices</div>
                  <div className="lbbtnClrd lborange1">Active</div>
                  <div className = "lighterText1">All Active Notices</div>
            </div>
            <hr></hr>
            <div className="MainContentCardBody scrollableArea">
              <table style={{width:"100%"}}>
              <tbody className="small-light">
                <tr className="row-header"><td>Title</td><td>Posted By</td></tr>
                {
                  
                  this.state.notices.map(function (i) {
                    return (<tr>
                      <td key={i.noticeid.toString()} className="bolder hvr"><a onClick = {(e) => _this.onOpenModal(e, i)}>{i.title}</a></td>
                      <td>{i.firstname + " " + i.lastname}</td>
                    </tr>);

                  })
                }
              </tbody>
              </table>
              <div  className= "xsmalllight smallInfo">click on notices for details</div>
            </div>
          </div>
          <Modal className="roundedBorder" open={this.state.modalOpen} onClose={this.onCloseModal} closeIconSize={14} center>
            <br></br>
            {
              !this.state.updateMode ?
                (
                  <div>
                 

                  <div className="lbmodal-title">{this.state.selectedNotice.title}</div>
                  <div className="modal-header meta-data"> By <strong>{" " + this.state.selectedNotice.firstname + " " + this.state.selectedNotice.lastname + " "}</strong> on <strong>{" " + this.formatDate(this.state.selectedNotice.startdate) }</strong></div>
                  <br></br>
                  <div className="small-lighter">
                    <div>                      
                      <div className="notice-desc">{this.state.selectedNotice.description}</div>
                      <br></br>              
                    </div>
                  </div>
                   {
                    this.state.user.isAdmin && (<div>
                    <button className="submit-btn-retro-sml" onClick={this.onUpdateNotice}>Update</button>
                    <button className="submit-btn-retro-sml" onClick={this.handleDelete}>Delete</button>
                    </div>)
                    }
                  </div>
                ) :( <div>Update Notice

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
                      Start Date : 
                      <input type="text" name="StartDate" value={this.state.formData.StartDate} onChange={this.handleChange}/>
                      </div>
                      </label>

                      <label>
                      <div className="form-field"> 
                      Expiration Date: 
                      <input type="text" name="ExpirationDate" value={this.state.formData.ExpirationDate} onChange={this.handleChange}/>
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

export default Notices;
