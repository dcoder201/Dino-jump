import React, { Component } from "react";
import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import StartPage from "./components/StartPage";
import Game from "./components/Game";


// function App() {
//   return (
//     <div className="App">
//         <Router>
//         <Switch>
//           <Route exact path="/" component={StartPage} />
//           <Route path="/game" component={Game} />
//         </Switch>
//       </Router>
//     </div>

//   );
// }

// export default App;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameStarted: false,
    };
  }

  startGame = () => {
    this.setState({ gameStarted: true });
  };

  render() {
    return (
      <Router>
        <Switch>
         <Route exact path="/" component={StartPage} />
          <Route path="/game" component={Game} />
        </Switch>
      </Router>
    );
  }
}

export default App;