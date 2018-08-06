var ChainList = artifacts.require("./ChainList.sol");

// each test suite creates a brand new instance of the contract.
contract("ChainList", function(accounts) {
    it("should be initialized empty", function() {
        return ChainList
                .deployed()
                .then(function(instance) {
                    return instance.getArticle();
                })
                .then(function(data) {
                    assert.equal(data[0], 0x0, "seller must be empty");
                    assert.equal(data[1], "", "article's name must be empty");
                    assert.equal(data[2], "", "descryption must be empty");
                    assert.equal(data[3].toNumber(), 0, "price must be zero");
                });
    })

    it("should sell an article", function() {
        const SELLER = accounts[1];
        const ARTICLE_NAME = "Pixel";
        const DESCRYPTION = "Hey Google!";
        const PRICE = 2;
        return ChainList
                .deployed()
                .then(function(instance) {
                    instance1 = instance;
                    return instance1.sellArticle(ARTICLE_NAME,
                                                 DESCRYPTION, 
                                                 web3.toWei(PRICE, "ether"), 
                                                 {from: SELLER});
                })
                .then(function(){
                    return instance1.getArticle();
                })
                .then(function(data) {
                    assert.equal(data[0], SELLER, "seller must be " + SELLER);
                    assert.equal(data[1], ARTICLE_NAME, "article's name must be " + ARTICLE_NAME);
                    assert.equal(data[2], DESCRYPTION, "descryption must be " + DESCRYPTION);
                    assert.equal(data[3].toNumber(), web3.toWei(PRICE), "price must be " + PRICE);// price stored in the network as a BigNumber in wei.
                });
    })

    it("should trigger an event when a new article is sold", function() {
        const SELLER = accounts[2];
        const ARTICLE_NAME = "Pixel2";
        const DESCRYPTION = "HeyHey Google!";
        const PRICE = 2;
        return ChainList
                .deployed()
                .then(function(instance) {
                    return instance.sellArticle(ARTICLE_NAME, DESCRYPTION, web3.toWei(PRICE, "ether"), {from: SELLER});
                })
                .then(function(receipt){
                    assert.equal(receipt.logs.length, 
                                 1, 
                                 "one event should have been triggered");
                    assert.equal(receipt.logs[0].event, 
                                 "LogSellArticle", 
                                 "event should be LogSellArticle");
                    assert.equal(receipt.logs[0].args._seller, 
                                 SELLER, 
                                 "event seller must be " + SELLER);
                    assert.equal(receipt.logs[0].args._name, 
                                 ARTICLE_NAME, 
                                 "event article name must be " + ARTICLE_NAME);
                    assert.equal(receipt.logs[0].args._price.toNumber(), 
                                 web3.toWei(PRICE, "ether"), 
                                 "event article price must be " + web3.toWei(PRICE, "ether"));              
                });
    });

    /*
    it("should be failing", function() {
        return ChainList
                .deployed()
                .then(function(instance) {
                    return instance.getArticle();
                })
                .then(function(data) {
                    assert.equal(data[0], 0x0, "seller must be empty");
                    assert.equal(data[1], "", "article's name must be empty");
                    assert.equal(data[2], "", "descryption must be empty");
                    assert.equal(data[3].toNumber(), 1, "price must be zero");
                });
    })
    */
})