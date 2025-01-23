// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const PostsModule = buildModule("PostsModule", (m) => {


  const posts = m.contract("Posts");

  return { posts };
});

export default PostsModule;
