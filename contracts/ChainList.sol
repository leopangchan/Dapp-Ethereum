pragma solidity ^0.4.18;

contract ChainList {
    // state variables
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price; // in wei
    
    // events
    event LogSellArticle(
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle(
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    // sell an article
    function sellArticle(
        string _name, 
        string _description, 
        uint256 _price
    ) public {
        seller = msg.sender; // person calling this function.
        name = _name;
        description = _description;
        price = _price;

        LogSellArticle(seller, name, price);
    }

    function buyArticle() payable public {
        require(seller != 0x0);

        require(buyer == 0x0);

        require(msg.sender != seller);

        require(msg.value == price);

        buyer = msg.sender;

        seller.transfer(msg.value);

        LogBuyArticle(seller, buyer, name, price);
    }

  // get an article
    function getArticle() public view returns (
        address _seller,
        address _buyer,
        string _name,
        string _description,
        uint256 _price
    ) {
        return (seller, buyer, name, description, price);
    }
}
