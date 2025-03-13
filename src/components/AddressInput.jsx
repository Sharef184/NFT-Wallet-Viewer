import { Form, Button, InputGroup } from "react-bootstrap";

export default function AddressInput({ address, onAddressChange, onSearch, loading }) {
  return (
    <InputGroup className="mb-4">
      <Form.Control
        type="text"
        placeholder="Enter wallet address"
        value={address}
        onChange={onAddressChange}
        className="bg-dark text-white border-secondary"
      />
      <Button variant="primary" onClick={onSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </InputGroup>
  );
}