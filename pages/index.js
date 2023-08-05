import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import styles from './index.module.css';

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactions, setTransactions] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      setTransactionState();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      setTransactionState();

    }
  };

  const setTransactionState = async () => {
    if (atm) {
      let transactions_ = await atm.getTransactions();
      transactions_ = transactions_.map((t) => {
        return parseInt(t._hex);
      });
      setTransactions(transactions_);
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    if (transactions.length === 0) {
      setTransactionState();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <h1>Transactions</h1>
          {transactions.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {transactions?.map((t) => {
                  return (
                    <tr key={Math.random()}>
                      <td>{t < 1 ? "Withdraw" : "Deposit"}</td>
                      <td>{t}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No Transactions yet</p>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters Crypto Exchange!</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
            text-align: center;
            border: 2px solid red;
            width: max-content;
            margin: auto;
            padding: 10px;
            border-radius: 2em;
          }
          button {
            padding: 10px;
          }
        `}
      </style>
    </main>
  );
}
