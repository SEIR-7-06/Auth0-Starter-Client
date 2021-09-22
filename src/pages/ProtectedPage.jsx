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