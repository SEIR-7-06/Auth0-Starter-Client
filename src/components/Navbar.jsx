import { Link } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";

function Navbar() {
    const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

    let navItems;
    if(isAuthenticated) {
        navItems = (
            <>
                <Link to="/profile">Profile</Link>
                <span onClick={() => logout({ returnTo: window.location.origin })}>Log out</span>
            </>
        )
    } else {
        navItems = <span onClick={() => loginWithRedirect()}>Log in</span>
    }

    return (
        <nav>
            <div>
                <Link to="/">Home</Link>
            </div>
            <div>
                { navItems }
            </div>
        </nav>
    )
}

export default Navbar