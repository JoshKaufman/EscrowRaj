"use strict";angular.module("EscrowRajApp",["ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"about"}).when("/buyer",{templateUrl:"views/buyer.html",controller:"BuyerCtrl",controllerAs:"buyer",access:{requiresLogin:!0}}).when("/seller",{templateUrl:"views/seller.html",controller:"SellerCtrl",controllerAs:"seller",access:{requiresLogin:!0}}).when("/login",{templateUrl:"views/login.html",controller:"LoginCtrl"}).when("/signup",{templateUrl:"views/signup.html",controller:"SignupCtrl"}).when("/contract/:contractAddress",{templateUrl:"views/contract.html",controller:"ContractCtrl"}).when("/arbitrators",{templateUrl:"views/arbitrators.html",controller:"ArbitratorsCtrl"}).otherwise({redirectTo:"/"})}]).run(["$rootScope","$location","auth",function(a,b,c){a.$on("$routeChangeStart",function(d,e){e.access&&e.access.requiresLogin&&(c.isAuthenticated()||(a.preLoginLocation=b.path(),b.path("/login")))}),a.$on("user:authenticated",function(c,d){a.authenticated=!0,a.preLoginLocation||(a.preLoginLocation="/"),b.path("/seller"),a.$apply()}),a.$on("$viewContentLoaded",function(){$(".button-collapse").sideNav(),$(".tooltipped").tooltip({delay:100})})}]).config(["$httpProvider",function(a){a.defaults.useXDomain=!0,delete a.defaults.headers.common["X-Requested-With"]}]),angular.module("EscrowRajApp").controller("MainCtrl",function(){}),angular.module("EscrowRajApp").controller("AboutCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("EscrowRajApp").controller("BuyerCtrl",["$scope","$location","escrow",function(a,b,c){a.preFillAddresses=[{name:"Kevin",address:"46fa4c2d60305df40a74b8cbc04773d9bd5ad295"},{name:"Josh",address:"041e0f42d6efddc7beab4143b30730dbe834f299"}],a.encKeySecret="",a.sellerAddress="",a.etherAmount=1,a.gasPrice=100,a.memo="",a.loadSeller=function(b){a.sellerAddress=b},a.sendContract=function(){a.inprogress=!0,Materialize.toast("Submitting the contract to the Ethereum network. Please wait",4e3);var d=c.createContract(a.encKeySecret);c.submitContract(d,{sellerAddress:a.sellerAddress,gasPrice:a.gasPrice,etherAmount:a.etherAmount,memo:a.memo},a.encKeySecret).then(function(c){a.inprogress=!1,b.path("/contract/"+c.address.toString())})}}]),angular.module("EscrowRajApp").controller("SellerCtrl",["$scope","$location",function(a,b){a.contractAddress="",a.loadContract=function(){""!==a.contractAddress&&b.path("/contract/"+a.contractAddress)}}]),angular.module("EscrowRajApp").controller("LoginCtrl",["$scope","auth",function(a,b){a.email={value:"",valid:null},a.password={value:"",valid:null},a.address={value:"",valid:null};var c=function(a){return""===a.value.trim()?a.valid=!1:a.valid=!0,a.valid};a.authenticate=function(){c(a.email)&&c(a.password)&&c(a.address)&&b.login({email:a.email.value,loginpass:a.password.value,address:a.address.value})}}]),angular.module("EscrowRajApp").controller("SignupCtrl",["$scope","auth",function(a,b){var c;a.email={value:"",valid:null},a.seed="",a.encPassword={value:"",valid:null},a.loginPassword={value:"",valid:null},a.address="";var d=function(a){return""===a.value.trim()?a.valid=!1:a.valid=!0,a.valid};a.signup=function(){var e={email:"",loginpass:""};""===a.seed&&a.randomizeSeedOption&&(a.seed=ethlightjs.keystore.generateRandomSeed()),d(a.email)&&d(a.loginPassword)&&d(a.encPassword)&&(c=new ethlightjs.keystore(a.seed,a.encPassword.value),a.address=c.generateNewAddress(a.encPassword.value),e.email=a.email.value,e.loginpass=a.loginPassword.value,e.address=a.address,b.register(e,c))},a.randomizeSeed=function(){a.seed=ethlightjs.keystore.generateRandomSeed()},a.randomizeSeed()}]),angular.module("EscrowRajApp").service("auth",["$http","$q","$rootScope",function(a,b,c){var d=window.apiURL+"/eth/v1.0",e=window.ethlightjs,f=sessionStorage.getItem("user");this.user=f?e.keystore.deserialize(f):"",c.authenticated=this.user,this.isAuthenticated=function(){return!!this.user},this.getUser=function(){return this.user},this.getBalance=function(){a.get(d+"/account?address="+this.user.addresses[0]).then(function(a){c.accountBalance=web3.fromWei(a.data[0].balance,"ether")})},this.register=function(b,c){submitUser({email:b.email,loginpass:b.loginpass,app:window.appName,address:b.address,enckey:c.serialize()},function(b){this.user=b;var c={address:this.user.address.address};a.post(d+"/faucet",c)}.bind(this))},this.login=function(a){var d=b.defer();return retrieveUser({app:window.appName,email:a.email,loginpass:a.loginpass,address:a.address},function(a){this.user=a,sessionStorage.setItem("user",this.user.serialize()),c.$broadcast("user:authenticated"),this.getBalance(),d.resolve(a)}.bind(this)),d.promise},this.loadAccountInfo=function(){},this.isAuthenticated()&&this.getBalance()}]),angular.module("EscrowRajApp").service("escrow",["$http","auth","$q",function(a,b,c){var d,e=(window.apiURL+"/eth/v1.0",window.blockapi);this.contract=null,this.contract=window.EscrowRaj,this.buildContractSource=function(a){var b=e.Solidity("");return b.vmCode=a.vmCode,b.symtab=a.symtab,b},this.createContract=function(a){return this.buildContractSource(this.contract)},this.submitContract=function(a,f,g){var h=c.defer();d=b.getUser();var i=d.getAddresses()[0],j=d.exportPrivateKey(i,g),k={apiURL:window.apiURL,value:parseInt(f.etherAmount),fromAccount:e.Contract({privkey:j}),gasPrice:parseInt(f.gasPrice),gasLimit:2e6};return a.submit(k,function(a){var b=function(){h.resolve(a)};a.call(apiURL,b,{funcName:"setSellerAndAmt",value:parseInt(f.etherAmount),fromAccount:e.Contract({privkey:j}),gasPrice:parseInt(f.gasPrice),gasLimit:2e5},{sellerAddress:f.sellerAddress,amt:f.etherAmount})}),h.promise},this.getContractInfo=function(a){var b=c.defer(),d=e.Contract({address:a,symtab:this.contract.symtab});return d.sync(window.apiURL,function(){b.resolve(d)}),b.promise}}]),angular.module("EscrowRajApp").controller("ContractCtrl",["$scope","$routeParams","escrow","auth",function(a,b,c,d){var e;a.contract={},a.contract.address=b.contractAddress;var f=d.getUser(),g=function(){c.getContractInfo(a.contract.address).then(function(b){e=b,e&&(a.contract.seller=e.get.seller,a.contract.buyer=e.get.buyer,a.contract.amount=e.get.amount,a.contract.balance=e.balance.toString())})},h=function(){a.contract.buyer==f.addresses[0]&&(a.contract.balance=0,Materialize.toast("Seller has been paid",4e3)),a.$apply()};a.releaseFunds=function(b){var c=d.getUser(),f=c.getAddresses()[0],g=c.exportPrivateKey(f,a.passphrase);e.call(window.apiURL,h,{funcName:"release",value:0,fromAccount:blockapi.Contract({privkey:g}),gasPrice:100,gasLimit:2e5},{})},g()}]);var EscrowRaj={vmCode:"60606040525b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b610248806100406000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806386d1a69f1461004f578063ac4c25b21461005c578063c4969b8f146100695761004d565b005b61005a6004506100c6565b005b6100676004506101b4565b005b610080600480359060200180359060200150610082565b005b81600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff0219169083021790555080341015156100c157806002600050819055505b5b5050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156101b157600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000600260005054604051809050600060405180830381858888f1935050505050600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b5b565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561024557600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b5b56",symtab:{EscrowRaj:{"void":{functionDomain:[],functionArgs:[],functionHash:"ac4c25b2",bytesUsed:"0",jsType:"Function",solidityType:"function() returns ()"},amount:{atStorageKey:"2",bytesUsed:"20",jsType:"Int",solidityType:"uint256"},seller:{atStorageKey:"1",bytesUsed:"14",jsType:"Address",solidityType:"address"},release:{functionDomain:[],functionArgs:[],functionHash:"86d1a69f",bytesUsed:"0",jsType:"Function",solidityType:"function() returns ()"},setSellerAndAmt:{functionDomain:[{atStorageKey:"0",bytesUsed:"14",jsType:"Address",solidityType:"address"},{atStorageKey:"1",bytesUsed:"20",jsType:"Int",solidityType:"uint256"}],functionArgs:["sellerAddress","amt"],functionHash:"c4969b8f",bytesUsed:"0",jsType:"Function",solidityType:"function(address,uint256) returns ()"},buyer:{atStorageKey:"0",bytesUsed:"14",jsType:"Address",solidityType:"address"}}}};angular.module("EscrowRajApp").controller("ArbitratorsCtrl",["$scope","arbitratorService",function(a,b){b.getArbitrators().then(function(b){a.arbitrators=b.data})}]),angular.module("EscrowRajApp").service("arbitratorService",["$http",function(a){this.getArbitrators=function(){return a.get("https://www.bitrated.com/users.json?role=arbiter")}}]),angular.module("EscrowRajApp").directive("ngEnter",function(){return{restrict:"A",link:function(a,b,c){b.bind("keydown keypress",function(b){13===b.which&&(a.$apply(function(){a.$eval(c.ngEnter)}),b.preventDefault())})}}}),angular.module("EscrowRajApp").run(["$templateCache",function(a){a.put("views/about.html","<p>This is the about view.</p>"),a.put("views/arbitrators.html",'<div class="row"> <ul class="col s12"> <li ng-repeat="arbitrator in arbitrators" class="arbitrators card hoverable s3"> <div class="card-image waves-effect waves-block waves-light"> <img class="activator" src="http://static.bitrated.com/users/{{arbitrator.username}}-full.png"> </div> <div class="card-content"> <span class="card-title activator grey-text text-darken-4">{{arbitrator.full_name}}<i class="material-icons right">more_vert</i></span> <p><a href="#">{{arbitrator.title}}</a></p> </div> <div class="card-reveal"> <span class="card-title grey-text text-darken-4">{{arbitrator.full_name}}<i class="material-icons right">close</i></span> <p>Rating: {{arbitrator.scores.bitrating}}</p> <p>Reviews: {{arbitrator.scores.totals.reviews}}</p> <p>Vouches: {{arbitrator.scores.totals.vouches}}</p> <p>Linked Accounts: {{arbitrator.scores.totals.bitrating}}</p> </div> </li> </ul> </div>'),a.put("views/buyer.html",'<div class="row"> <form class="col s12"> <div class="row"> <div class="input-field col s8"> <input id="seller" type="text" class="validate" ng-model="sellerAddress"> <label for="seller" ng-class="{\'active\': sellerAddress}">Seller\'s Address</label> </div> <div class="input-field col s4"> Prefill Addresses: <a ng-click="loadSeller(address.address)" class="prefill-link" ng-repeat="address in preFillAddresses">{{address.name}}</a> </div> </div> <div class="row"> <div class="input-field col s12"> <input id="amount" type="text" class="validate" ng-model="etherAmount"> <label for="amount" ng-class="{\'active\': etherAmount}">Amount (in ETH)</label> </div> </div> <div class="row"> <div class="input-field col s12"> <textarea id="details" class="materialize-textarea" ng-model="memo"></textarea> <label for="details" ng-class="{\'active\': memo}">Memo</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input type="text" ng-model="encKeySecret" id="encrytionPassword"> <label for="encrytionPassword" ng-class="{\'active\': encKeySecret}">Encryption Password</label> </div> </div> <div class="row"> <div class="col s12"> <div class="preloader-wrapper active" ng-show="inprogress"> <div class="spinner-layer spinner-blue-only"> <div class="circle-clipper left"> <div class="circle"></div> </div> </div> </div> <button class="btn btn-large waves-effect waves-light" ng-click="sendContract()" ng-hide="inprogress">Send Contract</button> </div> </div> </form> </div>'),a.put("views/contract.html",'<h3>Contract Details</h3> <p>Address: {{contract.address}}</p> <div ng-show="contract.amount"> <p>Balance: {{contract.balance}}</p> <p>Seller: {{contract.seller}}</p> <p>Buyer: {{contract.buyer}}</p> <p>Amount: {{contract.amount}}</p> <div class="control-panel" ng-show="authenticated"> <div class="input-field col s8"> <input type="text" class="validate" value="" ng-model="passphrase" id="seed" placeholder="Enter your passphrase to release funds"> </div> <button class="btn" ng-click="releaseFunds()" ng-show="contract.balance">Release Funds</button> </div> </div> <div ng-hide="contract.amount"> <p>Contract does not exist</p> </div>'),a.put("views/login.html",'<h3 class="header">Login</h3> <div class="row"> <form class="col s12"> <div class="row"> <div class="input-field col s12" ng-class="{\'has-error\': email.valid === false}"> <input type="email" class="validate" id="email" ng-model="email.value"> <label for="email">Email</label> </div> </div> <div class="row"> <div class="input-field col s12" ng-class="{\'has-error\': password.valid === false}"> <input type="password" class="validate" id="password" ng-model="password.value"> <label for="password">Password</label> </div> </div> <div class="row"> <div class="input-field col s12" ng-class="{\'has-error\': address.valid === false}"> <input type="text" class="validate" id="address" ng-model="address.value"> <label for="address">Address</label> </div> </div> <div class="row"> <div class="input-field col s12"> <button type="submit" class="btn btn-default" ng-click="authenticate()">Log in</button> </div> </div> </form> </div>'),a.put("views/main.html",'<div class="section no-pad-bot" id="index-banner"> <h1 class="header center"> <div class="card-panel z-index-0"> <a ng-href="#/seller">I am a Seller</a> </div> <div class="card-panel z-index-0"> <a ng-href="#/buyer">I am a Buyer</a> </div> </h1> </div>'),a.put("views/seller.html",'<div class="row"> <!--<p class="flow-text">Sellers currently are unable to create EscrowRaj contracts, only buyers can.</p>--> <p class="flow-text">Ask the seller to create the contract and deposit the amount in ETH.</p> <p class="flow-text">Look up the contract before shipping the product:</p> <div class="input-field col s12"> <input type="text" ng-model="contractAddress" id="contractAddress" ng-enter="loadContract()"> <label for="contractAddress">Contract Address</label> </div> <button class="btn btn-primary" ng-click="loadContract()">Load Contract</button> </div>'),a.put("views/signup.html",'<div class="col s12 offset-m2 l6 offset-l3"> <div class="card-panel lighten-5 z-index-1"> <div class="row valign-wrapper"> <div class="col s2"> <a href="http://blockapps.net/" target="_blank"><img src="http://hacknet.blockapps.net/static/images/logo.png" alt="" class="responsive-img"></a> </div> <div class="col s10"> <span class="black-text"> EscrowRaj is powered by <a href="http://blockapps.net/" target="_blank">BlockApps</a>. EscrowRaj also runs on a Test network. Your testnet wallet will be generated locally, but encrypted and stored at BlockApps servers. </span> </div> </div> </div> </div> <h2 class="header">Signup</h2> <div class="row"> <form class="col s12"> <div class="row"> <div class="input-field col s12 tooltipped" data-position="top" data-delay="50" data-tooltip="Your email address for BlockApps signup" ng-class="{\'has-error\': email.valid === false}"> <input type="email" class="validate" id="email" ng-model="email.value"> <label for="email">Email</label> </div> </div> <div class="row"> <div class="input-field col s12 tooltipped" data-position="top" data-delay="50" data-tooltip="Only used for BlockApps authentication" ng-class="{\'has-error\': loginPassword.valid === false}"> <input type="password" class="validate" ng-model="loginPassword.value" id="loginPassword"> <label for="loginPassword">Password</label> </div> </div> <div class="row"> <div class="input-field col s9 tooltipped" data-position="top" data-delay="50" data-tooltip="Please write down this seed, it can be used to recover your private key."> <input type="text" class="validate" value="" ng-model="seed" id="seed"> <label for="seed" ng-class="{\'active\': seed}">12 word mnemonic seed</label> </div> <div class="input-field col s3"> <button ng-click="randomizeSeed()" class="btn">Randomize</button> </div> </div> <div class="row"> <div class="input-field col s12 tooltipped" ng-class="{\'has-error\': encPassword.valid === false}" data-position="top" data-delay="50" data-tooltip="Your need to enter this password before performing any transaction on the network."> <input type="password" class="validate" ng-model="encPassword.value" id="encryptionPassword"> <label for="encryptionPassword">Encryption Password</label> </div> </div> <div class="row"> <div class="input-field col s12" ng-show="address"> <input disabled type="text" id="address" class="value" ng-model="address" ng-show="address"> <label for="address" class="active">Wallet Address</label> </div> </div> <div class="row"> <div class="input-field col s6" ng-hide="address"> <button type="submit" class="btn btn-default" ng-click="signup()">Signup</button> </div> <div class="input-field col s6" ng-show="address"> <a class="btn waves-effect waves-light" ng-href="#/"><i class="material-icons left">input</i>Proceed</a> </div> </div> </form> </div>')}]);