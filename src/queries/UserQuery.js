import { gql } from 'react-apollo'

const UserQuery = gql`
  query userQuery {
    user {
      id
    }
  }
`

export default UserQuery
