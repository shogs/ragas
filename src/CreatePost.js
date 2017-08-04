import React, { Component } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import { graphql, gql } from 'react-apollo'
import { PropTypes } from 'prop-types'
import Post from './Post'

class CreatePost extends Component {

  static propTypes = {
    createPost: PropTypes.func,
    data: PropTypes.object
  }

  state = {
    description: '',
    imageUrl: '',
  }

  render () {
    if (this.props.data.loading) {
      return (<div>Loading</div>)
    }

    if (!this.props.data.user) {
      console.warn('only logged in users can create new posts')
      return (
        <Redirect to={{
          pathname: '/'
        }}/>
      )
    }

    return (
      <div className='w-100 pa4 flex justify-center'>
        <div style={{ maxWidth: 400 }} className=''>
          <input
            className='w-100 pa3 mv2'
            value={this.state.description}
            placeholder='Description'
            onChange={(e) => this.setState({description: e.target.value})}
          />
          <input
            className='w-100 pa3 mv2'
            value={this.state.imageUrl}
            placeholder='Image Url'
            onChange={(e) => this.setState({imageUrl: e.target.value})}
          />
          {this.state.imageUrl &&
            <img src={this.state.imageUrl} className='w-100 mv3' alt="" />
          }
          {this.state.description && this.state.imageUrl &&
            <button className='pa3 bg-black-10 bn dim ttu pointer' onClick={this.handlePost}>Post</button>
          }
        </div>
      </div>
    )
  }

  handlePost = () => {
    const {description, imageUrl} = this.state
    this.props.createPost({
      variables: {description, imageUrl},
      optimisticResponse: {
        createPost: {
          id: -1,
          description: description,
          imageUrl: imageUrl,
          __typename: 'Post'
        }
      }
    })
    this.props.history.push('/')
  }
}

const createPost = gql`
  mutation createPost($description: String!, $imageUrl: String!) {
    createPost(description: $description, imageUrl: $imageUrl) {
      id
      ... Post_post
    }
  }
  ${Post.fragments.post}
`

const query = gql`
  query AllPostsQuery {
    allPosts(orderBy: createdAt_DESC) {
      id
      ... Post_post
    }
  }
  ${Post.fragments.post}
`

const userQuery = gql`
  query userQuery {
    user {
      id
    }
  }
`

export default graphql(createPost, {
  name: 'createPost',
  options: {
    update: (proxy, {data: {createPost}}) => {
      const data = proxy.readQuery({ query })
      data.allPosts.unshift(createPost);
      proxy.writeQuery({query, data});
    }
  }
})(
  graphql(userQuery, { options: {fetchPolicy: 'network-only'}} )(withRouter(CreatePost))
)
