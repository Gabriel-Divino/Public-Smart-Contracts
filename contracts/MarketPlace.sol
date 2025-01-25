// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MarketPlace {


    struct  Product{
        address seller;
        string name;
        uint256 value;
        uint16 stock;
    }

    struct Request{
        address buyer;
        Product product;
        uint16 quantity;
        uint256 totalValue;
    }

    uint16 private productId = 0;
    uint16 private requestId = 0;

    mapping(address => uint16[]) public productReference;
    mapping(address => uint16[]) public orderReference;

    mapping(uint16 => Product) public products;
    mapping(uint16 => Request) public requests;


    function addProduct(
        string memory _name,
        uint256 _value,
        uint16 _stock
    ) public
    {
        productId+=1;
        products[productId] = Product({
            seller : msg.sender,
            name : _name,
            value : _value,
            stock : _stock
        });

        productReference[msg.sender].push(productId);
    }


    function editProduct(
        uint16 id,
        string memory _name,
        uint256 _value,
        uint16 _stock  
    ) public {

        Product memory product = products[id];
        require(product.seller == msg.sender,"Acesso Negado");
        product.name = _name;
        product.value = _value;
        product.stock = _stock;
        products[id] = product;

    }

    function buyProduct(
        uint16 _productId,
        uint16 _quantity
    ) public payable
    {
        require(_productId <= productId,"Produto nao existe");
        Product memory product = products[_productId];
        require(msg.sender != product.seller,"Vendedor nao pode comprar o proprio produto");
        require(product.stock != 0,"Estoque zerado");
        require(_quantity <= product.stock,"Nao ha essa quantidade de  produtos no estoque");
        uint256 totalValue = product.value  * _quantity;
        require(msg.value == totalValue,"Valor insuficiente para compra");

        payable(product.seller).transfer(msg.value);
        requestId+=1;
        requests[requestId] = Request({
            buyer : msg.sender,
            product : product,
            quantity : uint16(_quantity),
            totalValue : msg.value
        });

        orderReference[msg.sender].push(requestId);
        product.stock = product.stock - _quantity;
        products[_productId] = product;

    }


}
