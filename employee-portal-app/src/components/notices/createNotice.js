import React, { Component } from 'react';
import axios from 'axios';

class CreateNotice extends Component{
  _isMounted= false;
  constructor(props) {

    super(props);
    this.state = {
        Title: "",
        Description:"",
        StartDate:"",
        ExpirationDate:"",

        validationError: "",

        user: {

        }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateFieldsAndPublishNotice = this.validateFieldsAndPublishNotice.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
    validateFieldsAndPublishNotice = (values) => {
        const _this = this;

        const payload = axios.post(`http://localhost:3001/api/publishNotice`, values)
            .then((result) => {
          // Note: Error's "data" is in result.response.data (inside "response")
          // success's "data" is in result.data
          
          this.setState({Email: "", Password: ""})
          
          if (result.response && result.response.status !== 200) {
            //signInUserFailure(result.response.data);
            console.log("error in auth");
          } else {
            this.setState({Title: "",
                  Description:"",
                  StartDate:"",
                  ExpirationDate:"",

                  validationError: ""});
            console.log("Notice Created")
          }
        }).catch(err => {
            console.log(err)
        });
    };

  handleSubmit(event) {
     const token = sessionStorage.jwtToken;

    this.validateFieldsAndPublishNotice({token: token, Title: this.state.Title, Description: this.state.Description, StartDate: this.state.StartDate, ExpirationDate: this.state.ExpirationDate});
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
            <div className="titleText lbTitle">Publish Notice</div>
            <div className="lbbtnClrd lborange1">New</div>
            <div className = "lighterText1">Fill Details</div>
          </div>
          <hr></hr>
        
            <div className = "FormCardBody">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    Title : 
                    <input type="text" name="Title" value={this.state.Title} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    
                    <label>
                    Description : 
                    <input type="text" name="Description" value={this.state.Description} onChange={this.handleChange}/>
                    </label>

                    <br></br>

                    <label>
                    Start Date : 
                    <input type="text" name="StartDate" value={this.state.StartDate} onChange={this.handleChange}/>
                    </label>

                    <br></br>
                    <label>
                    Expiration Date: 
                    <input type="text" name="ExpirationDate" value={this.state.ExpirationDate} onChange={this.handleChange}/>
                    </label>

                    <br></br>

                    <input type="submit" value="Submit" />
                </form>
            </div>
        
        </div>
        </div>
    )
  }
}

export default CreateNotice;
