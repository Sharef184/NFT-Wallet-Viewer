import { useState } from "react";
import { Card, Row, Col, Form } from "react-bootstrap";

export default function NftGallery({ nfts, formatImageUrl }) {
  const [filter, setFilter] = useState("");

  const filteredNfts = nfts.filter((nft) =>
    nft.onchain_metadata?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="bg-dark text-white mb-4">
      <Card.Body>
        <Card.Title>NFT Collection</Card.Title>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark text-white border-secondary"
          />
        </Form.Group>
        <Row>
          {filteredNfts.map((nft) => (
            <Col key={nft.asset} md={4} className="mb-4">
              <Card className="bg-secondary text-white">
                <img
                  src={formatImageUrl(nft.onchain_metadata?.image)}
                  alt={nft.onchain_metadata?.name || "NFT"}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Text className="text-center">
                    {nft.onchain_metadata?.name || "Unknown NFT"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
}