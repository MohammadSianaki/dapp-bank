import logo from "./logo.svg";
import "./App.css";
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";
import { React, useEffect, useState } from "react";

function App() {
  const [state, setState] = useState({
    isWalletConnected: false,
    isBankOwner: false,
    inputValue: {
      withdraw: "",
      deposit: "",
      bankName: "",
    },
    bankOwnerAddress: null,
    customerTotalBalance: null,
    currentBankName: null,
    customerAddress: null,
    error: null,
  });

  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setState((curr) => ({
          ...curr,
          isWalletConnected: true,
          customerAddress: account,
        }));
      } else {
        setState((curr) => ({
          ...curr,
          error: "Please install a metamas wallet to use our bank",
        }));
        console.log("No Metamask Detected!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          state.contractAddress,
          contractABI,
          signer
        );
        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setState((curr) => ({
          ...state,
          currentBankName: bankName.toString(),
        }));
      } else {
        setState((curr) => ({
          ...curr,
          error: "Please install a metamas wallet to use our bank",
        }));
        console.log("No Metamask Detected!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const BankNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await bankContract.setBankName(
          utils.formatBytes32String(state.inputValue.bankName)
        );

        console.log("Setting Bank Name...");

        await txn.wait();

        console.log("Bank Name Changed", txn.hash);

        await getBankName();
      } else {
        console.log("Ethereum object not found, install Metamask.");

        setState((prev) => ({
          ...prev,
          error: "Please install a MetaMask wallet to use our bank.",
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let owner = await bankContract.bankOwner();

        setState((curr) => ({
          ...state,
          bankOwnerAddress: owner,
        }));

        const [accounts] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (owner.toLowerCase() === accounts.toLowerCase()) {
          setState((curr) => ({
            ...state,
            isBankOwner: true,
          }));
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");

        setState((prev) => ({
          ...prev,
          error: "Please install a MetaMask wallet to use our bank.",
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let balance = await bankContract.getCustomerBalance();

        setState((curr) => ({
          ...curr,
          customerTotalBalance: utils.formatEther(balance),
        }));

        console.log("Retrieved balance...", balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(state.inputValue.deposit),
        });

        console.log("Deposting money...");

        await txn.wait();

        console.log("Deposited money...done", txn.hash);

        customerBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let myAddress = await signer.getAddress();

        console.log("provider signer...", myAddress);

        const txn = await bankContract.withdrawMoney(
          myAddress,
          ethers.utils.parseEther(state.inputValue.withdraw)
        );

        console.log("Withdrawing money...");

        await txn.wait();

        console.log("Money with drew...done", txn.hash);

        customerBalanceHandler();
      } else {
        console.log("Ethereum object not found, install Metamask.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setState((prev) => ({
      ...prev,
      inputValue: {
        ...prev.inputValue,
        [event.target.name]: event.target.value,
      },
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getBankOwnerHandler();
    customerBalanceHandler();
  }, [state.isWalletConnected]);

  return (
    <main className="main-container">
      <h2 className="headline">
        <span className="headline-gradient">Bank Contract Project</span> 💰
      </h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {state.error && <p className="text-2xl text-red-700">{state.error}</p>}
        <div className="mt-5">
          {state.currentBankName === "" && state.isBankOwner ? (
            <p>"Setup the name of your bank." </p>
          ) : (
            <p className="text-3xl font-bold">{state.currentBankName}</p>
          )}
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={state.inputValue.deposit}
            />
            <button className="btn-purple" onClick={deposityMoneyHandler}>
              Deposit Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={state.inputValue.withdraw}
            />
            <button className="btn-purple" onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Customer Balance: </span>
            {state.customerTotalBalance}
          </p>
        </div>
        <div className="mt-5">
          <p>
            <span className="font-bold">Bank Owner Address: </span>
            {state.bankOwnerAddress}
          </p>
        </div>
        <div className="mt-5">
          {state.isWalletConnected && (
            <p>
              <span className="font-bold">Your Wallet Address: </span>
              {state.customerAddress}
            </p>
          )}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {state.isWalletConnected
              ? "Wallet Connected 🔒"
              : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {state.isBankOwner && (
        <section className="bank-owner-section">
          <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">
            Bank Admin Panel
          </h2>
          <div className="p-10">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="bankName"
                placeholder="Enter a Name for Your Bank"
                value={state.inputValue.bankName}
              />
              <button className="btn-grey" onClick={BankNameHandler}>
                Set Bank Name
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
