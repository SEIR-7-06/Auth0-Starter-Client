import { 
    BrowserRouter as Router,
    Switch, 
    Route
} from 'react-router-dom'
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import ProtectedPage from './pages/ProtectedPage';

function App() {
    return (
        <Router>
            <Navbar />
            <div className="App">
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/protectedPage" component={ProtectedPage} />
                    <Route path="*" component={NotFound}/>
                </Switch>  
            </div>
        </Router>
    );
}

export default App;
