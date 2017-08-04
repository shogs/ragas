import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

class Post extends Component {

  static propTypes = {
    post: PropTypes.object,
  }

  static fragments = {
    post: gql`
      fragment Post_post on Post {
        id
        description
        imageUrl
      }
    `
  }

  render () {
    return (
      <div className='pa3 bg-black-05 ma3'>
        <div
          className='w-100'
          style={{
            backgroundImage: `url(${this.props.post.imageUrl})`,
            backgroundSize: 'cover',
            paddingBottom: '100%',
          }}
        />
        <div className='pt3'>
          {this.props.post.description}&nbsp;
          <span className='red f6 pointer dim' onClick={this._handleDelete}>Delete</span>
        </div>
      </div>
    )
  }

  _handleDelete = () => {
    this.props.deletePost({
      variables: {id: this.props.post.id},
      optimisticResponse: {
        deletePost: {
          id: this.props.post.id,
          __typename: 'Post'
        }
      }
    })
  }
}

const deletePost = gql`
  mutation deletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`

const query = gql`
  query AllPostsQuery {
    allPosts(orderBy: createdAt_DESC) {
      id
      ...Post_post
    }
  }
  ${Post.fragments.post}
`

const PostWithMutation = graphql(deletePost, {
  name: 'deletePost',
  options: {
    update: (proxy, {data: {deletePost}}) => {
      const data = proxy.readQuery({ query })
      data.allPosts.find((post, idx) => {
        if (post.id === deletePost.id) {
          data.allPosts.splice(idx, 1)
          proxy.writeQuery({query, data})
          return true
        }
        return false
      })
    }
  }
})(Post)

export default PostWithMutation
