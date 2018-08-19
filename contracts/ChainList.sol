pragma solidity ^0.4.18;

contract ChainList {

    struct Article {
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    mapping (uint => Article) public articles;
    uint articleCounter;
    
    // events
    event LogSellArticle(
        uint indexed id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle(
        uint indexed _id,
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

        articles[articleCounter] = Article(
            articleCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );
        
        articleCounter++;
        LogSellArticle(articleCounter, msg.sender, _name, _price);
    }

    function buyArticle(uint _id) payable public {
        // we check whether there is an article for sale
        require(articleCounter > 0);

        // we check that the article exists
        require(_id > 0 && _id <= articleCounter);

        // we retrieve the article
        Article storage article = articles[_id];

        // we check that the article has not been sold yet
        require(article.buyer == 0X0);

        // we don't allow the seller to buy his own article
        require(msg.sender != article.seller);

        // we check that the value sent corresponds to the price of the article
        require(msg.value == article.price);

        // keep buyer's information
        article.buyer = msg.sender;

        // the buyer can pay the seller
        article.seller.transfer(msg.value);

        // trigger the event
        LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }

    function getNumberOfArticles() public view returns (uint) {
        return articleCounter;
    }

    function getArticlesForSale() public view returns (uint[]) {
        uint[] memory articleIds = new uint[](articleCounter);

        uint numberOfArticleForSale = 0;
        for (uint i = 0; i < articleCounter; i++) {
            if (articles[i].buyer == 0x0) {
                articleIds[i] = i;
            }
            numberOfArticleForSale++;
        }

        uint[] memory articleForSaleIds = new uint[](numberOfArticleForSale);
        for (uint j = 0; j < numberOfArticleForSale; j++) {
            articleForSaleIds[j] = articleIds[j];
        }
        return articleForSaleIds;
    }
/*
  // get an article
    function getArticle(uint _id) public view returns (
        address _seller,
        address _buyer,
        string _name,
        string _description,
        uint256 _price
    ) {
        Ar
        return (seller, buyer, name, description, price);
    }
    */
}
