<template>
    <div class="search">
      <h1>Diamond NFT System</h1>
      
      <div v-if="!isConnected" class="connect-wallet">
        <p>Please connect your wallet first</p>
        <button @click="connectWallet">Connect MetaMask</button>
      </div>

      <div v-else>
        <p>Wallet Connected: {{ account }}</p>
        
        <div class="action-buttons">
          <button @click="showMiningDialog" class="action-btn">Mint New Diamond</button>
          <button @click="showMyNFTs" class="my-nfts-btn">My NFTs</button>
        </div>

        <div class="search-section">
          <input
            v-model="tokenId"
            type="number"
            placeholder="Enter Token ID"
            @keyup.enter="searchDiamond"
          />
          <button @click="searchDiamond">Search</button>
        </div>

        <div v-if="diamond && isValidDiamondData(diamond)">
          <h2>Mining Stage</h2>
          <ul>
            <li><strong>Diamond ID:</strong> {{ String(diamond.Mining.diamondID) }}</li>
            <li><strong>Mining Company:</strong> {{ diamond.Mining.miningCompany || 'N/A' }}</li>
            <li><strong>Mining Company Address:</strong> {{ diamond.Mining.miningAddress || 'N/A' }}</li>
            <li><strong>Location:</strong> {{ diamond.Mining.location || 'N/A' }}</li>
            <li><strong>Mined Date:</strong> {{ formatDate(diamond.Mining.minedDate) }}</li>
            <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 0, diamond) }}</li>
          </ul>

          <h2>Cutting Stage</h2>
          <ul>
            <li><strong>Cutting Company:</strong> {{ diamond.Cutting.cuttingCompany || 'N/A' }}</li>
            <li><strong>Cutting Company Address:</strong> {{ diamond.Cutting.cuttingAddress || 'N/A' }}</li>
            <li><strong>Cut Date:</strong> {{ formatDate(diamond.Cutting.cutDate) }}</li>
            <li><strong>Cut Grade:</strong> {{ diamond.Cutting.cutGrade || 'N/A' }}</li>
            <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 1, diamond) }}</li>
          </ul>

          <h2>Grading Stage</h2>
          <ul>
            <li><strong>Grading Lab:</strong> {{ diamond.grading.gradingLab || 'N/A' }}</li>
            <li><strong>Grading Lab Address:</strong> {{ diamond.grading.gradingAddress || 'N/A' }}</li>
            <li><strong>Engraved ID:</strong> {{ diamond.grading.engravedID || 'N/A' }}</li>
            <li><strong>Grading Level:</strong> {{ diamond.grading.grading || 'N/A' }}</li>
            <li><strong>Grading Date:</strong> {{ formatDate(diamond.grading.gradingDate) }}</li>
            <li><strong>Quality Report:</strong> {{ diamond.grading.qualityReport || 'N/A' }}</li>
            <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 2, diamond) }}</li>
          </ul>

          <h2>Jewelry Making Stage</h2>
          <ul>
            <li><strong>Jewelry Maker:</strong> {{ diamond.jewelry.jewelryMaker || 'N/A' }}</li>
            <li><strong>Jewelry Maker Address:</strong> {{ diamond.jewelry.jewelryAddress || 'N/A' }}</li>
            <li><strong>Jewelry Type:</strong> {{ diamond.jewelry.jewelryType || 'N/A' }}</li>
            <li><strong>Possession Date:</strong> {{ formatDate(diamond.jewelry.possessionDate) }}</li>
            <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 3, diamond) }}</li>
          </ul>

          <h2>Design Stage</h2>
          <ul>
            <li><strong>Designer:</strong> {{ diamond.design.designer || 'N/A' }}</li>
            <li><strong>Designer Address:</strong> {{ diamond.design.designerAddress || 'N/A' }}</li>
            <li><strong>Design Date:</strong> {{ formatDate(diamond.design.designDate) }}</li>
            <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 4, diamond) }}</li>
          </ul>

          <h2>Customer Stage</h2>
          <ul>
            <li><strong>Customer Name:</strong> {{ diamond.customer.name || 'N/A' }}</li>
            <li><strong>Customer Address:</strong> {{ diamond.customer.customerAddress || 'N/A' }}</li>
            <li><strong>Purchase Date:</strong> {{ formatDate(diamond.customer.purchaseDate) }}</li>
            <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 5, diamond) }}</li>
          </ul>

          <h2>Ownership Information</h2>
          <ul>
            <li><strong>Current Stage:</strong> {{ getPosition(diamond.position) }}</li>
            <li><strong>Current Owner:</strong> {{ diamond.owner }}</li>
          </ul>
        </div>
        <div v-else-if="diamond && !isValidDiamondData(diamond)" class="error-message">
          <p>Token ID {{ tokenId }} does not exist</p>
        </div>

        <div v-if="showMiningForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="showMiningForm = false">&times;</span>
            <h2>Mining Stage</h2>
            <form @submit.prevent="mintDiamond">
              <div class="form-group">
                <label>Mining Company:</label>
                <input v-model="miningForm.miningCompany" required />
              </div>
              <div class="form-group">
                <label>Location:</label>
                <input v-model="miningForm.location" required />
              </div>
              <div class="form-group">
                <label>Mining Date:</label>
                <input type="date" v-model="miningForm.date" required />
              </div>
              <button type="submit">Submit Mining Info</button>
            </form>
          </div>
        </div>

        <div v-if="showCuttingForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeForm">&times;</span>
            <h2>Cutting Stage</h2>
            <form @submit.prevent="submitCutting">
              <div class="form-group">
                <label>Token ID:</label>
                <input type="number" v-model="cuttingForm.tokenId" disabled />
              </div>
              <div class="form-group">
                <label>Cutting Company:</label>
                <input v-model="cuttingForm.cuttingCompany" required />
              </div>
              <div class="form-group">
                <label>Cut Date:</label>
                <input type="date" v-model="cuttingForm.cutDate" required />
              </div>
              <div class="form-group">
                <label>Cut Grade:</label>
                <input v-model="cuttingForm.grade" required />
              </div>
              <button type="submit">Submit Cutting Info</button>
            </form>
          </div>
        </div>

        <div v-if="showGradingForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeForm">&times;</span>
            <h2>Grading Stage</h2>
            <form @submit.prevent="submitGrading">
              <div class="form-group">
                <label>Token ID:</label>
                <input type="number" v-model="gradingForm.tokenId" required />
              </div>
              <div class="form-group">
                <label>Grading Lab:</label>
                <input v-model="gradingForm.gradingLab" required />
              </div>
              <div class="form-group">
                <label>Engraved ID:</label>
                <input v-model="gradingForm.engravedID" required />
              </div>
              <div class="form-group">
                <label>Grading Level:</label>
                <input v-model="gradingForm.gradingLevel" required />
              </div>
              <div class="form-group">
                <label>Grading Date:</label>
                <input type="date" v-model="gradingForm.gradingDate" required />
              </div>
              <div class="form-group">
                <label>Quality Report:</label>
                <input v-model="gradingForm.qualityReport" required />
              </div>
              <button type="submit">Submit Grading Info</button>
            </form>
          </div>
        </div>

        <div v-if="showJewelryForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeForm">&times;</span>
            <h2>Jewelry Making Stage</h2>
            <form @submit.prevent="submitJewelry">
              <div class="form-group">
                <label>Token ID:</label>
                <input type="number" v-model="jewelryForm.tokenId" required />
              </div>
              <div class="form-group">
                <label>Jewelry Maker:</label>
                <input v-model="jewelryForm.jewelryMaker" required />
              </div>
              <div class="form-group">
                <label>Jewelry Type:</label>
                <input v-model="jewelryForm.jewelryType" required />
              </div>
              <div class="form-group">
                <label>Possession Date:</label>
                <input type="date" v-model="jewelryForm.possessionDate" required />
              </div>
              <button type="submit">Submit Jewelry Info</button>
            </form>
          </div>
        </div>

        <div v-if="showMyNFTsDialog" class="modal">
          <div class="modal-content">
            <span class="close" @click="showMyNFTsDialog = false">&times;</span>
            <h2>My Diamond NFTs</h2>
            <div v-if="myNFTs.length > 0">
              <div v-for="nft in myNFTs" :key="nft.tokenId" class="nft-item">
                <h3>Token ID: {{ nft.tokenId }}</h3>
                <p>Diamond ID: {{ nft.diamondID }}</p>
                <p>Mining Company: {{ nft.miningCompany }}</p>
                <p>Location: {{ nft.location }}</p>
                <p>Mined Date: {{ nft.minedDate }}</p>
                <p>Current Stage: {{ getPosition(nft.position) }}</p>
                
                <div class="nft-actions">
                  <template v-if="nft.owner.toLowerCase() === account.toLowerCase()">
                    <button v-if="nft.position === 0" 
                            @click="showTransferDialog(nft.tokenId)" 
                            class="transfer-btn">
                      Transfer to Cutting Company
                    </button>
                    
                    <template v-if="nft.position === 1">
                      <button @click="showCuttingDialog(nft.tokenId)" 
                              class="action-btn">
                        Fill Cutting Info
                      </button>
                      <button @click="showTransferDialog(nft.tokenId)" 
                              class="transfer-btn">
                        Transfer to Grading Company
                      </button>
                    </template>
                    
                    <template v-if="nft.position === 2">
                      <button @click="showGradingDialog(nft.tokenId)" 
                              class="action-btn">
                        Fill Grading Info
                      </button>
                      <button @click="showTransferDialog(nft.tokenId)" 
                              class="transfer-btn">
                        Transfer to Jewelry Company
                      </button>
                    </template>
                    
                    <template v-if="nft.position === 3">
                      <button @click="showJewelryDialog(nft.tokenId)" 
                              class="action-btn">
                        Fill Jewelry Info
                      </button>
                      <button @click="showTransferDialog(nft.tokenId)" 
                              class="transfer-btn">
                        Transfer to Designer
                      </button>
                    </template>
                    
                    <template v-if="nft.position === 4">
                      <button @click="showDesignerDialog(nft.tokenId)" 
                              class="action-btn">
                        Fill Designer Info
                      </button>
                      <button @click="showTransferDialog(nft.tokenId)" 
                              class="transfer-btn">
                        Transfer to Customer
                      </button>
                    </template>
                    
                    <template v-if="nft.position >= 5">
                      <button @click="showCustomerDialog(nft.tokenId)" 
                              class="action-btn">
                        Fill Customer Info
                      </button>
                      <button @click="showTransferDialog(nft.tokenId)" 
                              class="transfer-btn">
                        Transfer to Next Owner
                      </button>
                    </template>
                  </template>
                </div>
              </div>
            </div>
            <div v-else>
              <p>You don't own any diamond NFTs yet.</p>
            </div>
          </div>
        </div>

        <div v-if="showTransferForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeForm">&times;</span>
            <h2>Transfer Diamond NFT</h2>
            <form @submit.prevent="submitTransfer">
              <div class="form-group">
                <label>Token ID:</label>
                <input type="text" v-model="transferForm.tokenId" disabled />
              </div>
              <div class="form-group">
                <label>Recipient Address:</label>
                <input v-model="transferForm.to" required 
                       placeholder="Enter recipient's wallet address" />
              </div>
              <button type="submit">Transfer NFT</button>
            </form>
          </div>
        </div>

        <div v-if="showDesignerForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeForm">&times;</span>
            <h2>Designer Stage</h2>
            <form @submit.prevent="submitDesigner">
              <div class="form-group">
                <label>Token ID:</label>
                <input type="number" v-model="designerForm.tokenId" required />
              </div>
              <div class="form-group">
                <label>Designer Name:</label>
                <input v-model="designerForm.designerName" required />
              </div>
              <div class="form-group">
                <label>Design Date:</label>
                <input type="date" v-model="designerForm.designDate" required />
              </div>
              <button type="submit">Submit Designer Info</button>
            </form>
          </div>
        </div>

        <div v-if="showCustomerForm" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeForm">&times;</span>
            <h2>Customer Stage</h2>
            <form @submit.prevent="submitCustomer">
              <div class="form-group">
                <label>Token ID:</label>
                <input type="number" v-model="customerForm.tokenId" required />
              </div>
              <div class="form-group">
                <label>Customer Name:</label>
                <input v-model="customerForm.customerName" required />
              </div>
              <div class="form-group">
                <label>Purchase Date:</label>
                <input type="date" v-model="customerForm.purchaseDate" required />
              </div>
              <button type="submit">Submit Customer Info</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ethers } from "ethers";
  import DiomandDapp from "../../artifacts/contracts/DiamondDapp.sol/DiomandDapp.json";
  
  export default {
    name: 'SearchPage',
    data() {
      return {
        tokenId: "",
        diamond: null,
        isConnected: false,
        account: "",
        contract: null,
        showMiningForm: false,
        showCuttingForm: false,
        showGradingForm: false,
        showJewelryForm: false,
        showMyNFTsDialog: false,
        showTransferForm: false,
        showDesignerForm: false,
        showCustomerForm: false,
        miningForm: {
          miningCompany: '',
          location: '',
          date: ''
        },
        cuttingForm: {
          tokenId: '',
          cuttingCompany: '',
          cutDate: '',
          grade: ''
        },
        gradingForm: {
          tokenId: '',
          gradingLab: '',
          engravedID: '',
          gradingLevel: '',
          gradingDate: '',
          qualityReport: ''
        },
        jewelryForm: {
          tokenId: '',
          jewelryMaker: '',
          jewelryType: '',
          possessionDate: ''
        },
        designerForm: {
          tokenId: '',
          designerName: '',
          designDate: ''
        },
        customerForm: {
          tokenId: '',
          customerName: '',
          purchaseDate: ''
        },
        myNFTs: [],
        transferForm: {
          tokenId: '',
          to: ''
        },
        selectedTokenId: null
      };
    },
    mounted() {
      // 检是否已经连接
      this.checkConnection();
      // 监听账户变化
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', this.handleAccountsChanged);
      }
    },
    methods: {
      async checkConnection() {
        if (window.ethereum) {
          try {
            // 获取已连接的账户
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              this.account = accounts[0];
              this.isConnected = true;
              await this.initContract();
            }
          } catch (error) {
            console.error("Error checking connection:", error);
          }
        }
      },
      async connectWallet() {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          return;
        }

        try {
          // 请求用户连接
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          this.account = accounts[0];
          this.isConnected = true;
          
          // 初始化合约
          await this.initContract();
          
          alert("Wallet connected successfully!");
        } catch (error) {
          console.error("Error connecting wallet:", error);
          alert("Failed to connect wallet");
        }
      },
      handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
          // MetaMask 断开连接
          this.isConnected = false;
          this.account = "";
          this.contract = null;
        } else {
          // 账户切换
          this.account = accounts[0];
        }
      },
      async initContract() {
        try {
          if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
          }

          // 请求换到本地网络
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7A69' }], // 31337 in hex
            });
          } catch (switchError) {
            // 如果网络不在，添加网络
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x7A69', // 31337 in hex
                    chainName: 'Localhost 8545',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['http://127.0.0.1:8545/']
                  }]
                });
              } catch (addError) {
                throw new Error("Failed to add the local network");
              }
            } else {
              throw new Error("Failed to switch to the local network");
            }
          }

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []); // 请求用户授权
          const signer = provider.getSigner();
          
        
          
          // 获取当前账户地址
          const address = await signer.getAddress();
          console.log("Current account:", address);

          // 使用部署时的址
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          console.log("Contract address:", contractAddress);

          // 验证合约地址否存在
          const code = await provider.getCode(contractAddress);
          console.log("Contract code:", code);
          if (code === '0x') {
            throw new Error("No contract found at this address");
          }

          this.contract = new ethers.Contract(
            contractAddress,
            DiomandDapp.abi,
            signer
          );

          // 测试合约连接
          const name = await this.contract.name();
          console.log("Contract name:", name);
          console.log("Contract initialized successfully");

        } catch (error) {
          console.error("Detailed contract initialization error:", error);
          alert(`Contract initialization failed: ${error.message}`);
          throw error;
        }
      },
      async searchDiamond() {
        try {
          if (!this.isConnected) {
            alert("Please connect your wallet first!");
            return;
          }

          if (this.tokenId === "" || isNaN(this.tokenId) || this.tokenId < 0) {
            alert("Please enter a valid Token ID");
            return;
          }

          if (!this.contract) {
            await this.initContract();
          }

          // 获取所有阶段的详细信息
          const miningDetails = await this.contract.getMiningDetails(this.tokenId);
          const cuttingDetails = await this.contract.getCuttingDetails(this.tokenId);
          const gradingDetails = await this.contract.getGradingDetails(this.tokenId);
          const jewelryDetails = await this.contract.getJewelryDetails(this.tokenId);
          const designDetails = await this.contract.getDesignDetails(this.tokenId);
          const customerDetails = await this.contract.getCustomerDetails(this.tokenId);
          const position = await this.contract.getDiamondPosition(this.tokenId);
          const owner = await this.contract.ownerOf(this.tokenId);

          // const diamondID = await this.contract.diamondID(this.tokenId);
          
          // // 从合约获取客户信息
          // const customer = await this.contract.customer(this.tokenId);
          // const customerPurchaseDate = await this.contract.possessionDate(this.tokenId);

          // console.log("Basic Details:", basicDetails); // 添加日志
          console.log("Mining Details:", miningDetails);
          console.log("Cutting Details:", cuttingDetails);
          console.log("Current Token ID:", this.tokenId); // 添加日志


          // 修改数据结构组织方式
          this.diamond = {
            Mining: {
              diamondID: String(this.tokenId),
              miningCompany: ethers.utils.parseBytes32String(miningDetails[0]),
              location: ethers.utils.parseBytes32String(miningDetails[1]),
              minedDate: miningDetails[2].toNumber(),
              miningAddress: miningDetails[3]
            },
            Cutting:{
              cuttingCompany: ethers.utils.parseBytes32String(cuttingDetails[0]),
              cutDate: cuttingDetails[1].toNumber(),
              grade: ethers.utils.parseBytes32String(cuttingDetails[2]),
              cuttingAddress: cuttingDetails[3]
            },
            grading: {
              gradingLab: ethers.utils.parseBytes32String(gradingDetails[0]),
              engravedID: ethers.utils.parseBytes32String(gradingDetails[1]),
              grading: ethers.utils.parseBytes32String(gradingDetails[2]),
              gradingDate: gradingDetails[3].toNumber(),
              qualityReport: gradingDetails[4],  // 这个保持 string
              gradingAddress: gradingDetails[5]
            },
            jewelry: {
              jewelryMaker: ethers.utils.parseBytes32String(jewelryDetails[0]),
              jewelryType: ethers.utils.parseBytes32String(jewelryDetails[1]),
              possessionDate: jewelryDetails[2].toNumber(),
              jewelryAddress: jewelryDetails[3]
            },
            design: {
              designer: ethers.utils.parseBytes32String(designDetails[0]),
              designDate: designDetails[1].toNumber(),
              designerAddress: designDetails[2]
            },
            customer: {
              name: ethers.utils.parseBytes32String(customerDetails[0]),
              purchaseDate: customerDetails[1].toNumber(),
              customerAddress: customerDetails[2]
            },
            position: position.toNumber(),
            owner: owner
          };

          console.log("Diamond Data:", this.diamond);

        } catch (error) {
          console.error("Error fetching diamond details:", error);
          this.diamond = null;
          alert(`Error: ${error.message}`);
        }
      },
      getPosition(position) {
        const stages = ["Mining", "Cutting", "Grading", "Jewelry Making", "Design", "Customer"];
        return position >= 5 ? "Customer" : stages[position] || "Unknown";
      },
      // 添加检查数据有效性的方法
      isValidDiamondData(data) {
        return data.Mining.miningCompany !== '' || 
               data.Mining.location !== '' || 
               data.Mining.minedDate !== 0;
      },
      showMiningDialog() {
        this.showMiningForm = true;
      },
      showCuttingDialog(tokenId) {
        this.showMyNFTsDialog = false;
        this.cuttingForm.tokenId = tokenId;
        this.showCuttingForm = true;
      },
      showGradingDialog(tokenId) {
        this.showMyNFTsDialog = false;
        this.gradingForm.tokenId = tokenId;
        this.showGradingForm = true;
      },
      showJewelryDialog(tokenId) {
        this.showMyNFTsDialog = false;
        this.jewelryForm.tokenId = tokenId;
        this.showJewelryForm = true;
      },
      showTransferDialog(tokenId) {
        this.showMyNFTsDialog = false;
        this.transferForm.tokenId = tokenId;
        this.showTransferForm = true;
      },
      //确认diamon的position
      async checkDiamondPosition(tokenId) {
    try {
        const position = await this.contract.position(tokenId);
        console.log(`Diamond ${tokenId} current position:`, position.toString());
        return position;
    } catch (error) {
        console.error("Error checking position:", error);
        }
      },

      // 提交切割信息
      async submitCutting() {
        try {
          if (!this.contract) {
            await this.initContract();
          }
          //检查diamon的position
          try {
            const position = await this.checkDiamondPosition(this.cuttingForm.tokenId);
            if (position.toNumber() !== 1) {
              alert(`Diamond is not in the Cutting stage. Please check the position.Current position: ${position.toString()}`);
              return;
            }
          } catch (error) {
            console.error("Error checking position:", error);
            alert(`Error: ${error.message || "Failed to check diamond position"}`);
            return;
          }

          // 将字符串转换为 bytes32
          const cuttingCompanyBytes32 = ethers.utils.formatBytes32String(this.cuttingForm.cuttingCompany);
          const gradeBytes32 = ethers.utils.formatBytes32String(this.cuttingForm.grade);
          const cutDateTimestamp = Math.floor(new Date(this.cuttingForm.cutDate).getTime() / 1000);

          const tx = await this.contract.cutting(
            this.cuttingForm.tokenId,
            cuttingCompanyBytes32,  // 使用转换后的 bytes32
            cutDateTimestamp,
            gradeBytes32           // 使用转换后的 bytes32
          );

          console.log("Waiting for transaction confirmation...");
          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt);

          alert('Cutting information submitted successfully!');
          this.showCuttingForm = false;
          this.cuttingForm = { tokenId: '', cuttingCompany: '', cutDate: '', grade: '' };
          await this.fetchMyNFTs();
        } catch (error) {
          console.error('Error submitting cutting info:', error);
          alert(`Failed to submit cutting info: ${error.message}`);
        }
      },
      
      //提交评级信息
      async submitGrading() {
        try {
          if (!this.contract) {
            await this.initContract();
          }
          // 检查钻石的 position
          try {
            const position = await this.checkDiamondPosition(this.gradingForm.tokenId);
            if (position.toNumber() !== 2) {
              alert(`Diamond is not in the Grading stage. Current position: ${position.toString()}`);
              return;
            }
          } catch (error) {
            console.error("Error checking position:", error);
            alert(`Error: ${error.message || "Failed to check diamond position"}`);
            return;
          }

          // 将字符串转换为 bytes32
          const gradingLabBytes32 = ethers.utils.formatBytes32String(this.gradingForm.gradingLab);
          const engravedIDBytes32 = ethers.utils.formatBytes32String(this.gradingForm.engravedID);
          const gradingLevelBytes32 = ethers.utils.formatBytes32String(this.gradingForm.gradingLevel);
          const gradingDateTimestamp = Math.floor(new Date(this.gradingForm.gradingDate).getTime() / 1000);

          console.log("Submitting grading info:", {
            tokenId: this.gradingForm.tokenId,
            gradingLab: gradingLabBytes32,
            engravedID: engravedIDBytes32,
            gradingLevel: gradingLevelBytes32,
            gradingDate: gradingDateTimestamp,
            qualityReport: this.gradingForm.qualityReport  // 保持为 string
          });

          const tx = await this.contract.setGradingInfo(
            this.gradingForm.tokenId,
            gradingLabBytes32,        // 使用转换后的 bytes32
            engravedIDBytes32,        // 使用转换后的 bytes32
            gradingLevelBytes32,      // 使用转换后的 bytes32
            gradingDateTimestamp,
            this.gradingForm.qualityReport  // qualityReport 保持为 string
          );

          await tx.wait();
          alert('Grading information submitted successfully!');
          this.showGradingForm = false;
          this.gradingForm = { tokenId: '', gradingLab: '', engravedID: '', gradingLevel: '', gradingDate: '', qualityReport: '' };
          await this.fetchMyNFTs();
        } catch (error) {
          console.error('Error submitting grading info:', error);
          alert(`Failed to submit grading info: ${error.message}`);
        }
      },

      //提交珠宝商数据
      async submitJewelry() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          // 检查钻石的 position
          try {
            const position = await this.checkDiamondPosition(this.jewelryForm.tokenId);
            if (position.toNumber() !== 3) {
              alert(`Diamond is not in the Jewelry Making stage. Current position: ${position.toString()}`);
              return;
            }
          } catch (error) {
            console.error("Error checking position:", error);
            alert(`Error: ${error.message || "Failed to check diamond position"}`);
            return;
          }

          // 将字符串转换为 bytes32
          const jewelryMakerBytes32 = ethers.utils.formatBytes32String(this.jewelryForm.jewelryMaker);
          const jewelryTypeBytes32 = ethers.utils.formatBytes32String(this.jewelryForm.jewelryType);
          const possessionDateTimestamp = Math.floor(new Date(this.jewelryForm.possessionDate).getTime() / 1000);

          console.log("Submitting jewelry info:", {
            tokenId: this.jewelryForm.tokenId,
            jewelryMaker: jewelryMakerBytes32,
            jewelryType: jewelryTypeBytes32,
            possessionDate: possessionDateTimestamp
          });

          const tx = await this.contract.jewelryMaking(
            this.jewelryForm.tokenId,
            jewelryMakerBytes32,     // 使用转换后的 bytes32
            jewelryTypeBytes32,      // 使用转换后的 bytes32
            possessionDateTimestamp
          );

          await tx.wait();
          alert('Jewelry making information submitted successfully!');
          this.showJewelryForm = false;
          this.jewelryForm = { tokenId: '', jewelryMaker: '', jewelryType: '', possessionDate: '' };
          await this.fetchMyNFTs();
        } catch (error) {
          console.error('Error submitting jewelry info:', error);
          alert(`Failed to submit jewelry info: ${error.message}`);
        }
      },
      async showMyNFTs() {
        await this.fetchMyNFTs();
        this.showMyNFTsDialog = true;
      },
      // 获取我的NFTs
      async fetchMyNFTs() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          const balance = await this.contract.balanceOf(this.account);
          this.myNFTs = [];

          for (let i = 0; i < balance; i++) {
            const tokenId = await this.contract.tokenOfOwnerByIndex(this.account, i);
            const miningDetails = await this.contract.getMiningDetails(tokenId);
            const cuttingDetails = await this.contract.getCuttingDetails(tokenId);
            // const gradingDetails = await this.contract.getGradingDetails(tokenId);
            // const jewelryDetails = await this.contract.getJewelryDetails(tokenId);
            // const designDetails = await this.contract.getDesignDetails(tokenId);
            // const customerDetails = await this.contract.getCustomerDetails(tokenId);
            const position = await this.contract.getDiamondPosition(tokenId);
            const owner = await this.contract.ownerOf(tokenId);

            this.myNFTs.push({
              tokenId: tokenId.toString(),
              diamondID: miningDetails[4],
              miningCompany: miningDetails[0],
              location: miningDetails[1],
              minedDate: this.formatDate(miningDetails[2].toNumber()),
              cuttingCompany: cuttingDetails[0],
              cutDate: this.formatDate(cuttingDetails[1].toNumber()),
              grade: cuttingDetails[2],
              position: position.toNumber(),
              owner: owner
            });
          }
        } catch (error) {
          console.error('Error fetching NFTs:', error);
          alert('Failed to fetch your NFTs');
        }
      },
      formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleDateString();
      },

      // 提交铸造信息
      async mintDiamond() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          // 将字符串转换为 bytes32 格式
          const miningCompanyBytes32 = ethers.utils.formatBytes32String(this.miningForm.miningCompany);
          const locationBytes32 = ethers.utils.formatBytes32String(this.miningForm.location);
          
          // 转换日期为时间戳
          const dateTimestamp = Math.floor(new Date(this.miningForm.date).getTime() / 1000);

          console.log("Mining with params:", {
            company: miningCompanyBytes32,
            location: locationBytes32,
            date: dateTimestamp
          });

          // 调用合约 mining 方法，使用转换后的 bytes32 数据
          const tx = await this.contract.mining(
            miningCompanyBytes32,
            locationBytes32,
            dateTimestamp
          );

          // 等待交易被确认
          console.log("Waiting for transaction confirmation...");
          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt);

          // 显示成功消息
          alert('Diamond NFT minted successfully!');
          
          // 关闭表单
          this.showMiningForm = false;
          
          // 清空表单数据
          this.miningForm = {
            miningCompany: '',
            location: '',
            date: ''
          };

          // 刷新 NFT 列表
          await this.fetchMyNFTs();

        } catch (error) {
          console.error('Error minting diamond:', error);
          alert(`Failed to mint diamond: ${error.message}`);
        }
      },
      async submitTransfer() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          const tx = await this.contract.transit(
            this.transferForm.tokenId,
            this.transferForm.to,
            // { gasLimit: 300000 }
          );

          await tx.wait();
          alert('NFT transferred successfully!');
          this.showTransferForm = false;
          this.transferForm = { tokenId: '', to: '' };
          await this.fetchMyNFTs();
        } catch (error) {
          console.error('Error transferring NFT:', error);
          alert(`Failed to transfer NFT: ${error.message}`);
        }
      },
      // 检查是否是原始所有者（铸造者）
      async isOriginalOwner(tokenId) {
        try {
          const mintingHistory = await this.contract.getBasicDetails(tokenId);
          // 假设 miningCompany 是由原始所有者设置的
          return mintingHistory[0] !== '';
        } catch (error) {
          console.error('Error checking original owner:', error);
          return false;
        }
      },

      // 检查阶段
      getStageStatus(position, stage, data) {
        // 如果是客户阶段（stage 5）且当前位置大于等于5
        if (stage === 5 && position >= 5) {
          return 'In Progress';
        }

        // 如果当前位置小于该阶段
        if (position < stage) {
          return 'Not Started';
        }

        // 如果当前位置大于该阶段，说明该阶段已完成
        if (position > stage) {
          // 检查该阶段是否完成
          switch(stage) {
            case 0: // Mining
              return data.basic.miningCompany ? 'Completed' : 'Incomplete';
            case 1: // Cutting
              return data.basic.cuttingCompany ? 'Completed' : 'Incomplete';
            case 2: // Grading
              return data.grading.gradingLab ? 'Completed' : 'Incomplete';
            case 3: // Jewelry
              return data.jewelry.jewelryMaker ? 'Completed' : 'Incomplete';
            case 4: // Design
              return data.design.designer ? 'Completed' : 'Incomplete';
            case 5: // Customer
              return data.customer.name ? 'Completed' : 'Incomplete';
            default:
              return 'Unknown';
          }
        }

        // 如果当前位置等于该阶段
        return 'In Progress';
      },
      isStageCompleted(nft, stage) {
        switch(stage) {
          case 0: // Mining
            return nft.miningCompany !== '';
          case 1: // Cutting
            return nft.cuttingCompany !== '';
          case 2: // Grading
            return nft.gradingLab !== '';
          case 3: // Jewelry
            return nft.jewelryMaker !== '';
          default:
            return false;
        }
      },
      closeForm() {
        this.showCuttingForm = false;
        this.showGradingForm = false;
        this.showJewelryForm = false;
        this.showTransferForm = false;
        this.showMyNFTsDialog = true;
      },

      // 提交设计者信息
      async submitDesigner() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          // 检查钻石的 position
          try {
            const position = await this.checkDiamondPosition(this.designerForm.tokenId);
            if (position.toNumber() !== 4) {
              alert(`Diamond is not in the Design stage. Current position: ${position.toString()}`);
              return;
            }
          } catch (error) {
            console.error("Error checking position:", error);
            alert(`Error: ${error.message || "Failed to check diamond position"}`);
            return;
          }

          // 将字符串转换为 bytes32
          const designerNameBytes32 = ethers.utils.formatBytes32String(this.designerForm.designerName);
          const designDateTimestamp = Math.floor(new Date(this.designerForm.designDate).getTime() / 1000);

          console.log("Submitting designer info:", {
            tokenId: this.designerForm.tokenId,
            designerName: designerNameBytes32,
            designDate: designDateTimestamp
          });

          const tx = await this.contract.setDesigner(
            this.designerForm.tokenId,
            designerNameBytes32,     // 使用转换后的 bytes32
            designDateTimestamp
          );

          await tx.wait();
          alert('Designer information submitted successfully!');
          this.showDesignerForm = false;
          this.designerForm = { tokenId: '', designerName: '', designDate: '' };
          await this.fetchMyNFTs();
        } catch (error) {
          console.error('Error submitting designer info:', error);
          alert(`Failed to submit designer info: ${error.message}`);
        }
      },
      //提交顾客信息
      async submitCustomer() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          // 检查钻石的 position
          try {
            const position = await this.checkDiamondPosition(this.customerForm.tokenId);
            if (position.toNumber() < 5) {
              alert(`Diamond is not in the Customer stage. Current position: ${position.toString()}`);
              return;
            }
          } catch (error) {
            console.error("Error checking position:", error);
            alert(`Error: ${error.message || "Failed to check diamond position"}`);
            return;
          }

          // 将字符串转换为 bytes32
          const customerNameBytes32 = ethers.utils.formatBytes32String(this.customerForm.customerName);
          const purchaseDateTimestamp = Math.floor(new Date(this.customerForm.purchaseDate).getTime() / 1000);

          console.log("Submitting customer info:", {
            tokenId: this.customerForm.tokenId,
            customerName: customerNameBytes32,
            purchaseDate: purchaseDateTimestamp
          });

          const tx = await this.contract.setCustomer(
            this.customerForm.tokenId,
            customerNameBytes32,      // 使用转换后的 bytes32
            purchaseDateTimestamp
          );

          await tx.wait();
          alert('Customer information submitted successfully!');
          this.showCustomerForm = false;
          this.customerForm = { tokenId: '', customerName: '', purchaseDate: '' };
          await this.fetchMyNFTs();
        } catch (error) {
          console.error('Error submitting customer info:', error);
          alert(`Failed to submit customer info: ${error.message}`);
        }
      },
      showDesignerDialog(tokenId) {
        this.showMyNFTsDialog = false;
        this.designerForm.tokenId = tokenId;
        this.showDesignerForm = true;
      },
      showCustomerDialog(tokenId) {
        this.showMyNFTsDialog = false;
        this.customerForm.tokenId = tokenId;
        this.showCustomerForm = true;
      }
    },
    beforeUnmount() {
      // 清理事件监听
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      }
    }
  };
  </script>
  
  <style scoped>
  .search {
    max-width: 800px;  /* 增加最大宽度 */
    margin: 20px auto;
    padding: 0 20px;
    text-align: center;
  }
  
  /* 搜索结果容器 */
  .search-results {
    margin-top: 20px;
    text-align: left;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  /* 阶段标题 */
  h2 {
    color: #2c3e50;
    border-bottom: 2px solid #4CAF50;
    padding-bottom: 10px;
    margin-top: 30px;
  }
  
  /* 列样式 */
  ul {
    list-style: none;
    padding: 0;
    margin: 15px 0;
  }
  
  li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  
  li strong {
    color: #2c3e50;
    margin-right: 10px;
  }
  
  /* 输入框和按钮 */
  .search-section {
    margin: 20px 0;
  }
  
  .search-section input {
    padding: 10px;
    font-size: 16px;
    width: 200px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .search-section button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* 操作按钮 */
  .action-buttons {
    margin: 20px 0;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .action-btn, .my-nfts-btn {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .action-btn:hover, .my-nfts-btn:hover {
    background-color: #45a049;
  }
  
  /* 连接钱包部分 */
  .connect-wallet {
    margin: 20px 0;
  }
  
  .connect-wallet button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* 模态框样式 */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-y: auto;
    padding: 20px 0;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    position: relative;
    margin: 20px auto;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  /* 关闭按钮样式 */
  .close {
    position: absolute;
    right: 15px;
    top: 10px;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    z-index: 2;
  }
  
  .close:hover {
    color: #000;
  }
  
  /* NFT 列表项样式 */
  .nft-item {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .nft-item h3 {
    margin: 0 0 10px 0;
    color: #2c3e50;
  }
  
  .nft-item p {
    margin: 5px 0;
    color: #666;
  }
  
  /* 错误消息样式 */
  .error-message {
    color: #ff4444;
    margin: 20px 0;
    padding: 10px;
    background-color: #ffebee;
    border-radius: 4px;
  }
  
  /* 表单样式 */
  .form-group {
    margin: 15px 0;
    text-align: left;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    color: #2c3e50;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  /* 响应式设计 */
  @media (max-width: 600px) {
    .search {
      padding: 0 10px;
    }
  
    .search-section input {
      width: 100%;
      margin-bottom: 10px;
    }
  
    .action-buttons {
      flex-direction: column;
      gap: 10px;
    }
  
    .modal-content {
      width: 95%;
      margin: 10px;
    }
  }
  
  .nft-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .action-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .transfer-btn {
    background-color: #2196F3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .action-btn:hover {
    background-color: #45a049;
  }
  
  .transfer-btn:hover {
    background-color: #1976D2;
  }
  </style>
  