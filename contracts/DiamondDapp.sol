// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract DiomandDapp is ERC721Enumerable {
    uint256 public tokenIds;

    // 每个阶段的相关信息
    mapping(uint256 => bytes32) public diamondID;
    mapping(uint256 => uint256) public position; // 0: 采矿, 1: 切割, 2: 评级, 3: 珠宝商，4: 设计，5：客户
    // 采矿阶段
    mapping(uint256 => bytes32) public miningCompany;
    mapping(uint256 => bytes32) public location;
    mapping(uint256 => uint256) public minedDate;
    // 切割阶段
    mapping(uint256 => bytes32) public cuttingCompany;
    mapping(uint256 => bytes32) public cutGrade;
    mapping(uint256 => uint256) public cutDate;
    
    // 评级阶段
    mapping(uint256 => bytes32) public gradingLab;
    mapping(uint256 => bytes32) public grading;
    mapping(uint256 => bytes32) public engravedID;
    mapping(uint256 => uint256) public gradingDate;
    mapping(uint256 => string) public qualityReport;
    // 珠宝制作阶段
    mapping(uint256 => bytes32) public jewelryMaker;
    mapping(uint256 => bytes32) public jewelryType;
    mapping(uint256 => uint256) public possessionDate;
    // 设计阶段
    mapping(uint256 => bytes32) public designer;
    mapping(uint256 => uint256) public designDate;
    
    // 客户阶段
    mapping(uint256 => bytes32) public customer;

    // 添加新的映射来存储每个阶段的操作者地址
    mapping(uint256 => address) public miningAddress;    // 采矿公司地址
    mapping(uint256 => address) public cuttingAddress;   // 切割公司地址
    mapping(uint256 => address) public gradingAddress;   // 评级机构地址
    mapping(uint256 => address) public jewelryAddress;   // 珠宝商地址
    mapping(uint256 => address) public designerAddress;  // 设计师地址
    mapping(uint256 => address) public customerAddress;  // 客户地址

    modifier onlyDiamondOwner(uint256 token_id) {
        require(
            msg.sender == ownerOf(token_id),
            "You don't own the diamond now"
        );
        _;
    }

    modifier onlyAtPosition(uint256 token_id, uint256 requiredPosition) {
        // 如果当前位置等于要求位置，直接通过
        if (position[token_id] == requiredPosition) {
            _;
            return;
        }
        
        // 如果当前位置大于要求位置且大于等于5，也通过
        if (position[token_id] > requiredPosition && position[token_id] >= 5) {
            _;
            return;
        }
        
        // 其他情况都不满足
        revert("You can't perform this operation at this position");
    }

    constructor() ERC721("Diomand Supplychain", "DS") {}

    // 采矿操作
    function mining(
        bytes32 mining_company,
        bytes32 loc,
        uint256 date
    ) public payable onlyAtPosition(tokenIds, 0) {
        _safeMint(msg.sender, tokenIds);
        miningCompany[tokenIds] = mining_company;
        location[tokenIds] = loc;
        minedDate[tokenIds] = date;
        position[tokenIds] = 0; // 采矿阶段
        miningAddress[tokenIds] = msg.sender;  // 记录采矿公司地址
        tokenIds += 1;
    }

    // 转移钻石到下一个环节
    function transit(
        uint256 token_id,
        address nextStop
    ) public onlyDiamondOwner(token_id) {
        _safeTransfer(msg.sender, nextStop, token_id);
        position[token_id] += 1;
    }

    // 切割操作，只有在采矿完后才允许
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
        cuttingAddress[token_id] = msg.sender;  // 记录切割公司地址
    }

    // 加工质量控制操作，只有在切割完成后才允许
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
        gradingAddress[token_id] = msg.sender;  // 记录评级机构地址
    }

    // 设置珠宝商操作，只有在质量控制完成后才允许
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
        jewelryAddress[token_id] = msg.sender;  // 记录珠宝商地址
    }

     // 设置设计师信息
    function setDesigner(
        uint256 token_id,
        bytes32 designer_name,
        uint256 design_date
    ) public onlyAtPosition(token_id, 4) onlyDiamondOwner(token_id) {
        designer[token_id] = designer_name;
        designDate[token_id] = design_date;
        position[token_id] = 4;
        designerAddress[token_id] = msg.sender;  // 记录设计师地址
    }

    // 设置客户信息
    function setCustomer(
        uint256 token_id,
        bytes32 customer_name,
        uint256 purchase_date
    ) public onlyAtPosition(token_id, 5) onlyDiamondOwner(token_id) {
        customer[token_id] = customer_name;
        possessionDate[token_id] = purchase_date;
        position[token_id] = 5;
        customerAddress[token_id] = msg.sender;  // 记录客户地址
    }

    // 获取采矿阶段信息
    function getMiningDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _miningCompany,
        bytes32 _location,
        uint256 _minedDate,
        address _miningAddress,
        bytes32 _diamondID
    ) {
        return (
            miningCompany[token_id],
            location[token_id],
            minedDate[token_id],
            miningAddress[token_id],
            diamondID[token_id]
        );
    }

    // 获取切割阶段信息
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

    // 获取钻石的评级相关信息
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

    // 获取珠宝制作相关信息
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

    // 获取设计相关信息
    function getDesignDetails(
        uint256 token_id
    ) public view returns (
        bytes32 _designer,
        uint256 _designDate,
        address _designerAddress
    ) {
        return (
            designer[token_id],
            designDate[token_id],
            designerAddress[token_id]
        );
    }

    // 获取钻石生命周期阶段
    function getDiamondPosition(
        uint256 token_id
    ) public view returns (uint256) {
        return position[token_id];
    }

    // 添加获取客户信息的函数
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
