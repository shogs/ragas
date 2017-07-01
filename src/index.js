import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import './index.css'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

const wsClient = new SubscriptionClient(process.env.REACT_APP_SUBSCRIPTION_API, {
  reconnect: true,
  // connectionParams: {
  //       authToken: user.authToken,
  // }
})

const networkInterface = createNetworkInterface({
  uri: process.env.REACT_APP_GRAPHQL_API,
  // opts: {
  //   credentials: 'include'
  // }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(networkInterface, wsClient)

networkInterface.use([{
  applyMiddleware(req, next) {
    if(!req.options.headers) {
      req.options.headers = {}
    }

    const token = localStorage.getItem('token')
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}])

const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  dataIdFromObject: o => o.id
})

ReactDOM.render(
  (
    <ApolloProvider client={apolloClient}>
      <Router>
        <Route exact path='/' component={App} />
      </Router>
    </ApolloProvider>
  ),
  document.getElementById('root')
)

registerServiceWorker();
