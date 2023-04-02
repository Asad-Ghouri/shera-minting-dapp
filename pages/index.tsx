import styles from "./styles/Home.module.css";
import {
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useNFTs,
  Web3Button,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useState } from "react";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

const Home: NextPage = () => {
  const address = useAddress();

  // Fetch the NFT collection from thirdweb via it's contract address.
  const { contract: nftCollection } = useContract(
    // Replace this with your NFT Collection contract address
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );

  // Load all the minted NFTs in the collection
  const { data: nfts, isLoading: loadingNfts } = useNFTs(nftCollection);

  // Here we store the user inputs for their NFT.
  const [nftName, setNftName] = useState<string>("");

  const [nftDescription, setnftDescription] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);

  const [loadingbtn, setloadingbtn] = useState(false);

  const storage = new ThirdwebStorage();
  // This function calls a Next JS API route that mints an NFT with signature-based minting.
  // We send in the address of the current user, and the text they entered as part of the request.
  const mintWithSignature = async () => {
    try {
      // Make a request to /api/server
      const uri = await storage.upload(file);

      const uri2 = storage.resolveScheme(uri);

      console.log(uri2);

      const signedPayloadReq = await fetch(`/api/server`, {
        method: "POST",
        body: JSON.stringify({
          authorAddress: address, // Address of the current user
          nftName: nftName || "",
          nftDescription: nftDescription || "",
          nftImage: uri2 || "",
        }),
      });

      // Grab the JSON from the response
      const json = await signedPayloadReq.json();

      if (!signedPayloadReq.ok) {
        alert(json.error);
      }

      // If the request succeeded, we'll get the signed payload from the response.
      // The API should come back with a JSON object containing a field called signedPayload.
      // This line of code will parse the response and store it in a variable called signedPayload.
      const signedPayload = json.signedPayload;

      // Now we can call signature.mint and pass in the signed payload that we received from the server.
      // This means we provided a signature for the user to mint an NFT with.
      const nft = await nftCollection?.signature.mint(signedPayload);

      alert("Minted succesfully!");

      return nft;
    } catch (e) {
      console.error("An error occurred trying to mint the NFT:", e);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target?.files?.[0];
    if (files) {
      setFile(files);
    }
  };
  return (
    <div className="mt-5rem sc-c14cb99b-0 jmMriM CollectionManager--container CollectionManager--narrow-container">
      <header className="jSPhMX kKyBpy">
        <h1 className="fgAoF cyAYwl">Create New Item</h1>
      </header>
      <form className="kAnbfl">
        <p className="fBfnHR">
          <span className="AssetForm--required-label">*</span>
          Required fields
        </p>
        <div className="jSPhMX kKyBpy vIGHJ">
          <div className="dULEQL jSPhMX">
            <div className="dlNkru jSPhMX kKyBpy">
              <label className="diQTwC eimMfF bQtUXg">
                Image, Video, Audio, or 3D Model
              </label>
              <span className="fBfnHR">
                File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV,
                OGG, GLB, GLTF. Max size: 100 MB
              </span>
            </div>
            <div
              // height={257}
              // width="597px"
              className="gytSMI jSPhMX kKyBpy fYgjHJ cmjqwQ hzAKsl"
            >
              <input type="file" style={{ display: "none" }} />
              <i className="sc-c087d08a-2 RmZZc material-icons">
                <input
                  type="file"
                  className="border-[1px] p-2 text-lg  w-full nftname"
                  onChange={handleChange}
                />
              </i>
              <div className="equPFN"></div>
            </div>
          </div>
        </div>
        <div className="jSPhMX kKyBpy vIGHJ">
          <div className="dULEQL jSPhMX">
            <div className="dlNkru jSPhMX kKyBpy">
              <label className="eimMfF bQtUXg">Name</label>
            </div>
            <div className="gjHRNK">
              <div className="Input--main">
                <div className="Input--prefix"></div>
                <input
                  className="Input--input"
                  placeholder="Item name"
                  type="text"
                  onChange={(e) => setNftName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="jSPhMX kKyBpy vIGHJ">
          <div className="dULEQL jSPhMX">
            <div className="dlNkru jSPhMX kKyBpy">
              <label className="diQTwC eimMfF gYLcWK">Description *</label>
              <span className="fBfnHR">
                The description will be included on the item's detail page
                underneath its image.
                {/* <a
                  className="fKAlPV"
                  href="https://www.markdownguide.org/cheat-sheet/"
                > */}
                Markdown
                {/* </a> */}
                syntax is supported.
              </span>
            </div>
            <textarea
              placeholder="Provide a detailed description of your item."
              className="cEERlm"
              onChange={(e) => setnftDescription(e.target.value)}
            />
          </div>
        </div>
      </form>
      {/* <button
        id="mintButton"
        type="button"
        className="mt-5 w-full p-5  text-white text-lg  animate-pulse mintbtn"
        onClick={onMintPressed}
      >
        Mint NFT
      </button> */}
      <div style={{ marginTop: 24 }}>
        {loadingbtn ? (
          <button className="w-full p-5  text-white text-lg  animate-pulse mintbtn">
            {" "}
            Uploading to ipfs{" "}
          </button>
        ) : (
          <Web3Button
            contractAddress={process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS!}
            className="mt-5 w-full p-5  text-white text-lg  animate-pulse mintbtn"
            action={() => mintWithSignature()}
            onSubmit={() => setloadingbtn(true)}
            onSuccess={() => setloadingbtn(false)}
            onError={() => setloadingbtn(false)}
          >
            Mint NFT
          </Web3Button>
        )}
      </div>
    </div>
  );
};

export default Home;
