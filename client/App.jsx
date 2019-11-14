import React, { Component } from 'react';
import axios from 'axios';

import MainContainer from './containers/MainContainer.jsx';
import Login from './components/Login.jsx';
import Banner from './components/Banner.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_Id: '',
      response: '',
      name: 'HoldName',
      cash: 5000,
      day: 99,
      // dummy stocks populated while waiting for database info
      stocks: [{name: 'Apple', avg_value: 100, amount_owned: 5},{name: 'Apple', avg_value: 100, amount_owned: 5},{name: 'Apple', avg_value: 100, amount_owned: 5},{name: 'Apple', avg_value: 100, amount_owned: 5},{name: 'Apple', avg_value: 100, amount_owned: 5},{name: 'Apple', avg_value: 100, amount_owned: 5}],

      singleTradeMaxProfitResult: 0,
      singleTradeMinProfitResult: 0,
      multiTradeMaxProfitResult: 0,
      multiTradeMinProfitResult: 0,
      sevenDayMovingAvgResult: 0,
    }
    this.login = this.login.bind(this);
    this.signUp = this.signUp.bind(this);
    this.logout = this.logout.bind(this);

    this.singleTradeMaxProfit = this.singleTradeMaxProfit.bind(this);
    this.singleTradeMinProfit = this.singleTradeMinProfit.bind(this);
    this.multiTradeMaxProfit = this.multiTradeMaxProfit.bind(this);
    this.multiTradeMinProfit = this.multiTradeMinProfit.bind(this);
    this.sevenDayMovingAvg = this.sevenDayMovingAvg.bind(this);
  }

  // the following are optional routes for gathering data from users and the database
  getHoldings(){
    axios.get(`http://localhost:8080/get/${this.state.user_Id}`, this.state.user_Id)
    .then(res => {
      const stocks = res.data;
      this.setState({ stocks });
    })
  }

  login(info){
    axios.post(`http://localhost:8080/login`, info)
    .then(res => {
      if(!res.data){ this.setState({ response : 'Invalid user' }) }
      else if(res.data.username){
        if(res.data.password !== info.password){
          this.setState({ response : 'Incorrect password.' })
          return;
        }
        this.setState({ user : res.data.username, userId : res.data._id, response : '' }, () => {
          this.getThoughts();
        })
      }
    })
  }

  signUp(info){
    if(!info.username || !info.password){
      this.setState({ response : 'Missing field' })
      return;
    }
    else { this.setState({ response : '' }) }
  }

  logout(){
    this.setState({ name: '' , cash: 0, day: 0, stocks: []})
  }

 
  singleTradeMaxProfit(arr) {    
    if (!Array.isArray(arr) || arr.length < 1) {
      return;
    }
  
    let minPrice = arr[0];
    let maxProfit = arr[1] - arr[0];

    // when iterating over an array, use forEach() (otherwise you look like a junior dev). If there's a shorter syntax out there and you're not using it, it makes you look junior
    // arr.forEach();
  
    for (let i = 0; i < arr.length; i += 1) {
      let currentPrice = arr[i];
      let potentialProfit = currentPrice - minPrice;
      maxProfit = Math.max(maxProfit, potentialProfit)
      minPrice = Math.min(minPrice, currentPrice)
    }
    if (maxProfit < 0) {
      return;
    }
    
    this.setState({
      singleTradeMaxProfitResult: maxProfit,
    });
  }

  singleTradeMinProfit(arr) {
    const newArr = [];

    for (let i = 0; i < arr.length; i += 1) {
      let buyHi = arr[i];
      let sellLo = Infinity;
  
      for (let j = i + 1; j < arr.length; j += 1) {
        if (buyHi > arr[j] && sellLo > arr[j]) {
          sellLo = arr[j];
        }
      }
      
      if (buyHi > sellLo) {
        newArr.push(sellLo - buyHi)
      }
    }
  
    this.setState({
      singleTradeMinProfitResult: Math.min(...newArr),
    });
  }

  multiTradeMaxProfit(arr) {
    let result = 0;

    for (let i = 0; i < arr.length - 1; i += 1) {
      if (arr[i + 1] > arr[i]) {
        result += arr[i + 1] - arr[i]
      }
    }  
    this.setState({
      multiTradeMaxProfitResult: result,
    });
  }

  multiTradeMinProfit(arr) {
    let result = 0;

    for (let i = 0; i < arr.length - 1; i += 1) {
      if (arr[i + 1] < arr[i]) {
        result += arr[i + 1] - arr[i]
      }
    }  
    this.setState({
      multiTradeMinProfitResult: result,
    });
  }

  sevenDayMovingAvg(arr) {
    console.log('calc');
  }

  componentDidMount() {
    this.getHoldings()
  }


  // if not logged in, the landing page will render a login container
  // if logged in, it will conditionally render the UI

  render() {
    if(!this.state.name){
      return(
        <div className="outerContainer">
          <Banner logout={this.logout} />
          <Login
            login={this.login}
            signUp={this.signUp}
            response={this.state.response}
          />
        </div>
      )
    }
    return(
      <div className="outerContainer">
        <Banner logout={this.logout} />
        <MainContainer 
          user_Id={this.state.user_Id} 
          state={this.state}

          day={this.state.day}
          singleTradeMaxProfit={this.singleTradeMaxProfit}
          singleTradeMaxProfitResult={this.state.singleTradeMaxProfitResult}
          singleTradeMinProfit={this.singleTradeMinProfit}
          singleTradeMinProfitResult={this.state.singleTradeMinProfitResult}
          multiTradeMaxProfit={this.multiTradeMaxProfit}
          multiTradeMaxProfitResult={this.state.multiTradeMaxProfitResult}
          multiTradeMinProfit={this.multiTradeMinProfit}
          multiTradeMinProfitResult={this.state.multiTradeMinProfitResult}
          sevenDayMovingAvg={this.sevenDayMovingAvg}
          sevenDayMovingAvgResult={this.state.sevenDayMovingAvgResult}
        />
      </div>
    )
  }
}

export default App;