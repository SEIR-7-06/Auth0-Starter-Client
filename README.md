# Auth0 Starter - Client

This project contains the starter and finished code for a React App with OAuth authentication using [Auth0](https://auth0.com/).

Use this app in conjunction with the Auth0 starter server.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Auth0 Application Setup
1. Sign up for an Auth0 Account: https://auth0.com/signup

2. We'll be following the the quickstart documentation for a React SPA at this URL: https://auth0.com/docs/quickstart/spa/react/01-login

3. Notably, we'll want to create an "Application" on the Auth0 dashboard, under "Applications" > "Applications". We will want to configure:

* Application Type:
    * Single Page Application

    ![application type](./readme-images/application-type.png)

* Application Login URI
    * Keep this one blank

* Allowed Callback URLs
    * http://localhost:3000, and/or the URL of your hosted client app

    ![callback urls](./readme-images/profile.png)

* Allowed logout URLs
    * http://localhost:3000, and/or the URL of your hosted client app
    
    ![callback urls](./readme-images/logout.png)

## Auth0 API Setup
1. Next we'll register an API on the dashboard, following the documentation at this URL: https://auth0.com/docs/architecture-scenarios/spa-api/part-2

2. Configure an API in the menu found at "Applications" > "APIs"

* Identifier
    * Set it to your development server URL, such as http://localhost:8000

    ![identifiers](./readme-images/identifier.png)

## React Setup
1. Install the Auth0 react SDK:
* `npm install @auth0/auth0-react`

2. Configure Auth0Provider component in `index.js`
https://auth0.com/docs/quickstart/spa/react/01-login#configure-the-auth0provider-component

```js
import { Auth0Provider } from '@auth0/auth0-react'

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="domain from the application page"
      clientId="clientid from the application page"
      redirectUri={window.location.origin + '/profile'}
      audience={process.env.REACT_APP_SERVER_URL}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
```
2. Add login to the `Navbar.jsx`
https://auth0.com/docs/quickstart/spa/react/01-login#add-login-to-your-application

3. Add logout to `Navbar.jsx`
https://auth0.com/docs/quickstart/spa/react/01-login#add-login-to-your-application

4. Add user profile info to `Profile.jsx`
https://auth0.com/docs/quickstart/spa/react/01-login#show-user-profile-information

5. Implement better redirects when you try to access a protected route
https://auth0.com/docs/libraries/auth0-react#protect-a-route
```js
const ProtectedRoute = ({ component }) => {
    return (
        <Route 
            component={withAuthenticationRequired(component, {
                onRedirecting: () => (<div>Redirecting you to the login page...</div>)
            })} 
        />
    )
}
```

6. Implement conditional rendering for `Navbar.jsx`
```js
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
```
7. Implement conditional rendering for `Home.jsx`
```js
function Home() {
    const { isAuthenticated } = useAuth0();

    return (
        <div>
            <h1>Home Page</h1>
            { isAuthenticated ? <Link to="/protectedPage">Secret Protected Page!</Link> : ""}
        </div>
    )
}
```

8. When logging in, make sure to add that User to the database
```js
function Profile() {
    const { user } = useAuth0();

    useEffect(() => {
        const serverUrl = process.env.REACT_APP_SERVER_URL    
        // console.log(user.sub) // the unique user's ID from Auth0
        
        fetch(`${serverUrl}/auth`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ auth0Id: user.sub })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                console.log(err)
            })

    }, [user?.sub])

    return (
        <div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    )
}

```

## Express Server setup for Authorization
1. Create a User model in `User.js`
```js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    auth0Id: String,
    favoriteFoods: []
})

const User = mongoose.model('User', userSchema)

module.exports = User
```

2. Create the `jwtCheck` middleware according to:
https://auth0.com/docs/architecture-scenarios/spa-api/api-implementation-nodejs

* `npm i express-jwt jwks-rsa`

```js
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-5l0x66ym.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'http://localhost:8000',
  issuer: 'https://dev-5l0x66ym.us.auth0.com/',
  algorithms: ['RS256']
});

module.exports = jwtCheck
```



3. Protect the `/favoriteFoods` resource from unauthorized requests using the `jwtCheck` middleware
```js
app.use('/favoriteFoods', jwtCheck, require('./controllers/favoriteFoods'))
```

3. Add in the auth route in `auth.js` that find or creates the `User`
```js
// Create a user if it doesn't already exist using the auth0Id passed from the client
router.post('/', async (req, res) => {
    const id = req.body.auth0Id
    const user = await db.User.findOne({ auth0Id: id })

    if(!user) {
        const newUser = await db.User.create({ auth0Id: id })
        console.log('created', newUser)
    }
    
    res.send({ msg: `${req.body.auth0Id} findOrCreate completed!`})
})
```

4. Next, build the protected resource `/favoriteFoods`
```js
const router = require('express').Router()
const db = require('../models')

router.get('/', async (req, res) => {
    try {
        const user = await db.User.findOne({ auth0Id: req.user.sub })
        res.json(user.favoriteFoods)
    } catch(err) {
        console.log(err)
        res.json({ msg: 'Something went wrong!'})
    }
})

router.post('/', async (req, res) => {
    console.log(req.body)
    // console.log(req.user) // this is where the entire decoded jwt is
    console.log(req.user.sub) // this is the auth0 id
    try {
        const user = await db.User.findOneAndUpdate(
            { auth0Id: req.user.sub },
            { $push: { favoriteFoods: req.body.food }}
        )    
        res.json({ msg: 'Food created!' })
    } catch(err) {
        console.log(err)
        res.json({ msg: 'Something went wrong!'})
    }
})

module.exports = router
```

## Lastly, access the protected backend routes from React
https://auth0.com/docs/quickstart/spa/react/02-calling-an-api

```js
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react";

function ProtectedPage() {
    const { getAccessTokenSilently } = useAuth0();
    
    const [foods, setFoods] = useState([])
    const [food, setFood] = useState("")

    useEffect(() => {
        
        async function getFoods() {
            const serverUrl = process.env.REACT_APP_SERVER_URL
            const token = await getAccessTokenSilently()
            
            fetch(serverUrl + '/favoriteFoods', { headers: { 'Authorization': `Bearer ${token}` } })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    setFoods(data)
                })
        }
        getFoods()
    }, [getAccessTokenSilently])

    async function handleSubmit(e) {
        e.preventDefault()
        const serverUrl = process.env.REACT_APP_SERVER_URL
        const token = await getAccessTokenSilently()
        console.log('access token', token) 
        
        try {
            // Accessing a protected route!
            const response = await fetch(serverUrl + '/favoriteFoods', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // must send body in the form of an object
                body: JSON.stringify({ food: food }) 
            })

            const json = await response.json()
            console.log(json)
            setFoods([...foods, food])
            setFood("")
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <div>
            <h1>You found the protected page!</h1>
            <p>Note: Only people who are logged in can see this page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="food">Favorite Foods: </label>
                <input 
                    type="text" 
                    onChange={ e => setFood(e.target.value) }
                    value={ food }
                />
                <input type="submit" value="Submit" />
            </form>
            <h2>Favorite foods!</h2>
            <ul>
                { foods.map((food, idx) => <li key={idx}>{food}</li>) }
            </ul>
        </div>
    )
}

export default ProtectedPage
```