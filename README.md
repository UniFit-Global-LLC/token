# UniFit Global Token

Repository for the UniFit Global Token

https://unifitglobal.com/

* Contracts built with [Solidity](https://docs.soliditylang.org/en/latest/index.html)
* Contract development with [Hardhat](https://hardhat.org/)

## Contact

Please submit all questions to support@unifitglobal.com

## Installation

Install the `yarn` packages

```
yarn install
```

Note: [`yarn` installation can be found here](https://yarnpkg.com/getting-started/install)

## Running the automated tests

```
yarn test
```

### Lint Contract

```
yarn solhint
```

### Local blockchain

```
yarn chain
```

## Deployment

### Local chain

Start chain and run deploy

```
# In one terminal window
yarn chain

# In another terminal window
npx hardhat run scripts/deploy-unifittoken.js --network localhost
```

### Rinkeby
 
Set your environment variables

Run hardhat deploy

```
npx hardhat run scripts/deploy-unifittoken.js --network rinkeby
```
