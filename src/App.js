import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from 'react-router'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Login from './Login'
import ListPage from './ListPage'
import { Link } from 'react-router-dom'

const Button = styled.button`
  background: blue
  foreground: white
`

const PaddedDiv = styled.div`
  padding: 10px
`

const clientId = process.env.REACT_APP_CLIENT_ID
const domain = process.env.REACT_APP_DOMAIN

class App extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
  }

  _isLoggedIn = () => {
    return this.props.data.user
  }

  _logout = () => {
    window.localStorage.removeItem('auth0IdToken')
    window.localStorage.removeItem('profile')
    this.props.history.go(0)
  }

  loginLogout = () => {
    if (!this._isLoggedIn()) {
      return (
        <Login
          clientId={clientId}
          domain={domain}
        />
      )
    } else {
      return (<Button onClick={this._logout} className='dib pa3 white bg-blue dim pointer'>Logout</Button>)
    }
  }

  create = () => {
    if (this._isLoggedIn()) {
      return (<Link to="/create">Create</Link>)
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div>
          {this.loginLogout()}
        </div>
        <PaddedDiv>
          {this.create()}
        </PaddedDiv>
        <ListPage user={this.props.data.user} />
      </div>
    )
  }
}

const userQuery = gql`
  query {
    user {
      id
    }
  }
`

const AppWithUserQuery = graphql(userQuery, { options: { fetchPolicy: 'network-only' } })(App)

export default withRouter(AppWithUserQuery)
