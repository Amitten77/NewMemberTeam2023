const LendingHand = artifacts.require("LendingHand");

module.exports = function(deployer) {
  deployer.deploy(LendingHand);
};
