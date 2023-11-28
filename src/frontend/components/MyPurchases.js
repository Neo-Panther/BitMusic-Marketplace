import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card} from 'react-bootstrap'
import market from './music_store.avif'

export default function MyPurchases({ marketplace, musicnft, account }) {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const loadPurchasedReleases = async () => {
    // Fetch purchased releases from marketplace by quering Offered events with the buyer set as the user
    const filter =  marketplace.filters.Bought(null,null,null,null,null,account)
    const results = await marketplace.queryFilter(filter)
    //Fetch metadata of each musicnft and add that to listedRelease object.
    const purchases = await Promise.all(results.map(async i => {
      // fetch arguments from each result
      i = i.args
      // get uri url from musicnft contract
      const uri = await musicnft.tokenURI(i.tokenId)
      // use uri to fetch the musicnft metadata stored on ipfs 
      const response = await fetch(uri)
      const metadata = await response.json()
      // get total price of release (release price + fee)
      const totalPrice = await marketplace.getTotalPrice(i.releaseId)
      // define listed release object
      let purchasedRelease = {
        totalPrice,
        price: i.price,
        releaseId: i.releaseId,
        name: metadata.name,
        description: metadata.description,
        uri: metadata.music
      }
      return purchasedRelease
    }))
    setLoading(false)
    setPurchases(purchases)
  }
  useEffect(() => {
    loadPurchasedReleases()
  })
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((release, idx) => (
              <Col key={idx} className="overflow-hidden">
                 <a href={release.uri} target="_blank" rel="noreferrer"><Card.Img variant="top" />
                <Card>
                <Card.Img variant="top" src={market}  />
                  <Card.Body color="secondary">
                    <Card.Title>{release.name}</Card.Title>
                    <Card.Text>
                    {ethers.utils.formatEther(release.totalPrice)} ETH
                    </Card.Text>
                  </Card.Body>
                </Card>
                </a>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No purchases</h2>
          </main>
        )}
    </div>
  );
}