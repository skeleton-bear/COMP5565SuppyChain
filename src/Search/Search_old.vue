<template>
    <div class="search">
      <h1>Diamond NFT System</h1>
      
      <div v-if="!isConnected" class="connect-wallet">
        <p>Please connect your wallet first</p>
        <button @click="connectWallet">Connect MetaMask</button>
      </div>

      <div v-else>
        <div class="wallet-info">
          <p>Wallet Connected: {{ account }}</p>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
        
        <div class="action-buttons">
          <button @click="showMiningDialog" class="action-btn">Mint New Diamond</button>
          <button @click="showMyNFTs" class="my-nfts-btn">My NFTs</button>
          <button @click="viewAllTokens" class="action-btn">View All Diamonds</button>
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
                <input type="number" v-model="gradingForm.tokenId" disabled />
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
                <input type="number" v-model="jewelryForm.tokenId" disabled />
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
              <div v-for="nft in myNFTs" 
                   :key="nft.tokenId" 
                   class="nft-item" 
                   @click="viewNFTDetails(nft.tokenId)"
                   style="cursor: pointer;">
                <h3>Token ID: {{ nft.tokenId }}</h3>
                <p>Diamond ID: {{ nft.diamondID }}</p>
                <p>Mining Company: {{ nft.miningCompany }}</p>
                <p>Location: {{ nft.location }}</p>
                <p>Current Stage: {{ getPosition(nft.position) }}</p>
                
                <div class="nft-actions" @click.stop>
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
                <input type="number" v-model="transferForm.tokenId" disabled />
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
                <input type="number" v-model="designerForm.tokenId" disabled />
              </div>
              <div class="form-group">
                <label>Designer Name:</label>
                <input v-model="designerForm.designerName" required />
              </div>
              <div class="form-group">
                <label>Design Date:</label>
                <input type="date" v-model="designerForm.designDate" required />
              </div>
              <div class="form-group">
                <label>Design Price (ETH):</label>
                <input type="number" step="0.001" v-model="designerForm.designPrice" required />
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
                <input type="number" v-model="customerForm.tokenId" disabled />
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
  import { CONTRACT_ADDRESS } from '../config';
  
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
          designDate: '',
          designPrice: ''
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
      // 监听登出事件
      window.addEventListener('storage', this.handleStorageChange);
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
      handleStorageChange(event) {
        if (event.key === 'walletLogout' && event.newValue === 'true') {
          // 清除登出标记
          window.localStorage.removeItem('walletLogout');
          // 执行登出操作
          this.isConnected = false;
          this.account = "";
          this.contract = null;
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

          // 使用配置中的合约地址
          const contractAddress = CONTRACT_ADDRESS;
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
          console.error("Contract initialization error:", error);
          alert(`Contract initialization failed: ${error.message}`);
          throw error;
        }
      },
      async searchDiamond() {
        try {
          // 修改判断条件，因为 0 是有效的 tokenId
          if (this.tokenId === "" || this.tokenId === null || this.tokenId === undefined) {
            alert("Please enter a Token ID");
            return;
          }
          
          // 确保 tokenId 是非负数
          if (Number(this.tokenId) < 0) {
            alert("Please enter a valid Token ID (non-negative number)");
            return;
          }

          // 检查代币是否存在
          if (!this.contract) {
            await this.initContract();
          }
          
          try {
            await this.contract.ownerOf(this.tokenId);
          } catch (error) {
            console.error("Token does not exist:", error);
            alert("This token does not exist");
            return;
          }
          
          // 使用路由导航到结果页面，并传递tokenId作为查询参数
          this.$router.push({
            name: 'search-result',
            query: { id: String(this.tokenId) }  // 确保 tokenId 是字符串
          });
        } catch (error) {
          console.error('Error searching diamond:', error);
          alert('Failed to search diamond');
        }
      },
      getPosition(position) {
        const stages = ["Mining", "Cutting", "Grading", "Jewelry Making", "Design", "Customer"];
        return position >= 5 ? "Customer" : stages[position] || "Unknown";
      },
      // 修改 isValidDiamondData 方法
      isValidDiamondData(data) {
        return data && 
               data.Mining && 
               (data.Mining.miningCompany !== 'N/A' || 
                data.Mining.location !== 'N/A' || 
                data.Mining.minedDate !== 0);
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

          console.log("Cutting parameters:", {
            tokenId: this.cuttingForm.tokenId,
            company: cuttingCompanyBytes32,
            date: cutDateTimestamp,
            grade: gradeBytes32
          });

          const tx = await this.contract.cutting(
            this.cuttingForm.tokenId,
            cuttingCompanyBytes32,
            cutDateTimestamp,
            gradeBytes32,
            { gasLimit: 500000 }
          );

          console.log("Transaction sent:", tx.hash);
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
            const position = await this.contract.getDiamondPosition(tokenId);
            const owner = await this.contract.ownerOf(tokenId);

            this.myNFTs.push({
              tokenId: tokenId.toString(),
              diamondID: miningDetails[4],
              miningCompany: this.bytesToString(miningDetails[0]),
              location: this.bytesToString(miningDetails[1]),
              minedDate: this.formatDate(miningDetails[2].toNumber()),
              cuttingCompany: this.bytesToString(cuttingDetails[0]),
              cutDate: this.formatDate(cuttingDetails[1].toNumber()),
              grade: this.bytesToString(cuttingDetails[2]),
              position: position.toNumber(),
              owner: owner
            });
          }
        } catch (error) {
          console.error('Error fetching NFTs:', error);
          alert('Failed to fetch your NFTs');
        }
      },
      // 修改 formatDate 方法
      formatDate(timestamp) {
        if (!timestamp || timestamp === 0) return 'N/A';
        try {
          return new Date(timestamp * 1000).toLocaleDateString();
        } catch (error) {
          console.warn('格式化日期时出错:', error);
          return 'N/A';
        }
      },

      // 提交铸造信息
      async mintDiamond() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          // 检查输入值是否为空
          if (!this.miningForm.miningCompany || !this.miningForm.location || !this.miningForm.date) {
            alert("请填写所有必填字段");
            return;
          }

          // 将字符串转换 bytes32 格式
          const miningCompanyBytes32 = ethers.utils.formatBytes32String(this.miningForm.miningCompany);
          const locationBytes32 = ethers.utils.formatBytes32String(this.miningForm.location);
          
          // 转换日期为时间戳
          const dateTimestamp = Math.floor(new Date(this.miningForm.date).getTime() / 1000);

          console.log("Mining parameters:", {
            company: miningCompanyBytes32,
            location: locationBytes32,
            date: dateTimestamp
          });

          // 调用合约方法
          const tx = await this.contract.mining(
            miningCompanyBytes32,
            locationBytes32,
            dateTimestamp,
            { value: ethers.utils.parseEther("0.03") }
            // { gasLimit: 500000 } // 添加 gas 限制
          );

          console.log("Transaction sent:", tx.hash);
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
      //转移NFT操作
      async submitTransfer() {
        try {
          if (!this.contract) {
            await this.initContract();
          }

          // 检查地址格式
          if (!ethers.utils.isAddress(this.transferForm.to)) {
            alert("请输入有效的以太坊地址");
            return;
          }

          // 检查是否是当前 NFT 的所有者
          try {
            const owner = await this.contract.ownerOf(this.transferForm.tokenId);
            if (owner.toLowerCase() !== this.account.toLowerCase()) {
              alert("你不是这个钻石 NFT 的所有者，无法进行转移操作");
              return;
            }
          } catch (error) {
            console.error("Error checking ownership:", error);
            alert("检查所有权时出错");
            return;
          }

          console.log("Transfer parameters:", {
            tokenId: this.transferForm.tokenId,
            to: this.transferForm.to
          });

          const tx = await this.contract.transit(
            this.transferForm.tokenId,
            this.transferForm.to
          );

          console.log("Transaction sent:", tx.hash);
          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt);

          alert('NFT transferred successfully!');
          this.showTransferForm = false;
          this.transferForm = { tokenId: '', to: '' };
          await this.fetchMyNFTs();

        } catch (error) {
          console.error('Error transferring NFT:', error);
          
          // 处理特的错误信息
          if (error.message.includes("You don't own the diamond now")) {
            alert("You don't own the diamond now");
          } else if (error.message.includes("cannot estimate gas")) {
            alert("The transaction may fail, please check if you are the owner of the NFT");
          } else {
            alert(`Failed to transfer NFT: ${error.message}`);
          }
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

      // 修改 getStageStatus 方法
      getStageStatus(position, stage, data) {
        // 首先检查 data 是否存在
        if (!data) {
          return 'Unknown';
        }

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
          // 检查该阶段是否有数据
          switch(stage) {
            case 0: // Mining
              return data.Mining && data.Mining.miningCompany && data.Mining.miningCompany !== 'N/A' 
                ? 'Completed' 
                : 'Incomplete';
            case 1: // Cutting
              return data.Cutting && data.Cutting.cuttingCompany && data.Cutting.cuttingCompany !== 'N/A' 
                ? 'Completed' 
                : 'Incomplete';
            case 2: // Grading
              return data.grading && data.grading.gradingLab && data.grading.gradingLab !== 'N/A' 
                ? 'Completed' 
                : 'Incomplete';
            case 3: // Jewelry
              return data.jewelry && data.jewelry.jewelryMaker && data.jewelry.jewelryMaker !== 'N/A' 
                ? 'Completed' 
                : 'Incomplete';
            case 4: // Design
              return data.design && data.design.designer && data.design.designer !== 'N/A' 
                ? 'Completed' 
                : 'Incomplete';
            case 5: // Customer
              return data.customer && data.customer.name && data.customer.name !== 'N/A' 
                ? 'Completed' 
                : 'Incomplete';
            default:
              return 'Unknown';
          }
        }

        // 如果当前位置于该阶段
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

          // 准备参数，确保类型匹配
          const tokenId = ethers.BigNumber.from(this.designerForm.tokenId);
          const designerNameBytes32 = ethers.utils.formatBytes32String(this.designerForm.designerName);
          const designDateTimestamp = ethers.BigNumber.from(
            Math.floor(new Date(this.designerForm.designDate).getTime() / 1000)
          );
          const designPrice = ethers.utils.parseUnits(this.designerForm.designPrice.toString(), "ether");

          console.log("Submitting designer info:", {
            tokenId: tokenId.toString(),
            designerName: designerNameBytes32,
            designDate: designDateTimestamp.toString(),
            designPrice: designPrice.toString()
          });

          // 调用合约函数
          const tx = await this.contract.setDesigner(
            tokenId,
            designerNameBytes32,
            designDateTimestamp,
            designPrice
          );

          await tx.wait();
          alert('Designer information submitted successfully!');
          this.showDesignerForm = false;
          this.designerForm = { tokenId: '', designerName: '', designDate: '', designPrice: '' };
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
      },
      // 修改 bytesToString 方法
      bytesToString(bytes32) {
        if (!bytes32) return 'N/A';
        try {
          const string = ethers.utils.parseBytes32String(bytes32);
          return string === '' ? 'N/A' : string;
        } catch (error) {
          console.warn('Error parsing bytes32 to string:', error);
          return 'Invalid Data';
        }
      },
      // 添加检查零地址的辅助方法
      isZeroAddress(address) {
        return !address || address === '0x0000000000000000000000000000000000000000';
      },
      // 修改 viewNFTDetails 方法
      async viewNFTDetails(tokenId) {
        try {
          // 首先检查代币是否存在
          if (!this.contract) {
            await this.initContract();
          }
          
          try {
            await this.contract.ownerOf(tokenId);
          } catch (error) {
            console.error("Token does not exist:", error);
            alert("This token does not exist");
            return;
          }

          // 关闭 MyNFTs 对话框
          this.showMyNFTsDialog = false;
          
          // 导航到结果页面
          this.$router.push({
            name: 'search-result',
            query: { id: tokenId.toString() }  // 确保 tokenId 是字符串
          });
        } catch (error) {
          console.error('Error viewing NFT details:', error);
          alert('Failed to view NFT details');
        }
      },
      viewAllTokens() {
        this.$router.push('/all-tokens');
      },
      async logout() {
        this.isConnected = false;
        this.account = "";
        this.contract = null;
        this.$router.push('/');
      }
    },
    beforeUnmount() {
      // 清理事件监听
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      }
      window.removeEventListener('storage', this.handleStorageChange);
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
  .detail-btn {
    background-color: #2196F3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
  }
  
  .detail-btn:hover {
    background-color: #1976D2;
  }
  
  .wallet-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  
  .logout-btn {
    padding: 8px 16px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .logout-btn:hover {
    background-color: #ff0000;
  }
  </style>
  