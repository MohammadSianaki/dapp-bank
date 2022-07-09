pragma solidity ^0.8.0;

contract Bank {
    address public bankOwner;
    string public bankName;
    mapping(address => uint256) public customerBalance;

    constructor(){
        bankOwner = msg.sender;
    }

    function depositMoney() public payable {
        require(msg.value != 0, "You need to some amount of money!");
        customerBalance[msg.sender] = msg.value;
    }

    function setBankName(string memory _name) external {
        require(msg.sender == bankOwner, "You must be the bank owner to set the name!");
        bankName = _name;
    }

    function withdrawMoney(address payable _to, uint256 _amount) public {
        require(_amount <= customerBalance[msg.sender], "You have insufficient money to withdraw");
        customerBalance[msg.sender] -= _amount;
        _to.transfer(_amount);
    }

    function getCustomerBalance() external view returns (uint256){
        return customerBalance[msg.sender];
    }

    function getBankBalance() public view returns (uint256){
        require(msg.sender == bankOwner, "You must be the bank owner to getBankBalance");
        return address(this).balance;
    }
}
