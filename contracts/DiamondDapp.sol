// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract DiomandDapp is ERC721Enumerable {
    uint256 public tokenIds;

    // Information for each stage
    mapping(uint256 => uint256) public diamondID;
    mapping(uint256 => uint256) public position; // 0: Mining, 1: Cutting, 2: Grading, 3: Jewelry Making, 4: Design, 5: Customer
    
    // Mining stage
    mapping(uint256 => bytes32) public miningCompany;
    mapping(uint256 => bytes32) public location;
    mapping(uint256 => uint256) public minedDate;
    
    // Cutting stage
    mapping(uint256 => bytes32) public cuttingCompany;
    mapping(uint256 => bytes32) public cutGrade;
    mapping(uint256 => uint256) public cutDate;
    
    // Grading stage
    mapping(uint256 => bytes32) public gradingLab;
    mapping(uint256 => bytes32) public grading;
    mapping(uint256 => bytes32) public engravedID;
    mapping(uint256 => uint256) public gradingDate;
    mapping(uint256 => string) public qualityReport;
    
    // Jewelry making stage
    mapping(uint256 => bytes32) public jewelryMaker;
    mapping(uint256 => bytes32) public jewelryType;
    mapping(uint256 => uint256) public possessionDate;
    
    // Design stage
    mapping(uint256 => bytes32) public designer;
    mapping(uint256 => uint256) public designDate;
    mapping(uint256 => uint256) public designPrice;
    
    // Customer stage
    mapping(uint256 => bytes32) public customer;

    // Add new mappings to store operator addresses for each stage
    mapping(uint256 => address) public miningAddress;    // Mining company address
    mapping(uint256 => address) public cuttingAddress;   // Cutting company address
    mapping(uint256 => address) public gradingAddress;   // Grading lab address
    mapping(uint256 => address) public jewelryAddress;   // Jewelry maker address
    mapping(uint256 => address) public designerAddress;  // Designer address
    mapping(uint256 => address) public customerAddress;  // Customer address

    modifier onlyDiamondOwner(uint256 token_id) {
        require(
            msg.sender == ownerOf(token_id),
            "You don't own the diamond now"
        );
        _;
    }

    modifier onlyAtPosition(uint256 token_id, uint256 requiredPosition) {
        // If current position equals required position, pass directly
        if (position[token_id] == requiredPosition) {
            _;
            return;
        }
        
        // If current position is greater than required position and >= 5, also pass
        if (position[token_id] > requiredPosition && position[token_id] >= 5) {
            _;
            return;
        }
        
        // All other cases fail
        revert("You can't perform this operation at this position");
    }

    constructor() ERC721("Diomand Supplychain", "DS") {}

    // Mining operation
    function mining(
        bytes32 mining_company,
        bytes32 loc,
        uint256 date
    ) public payable onlyAtPosition(tokenIds, 0) {
        require(msg.value == 0.03 ether, "You must pay 0.03 ETH to mint a diamond");   
        _safeMint(msg.sender, tokenIds);
        miningCompany[tokenIds] = mining_company;
        location[tokenIds] = loc;
        minedDate[tokenIds] = date;
        position[tokenIds] = 0; // Mining stage
        miningAddress[tokenIds] = msg.sender;  // Record mining company address
        tokenIds += 1;
    }

    // Transfer diamond to next stage
    function transit(
        uint256 token_id,
        address nextStop
    ) public onlyDiamondOwner(token_id) {
        _safeTransfer(msg.sender, nextStop, token_id);
        position[token_id] += 1;
    }

    // Cutting operation, only allowed after mining
    function cutting(
        uint256 token_id,
        bytes32 cutting_company,
        uint256 cut_date,
        bytes32 grade
    ) public onlyAtPosition(token_id, 1) onlyDiamondOwner(token_id) {
        cuttingCompany[token_id] = cutting_company;
        cutDate[token_id] = cut_date;
        cutGrade[token_id] = grade;
        position[token_id] = 1;
        cuttingAddress[token_id] = msg.sender;  // Record cutting company address
    }

    // Grading operation, only allowed after cutting
    function setGradingInfo(
        uint256 token_id,
        bytes32 gradingLabParam,
        bytes32 engravedIDParam,
        bytes32 gradingLevelParam,
        uint256 gradingDateParam,
        string memory qualityReportParam
    ) public onlyAtPosition(token_id, 2) onlyDiamondOwner(token_id) {
        gradingLab[token_id] = gradingLabParam;
        engravedID[token_id] = engravedIDParam;
        grading[token_id] = gradingLevelParam;
        gradingDate[token_id] = gradingDateParam;
        qualityReport[token_id] = qualityReportParam;
        position[token_id] = 2;
        gradingAddress[token_id] = msg.sender;  // Record grading lab address
    }

    // Jewelry making operation, only allowed after grading
    function jewelryMaking(
        uint256 token_id,
        bytes32 jewelry_maker,
        bytes32 jewelryTypeParam,
        uint256 possessionDateParam
    ) public onlyAtPosition(token_id, 3) onlyDiamondOwner(token_id) {
        jewelryMaker[token_id] = jewelry_maker;
        jewelryType[token_id] = jewelryTypeParam;
        possessionDate[token_id] = possessionDateParam;
        position[token_id] = 3;
        jewelryAddress[token_id] = msg.sender;  // Record jewelry maker address
    }

     // Set designer information
    function setDesigner(
        uint256 token_id,
        bytes32 designer_name,
        uint256 design_date,
        uint256 design_price
    ) public onlyAtPosition(token_id, 4) onlyDiamondOwner(token_id) {
        designer[token_id] = designer_name;
        designDate[token_id] = design_date;
        designPrice[token_id] = design_price;
        position[token_id] = 4;
        designerAddress[token_id] = msg.sender;  // Record designer address
    }

    // Set customer information
    function setCustomer(
        uint256 token_id,
        bytes32 customer_name,
        uint256 purchase_date
    ) public onlyAtPosition(token_id, 5) onlyDiamondOwner(token_id) {
        customer[token_id] = customer_name;
        possessionDate[token_id] = purchase_date;
        position[token_id] = 5;
        customerAddress[token_id] = msg.sender;  // Record customer address
    }

    // Get mining stage information
    function getMiningDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _miningCompany,
        bytes32 _location,
        uint256 _minedDate,
        address _miningAddress,
        uint256 _diamondID
    ) {
        return (
            miningCompany[token_id],
            location[token_id],
            minedDate[token_id],
            miningAddress[token_id],
            diamondID[token_id]
        );
    }

    // Get cutting stage information
    function getCuttingDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _cuttingCompany,
        uint256 _cutDate,
        bytes32 _cutGrade,
        address _cuttingAddress
    ) {
        return (
            cuttingCompany[token_id],
            cutDate[token_id],
            cutGrade[token_id],
            cuttingAddress[token_id]
        );
    }

    // Get grading stage information
    function getGradingDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _gradingLab,
        bytes32 _engravedID,
        bytes32 _grading,
        uint256 _gradingDate,
        string memory _qualityReport,
        address _gradingAddress
    ) {
        return (
            gradingLab[token_id],
            engravedID[token_id],
            grading[token_id],
            gradingDate[token_id],
            qualityReport[token_id],
            gradingAddress[token_id]
        );
    }

    // Get jewelry making stage information
    function getJewelryDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _jewelryMaker,
        bytes32 _jewelryType,
        uint256 _possessionDate,
        address _jewelryAddress
    ) {
        return (
            jewelryMaker[token_id],
            jewelryType[token_id],
            possessionDate[token_id],
            jewelryAddress[token_id]
        );
    }

    // Get design stage information
    function getDesignDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _designer,
        uint256 _designDate,
        uint256 _designPrice,
        address _designerAddress
    ) {
        return (
            designer[token_id],
            designDate[token_id],
            designPrice[token_id],
            designerAddress[token_id]
        );
    }

    // Get diamond lifecycle stage
    function getDiamondPosition(
        uint256 token_id
    ) public view returns (uint256) {
        return position[token_id];
    }

    // Get customer information
    function getCustomerDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _customer,
        uint256 _purchaseDate,
        address _customerAddress
    ) {
        return (
            customer[token_id],
            possessionDate[token_id],
            customerAddress[token_id]
        );
    }
}
