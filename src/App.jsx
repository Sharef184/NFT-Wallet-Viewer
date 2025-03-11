import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Image } from "react-bootstrap";

const API_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const API_KEY = "mainnetRUrPjKhpsagz4aKOCbvfTPHsF0SmwhLc";
const DEFAULT_ADDRESS =
  "addr1x88ttk0fk6ssan4g2uf2xtx3anppy3djftmkg959tufsc6qkqt76lg22kjjmnns37fmyue765qz347sxfnyks27ysqaqd3ph23";
   // another address for testing = addr1x88ttk0fk6ssan4g2uf2xtx3anppy3djftmkg959tufsc69hyux9r0aaw20f44z4lwsgjhvpc6lfu62t06dx4wrrvwcs5kmt75

export default function CardanoWalletViewer() {
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData(address);
  }, [address]);

  const formatImageUrl = (image) => {
    return typeof image === "string" && image.startsWith("ipfs://")
      ? `https://ipfs.blockfrost.dev/ipfs/${image.replace("ipfs://", "")}`
      : "https://via.placeholder.com/150"; 
  };

  const fetchWalletData = async (addr) => {
    setLoading(true);
    setError(null);

    // Reset previous data
    setWalletInfo(null);
    setTransactions([]);
    setNfts([]);

    try {
      // Fetch wallet information
      const walletRes = await axios.get(`${API_URL}/addresses/${addr}`, {
        headers: { project_id: API_KEY },
      });
      setWalletInfo(walletRes.data);

      // Fetch transactions
      const txRes = await axios.get(`${API_URL}/addresses/${addr}/transactions`, {
        headers: { project_id: API_KEY },
      });
      setTransactions(txRes.data);

      // Fetch UTXOs to get assets
      const utxoRes = await axios.get(`${API_URL}/addresses/${addr}/utxos`, {
        headers: { project_id: API_KEY },
      });

      // Extract assets (excluding ADA/lovelace)
      const assets = utxoRes.data
        .flatMap((utxo) => utxo.amount || [])
        .filter((asset) => asset.unit !== "lovelace");

      // Fetch NFT details for each asset
      const nftDetails = await Promise.all(
        assets.map(async (asset) => {
          try {
            const assetRes = await axios.get(`${API_URL}/assets/${asset.unit}`, {
              headers: { project_id: API_KEY },
            });
            return assetRes.data;
          } catch (err) {
            console.error("Error fetching NFT details:", err);
            return null;
          }
        })
      );

      // Filter out null values and set NFTs
      setNfts(nftDetails.filter(Boolean));
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="bg-dark text-white min-vh-100 p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="display-4">Cardano Wallet Viewer</h1>
          <p className="lead text-muted">
            Explore wallet details, transactions, and NFT collections on the Cardano blockchain.
          </p>
        </Col>
      </Row>

      {/* Address Input */}
      <Row className="mb-4 justify-content-center">
        <Col md={8}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mb-2"
            />
            <Button
              variant="primary"
              onClick={() => fetchWalletData(address)}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Form.Group>
        </Col>
      </Row>

      {/* Loading and Error Messages */}
      {loading && (
        <Row className="justify-content-center">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      )}
      {error && (
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Wallet Info */}
      {walletInfo && (
        <Row className="mb-4">
          <Col>
            <Card className="bg-secondary text-white">
              <Card.Body>
                <Card.Title>Wallet Information</Card.Title>
                <Card.Text>
                  <strong>Address:</strong> {walletInfo.address}
                </Card.Text>
                <Card.Text>
                  <strong>Balance:</strong>{" "}
                  {(walletInfo.amount[0]?.quantity / 1e6).toLocaleString()} ADA
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Transactions */}
      {transactions.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="bg-secondary text-white">
              <Card.Body>
                <Card.Title>Recent Transactions</Card.Title>
                <ul className="list-unstyled">
                  {transactions.slice(0, 5).map((tx) => (
                    <li key={tx.tx_hash} className="mb-2">
                      <a
                        href={`https://cardanoscan.io/transaction/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-info"
                      >
                        {tx.tx_hash.substring(0, 20)}...
                      </a>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* NFTs */}
      {nfts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="bg-secondary text-white">
              <Card.Body>
                <Card.Title>NFT Collection</Card.Title>
                <Row>
                  {nfts.map((nft) => (
                    <Col key={nft.asset} md={4} className="mb-4">
                      <Card className="bg-dark text-white">
                        <Image
                          src={formatImageUrl(nft.onchain_metadata?.image)}
                          alt={nft.onchain_metadata?.name || "NFT"}
                          fluid
                          className="rounded-top"
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
          </Col>
        </Row>
      )}
    </Container>
  );
}