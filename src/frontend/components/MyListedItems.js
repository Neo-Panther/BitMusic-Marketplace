import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'
import market from './music_store.avif'
function renderSoldReleases(releases) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {releases.map((release, idx) => (
          <Col key={idx} className="overflow-hidden">
             <a href={release.uri} target="_blank" rel="noreferrer"><Card.Img variant="top" />
            <Card>
              <Card.Img variant="top" src={market}  />
              <Card.Body>{release.name}</Card.Body>
                  <Card.Body>{release.description}</Card.Body>
              <Card.Footer>
                For {ethers.utils.formatEther(release.totalPrice)} ETH - Recieved {ethers.utils.formatEther(release.price)} ETH
              </Card.Footer>
            </Card>
            </a>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [listedItems, setListedItems] = useState([])
  const [soldItems, setSoldItems] = useState([])
  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplace.itemCount()
    let listedItems = []
    let soldItems = []
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx)
      if (i.seller.toLowerCase() === account) {
        // get uri url from musicnft contract
        const uri = await musicnft.tokenURI(i.tokenId)
        // use uri to fetch the musicnft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of release (release price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.releaseId)
        // define listed release object
        let release = {
          totalPrice,
          price: i.price,
          releaseId: i.releaseId,
          name: metadata.name,
          description: metadata.description,
          uri: metadata.music
        }
        listedItems.push(item)
        // Add listed item to sold items array if sold
        if (i.sold) soldItems.push(item)
      }
    }
    setLoading(false)
    setListedItems(listedItems)
    setSoldItems(soldItems)
  }
  useEffect(() => {
    loadListedReleases()
  })
  if (updating) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                 <a href={release.uri} target="_blank" rel="noreferrer"><Card.Img variant="top" />
                <Card>
                  <Card.Img variant="top" src={market} />
                  <Card.Body>{release.name}</Card.Body>
                  <Card.Body>{release.description}</Card.Body>
                  <Card.Footer>{ethers.utils.formatEther(release.totalPrice)} ETH</Card.Footer>
                </Card>
                </a>
              </Col>
            ))}
          </Row>
            {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}