import React from "react";

export default function ContractCard({ title, status, expiry }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Status: <strong>{status}</strong></p>
      <p>Expiry: {expiry}</p>
    </div>
  );
}
