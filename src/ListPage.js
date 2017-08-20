import React, { Component } from 'react'
import Post from './Post'
import { graphql, gql } from 'react-apollo'
import PropTypes from 'prop-types'
import FeedQuery from './queries/FeedQuery'

class ListPage extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  componentDidMount() {
    this.props.data.subscribeToMore({
      document: SubscriptionQuery,
      variables: {
        createdById: this.props.user ? this.props.user.id : null,
      },
      updateQuery: (previousState, {subscriptionData}) => {
        if (subscriptionData.data.Post.mutation === 'CREATED') {
          const newPost = subscriptionData.data.Post.node
          const exists = previousState.allPosts.find(post => post.id === newPost.id)
          if (!exists) {
            const posts = [newPost].concat(previousState.allPosts)
            return {
              allPosts: posts
            }
          }
        } else if (subscriptionData.data.Post.mutation === 'UPDATED' && subscriptionData.data.Post.node.deleted === true) {
          const deletedPost = subscriptionData.data.Post.previousValues
          const posts = previousState.allPosts.filter(post => post.id !== deletedPost.id)
          return {
            allPosts: posts
          }
        }
      }
    })
  }

  render () {
    if (this.props.data.loading) {
      return (<div>Loading</div>)
    }

    return (
      <div className='w-100 flex justify-center'>
        <div className='w-100' style={{ maxWidth: 400 }}>
          {this.props.data.allPosts.map((post) =>
            <Post key={post.id} post={post} />
          )}
        </div>
      </div>
    )
  }
}

// eslint-disable-next-line
const SubscriptionQuery = gql`
  subscription SubscriptionQuery ($createdById:ID) {
    Post(filter: { mutation_in: [CREATED, UPDATED],
  	OR: [
      {
        node : {
          private: false
        }
      },
      {
        node: {
          private: true,
          createdBy: {
            id: $createdById
          }
        }
      }
    ]
  }) {
      mutation
      node {
        id
        ...Post_post
      }
      previousValues {
        id
        description
        imageUrl
        private
      }
    }
  }
  ${Post.fragments.post}
`

export default graphql(FeedQuery, {
  options: props => ({
    variables: {
      createdById: props.user ? props.user.id : null
    }
  })
})(ListPage)
