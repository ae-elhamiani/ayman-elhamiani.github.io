
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Macpost is ERC721 {
    uint256 public tokenCount;
    uint256 public postCount;
    mapping(uint256 => Post) public posts;

     using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter _tokenIds;
    mapping(uint256 => string) _tokenURIs;
    
    mapping(address => uint256) public profiles;

    struct Post {
        uint256 id;
        string hash;
        string ihash;
        uint256 tipAmount;
        address payable author;
    }

    event PostCreated(
        uint256 id,
        string hash,
        string ihash,
        uint256 tipAmount,
        address payable author
    );

    event PostTipped(
        uint256 id,
        string hash,
        string ihash,
        uint256 tipAmount,
        address payable author
    );

    constructor() ERC721("Macpost", "MP") {}
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId),"URI not exist on that ID");
        string memory _RUri =  _tokenURIs[tokenId];
        return _RUri;
    }

    function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        setProfile(tokenCount);
        return (tokenCount);
    }

    function setProfile(uint256 _id) public {
        require(
            ownerOf(_id) == msg.sender,
            "Must own an NFT to select as profile"
        );
        profiles[msg.sender] = _id;
    }

    function uploadPost(string memory _postHash,string memory _imgHash ) external {
        require(balanceOf(msg.sender) > 0);
        require(bytes(_postHash).length > 0 && bytes(_imgHash).length > 0);
        postCount++;
        posts[postCount] = Post(postCount, _postHash, _imgHash, 0, payable(msg.sender));
        emit PostCreated(postCount, _postHash, _imgHash, 0, payable(msg.sender));
    }

    function tipPostOwner(uint256 _id) external payable {
        require(_id > 0 && _id <= postCount);
        Post memory _post = posts[_id];
        require(_post.author != msg.sender);
        _post.author.transfer(msg.value);
        _post.tipAmount += msg.value;
        posts[_id] = _post;
        emit PostTipped(_id, _post.hash, _post.ihash, _post.tipAmount, _post.author);
    }

    function getAllPosts() external view returns (Post[] memory _posts) {
        _posts = new Post[](postCount);
        for (uint256 i = 0; i < _posts.length; i++) {
            _posts[i] = posts[i + 1];
        }
    }

    function getMyNfts() external view returns (uint256[] memory _ids) {
        _ids = new uint256[](balanceOf(msg.sender));
        uint256 currentIndex;
        uint256 _tokenCount = tokenCount;
        for (uint256 i = 0; i < _tokenCount; i++) {
            if (ownerOf(i + 1) == msg.sender) {
                _ids[currentIndex] = i + 1;
                currentIndex++;
            }
        }
    }
}