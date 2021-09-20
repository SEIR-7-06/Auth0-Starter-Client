import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav>
            <div>
                <Link to="/">Home</Link>
            </div>
            <div>
                <Link to="/profile">Profile</Link>
                <span>Login</span>
                <span>Log out</span>
            </div>
        </nav>
    )
}

export default Navbar