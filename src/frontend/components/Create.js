import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('http://127.0.0.1:5001')

const Create = ({ marketplace, musicnft }) => {
  const [music, setMusic] = useState('')
  const [publisher, setPublisher] = useState('')
  const [price, setPrice] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setMusic(`http://127.0.0.1:8080/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }
  const makeFile = async () => {
    console.log("1")
    if (!music || !price || !title || !description || !publisher) return
    try{
      const result = await client.add(JSON.stringify({music, price, name: title, description,publisher}))
      append(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const append = async (result) => {
    const link = `http://127.0.0.1:8080/ipfs/${result.path}`
    // mint musicnft 
    await(await musicnft.mint(link)).wait()
    // get tokenId of new musicnft 
    const id = await musicnft.tokenCount()
    // approve marketplace to spend musicnft
    await(await musicnft.setApprovalForAll(marketplace.address, true)).wait()
    // add musicnft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketplace.makeRelease(musicnft.address, id, listingPrice)).wait()
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
                accept='.mp3'
              />
              <Form.Control onChange={(e) => setTitle(e.target.value)} size="lg" required type="text" placeholder="Name of the audio file" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description of the release" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <Form.Control onChange={(e) => setPublisher(e.target.value)} size="lg" required type="text" placeholder="Name of the publisher" />
              <div className="d-grid px-0">
                <Button onClick={makeFile} variant="primary" size="lg">
                  Create & List MUSICNFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create