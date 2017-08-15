import Post from '../Post'
import { gql } from 'react-apollo'

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

export default FeedQuery
