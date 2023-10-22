// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Base URI + TokenID
// Base URI = https://nft-collection-tutorial-iota.vercel.app/api/
// Token ID = 1

// tokenURI(1) => https://nft-collection-tutorial-iota.vercel.app/api/

export default function handler(req, res) {
  const { tokenId } = req.query;

  const name = `Crypto Dev #${tokenId}`;
  const description = "CryptoDevs is an NFT Collection for Web3 Developers";
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${
    Number(tokenId) - 1
  }.svg`;
  res.status(200).json({
    name,
    description,
    image,
  });
}
