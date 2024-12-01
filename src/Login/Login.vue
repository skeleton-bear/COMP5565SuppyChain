<template>
    <div id="app">
      <div class="container">
        <h2>Connect MetaMask1</h2>
        <button @click="connectMetaMask" :disabled="isConnected">Connect with MetaMask</button>
        <p v-if="account">Connected Account: {{ account }}</p>
        <p v-else>Please connect your MetaMask wallet.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import { ethers } from "ethers";
  
  export default {
    name: "App",
    setup() {
      const account = ref(""); // The account address
      const isConnected = ref(false); // Track the connection status
  
      // Function to check if MetaMask is installed and connect
      const connectMetaMask = async () => {
        if (window.ethereum) {
          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            // Request account access
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const userAccount = await signer.getAddress();
            account.value = userAccount;
            isConnected.value = true;
          } catch (err) {
            console.error("Error connecting to MetaMask:", err);
            alert("Please allow MetaMask access.");
          }
        } else {
          alert("MetaMask is not installed!");
        }
      };
  
      return {
        account,
        isConnected,
        connectMetaMask,
      };
    },
  };
  </script>
  
  <style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
  
  .container {
    text-align: center;
    padding: 20px;
    border: 1px solid #ddd;
    background-color: #fff;
    border-radius: 10px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #f1c40f;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #f39c12;
  }
  
  button:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
  }
  
  p {
    font-size: 18px;
    margin-top: 10px;
  }
  </style>
  