require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/A2PeLCsqo5Zx5GnR_X8YOQ8aYTWsNPh5',
      accounts: [
        '750fbab35a7bed49289d42f21bc7ac08324b9a966a32a641d37bc47af3204ba7',
      ],
    },
  },
};
