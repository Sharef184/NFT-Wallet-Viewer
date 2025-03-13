import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Container, Row, Col, Alert } from "react-bootstrap";
import debounce from "lodash/debounce";
// Componnets :
import AddressInput from "./components/AddressInput";
import WalletInfo from "./components/WalletInfo";
import TransactionList from "./components/TransactionList";
import NftGallery from "./components/NftGallery";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorAlert from "./components/ErrorAlert";

const API_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const API_KEY = import.meta.env.VITE_BLOCKFROST_API_KEY;

const DEFAULT_ADDRESS = "addr1x88ttk0fk6ssan4g2uf2xtx3anppy3djftmkg959tufsc6qkqt76lg22kjjmnns37fmyue765qz347sxfnyks27ysqaqd3ph23";
// another address for testing = addr1x88ttk0fk6ssan4g2uf2xtx3anppy3djftmkg959tufsc69hyux9r0aaw20f44z4lwsgjhvpc6lfu62t06dx4wrrvwcs5kmt75

export default function CardanoWalletViewer() {
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced address change handler
  const handleAddressChange = useCallback(
    debounce((value) => {
      setAddress(value);
    }, 500),
    []
  );

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
    setTokens([]);

    try {
      // Fetch data in parallel
      const [walletRes, txRes, utxoRes] = await Promise.all([
        axios.get(`${API_URL}/addresses/${addr}`, { headers: { project_id: API_KEY } }),
        axios.get(`${API_URL}/addresses/${addr}/transactions`, { headers: { project_id: API_KEY } }),
        axios.get(`${API_URL}/addresses/${addr}/utxos`, { headers: { project_id: API_KEY } }),
      ]);

      setWalletInfo(walletRes.data);
      setTransactions(txRes.data);

      // Extract assets (excluding ADA/lovelace)
      const assets = utxoRes.data
        .flatMap((utxo) => utxo.amount || [])
        .filter((asset) => asset.unit !== "lovelace");

      // Set tokens
      setTokens(assets);

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
      setError("Failed to load wallet data. Please check the address and try again.");
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
          <AddressInput
            address={address}
            onAddressChange={(e) => handleAddressChange(e.target.value)}
            onSearch={() => fetchWalletData(address)}
            loading={loading}
          />
        </Col>
      </Row>

      {/* Loading and Error Messages */}
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert error={error} />}

      {/* Wallet Info */}
      {walletInfo && (
        <Row className="mb-4">
          <Col>
            <WalletInfo walletInfo={walletInfo} tokens={tokens} />
          </Col>
        </Row>
      )}

      {/* Transactions */}
      {transactions.length > 0 ? (
        <Row className="mb-4">
          <Col>
            <TransactionList transactions={transactions} />
          </Col>
        </Row>
      ) : (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              No transactions found.
            </Alert>
          </Col>
        </Row>
      )}

      {/* NFTs */}
      {nfts.length > 0 ? (
        <Row className="mb-4">
          <Col>
            <NftGallery nfts={nfts} formatImageUrl={formatImageUrl} />
          </Col>
        </Row>
      ) : (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              No NFTs found.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}