import { 
    BrowserRouter as Router,
    Switch, 
    Route
} from 'react-router-dom'
import './App.css';
import Home from './pages/Home';

function App() {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route exact path="/" component={Home} />
                </Switch>
            </div>
        </Router>
    );
}

export default App;
