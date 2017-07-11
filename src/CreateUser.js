import React, { Component } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import { graphql, gql } from 'react-apollo'
import { PropTypes } from 'prop-types'

class CreateUser extends Component {

  constructor(props) {
    super(props)

    this.profile = JSON.parse(window.localStorage.getItem('profile'))

    this.state = {
      emailAddress: this.profile ? this.profile.email : '',
      name: this.profile ? this.profile.name : '',
      emailSubscription: false,
    }
  }

  static propTypes = {
    createUser: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
  }

  createUser = () => {
    const variables = {
      idToken: window.localStorage.getItem('auth0IdToken'),
      emailAddress: this.state.emailAddress,
      name: this.state.name,
      emailSubscription: this.state.emailSubscription,
    }

    this.props.createUser({ variables })
      .then((response) => {
          this.props.history.replace('/')
      }).catch((e) => {
        console.error(e)
        this.props.history.replace('/')
      })
  }

  render() {
    if (this.props.data.loading) {
      return (<div>Loading...</div>)
    }

    // redirect if user is logged in or did not finish Auth0 Lock dialog
    if (this.props.data.user || window.localStorage.getItem('auth0IdToken') === null) {
      console.warn('not a new user or already logged in')
      return (
        <Redirect to={{
          pathname: '/'
        }}/>
      )
    }

    console.log(this.state)

    return (

      <div className='w-100 pa4 flex justify-center'>
        <div style={{ maxWidth: 400 }} className=''>
          <input
            className='w-100 pa3 mv2'
            value={this.state.emailAddress}
            placeholder='Email'
            onChange={(e) => this.setState({emailAddress: e.target.value})}
            readOnly={true}
          />
          <input
            className='w-100 pa3 mv2'
            value={this.state.name}
            placeholder='Name'
            onChange={(e) => this.setState({name: e.target.value})}
          />
          <div>
            <input
              className='w-100 pa3 mv2'
              value={this.state.emailSubscription}
              type='checkbox'
              onChange={(e) => this.setState({emailSubscription: e.target.checked})}
            />
            <span>
              Subscribe to email notifications?
            </span>
          </div>

          {this.state.name &&
          <button className='pa3 bg-black-10 bn dim ttu pointer' onClick={this.createUser}>Sign up</button>
          }
        </div>
      </div>
    )
  }
}

const createUser = gql`
  mutation ($idToken: String!, $name: String!, $emailAddress: String!, $emailSubscription: Boolean!) {
    createUser(authProvider: {auth0: {idToken: $idToken}}, name: $name, emailAddress: $emailAddress, emailSubscription: $emailSubscription) {
      id
    }
  }
`

const userQuery = gql`
  query {
    user {
      id
    }
  }
`

const CreateUserWithData = graphql(userQuery, {options: { fetchPolicy : 'network-only' }})(CreateUser)

const CreateUserWithMutation = graphql(createUser, {name: 'createUser'})(CreateUserWithData)

export default withRouter(CreateUserWithMutation)
