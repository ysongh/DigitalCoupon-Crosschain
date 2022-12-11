// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {Upgradable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/upgradables/Upgradable.sol";
import {StringToAddress, AddressToString} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/StringAddressUtils.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract DigitalCoupon is
    ERC721URIStorage,
    AxelarExecutable,
    Upgradable
{
    using StringToAddress for string;
    using AddressToString for address;

    using Counters for Counters.Counter;
    Counters.Counter public _receiptIds;

    uint public totalCoupon = 0;

    mapping(uint => Coupon) public couponList;
    mapping(address => mapping(uint => Referrer)) public referrersList;

        struct Coupon {
        uint couponId;
        string cid;
        string tablelandId;
        uint expireDate;
        uint price;
        uint rewardPercentAmount;
        address owner;
    }

    struct Referrer {
        uint couponId;
        address[] users;
    }

    event CouponCreated (uint couponId, string cid, uint expireDate, uint price, uint rewardPercentAmount, address owner);
    event CouponSale (uint couponId, string cid, uint nftid, address referrer, address buyer);

    error AlreadyInitialized();

    mapping(uint256 => bytes) public original; //abi.encode(originaChain, operator, tokenId);
    string public chainName; //To check if we are the source chain.
    IAxelarGasService public immutable gasReceiver;

    constructor(address gateway_, address gasReceiver_)
        ERC721("Digital Coupon Receipt", "DCR")
        AxelarExecutable(gateway_)
    {
        gasReceiver = IAxelarGasService(gasReceiver_);
    }

    function createCoupon(string memory _cid, uint _timeAmount, uint _price, uint _rewardPercentAmount) public returns (uint) {
        uint _expireDate = block.timestamp + _timeAmount * 1 days;

        couponList[totalCoupon] = Coupon(totalCoupon, _cid, "", _expireDate, _price, _rewardPercentAmount, msg.sender);
        emit CouponCreated(totalCoupon, _cid, _expireDate, _price, _rewardPercentAmount, msg.sender);
        totalCoupon++;

        return totalCoupon - 1;
    }

    function createReferrer(uint _couponId) external {
        referrersList[msg.sender][_couponId] = Referrer(_couponId, new address[](0));
        referrersList[msg.sender][_couponId].users.push(msg.sender);
    }

    function setTablelandId(uint _id, string memory _tablelandId) public {
        Coupon storage currentCoupon = couponList[_id];
        currentCoupon.tablelandId = _tablelandId;
    }

    function addRefer(uint _couponId, address _referrerAddress) external {
        Referrer storage _currentReferrer = referrersList[_referrerAddress][_couponId];
        _currentReferrer.users.push(msg.sender);
    }

    function purchaseWithReferrer(uint _couponId, address _referrerAddress, string memory _cid) external payable {
        Coupon memory currentCoupon = couponList[_couponId];
        uint toAmount = (currentCoupon.price * currentCoupon.rewardPercentAmount) / 100;
        uint ownerAmount = currentCoupon.price - toAmount;

        payable(currentCoupon.owner).transfer(ownerAmount);
        payable(_referrerAddress).transfer(toAmount);

        Referrer storage _currentReferrer = referrersList[_referrerAddress][_couponId];
        _currentReferrer.users.push(msg.sender);

        _receiptIds.increment();
        uint256 currentId = _receiptIds.current();
        _mint(msg.sender, currentId);
        _setTokenURI(currentId, _cid);

        emit CouponSale(_couponId, _cid, currentId, _referrerAddress, msg.sender);
    }

    function getCoupons() public view returns (Coupon[] memory){
        Coupon[] memory coupons = new Coupon[](totalCoupon);

        for (uint i = 0; i < totalCoupon; i++) {
            Coupon memory currentCoupon = couponList[i];
            coupons[i] = currentCoupon;
        }

        return coupons;
    }

    function getOwnerCoupons(address _ownerAddress) public view returns (Coupon[] memory) {
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalCoupon; i++) {
            if (couponList[i].owner == _ownerAddress) {
                itemCount += 1;
            }
        }

        Coupon[] memory coupons = new Coupon[](itemCount);

        for (uint i = 0; i < totalCoupon; i++) {
            if (couponList[i].owner == _ownerAddress) {
                uint currentId = i;
                Coupon memory currentCoupon = couponList[currentId];
                coupons[currentIndex] = currentCoupon;
                currentIndex += 1;
            }
        }

        return coupons;   
    }

    function getAddressFromReferrer(uint _couponId, address _referrerAddress) public view returns (address [] memory){
        Referrer memory _currentReferrer = referrersList[_referrerAddress][_couponId];
        return _currentReferrer.users;
    }

    function _setup(bytes calldata params)
        internal
        override
    {
        string memory chainName_ = abi.decode(
            params,
            (string)
        );
        if (bytes(chainName).length != 0)
            revert AlreadyInitialized();
        chainName = chainName_;
    }

    function createCouponToOtherChain(
        uint256 couponId,
        string memory destinationChain
    ) external payable {
        Coupon memory currentCoupon = couponList[couponId];
        string memory cid = currentCoupon.cid;
        uint expireDate = currentCoupon.expireDate;
        uint price = currentCoupon.price;
        uint rewardPercentAmount = currentCoupon.rewardPercentAmount;
        address owner = msg.sender;

        //Create the payload.
        bytes memory payload = abi.encode(
            cid, 
            expireDate,
            price,
            rewardPercentAmount,
            owner
        );
        
        string memory stringAddress = address(this)
            .toString();
        //Pay for gas. We could also send the contract call here but then the sourceAddress will be that of the gas receiver which is a problem later.
        gasReceiver.payNativeGasForContractCall{
            value: msg.value
        }(
            address(this),
            destinationChain,
            stringAddress,
            payload,
            msg.sender
        );
        //Call the remote contract.
        gateway.callContract(
            destinationChain,
            stringAddress,
            payload
        );
    }

    //This is automatically executed by Axelar Microservices since gas was payed for.
    function _execute(
        string calldata, /*sourceChain*/
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        //Decode the payload.
        (
            string memory cid,
            uint expireDate,
            uint price,
            uint rewardPercentAmount,
            address owner
        ) = abi.decode(
                payload,
                (string, uint, uint, uint, address)
            );
        couponList[totalCoupon] = Coupon(totalCoupon, cid, "", expireDate, price, rewardPercentAmount, owner);
        emit CouponCreated(totalCoupon, cid, expireDate, price, rewardPercentAmount, owner);
        totalCoupon++;
    }

    function contractId() external pure returns (bytes32) {
        return keccak256("example");
    }

    // WARMING: Remove this on production
    function withdrawETH() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}