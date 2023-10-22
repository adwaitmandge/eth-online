import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { ethers, utils } from "ethers";
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "@/constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState("");

  const web3ModalRef = useRef();

  const getNumMintedTokens = async () => {
    setLoading(true);
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const numTokenIds = await nftContract.tokenIds();
      console.log(numTokenIds);
      setNumTokensMinted(numTokenIds.toString());
    } catch (err) {
      console.error(err.message);
    }
    setLoading(false);
  };

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();

      if (chainId != 11155111) {
        window.alert("Change network to sepolia");
        throw new Error("Change network to sepolia");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
    } catch (err) {
      console.error(err.message);
    }
  };

  const connectWallet = async () => {
    try {
      // We need to gain access to the provider/signer from Metamask
      await getProviderOrSigner();
      // Update 'walletConnected' to true
      setWalletConnected(true);
    } catch (err) {
      console.error(err.message);
    }
  };

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const userAddress = await signer.getAddress();
      console.log("The user address is ", userAddress);
      console.log(userAddress);
      const owner = await nftContract.owner();
      console.log(owner);
      if (userAddress.toLowerCase() == owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const startPresale = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (err) {
      console.error(err.message);
    }
    setLoading(false);
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const _presaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err.message);
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );

      setPresaleEnded(hasPresaleEnded);
    } catch (err) {
      console.error(err.message);
    }
  };

  const presaleMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
    } catch (err) {
      console.error(err.message);
    }
    setLoading(false);
  };

  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();

      window.alert("You successfully minted a CryptoDev!");
    } catch (err) {
      console.error(err.message);
    }
    setLoading(false);
  };

  const onPageLoad = async () => {
    try {
      await connectWallet();
      await getOwner();

      // check if the presale has ended only if it has started, if you check whether or not the presale has ended and the presale has not started, the 'presaleEnded' variable at the backend has a default value of 0 and hence presaleEndTime.lt(currentTimeInSeconds) will evaluate to true even if there the presale has not started
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }

      // Track in real-time the number of minted NFTs
      setInterval(async () => {
        await getNumMintedTokens();
      }, 5000);

      // Track in real-time the status of presale (started, ended, whatever)
      setInterval(async () => {
        const presaleStarted = await checkIfPresaleStarted();
        if (presaleStarted) {
          await checkIfPresaleEnded();
        }
      }, 5000);
    } catch (err) {
      console.error(err.message);
    }
  };

  const renderBody = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }

    if (loading) {
      return <span className={styles.description}>Loading...</span>;
    }

    if (isOwner && !presaleStarted) {
      // render a button to start the presale
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale
        </button>
      );
    }

    if (!presaleStarted) {
      // just say that the presale hasn't started, come back later
      return (
        <div className={styles.description}>
          Presale has not started yet. Come back later
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      // allow users to mint in presale
      // they need to be in the whitelist for this to work
      return (
        <div>
          <span className={styles.description}>
            Presale has started! If your address is whitelisted, you can mint a
            CryptoDev!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    if (presaleEnded) {
      // allow users to take part in the public sale
      return (
        <div>
          <span>
            Presale has ended. You can mint a Crypto Dev in public sale, if any
            remain
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        </div>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Crypto-Devs NFT</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs NFT</h1>
          <div className={styles.description}>
            CryptoDevs NFT is a collection for developers in web3
          </div>
          <span className={styles.description}>
            {numTokensMinted} /20 have been minted already!
          </span>
          {renderBody()}
        </div>
        <img className={styles.image} src="/cryptodev/0.svg" />
      </div>
    </div>
  );
}
