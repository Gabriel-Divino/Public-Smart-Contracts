import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

interface AddProduct{

    name : string;
    value : bigint;
    stock : number;

}

interface ProductInterface{

    seller : string;
    name : string;
    value : bigint;
    stock : bigint;

}

interface RequestInterface {
    buyer : string;
    product : ProductInterface,
    quantity : bigint;
    totalValue : bigint
}


describe("MarketPlace", ()=>{

    const value : bigint = ethers.parseEther("0.005119214128494953");

    async function deployFixture() {
        const [owner, account1 , account2] = await hre.ethers.getSigners();
    
        const MarketPlace = await hre.ethers.getContractFactory("MarketPlace");
        const marketPlace = await MarketPlace.deploy();
    
        return { marketPlace, owner, account1 , account2 };
    }

    it('Add Product' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct : AddProduct  = {
            name : "Produto Teste",
            value : value,
            stock:10
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );

        const firstProduct : ProductInterface = await marketPlace.products(1);
        const reference : bigint = await marketPlace.productReference(owner.address,0);
        /*console.log(firstProduct);
        console.log(reference);*/
        expect(firstProduct.name).to.equal(newProduct.name);
        expect(reference).to.equal(1);

    })

    it('Edit Product (success)', async ()=>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct : AddProduct  = {
            name : "Produto Teste",
            value : value,
            stock:10
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );
        let firstProduct : ProductInterface = await marketPlace.products(1);
        //console.log(firstProduct);

        const newStock : number = 20;

        await marketPlace.editProduct(
            1,
            newProduct.name,
            newProduct.value,
            newStock
        );

        firstProduct  = await marketPlace.products(1);
        //console.log(firstProduct);
        expect(firstProduct.stock).to.equal(newStock);
    })


    it('Edit Product (error : Access denied)' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct : AddProduct  = {
            name : "Produto Teste",
            value : value,
            stock:10
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );
        
        const contract = marketPlace.connect(account1);
        const newStock : number = 20;


        await expect(contract.editProduct(1,newProduct.name,newProduct.value,newStock))
            .to.revertedWith("Acesso Negado");
    })


    it('Buy Product (success)' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct   =  {
            name : "Produto Teste",
            value : value,
            stock:10
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );

        //console.log(newProduct);

        const contract = marketPlace.connect(account1);
        const quantityPurchased  : number =  1;
        
        await contract.buyProduct(1,quantityPurchased,{value : value});

        const currentStock : number = newProduct.stock - quantityPurchased;

        let firstProduct : ProductInterface = await marketPlace.products(1);
        let firstRequest : RequestInterface = await marketPlace.requests(1);
        const reference : bigint = await marketPlace.orderReference(account1.address,0);

        /*console.log(firstProduct);
        console.log(firstRequest);*/
        expect(firstProduct.stock).to.equal(currentStock);
        expect(firstRequest.buyer).to.equal(account1.address);
        expect(reference).to.equal(1);


    })


    it('Buy Product (error : product does not exist)', async  () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        await expect(marketPlace.buyProduct(1,1)).to.revertedWith('Produto nao existe')
        
    })

    it('Buy Product (error : Seller cannot buy own product)' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct   =  {
            name : "Produto Teste",
            value : value,
            stock:10
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );

        await expect(marketPlace.buyProduct(1,1))
            .to.revertedWith('Vendedor nao pode comprar o proprio produto');


    })

    it('Buy Product (error : zero stock)' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct   =  {
            name : "Produto Teste",
            value : value,
            stock:0
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );


        const contract = marketPlace.connect(account1);
        const quantityPurchased  : number =  1;
        

        await expect(contract.buyProduct(1,quantityPurchased,{value : value}))
            .to.revertedWith('Estoque zerado');

    })


    it('Buy Product (error : There are no such products in stock)' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();

        const newProduct   =  {
            name : "Produto Teste",
            value : value,
            stock:1
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );


        const contract = marketPlace.connect(account1);
        const quantityPurchased  : number =  2;
        

        await expect(contract.buyProduct(1,quantityPurchased,{value : value}))
            .to.revertedWith('Nao ha essa quantidade de  produtos no estoque');

    })


    it('Buy Product (error : Insufficient value for purchase)' , async () =>{
        const { marketPlace, owner, account1 , account2 } = await deployFixture();
        console.log(value);
        const newProduct   =  {
            name : "Produto Teste",
            value : value,
            stock:10
        };

        await marketPlace.addProduct(
            newProduct.name,
            newProduct.value,
            newProduct.stock
        );


        const contract = marketPlace.connect(account1);
        const quantityPurchased  : number =  2;

        const newValue : bigint = ethers.parseEther("0.001");
        

        await expect(contract.buyProduct(1,quantityPurchased,{value : newValue}))
            .to.revertedWith('Valor insuficiente para compra');

    })



})


