import React, { Component } from 'react'
//import logo from './logo.svg'
import './App.css'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { withRouter } from 'react-router'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Login from './Login'
import ListPage from './ListPage'
import { Link } from 'react-router-dom'
import { Button, Layout, Menu, Icon } from 'antd'
const { Header, Sider, Content, Footer } = Layout

const PaddedDiv = styled.div`
  padding: 10px
`

const StyledFooter = styled(Footer)`
  text-align: center
`

const clientId = process.env.REACT_APP_CLIENT_ID
const domain = process.env.REACT_APP_DOMAIN

class App extends Component {
  state = {
    collapsed: false
  }

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
      return (<span onClick={this._logout}>Logout</span>)
    }
  }

  create = () => {
    if (this._isLoggedIn()) {
      return (<Link to="/create"><Button type="primary" icon="file-add">Create</Button></Link>)
    }
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  loginLogoutIcon = () => {
    if (this._isLoggedIn()) {
      return (
        <Icon type="login" />
      )
    } else {
      return (
        <Icon type="logout" />
      )
    }
  }

  render() {
    return (
      <Layout className="app">
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              {this.loginLogoutIcon()}
              {this.loginLogout()}
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon className="trigger" type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content className="content">
            <PaddedDiv>
              {this.create()}
            </PaddedDiv>
            <ListPage user={this.props.data.user} />
          </Content>
          <StyledFooter>Footer</StyledFooter>
        </Layout>
      </Layout>
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
