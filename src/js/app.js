App = {
    web3Provider: null,
    contracts: {},

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== "undefined") {
            App.web3Provider = web3.currentProvider;
        } else {
            // create a new provider talking with our local node (ganache)
            App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
        }
        web3 = new Web3(App.web3Provider);

        App.displayAccountInfo();

        return App.initContract();
    },

    displayAccountInfo: function() {
        // Get the current account (Coinbase)
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                $("#account").text(account);
                web3.eth.getBalance(account, function(err, balance){
                    if (err === null) {
                        $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
                    }
                });
            }
        });
    },

    initContract: function() {
        // the built (by truffle) smart contract's info is stored in ChainList.json
        // load the smart contract to an object, and give it a provider
        $.getJSON("ChainList.json", function(chainListArtifact) {
            // get the contract artifact file and use it to instantiate a truffle contract abstraction
            App.contracts.ChainList = TruffleContract(chainListArtifact);
            // set the provider for our contracts
            App.contracts.ChainList.setProvider(App.web3Provider);
            // retrieve the article from the contract
            return App.reloadArticles();
        })
    },

    reloadArticles: function() {
        // refresh account information because the balance might have changed
        App.displayAccountInfo();
        // retrieve the article placeholder and clear it
        $('#articlesRow').empty();

        App.contracts.ChainList
            .deployed()
            .then(function(instance) {
                return instance.getArticle();
            })
            .then(function(article) {
                if (article[0] == 0x0) { // check if a sender exists
                    // no article
                    return;
                }
                // retrieve the article template and fill it
                var articleTemplate = $('#articleTemplate');
                articleTemplate.find('.panel-title').text(article[1]);
                articleTemplate.find('.article-description').text(article[2]);
                articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));

                var seller = article[0];
                if (seller == App.account) {
                    seller = "You";
                }
                articleTemplate.find('.article-seller').text(seller);

                // add this article
                $('#articlesRow').append(articleTemplate.html());
            })
            .catch(function(err){
                console.error(err.message());
            });
    },

    sellArticle: function() {
        // retrieve the detail of the article
        var _article_name = $('#article_name').val();
        var _description = $('#article_description').val();
        var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

        if((_article_name.trim() == '') || (_price == 0)) {
            // nothing to sell
            return false;
        }

        App.contracts.ChainList
            .deployed()
            .then(function(instance) {
                return instance.sellArticle(_article_name, _description, _price, {
                        from: App.account,
                        gas: 500000
                    });
            })
            .then(function(res) {
                App.reloadArticles();
            })
            .catch(function(err) {
                console.error(err.message);
            });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
