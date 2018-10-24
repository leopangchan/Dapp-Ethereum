App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  isLoading: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
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

  displayAccountInfo: function () {
    // Get the current account (Coinbase)
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function (err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function () {
    // the built (by truffle) smart contract's info is stored in ChainList.json
    // load the smart contract to an object, and give it a provider
    $.getJSON("ChainList.json", function (chainListArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      App.contracts.ChainList.setProvider(App.web3Provider);
      // listens to events
      App.listenToEvents();
      // retrieve the article from the contract
      return App.reloadArticles();
    })
  },

  reloadArticles: function () {
    if (App.isLoading) {
      return;
    }
    App.isLoading = !App.isLoading;

    // refresh account information because the balance might have changed
    App.displayAccountInfo();
    // retrieve the article placeholder and clear it
    let chainListInstance;

    App.contracts.ChainList
      .deployed()
      .then(function (instance) {
        chainListInstance = instance;
        return instance.getArticlesForSale();
      })
      .then(function (articleIds) {
        $('#articlesRow').empty();

        for (let id in articleIds) {
          var articleId = id;
          //console.log("articleId = " + articleId);
          chainListInstance
            .articles(articleId)
            .then(function (article) {
              console.log("[DEBUG] article = " + JSON.stringify(article));
              App.displayArticle(article[0], article[1], article[3],
                article[4], article[5]);
            });
        }
        App.isLoading = !App.isLoading;
      })
      .catch(function (err) {
        App.isLoading = !App.isLoading;
        console.log(JSON.stringify(err));
      });
  },

  displayArticle: function (id, seller, name, description, price) {
    const articlesRow = $("#articlesRow");
    const etherPrice = web3.fromWei(price, "ether");
    const articleTemplate = $("#articleTemplate");
    console.log("[DEBUG] displaying articleId = " + id);
    articleTemplate.find(".panel-title").text(name);
    articleTemplate.find(".article-description").text(description);
    articleTemplate.find(".article-price").text(etherPrice);
    articleTemplate.find(".btn-buy").attr("data-id", id);
    articleTemplate.find(".btn-buy").attr("data-value", etherPrice);

    if (seller === App.account) {
      articleTemplate.find(".article-seller").text("You");
      articleTemplate.find(".btn-buy").hide();
    } else {
      articleTemplate.find(".article-seller").text(seller);
      articleTemplate.find(".btn-buy").show();
    }

    articlesRow.append(articleTemplate.html());
  },

  sellArticle: function () {
    // retrieve the detail of the article
    var _article_name = $('#article_name').val();
    var _description = $('#article_description').val();
    var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

    if ((_article_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.ChainList
      .deployed()
      .then(function (instance) {
        return instance.sellArticle(_article_name, _description, _price, {
          from: App.account,
          gas: 500000
        });
      })
      .then(function (res) {
        //App.reloadArticles();
      })
      .catch(function (err) {
        console.error(err.message);
      });
  },

  buyArticle: function () {
    event.preventDefault();

    let _id = $(event.target).data("id");
    let _price = parseFloat($(event.target).data('value'));

    App.contracts.ChainList
      .deployed()
      .then(function (instance) {
        return instance.buyArticle(_id, {
          from: App.account,
          value: web3.toWei(_price, "ether"),
          gas: 500000
        });
      })
      .catch(function (err) {
        console.log(err);
      });
  },

  // listen to events triggered by the contract
  listenToEvents: function () {
    App.contracts.ChainList.deployed().then(function (instance) {
      instance.LogSellArticle({}, {}).watch(function (error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
      instance.LogBuyArticle({}, {}).watch(function (error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args.buyer + ' bought the article</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
