// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


library BetsLibrary{

    struct Gambler{

        address wallet;
        uint8 team;
        uint value;
        
    }

    struct Game{

        uint32 id;
        string team1;
        string team2;
        bool finished;
        string status;
    }

    enum Choice{
        team1,team2
    }

    

}