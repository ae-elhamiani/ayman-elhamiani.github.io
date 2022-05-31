import { useState, useEffect , useRef}from 'react'
import { ethers } from "ethers"
import SideBar from './components/side-bar'
import { Row, Form, Button, Card, ListGroup } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { CameraFill, Textarea, ShareFill} from 'react-bootstrap-icons';
import TextareaAutosize from 'react-textarea-autosize';
import { Link } from 'react-router-dom'
import Painterro from 'painterro'




import "./home.css";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Home = ({ contract }) => {
    const [posts, setPosts] = useState('')
    const [hasProfile, setHasProfile] = useState(false)
    const [post, setPost] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    const inputFile = useRef(null);
    const [selectedFile, setSelectedFile] = useState();
    const [img, setImage] = useState('')

   
  
    const onImageClick = () => {
    inputFile.current.click();
    };
    
    const changeHandler = async (event) => {
    event.preventDefault()
    const img = event.target.files[0];
    setSelectedFile(URL.createObjectURL(img));
   
            // console.log(img)
            // setImage(event.target.files[0])
        if(img){
            const result = await client.add(img)
            console.log(`${result.path}`)
            setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
        }
    
    };
    const onPainterroClick =  () => {

        Painterro({
          saveHandler: async function (image, done) {
            const img = image.asDataURL();
            setSelectedFile(img);     
            console.log("hoooooooooooohiiiiiiiiihhhhhooooooooo1111111111")
            console.log("hoooooooooooohiiiiiiiiihhhhhooooooooo1111111111")
            console.log("hoooooooooooohiiiiiiiiihhhhhooooooooo1111111111")
            const result = await client.add(image.asBlob())
            console.log(`${result.path}`)
            console.log(img)
            console.log("hoooooooooooohiiiiiiiiihhhhhooooooooo222222222")
            setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
            done(true);
          },
          activeColor: '#00b400'  // change active color to green
        }).show();
        console.log("hoooooooooooohiiiiiiiiihhhhhooooooooo33333333")
        
      };

    const loadPosts = async () => {
        let address = await contract.signer.getAddress()
        setAddress(address)
        const balance = await contract.balanceOf(address)
        setHasProfile(() => balance > 0)
        let results = await contract.getAllPosts()
 
        let posts = await Promise.all(results.map(async i => {
            let response = await fetch(`https://ipfs.infura.io/ipfs/${i.hash}`)
           // let response2 = await fetch(`https://ipfs.infura.io/ipfs/${i.ihash}`)
            const metadataPost = await response.json()
            const nftId = await contract.profiles(i.author)
            console.log(i.ihash)
            const uri = await contract.tokenURI(nftId)
            response = await fetch(uri)
            const metadataProfile = await response.json()
            const author = {
                address: i.author,
                username: metadataProfile.username,
                avatar: metadataProfile.avatar
            }
            let post = {
                id: i.id,
                content_text: metadataPost.post,
                content: i.ihash,
                tipAmount: i.tipAmount,
                author
            }
            return post
        }))
        posts = posts.sort((a, b) => b.id - a.id)
        setPosts(posts)
        setLoading(false)
    }
    useEffect(() => {
        if (!posts) {
            loadPosts()
        }
    })
    const uploadPost = async () => {
        if (!post && !img) return
        let hash 
        let ihash 
        if (!post && img){
            const result2 = img
            setLoading(true)
            const words = img.split('ipfs/');
            hash = 'undefined'
            ihash = words[1]
        }
        else if (post && !img){
            const result = await client.add(JSON.stringify({ post }))
            // const result2 = await client.add(JSON.stringify({ img }))
            setLoading(true)
             hash = result.path
             ihash = 'undefined'
        }
        else{
        try {
            const result = await client.add(JSON.stringify({ post }))
           // const result2 = await client.add(JSON.stringify({ img }))
            const result2 = img
            setLoading(true)
            hash = result.path
            const words = img.split('ipfs/');
            ihash = words[1]
            console.log("********************")

        } catch (error) {
            window.alert("ipfs text upload error: ", error)
        }
        }
        await (await contract.uploadPost(hash, ihash)).wait()
        loadPosts()
    }
    const tip = async (post) => {
        await (await contract.tipPostOwner(post.id, { value: ethers.utils.parseEther("0.1") })).wait()
        loadPosts()
    }
    if (loading) return (
        <div className='text-center'>
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        </div>
    )
    return (
        <div className="container-fluid mt-5">
            <div style={{ display:'inline-block', width:'66%'}}>
                {hasProfile ?
                    (
                        <div className="mainContent">
                            
                            <div className="profileTweet">
                                        <div className="tweetBox">
                                        <TextareaAutosize className='exampleTextarea' onChange={(e) => setPost(e.target.value)}  size="lg" required as="textarea" placeholder="What's poppin' ?"  />




                                        {selectedFile && (
                                            <img src={selectedFile} className="tweetImg"></img>

                                        )}
                                        <div className="imgOrTweet">
                                            <div className="imgDiv" > 
                                            </div>
                                                <div className="tweetOptions">
                                                    
                                                            <div id='camfill' onClick={onImageClick}>
                                                                        <input type="file"  name="file"  ref={inputFile} onChange={changeHandler} style={{ display: "none"}}/>
                                                                        <CameraFill fill="#fff" size={27} svg="image"  /> 

                                                                   
                                                            </div>
                                                            <Button onClick={onPainterroClick} id=""   >
                                                                draw
                                                            </Button>
                                                            <Button onClick={uploadPost} id="tweet"   >
                                                            <ShareFill  size={23} id='sharefill'/>
                                                                Share
                                                            </Button>
                                                    
                                                </div>
                                    </div>
                                </div>
                            </div>
                        {/* <main role="main" className="col-lg-12 mx-auto share" style={{ maxWidth: '700px' }}>
                            <div className="content mx-auto">
                                <Row className="g-4">
                                    <Form.Control id='exampleTextarea' onChange={(e) => setPost(e.target.value)} size="lg" required as="textarea" placeholder="what's on your mind " />
                                    <div style={{ borderTop: "2px solid #000", marginLeft: 20, marginRight: 20 ,marginBottom: 2 , marginTop: 2}}></div>
                                      
                                    <div >
                                        <Button onClick={uploadPost}  id='postbutton'  >
                                            Share
                                        </Button>

                                    </div>

                                </Row>  

                                     {selectedFile && (
                                             <img src={selectedFile} className="tweetImg"></img>
                                            )}
                                            <div className="imgOrTweet">
                                                    <div className="imgDiv" onClick={onImageClick}>
                                                                <CameraFill  size={20} svg="image" id='image-post' ></CameraFill>
                                                                <input type="file"  name="file"  ref={inputFile} onChange={changeHandler} style={{ display: "none" }} id='image-input-post'/>

                                                    </div>
                                            </div>
                                        </div>
                        </main> */}
                                    <div style={{ borderTop: "1px solid rgb(63, 63, 63) ", marginLeft: 105, marginRight: 120 ,marginBottom: 2 , marginTop: 5,}}></div>
                    </div>
                    )
                    :
                    (<div className="text-center">
                        <main style={{ padding: "1rem 0" }}>
                            <h2 style={{color: `grey`}}  >Must own an NFT to post</h2>
                                <Button id='create-button' to='/profile' >
                                <a href='/profile'>Create</a>
                                </Button>
                        </main>
                    </div>)
                }
                {posts.length > 0 ?
                    posts.map((post, key) => {
                        return (
                            <div key={key} className="col-lg-12 my-3 mx-auto" style={{ width: '620px' }}>
                                <Card id="tweet-box">
                                    <Card.Header  id='card-header' >
                                        <div className='post-profile-box'>
                                            <div className='image-name' >
                                                <img className='tweet-profile-image'  src={post.author.avatar} />
                                                <small id='tweet-profile-user'>
                                                    {post.author.username}
                                                </small>
                                            </div>
                                            <div id='address'>
                                                <small className="mt-1 float-end d-inline address" style={{color :`#c4c6c9`}} >
                                                    {post.author.address}
                                                </small>
                                            </div>
                                        </div>
                                    </Card.Header>
                                   {post.content == 'undefined'?(
                                        <Card.Body className='cardbody'  >
                                        <Card.Title className='post-content' id='post-content'>
                                            {post.content_text}
                                            </Card.Title>
                                            </Card.Body>  
                                            ):(
                                                <Card.Body className='cardbody'  >
                                        <Card.Title className='post-content' id='post-content'>
                                            {post.content_text}
                                            </Card.Title>
                                            <img      id='imagge-post' src={`https://ipfs.infura.io/ipfs/${post.content}`} />
                                            </Card.Body>  
                                           
                                            )}


                                    <Card.Footer className="list-group-item" id='tips'>
                                    {address === post.author.address || !hasProfile ?
                                            null : <div className="d-inline float-end">
                                                <Button onClick={() => tip(post)} id='tip-button'>
                                                    Tip for 0.1 ETH
                                                </Button>
                                            </div>}
                                        <div id='tip-amount'> Tip Amount: {ethers.utils.formatEther(post.tipAmount)} ETH </div>
                                        
                                    </Card.Footer>

                                </Card>
                            </div>)
                    })
                    : (
                        <div className="text-center">
                            <main style={{ padding: "1rem 0" }}>
                                <h2 style={{color: `white`}} >No posts yet</h2>
                            </main>
                        </div>
                    )}
            </div>
            
            <SideBar></SideBar>
            

        </div >
    );
}

export default Home