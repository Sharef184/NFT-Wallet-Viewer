import { Card, Table } from "react-bootstrap";

export default function TransactionList({ transactions }) {
  return (
    <Card className="bg-dark text-white mb-4">
      <Card.Body>
        <Card.Title>Recent Transactions</Card.Title>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Transaction Hash</th>
              <th>Block Height</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((tx) => (
              <tr key={tx.tx_hash}>
                <td>
                  <a
                    href={`https://cardanoscan.io/transaction/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info"
                  >
                    {tx.tx_hash.substring(0, 20)}...
                  </a>
                </td>
                <td>{tx.block_height}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}