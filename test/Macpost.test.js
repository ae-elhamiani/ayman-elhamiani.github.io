const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Macpost", function () {
  let macpost
  let deployer, user1, user2, users
  let URI = "SampleURI"
  let postHash = "SampleHash"
  beforeEach(async () => {
    [deployer, user1, user2, ...users] = await ethers.getSigners();
    const MacpostFactory = await ethers.getContractFactory("Macpost");
    macpost = await MacpostFactory.deploy();
    await macpost.connect(user1).mint(URI)
  })

  describe('Deployment', async () => {
    it("Should track name and symbol", async function () {
      const nftName = "Macpost"
      const nftSymbol = "DAPP"
      expect(await macpost.name()).to.equal(nftName);
      expect(await macpost.symbol()).to.equal(nftSymbol);
    });
  })

  describe('Minting NFTs', async () => {
    it("Should track each minted NFT", async function () {
      expect(await macpost.tokenCount()).to.equal(1);
      expect(await macpost.balanceOf(user1.address)).to.equal(1);
      expect(await macpost.tokenURI(1)).to.equal(URI);
      await macpost.connect(user2).mint(URI)
      expect(await macpost.tokenCount()).to.equal(2);
      expect(await macpost.balanceOf(user2.address)).to.equal(1);
      expect(await macpost.tokenURI(2)).to.equal(URI);
    });
  })

  describe('Setting profiles', async () => {
    it("Should allow users to select which NFT they own to represent their profile", async function () {
      await macpost.connect(user1).mint(URI)
      expect(await macpost.profiles(user1.address)).to.equal(2);
      await macpost.connect(user1).setProfile(1)
      expect(await macpost.profiles(user1.address)).to.equal(1);
      await expect(
        macpost.connect(user2).setProfile(2)
      ).to.be.revertedWith("Must own the nft you want to select as your profile");
    });
  })
  
  describe('Uploading posts', async () => {
    it("Should track posts uploaded only by users who own an NFT", async function () {
      await expect(macpost.connect(user1).uploadPost(postHash))
        .to.emit(macpost, "PostCreated")
        .withArgs(
          1,
          postHash,
          0,
          user1.address
        )
      const postCount = await macpost.postCount()
      expect(postCount).to.equal(1);
      const post = await macpost.posts(postCount)
      expect(post.id).to.equal(1)
      expect(post.hash).to.equal(postHash)
      expect(post.tipAmount).to.equal(0)
      expect(post.author).to.equal(user1.address)
      await expect(
        macpost.connect(user2).uploadPost(postHash)
      ).to.be.revertedWith("Must own a macpost nft to post");
      await expect(
        macpost.connect(user1).uploadPost("")
      ).to.be.revertedWith("Cannot pass an empty hash");
    });
  })
  describe('Tipping posts', async () => {
    it("Should allow users to tip posts and track each posts tip amount", async function () {
      await macpost.connect(user1).uploadPost(postHash)
      const initAuthorBalance = await ethers.provider.getBalance(user1.address)
      const tipAmount = ethers.utils.parseEther("1")
      await expect(macpost.connect(user2).tipPostOwner(1, { value: tipAmount }))
        .to.emit(macpost, "PostTipped")
        .withArgs(
          1,
          postHash,
          tipAmount,
          user1.address
        )
      const post = await macpost.posts(1)
      expect(post.tipAmount).to.equal(tipAmount)
      const finalAuthorBalance = await ethers.provider.getBalance(user1.address)
      expect(finalAuthorBalance).to.equal(initAuthorBalance.add(tipAmount))
      await expect(
        macpost.connect(user2).tipPostOwner(2)
      ).to.be.revertedWith("Invalid post id");
      await expect(
        macpost.connect(user1).tipPostOwner(1)
      ).to.be.revertedWith("Cannot tip your own post");
    });
  })
  describe("Getter functions", function () {
    let ownedByUser1 = [1, 2]
    let ownedByUser2 = [3]
    beforeEach(async function () {
      await macpost.connect(user1).uploadPost(postHash)
      await macpost.connect(user1).mint(URI)
      await macpost.connect(user2).mint(URI)
      await macpost.connect(user2).uploadPost(postHash)
    })

    it("getAllPosts should fetch all the posts", async function () {
      const allPosts = await macpost.getAllPosts()
      expect(allPosts.length).to.equal(2)
    });
    it("getMyNfts should fetch all nfts the user owns", async function () {
      const user1Nfts = await macpost.connect(user1).getMyNfts()
      expect(user1Nfts.length).to.equal(2)
      const user2Nfts = await macpost.connect(user2).getMyNfts()
      expect(user2Nfts.length).to.equal(1)
    });
  });
});
