import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

const wsClient = new SubscriptionClient(process.env.REACT_APP_SUBSCRIPTION_API, { reconnect: true })

const networkInterface = createNetworkInterface({ uri: process.env.REACT_APP_GRAPHQL_API })

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(networkInterface, wsClient)

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
