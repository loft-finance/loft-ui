import {
    ApolloClient,
    InMemoryCache,
    gql
} from "@apollo/client";
import { v2 } from '@aave/protocol-js';

const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    cache: new InMemoryCache()
});

export async function getData(){
    const res = await client.query({
      query: gql`
        query GetRates {
          reserves(first: 5) {
            id
            name
            decimals
            baseVariableBorrowRate
            totalLiquidity
            price {
              id
              priceInEth
            }
          }
        }
      `
    })

    return await v2.formatReserves(
      res.data.reserves
    );
}