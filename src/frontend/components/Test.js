import { useEffect } from "react";

export default function MyListedItems({ marketplace, nft, account }) {
  useEffect(() => {
  }, []);

  return <div>{account ? <p>{account}</p> : <p>Connect wallet</p>}</div>;
}
