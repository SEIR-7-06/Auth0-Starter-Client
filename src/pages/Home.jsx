import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

function Home() {
    const { isAuthenticated } = useAuth0();

    return (
        <div>
            <h1>Home Page</h1>
            { isAuthenticated ? <Link to="/protectedPage">Secret Protected Page!</Link> : ""}
        </div>
    )
}

export default Home