import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import './index.css'
import { Switch } from 'react-router'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import CreateUser from './CreateUser'
import CreatePost from './CreatePost'

const token = localStorage.getItem('auth0IdToken')

const wsClient = new SubscriptionClient(process.env.REACT_APP_SUBSCRIPTION_API, {
  reconnect: true,
  connectionParams: {
    authorization: `Bearer ${token}`
  }
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
        <Switch>
          <Route exact path='/' component={App} />
          <Route path='/create' component={CreatePost} />
          <Route path='/signup' component={CreateUser} />
        </Switch>
      </Router>
    </ApolloProvider>
  ),
  document.getElementById('root')
)

registerServiceWorker();
