import { Link, BrowserRouter, Routes, Route }
  from "react-router-dom";
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import MacpostAbi from './contractsData/Macpost.json'
import MacpostAddress from './contractsData/Macpost-address.json'
import { Spinner, Navbar, Nav, NavItem, Button, Container } from 'react-bootstrap'
import { PersonFill ,HouseHeart,HouseDoorFill,HouseFill} from 'react-bootstrap-icons';



import logo from './logo.png'
import Home from './Home.js'
import Profile from './Profile.js'
import './App.css';




function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState({})

  const web3Handler = async () => {
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    // Setup event listeners for metamask
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })
    window.ethereum.on('accountsChanged', async () => {
      setLoading(false)
      web3Handler()
    })
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Get signer
    const signer = provider.getSigner()
    loadContract(signer)
  }
  const loadContract = async (signer) => {

    // Get deployed copy of Macpost contract
    const contract = new ethers.Contract(MacpostAddress.address, MacpostAbi.abi, signer)
    setContract(contract)
    setLoading(false)
  }
  return (
    <BrowserRouter>
      <div className="App">
      
        <>
          <Navbar className="navbar" id="nav-bar">
            <Container>

              <Navbar.Brand href="http://">

                <div className="div-logo">
                  <img src={logo} width="40" height="40" className="logo" href="localhost:3000" />
                  &nbsp; <a  id="macpost">MACpost</a>
                </div>

              </Navbar.Brand>

              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="  navo" >

                <Nav.Link as={Link} to="/" id="home"><HouseDoorFill  size={16} /></Nav.Link>
                  <Nav.Link as={Link} to="/profile" id="profile"><PersonFill  size={16} /></Nav.Link>


                </Nav>

                <Nav>
                  {account ? (
                    <Nav.Link
                      href={`https://etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button nav-button btn-sm mx-4">


                      <Button variant="outline-light" id="wallet1">
                        {account.slice(0, 10) + '....' + account.slice(34, 42)}
                      </Button>


                    </Nav.Link>

                  ) : (
                   <p>.</p>
                  )}
                </Nav>

              </Navbar.Collapse>
              

            </Container>

          </Navbar>

        </>

        <div>
          {loading ? (
           <div id ="connect-walet-p1">
              <Spinner animation="border" style={{ display: 'flex', color: `white` }} className="meta" />
              <p className='mx-3 my-0 meta ' style={{ padding: "1rem 0", color: `white`, fontSize: `30px` }}></p>
              <Button onClick={web3Handler} variant="outline-light"  >Connect Wallet</Button>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home contract={contract} />
              } />
              <Route path="/profile" element={
                <Profile contract={contract} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>

  );
}

export default App;
