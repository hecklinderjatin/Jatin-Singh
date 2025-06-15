export const getTraveler = /* GraphQL */ `
  query GetTraveler($uid: ID!) {
    getTraveler(uid: $uid) {
      uid
      name
    }
  }
`;
