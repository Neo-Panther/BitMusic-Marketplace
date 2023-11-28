# Music Marketplace

## Tools Used

- Solidity (Smart Contracts)
- Javascript: React.js (React - Frontend)
- [React routers](https://v5.reactrouter.com/) (Navigation between frontend components)
- [Hardhat](https://hardhat.org/) (Development Framework - Test Local Network)
- [Ethers](https://docs.ethers.io/v5/) (Library for interaction between frontend and the blockchain)
- [Ipfs](https://ipfs.io/) (Decentralized Music and Metadata storage)

## Setting Up
### 1. Install Dependencies
`npm install`

### 2. Boot up local development blockchain
`npx hardhat node`

### 3. Connect development blockchain accounts to Metamask
- Add hardhat to the list of networks on your metamask: open up a browser, click the fox icon, then click the top center dropdown button that lists all the available networks then click add networks. A form should pop up. For the `Network Name` field enter `Hardhat`. For the `New RPC URL` field enter `http://127.0.0.1:8545`. For the chain ID enter `1234`. Then click `save`.
- Copy private key of the addresses and import to Metamask
- Connect your metamask to hardhat blockchain, network 127.0.0.1:8545.

### 4. Migrate (Complie and Run) Smart Contracts
`npx hardhat run src/backend/scripts/deploy.js --network localhost`

### 5. Run Frontend React App
`npm run start`
