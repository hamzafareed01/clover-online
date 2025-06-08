import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('token');
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  const fetchInventory = async () => {
    const merchantId = prompt('Enter your Clover Merchant ID:');
    const res = await fetch(`http://localhost:5050/api/inventory?token=${token}&merchantId=${merchantId}`);
    const data = await res.json();
    setInventory(data.elements || []);
  };

  return (
    <div className="App">
      <h1>Clover App Starter</h1>
      {!token && (
        <a href="http://localhost:5050/auth/start">
          <button>Login with Clover</button>
        </a>
      )}
      {token && (
        <>
          <button onClick={fetchInventory}>Load Inventory</button>
          <ul>
            {inventory.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;