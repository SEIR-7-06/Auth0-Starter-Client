import { 
    BrowserRouter as Router,
    Switch, 
    Route
} from 'react-router-dom'
import './App.css';
import ProtectedRoute from './auth/ProtectedRoute';
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
                    <ProtectedRoute path="/profile" component={Profile} />
                    <ProtectedRoute path="/protectedPage" component={ProtectedPage} />
                    <Route path="*" component={NotFound}/>
                </Switch>  
            </div>
        </Router>
    );
}

export default App;
