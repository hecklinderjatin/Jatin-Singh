export const createTraveler = /* GraphQL */ `
  mutation CreateTraveler($input: CreateTravelerInput!) {
    createTraveler(input: $input) {
      uid
      name
    }
  }
`;
