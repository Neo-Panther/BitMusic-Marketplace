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

export default function MyListedReleases({ marketplace, musicnft, account }) {
  const [updating, setUpdating] = useState(true)
  const [listedReleases, setListedReleases] = useState([])
  const [soldReleases, setSoldReleases] = useState([])
  const loadListedReleases = async () => {
    // Load all sold releases that the user listed
    const releaseCount = await marketplace.releaseCount()
    let listedReleases = []
    let soldReleases = []
    for (let indx = 1; indx <= releaseCount; indx++) {
      const i = await marketplace.releases(indx)
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
        listedReleases.push(release)
        // Add listed release to sold releases array if sold
        if (i.sold) soldReleases.push(release)
      }
    }
    setUpdating(false)
    setListedReleases(listedReleases)
    setSoldReleases(soldReleases)
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
      {listedReleases.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedReleases.map((release, idx) => (
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
            {soldReleases.length > 0 && renderSoldReleases(soldReleases)}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}