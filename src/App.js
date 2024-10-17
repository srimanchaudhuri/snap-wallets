import '@fortawesome/fontawesome-free/css/all.min.css';
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

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const createWallet = (currentSeed) => {
    const path = `m/44'/501'/${count}'/0'`;
    const derivedSeed = derivePath(path, currentSeed.toString('hex')).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();
    const secretKey = Buffer.from(secret).toString('hex');
    setWallets((wallets) => [...wallets, { publicKey, secretKey }]);
    setIsKeyVisible((prev) => ({ ...prev, [count]: false }));
  };

  const handleClick = () => {
    setCount((prevCount) => prevCount + 1);

    if (mnemonic === '') {
      const newMnemonic = generateMnemonic();
      const newSeed = mnemonicToSeedSync(newMnemonic);
      setMnemonic(newMnemonic);
      setSeed(newSeed);
      setWallets([]);
      createWallet(newSeed);
    } else {
      createWallet(seed);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleKeyVisibility = (index) => {
    setIsKeyVisible((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="p-6 md:p-10 min-h-screen flex flex-col justify-center items-center transition-all duration-500 w-screen">
      <div className="flex justify-between items-center mb-8 w-full max-w-xl">
        <div className="text-3xl mb-4 md:text-4xl font-extrabold tracking-wide bg-clip-text">
          SnapWallets
        </div>
        <button 
          onClick={toggleDarkMode} 
          className="px-3 py-2 md:px-4 md:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <button 
        onClick={handleClick} 
        className="w-full md:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:from-teal-500 hover:to-blue-500 transform transition duration-300 ease-in-out hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Create a new wallet"
      >
        Add Wallet
      </button>

      {mnemonic.length > 0 && (
        <h1 className="text-lg md:text-xl font-semibold mt-8 transition-all duration-500 text-gray-700">
          Current Secret Phrase: <span className="font-mono text-md md:text-lg break-words">{mnemonic}</span>
        </h1>
      )}

      {wallets.length > 0 && (
        <div className="mt-10 w-full max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 ">Generated Wallets:</h2>
          <div className="space-y-4 mt-4">
            {wallets.map((wallet, index) => (
              <div 
                key={index} 
                className="text-md md:text-lg bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105"
              >
                <h3 className="font-bold mb-2">Wallet {index + 1}</h3>
                <p>
                  <strong>Public Key:</strong> 
                  <span className="font-mono text-sm md:text-md text-gray-600  break-all"> {wallet.publicKey}</span>
                </p>
                <p className="flex items-center">
                  <strong>Private Key:</strong> 
                  <span className="font-mono text-sm md:text-md text-gray-600  break-all ml-2">
                    {isKeyVisible[index] ? wallet.secretKey : '••••••••••••••••••'}
                  </span>
                  <button 
                    onClick={() => toggleKeyVisibility(index)} 
                    className="ml-2 text-sm text-blue-500 hover:text-blue-700 transition-all duration-300 focus:outline-none"
                  >
                    {isKeyVisible[index] ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
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
