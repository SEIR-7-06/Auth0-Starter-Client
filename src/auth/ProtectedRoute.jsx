import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Route } from 'react-router';

// https://auth0.com/docs/libraries/auth0-react#protect-a-route
const ProtectedRoute = ({ component }) => {
    return (
        <Route 
            component={withAuthenticationRequired(component, {
                onRedirecting: () => (<div>Redirecting you to the login page...</div>)
            })} 
        />
    )
}

export default ProtectedRoute