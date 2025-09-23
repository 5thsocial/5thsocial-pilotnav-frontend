import React from 'react';

const Home = ({ selectedSystem, selectedTxnCode }: { selectedSystem?: string; selectedTxnCode?: string | null }) => {
  return (
    <div>
      <h1>Home - {selectedSystem}</h1>
      <p>Selected Txn: {selectedTxnCode || 'None'}</p>
    </div>
  );
};

export default Home;