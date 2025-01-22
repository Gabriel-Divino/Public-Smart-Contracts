/**
 *Submitted for verification at Etherscan.io on 2025-01-22
*/

// SPDX-License-Identifier: MIT
//Link do contrato na rede Sepolia : https://sepolia.etherscan.io/address/0xBFFEC5FC50aCA3F2A1F95a8E36BEf74b694E8901
//Contrato publicado via Remix

pragma solidity >=0.8.12 <0.9.0;



contract Posts{

    struct Post{

        string title;
        string description;
    }

    mapping(address => Post[]) public posts;

    function addPosts(string memory _title , string memory _description ) public {
        posts[msg.sender].push(Post({
            title:_title,
            description:_description
        }));
    }

    function updatePost(
        uint32 index,
        string memory _title 
        ,string memory _description
    ) public 
    {
        posts[msg.sender][index] = Post({
            title:_title,
            description:_description
        });
    }

    function deletePost(uint32 index) public {
        delete posts[msg.sender][index];
    }

    function getPostsFromAddress(address wallet) public view returns (Post[] memory){
        Post[] memory postsUser = posts[wallet];
        return postsUser;
    }


}