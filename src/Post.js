import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import UserQuery from './queries/UserQuery'

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
        private
        deleted
        createdBy {
          id
        }
      }
    `
  }

  deleteButton = () => {
    if (this.props.data.user && this.props.data.user.id === this.props.post.createdBy.id) {
      return (
        <span className='red f6 pointer dim' onClick={this._handleDelete}>Delete</span>
      )
    }
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
          {this.deleteButton()}
        </div>
      </div>
    )
  }

  _handleDelete = () => {
    this.props.deletePost({
      variables: {id: this.props.post.id},
      optimisticResponse: {
        updatePost: {
          id: this.props.post.id,
          __typename: 'Post'
        }
      }
    })
  }
}

const deletePost = gql`
  mutation deletePost($id: ID!) {
    updatePost(id: $id, deleted: true) {
      id
    }
  }
`

const FeedQuery = gql`
  query FeedQuery ($createdById:ID) {
    allPosts(orderBy: createdAt_DESC, filter: {
    AND: [
      { deleted: false },
      {
        OR: [
          {
            private: false
          },
          {
            private: true,
            createdBy: {
              id: $createdById
            }
          }
        ]
      }
    ]
  }) {
      id
      ...Post_post
    }
  }
  ${Post.fragments.post}
`

const PostWithMutation = graphql(deletePost, {
  name: 'deletePost',
  options: props => ({
    update: (proxy, {data: {updatePost}}) => {
      const variables = {createdById: props.data.user.id}
      const data = proxy.readQuery({ query: FeedQuery, variables })
      data.allPosts.find((post, idx) => {
        if (post.id === updatePost.id) {
          data.allPosts.splice(idx, 1)
          proxy.writeQuery({query: FeedQuery, data, variables})
          return true
        }
        return false
      })
    }
  })
})(Post)

export default graphql(UserQuery)(PostWithMutation)
