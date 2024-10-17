import './App.css';
import { useEffect, useState } from 'react';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { Buffer } from 'buffer';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import process from 'process';

export default function App() {
  window.Buffer = Buffer;
  window.process = process;

  const [count, setCount] = useState(0);
  const [mnemonic, setMnemonic] = useState('');
  const [seed, setSeed] = useState('');
  const [wallets, setWallets] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isKeyVisible, setIsKeyVisible] = useState({});

  // Toggle dark mode by adding/removing 'dark' class to body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const createWallet = (currentSeed) => {
    const path = `m/44'/501'/${count}'/0'`;
    const derivedSeed = derivePath(path, currentSeed.toString('hex')).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();
    const secretKey = Buffer.from(secret).toString('hex');
    setWallets((wallets) => [...wallets, { publicKey, secretKey }]); // Store both keys
    setIsKeyVisible((prev) => ({ ...prev, [count]: false })); // Set the new key visibility to false (hidden)
  };

  const handleClick = () => {
    setCount((prevCount) => prevCount + 1);

    if (mnemonic === '') {
      const newMnemonic = generateMnemonic();
      const newSeed = mnemonicToSeedSync(newMnemonic);
      setMnemonic(newMnemonic);
      setSeed(newSeed);
      setWallets([]); // Clear old keys when generating a new mnemonic
      createWallet(newSeed); // Create wallet with the new seed
    } else {
      createWallet(seed); // Use the existing seed for generating wallets
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle visibility of the private key
  const toggleKeyVisibility = (index) => {
    setIsKeyVisible((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="p-10 min-h-screen flex flex-col justify-center items-center transition-all duration-500 w-screen">
      <div className="flex justify-between items-center mb-8 w-full max-w-xl">
        <div className="text-4xl font-extrabold tracking-wide bg-clip-text">
          SnapWallets
        </div>
        <button 
          onClick={toggleDarkMode} 
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <button 
        onClick={handleClick} 
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:from-teal-500 hover:to-blue-500 transform transition duration-300 ease-in-out hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Create a new wallet"
      >
        Add Wallet
      </button>

      {mnemonic.length > 0 && (
        <h1 className="text-xl font-semibold mt-8 transition-all duration-500 text-gray-700">
          Current Secret Phrase: <span className="font-mono text-lg break-words">{mnemonic}</span>
        </h1>
      )}

      {wallets.length > 0 && (
        <div className="mt-10 w-full max-w-xl">
          <h2 className="text-2xl font-bold text-gray-800 ">Generated Wallets:</h2>
          <div className="space-y-4 mt-4">
            {wallets.map((wallet, index) => (
              <div 
                key={index} 
                className="text-lg bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105"
              >
                <h3 className="font-bold mb-2 ">Wallet {index + 1}</h3>
                <p>
                  <strong>Public Key:</strong> 
                  <span className="font-mono text-sm text-gray-600 break-all"> {wallet.publicKey}</span>
                </p>
                <p className="flex items-center">
                  <strong>Private Key:</strong> 
                  <span className="font-mono text-sm text-gray-600  break-all ml-2">
                    {isKeyVisible[index] ? wallet.secretKey : '••••••••••••••••••'}
                  </span>
                  <button 
                    onClick={() => toggleKeyVisibility(index)} 
                    className="ml-2 text-sm text-blue-500 hover:text-blue-700 transition-all duration-300 focus:outline-none"
                    aria-label={isKeyVisible[index] ? "Hide Private Key" : "Show Private Key"}
                  >
                    {isKeyVisible[index] ? '👁️' : '👁️'}
                  </button>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
