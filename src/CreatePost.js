import React, { Component } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import { graphql, gql } from 'react-apollo'
import { PropTypes } from 'prop-types'
import Post from './Post'
import FeedQuery from './queries/FeedQuery'
import UserQuery from './queries/UserQuery'
import Button from 'antd/lib/button'
import { Input, Checkbox } from 'antd'

class CreatePost extends Component {

  static propTypes = {
    createPost: PropTypes.func,
    data: PropTypes.object
  }

  state = {
    description: '',
    imageUrl: '',
    isPrivate: false
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
          <Input
            value={this.state.description}
            placeholder='Description'
            onChange={(e) => this.setState({description: e.target.value})}
          />
          <Input
            value={this.state.imageUrl}
            placeholder='Image Url'
            onChange={(e) => this.setState({imageUrl: e.target.value})}
          />
          {this.state.imageUrl &&
            <img src={this.state.imageUrl} className='w-100 mv3' alt="" />
          }
          <div>
            <Checkbox
              value={this.state.isPrivate}
              type='checkbox'
              onChange={(e) => this.setState({isPrivate: e.target.checked})}
            >Private?</Checkbox>
          </div>
          {this.state.description && this.state.imageUrl &&
            <Button onClick={this.handlePost}>Post</Button>
          }
        </div>
      </div>
    )
  }

  handlePost = () => {
    const {description, imageUrl, isPrivate} = this.state
    const createdById = this.props.data.user.id
    this.props.createPost({
      variables: {description, imageUrl, isPrivate, createdById},
      optimisticResponse: {
        __typename: 'Mutation',
        createPost: {
          id: -1,
          description: description,
          imageUrl: imageUrl,
          private: isPrivate,
          deleted: false,
          createdBy: {
            id: createdById,
            __typename: 'User'
          },
          __typename: 'Post'
        }
      }
    })
    this.props.history.push('/')
  }
}

const createPost = gql`
  mutation createPost($description: String!, $imageUrl: String!, $isPrivate: Boolean!, $createdById: ID!) {
    createPost(description: $description, imageUrl: $imageUrl, private: $isPrivate, createdById: $createdById) {
      id
      ...Post_post
    }
  }
  ${Post.fragments.post}
`

export default graphql(createPost, {
  name: 'createPost',
  options: props => ({
    update: (proxy, {data: {createPost}}) => {
      const variables = {createdById: createPost.createdBy.id}
      const data = proxy.readQuery({ query: FeedQuery, variables })
      data.allPosts.unshift(createPost);
      proxy.writeQuery({query: FeedQuery, data, variables});
    }
  })
})(
  graphql(UserQuery, { options: {fetchPolicy: 'network-only'}} )(withRouter(CreatePost))
)
