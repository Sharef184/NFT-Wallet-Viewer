import { Alert } from "react-bootstrap";

export default function ErrorAlert({ error }) {
  return (
    <Alert variant="danger" className="text-center">
      {error}
    </Alert>
  );
}