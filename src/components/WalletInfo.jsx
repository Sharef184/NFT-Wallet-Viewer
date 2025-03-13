import { Card } from "react-bootstrap";

export default function WalletInfo({ walletInfo, tokens = [] }) {
  const adaBalance = walletInfo?.amount?.[0]?.quantity
    ? (walletInfo.amount[0].quantity / 1e6).toLocaleString()
    : "0";

  return (
    <Card className="bg-secondary text-white">
      <Card.Body>
        <Card.Title>Wallet Information</Card.Title>
        <Card.Text>
          <strong>Address:</strong> {walletInfo.address}
        </Card.Text>
        <Card.Text>
          <strong>ADA Balance:</strong> {adaBalance} ADA
        </Card.Text>
        {tokens.length > 0 && (
          <Card.Text>
            <strong>Token Balances:</strong>
            <ul>
              {tokens.map((token) => (
                <li key={token.unit}>
                  {token.quantity} {token.unit}
                </li>
              ))}
            </ul>
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}