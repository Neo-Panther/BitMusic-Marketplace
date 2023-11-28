import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import market from './music_store.avif'

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true)
  const [releases, setReleases] = useState([])
  const loadMarketplaceReleases = async () => {
    // Load all unsold releases
    const releaseCount = await marketplace.releaseCount()
    let releases = []
    for (let i = 1; i <= releaseCount; i++) {
      const release = await marketplace.releases(i)
      if (!release.sold) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(release.tokenId)
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of release (release price + fee)
        const totalPrice = await marketplace.getTotalPrice(release.releaseId)
        // Add release to releases array
        releases.push({
          totalPrice,
          releaseId: release.releaseId,
          seller: release.seller,
          name: metadata.name,
          description: metadata.description,
          uri: metadata.music
        })
      }
    }
    setLoading(false)
    setReleases(releases)
  }

  const buyMarketRelease = async (release) => {
    await (await marketplace.purchaseRelease(release.releaseId, { value: release.totalPrice })).wait()
    loadMarketplaceReleases()
  }

  useEffect(() => {
    loadMarketplaceReleases()
  })
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {releases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {releases.map((release, idx) => (
              <Col key={idx} className="overflow-hidden">
                 
                <Card>
                <Card.Img variant="top" src={market}  />
                  <Card.Body color="secondary">
                    <Card.Title>{release.name}</Card.Title>
                    <Card.Text>
                      {release.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketRelease(release)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(release.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
               
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default Home