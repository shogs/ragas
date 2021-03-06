import React, { Component } from 'react'
import Auth0Lock from 'auth0-lock'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const LoginButton = styled.button`
  background: blue
  foreground: white
`

class Login extends Component {
  constructor(props) {
    super(props)

    this._lock = new Auth0Lock(props.clientId, props.domain)
  }

  static propTypes = {
    clientId: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this._lock.on('authenticated', (authResult) => {
      window.localStorage.setItem('auth0IdToken', authResult.idToken)
      this._lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (!error) {
          this.props.history.replace('/signup')
          window.localStorage.setItem('profile', JSON.stringify(profile))
        }
      })
    })
  }

  _showLogin = () => {
    this._lock.show()
  }

  render () {
    return (
      <div>
        <LoginButton onClick={this._showLogin} className='dib pa3 white bg-blue dim pointer' >
          Log in with Auth0
        </LoginButton>
      </div>
    )
  }
}

export default withRouter(Login)
