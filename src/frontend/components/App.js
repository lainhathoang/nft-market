import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./Navigation";
import Home from "./Home";
import Create from "./Create";
import MyListedItems from "./MyListedItem";
import Test from "./Test";

import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import { useEffect, useState } from "react";

import { ethers } from "ethers";
import { Spinner, Button } from "react-bootstrap";

import "./App.css";
import { _fetchData } from "ethers/lib/utils";
import MyPurchases from "./MyPurchases";

function App() {
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});
  const [marketplace, setMarketplace] = useState({});

  const web3Handler = async () => {
    if (window.ethereum) {
      console.log("Detected");
      try {
        // connect account, if didn't connect auto pop up metamask
        await window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((res) => {
            setAccount(res[0]);
          });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        loadContracts(signer);
      } catch (error) {
        console.log(error);
        // alert("Cancle all the Wallet progresses and Reload the page");
      }
    } else {
      alert("install metamask extension");
    }
  };

  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);

    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
  };

  // Detect change in Metamask account
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
        await window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        await window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((res) => {
            setAccount(res[0]);
          });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        loadContracts(signer);
      } catch (error) {
        alert("End all the Wallet progresses and Reload the page");
      }
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        <div>
          <Routes>
            <Route
              path="/"
              element={
                <Test marketplace={marketplace} nft={nft} account={account} />
              }
            />
            <Route
              path="/home"
              element={
                <Home marketplace={marketplace} nft={nft} account={account} />
              }
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItems
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
            <Route
              path="/my-purchases"
              element={
                <MyPurchases
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

// const [loading, setLoading] = useState(true);
// const [account, setAccount] = useState(null);
// const [nft, setNFT] = useState({});
// const [marketplace, setMarketplace] = useState({});
// // MetaMask Login/Connect
// const web3Handler = async () => {
//   const accounts = await window.ethereum.request({
//     method: "eth_requestAccounts",
//   });
//   setAccount(accounts[0]);
//   // Get provider from Metamask
//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   // Set signer
//   const signer = provider.getSigner();

//   window.ethereum.on("chainChanged", (chainId) => {
//     window.location.reload();
//   });

//   window.ethereum.on("accountsChanged", async function (accounts) {
//     setAccount(accounts[0]);
//     await web3Handler();
//   });
//   loadContracts(signer);
// };

// const loadContracts = async (signer) => {
//   // Get deployed copies of contracts
//   const marketplace = new ethers.Contract(
//     MarketplaceAddress.address,
//     MarketplaceAbi.abi,
//     signer
//   );
//   setMarketplace(marketplace);
//   const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
//   setNFT(nft);
//   setLoading(false);

//   const feeAccount = await marketplace.feeAccount();
//   console.log("feeAccount: " + feeAccount);
// };

// useEffect(() => {
//   // Get provider from Metamask
//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   // Set signer
//   const signer = provider.getSigner();
//   loadContracts(signer);
// }, []);
