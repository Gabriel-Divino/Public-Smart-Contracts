import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";


interface PostsInterface{
  title : string;
  description : string;
}

describe("Posts", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Posts = await hre.ethers.getContractFactory("Posts");
    const posts = await Posts.deploy();

    return { posts, owner, otherAccount };
  }


  it('Add Posts',async function name() {
    const { posts, owner, otherAccount } = await deployFixture();

    const newPost : PostsInterface = {
      title:"Ethereum",
      description :"Ethereum é uma plataforma descentralizada capaz de executar contratos inteligentes e aplicações descentralizadas usando a tecnologia blockchain."
    };

    await posts.addPosts(newPost.title,newPost.description);
    const firstPost : PostsInterface = await posts.posts(owner,0);
    expect(firstPost.title).to.equal(newPost.title);

  })

  it("Edit Post", async function () {

    const {owner , otherAccount , posts} = await deployFixture();
    const newPost : PostsInterface = {
      title:"Ether",
      description :"O ether é negociado nas corretoras com o código ETH."
    };

    await posts.addPosts(newPost.title,newPost.description);
    let firstPost : PostsInterface = await posts.posts(owner,0);
    //console.log(firstPost);

    const editPost : PostsInterface = {
      title : "Ether (Moeda)",
      description : "O Ether é uma moeda digital utilizada na plataforma do Ethereum"
    };

    await posts.updatePost(0,editPost.title,editPost.description);
    firstPost = await posts.posts(owner,0);
    //console.log(firstPost);
    expect(firstPost.title).to.equal(editPost.title);

  })

  it('Delete Posts', async function () {
    const {posts , otherAccount , owner} = await deployFixture();
    const newPost : PostsInterface = {
      title:"Ethereum",
      description :"Ethereum é uma plataforma descentralizada capaz de executar contratos inteligentes e aplicações descentralizadas usando a tecnologia blockchain."
    };

    await posts.addPosts(newPost.title,newPost.description);
    let firstPost : PostsInterface = await posts.posts(owner,0);
    //console.log(firstPost);

    await posts.deletePost(0);

    firstPost =  await posts.posts(owner,0);
    //console.log(firstPost);
    expect(firstPost.title).to.equal("");

  
  })

  it('Get Posts', async function () {
    const {posts , owner , otherAccount } = await deployFixture();
    const contract =  posts.connect(otherAccount);

    const newPosts : PostsInterface[] = [
      {
        title:"Ethereum",
        description :"Ethereum é uma plataforma descentralizada capaz de executar contratos inteligentes e aplicações descentralizadas usando a tecnologia blockchain."
      },
      {
        title:"Ether",
        description :"O ether é negociado nas corretoras com o código ETH."  
      }

    ]
    
    for(let post of newPosts){
      await contract.addPosts(post.title,post.description);
    }

    const getPosts : PostsInterface[] = await  posts.getPostsFromAddress(otherAccount);
    //console.log(getPosts)
    expect(getPosts.length).to.equal(2);

  })


  
});
