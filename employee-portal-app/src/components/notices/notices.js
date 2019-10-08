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
      selectedNotice: {}
    };
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onOpenModal = this.onOpenModal.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    this.setState({user: this.props.user});
    const token = sessionStorage.jwtToken;
    const _this = this;
    if(!!token) {
      axios.post(`http://localhost:3001/api/getAllNotices`, {token: token}).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in getting notices");
      } else {
          _this.setState({notices: result.data});

          console.log(result.data);
        }
      }).catch(err => {
          console.log(err)
      });
    } 
  }
  onOpenModal(event,data) {
    this.setState({modalOpen: true, selectedNotice: data});
  }

  onCloseModal() {
    this.setState({modalOpen: false, selectedNotice: {} });
  }
  handleDelete() {
    const token = sessionStorage.jwtToken;
    const _this = this;
    axios.post(`http://localhost:3001/api/deleteNotice`, {NoticeId: this.state.selectedNotice.noticeid, token: token}).then((result) => {
      if (result.response && result.response.status !== 200) {
        console.log("error in getting notices");
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
                <table style={{width:"100%", "fontFamily":"Roboto"}}>
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
            <button onClick={this.handleDelete}>Delete</button>
            <div className="lbmodal-title">{this.state.selectedNotice.title}</div>
            <div className="lbbtnClrd lborange1">Active</div>
            <div className="small-lighter">
              <br></br>
              <table style={{"width": "100%", "textAlign": "center"}}>
                <tbody>

                <tr><td className="modal-header">Start Date</td><td className="modal-header">Expiry</td></tr>
                <tr><td>{this.state.selectedNotice.startdate}</td><td>{this.state.selectedNotice.expirationdate}</td></tr>
              
                </tbody>
              </table>
              <br></br>
              <div style = {{textAlign:"center"}}>
                <div className= "modal-header">Posted By</div>
                <div> {this.state.selectedNotice.firstname + " " + this.state.selectedNotice.lastname}</div>
                <br></br>
                <div className= "modal-header">Description</div>
                <div>{this.state.selectedNotice.description}</div>
                <br></br>              
              </div>
            </div>
          </Modal>
        </div>
      )
  }
}

export default Notices;
