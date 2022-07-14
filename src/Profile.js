import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Modal } from 'react-bootstrap'
import "./profile.css"

import { Row, Form, Button, Card, ListGroup, Col } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const App = ({ contract }) => {
    const [profile, setProfile] = useState('')
    const [nfts, setNfts] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(true)



    const [account, setAccount] = useState(null)

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const loadMyNFTs = async () => {
        // Get users nft ids
        const results = await contract.getMyNfts();
        // Fetch metadata of each nft and add that to nft object.
        let nfts = await Promise.all(results.map(async i => {
            // get uri url of nft
            const uri = await contract.tokenURI(i)
            // fetch nft metadata
            const response = await fetch(uri)
            const metadata = await response.json()
            return ({
                id: i,
                username: metadata.username,
                avatar: metadata.avatar
            })
        }))
        setNfts(nfts)
        getProfile(nfts)
    }
    const getProfile = async (nfts) => {
        const address = await contract.signer.getAddress()
        const id = await contract.profiles(address)
        const profile = nfts.find((i) => i.id.toString() === id.toString())
        setProfile(profile)
        setLoading(false)
    }

    const getAddresss = async()=> {
        const address =  await contract.signer.getAddress()
       
    }


    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                setAvatar(`https://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    const mintProfile = async (event) => {
        if (!avatar || !username) return
        try {
            const result = await client.add(JSON.stringify({ avatar, username }))
            // setLoading(true)
            await (await contract.mint(`https://ipfs.infura.io/ipfs/${result.path}`)).wait()
            loadMyNFTs()
        } catch (error) {
            window.alert("ipfs uri upload error: ", error)
        }
    }

    const switchProfile = async (nft) => {
        // setLoading(true)
        await (await contract.setProfile(nft.id)).wait()
        getProfile(nfts)
    }
    useEffect(() => {
        if (!nfts) {
            loadMyNFTs()
        }
    })
    if (loading) return (
        <div className='text-center'>
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        </div>
    )
    return (
        <div className="mt-4 text-center">
            
            {profile ? (
                <div className="mb-3"  >
                        {/* <img className="mb-3" id='main-profile-image'  style={{ width: '300px',  height:'300px'}} src={profile.avatar} />
                        <h3 className="mb-3" className="username">{profile.username}</h3>
                        <h6 className="mb-3" className="userbio"> yow this is me the owner of this proffile  </h6> */}
                                <div class="wrapper">
                                    <div class="profile-card js-profile-card">
                                    <div class="profile-card__img">
                                        <img src={profile.avatar}alt="profile card"/>
                                    </div>

                                
                                    <div class="profile-card__cnt js-profile-cnt">
                                            <div class="data-container">
                                                        <h1>{profile.username}</h1>
                                                        <h4>0x6b3e123b689C80EC7Ed7031152b8491E8f336EE5</h4>
                                            </div>
                                            <div style={{ borderTop: "3px solid #15F095 ", marginLeft: 20, marginRight: 20 ,marginBottom: 2 , marginTop: 5,}}></div>
                                            <div style={{ borderTop: "3px solid #000 ", marginLeft: 20, marginRight: 20 ,marginBottom: 0 , marginTop: 0,}}></div>
                                        
                                            <div class="profile-card-ctr">
                                                <Button id="add-avatar"  onClick={handleShow}>
                                                    Add avatar
                                                </Button> 
                                            </div>
                                    </div>
                                    </div>
                                </div>                       
                </div>
                ):  
                     <div id="user-login">
                        <div class="formm" >
                             <div class="state"></div>
                                <div class="file-inputt">
                                <div className="Eye"><h1>BlackEye</h1></div>

                                    <Form.Control type="file" id="file" class="file" required name="file" onChange={uploadToIPFS} />
                                    <label for="file">  Select file for profile image</label> 
                                </div>
                                        <Form.Control onChange={(e) => setUsername(e.target.value)} required type="text" placeholder="Username"  id='user-name' />
                                        <Button onClick={mintProfile} id="mintt-button" >
                                                Mint NFT Profile
                                        </Button>
                        </div>
                    </div>
            }
               
                    
                    <div className="row">
                        <main role="main" className="col-lg-12 mx-auto" id='profile-box'  style={{ maxWidth: '400px' }}>
                            <div className="content mx-auto">
                                    {/* <div id='choose-file'  >
                                            <Form.Control type="file" required name="file" onChange={uploadToIPFS} />
                                                    <div class="file-input">
                                                    <input type="file" id="file" class="file"/> 
                                                    <label for="file">Select file for profile image</label> 
                                                    </div>
                                            <Form.Control onChange={(e) => setUsername(e.target.value)} size="lg" required type="text" placeholder="Username"  id='user-name'/>
                                            <Button onClick={mintProfile} id="mint-button" >
                                                Mint NFT Profile
                                            </Button>
                                    </div> */}

                                    <Modal show={show}  keepMounted onHide={handleClose} animation={false} id='box-modal' style={{marginTop: `100px`}} >
                                    <Modal.Header closeButton   className='modal-box'>                                                           
                                                <Modal.Title > 
                                                        <div class="state"><h1>BlackEye</h1></div>
                                                </Modal.Title>
                                    </Modal.Header>

                                    <Modal.Body className='modal-box'>
                                                <Form.Control type="file" id='file' required name="file" onChange={uploadToIPFS} />
                                                    <label for="file"> <i class="fa-solid fa-camera" id='camera'  required ></i>Select file for profile image</label> 
                                                <Form.Control onChange={(e) => setUsername(e.target.value)} size="lg" required type="text" placeholder="Username" id='user-name'/>
                                    </Modal.Body>

                                    <Modal.Footer className='modal-box'>
                                            <Button onClick={function(event){ mintProfile(); handleClose()}} id="mint-button" onHide={handleClose}  >
                                                Mint NFT 
                                            </Button>
                                    </Modal.Footer>

                                </Modal>
                            </div>
                        </main>
                    </div>



                    <div className="px-5 container">
                        <Row xs={1} md={2} lg={4} className="g-4 py-5">
                            {nfts.map((nft, idx) => {
                                if (nft.id === profile.id) return
                                return (
                                    <Col key={idx} className="overflow-hidden">
                                        <Card id='card-box'>
                                            <Card.Img id='card-profile-image' variant="top" src={nft.avatar} style={{ maxwidth: `270px`, maxheight: `290px` }} />
                                            {/* <Card.Body color="secondary" id='card-profile-body' >
                                                <Card.Title className='nft-name'  >{nft.username}</Card.Title>
                                            </Card.Body> */}
                                            <Card.Footer>
                                                <div className="d-grid footer">
                                                    <Button onClick={() => switchProfile(nft)} size="lg" id='set-profile'>
                                                        Set as Profile
                                                    </Button>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                )
                            })}
                        </Row>
                    </div>


                            


        </div>
    );
}

export default App;
