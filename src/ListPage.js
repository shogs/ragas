import React, { Component } from 'react'
import Post from './Post'
import { graphql, gql } from 'react-apollo'
import PropTypes from 'prop-types'

class ListPage extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  componentDidMount() {
    this.props.data.subscribeToMore({
      document: SubscriptionQuery,
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
        } else if (subscriptionData.data.Post.mutation === 'DELETED') {
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

const FeedQuery = gql`
  query FeedQuery {
    allPosts(orderBy: createdAt_DESC) {
      id
      ...Post_post
    }
  }
  ${Post.fragments.post}
`

// eslint-disable-next-line
const SubscriptionQuery = gql`
  subscription SubscriptionQuery {
    Post(filter: { mutation_in: [CREATED, DELETED] }) {
      mutation
      node {
        id
        description
        imageUrl
      }
      previousValues {
        id
        description
        imageUrl
      }
    }
  }
`


export default graphql(FeedQuery)(ListPage)
