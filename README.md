# vehicle_poc
vehicle lifecycle management blockchain network

The network contains 4 Orgs
1) Manufacturer
2) Dealer
3) Insurance
4) Gdt (GovT)

and one solo orderer ( Not good for production. I will use Raft ordering service in furture).
All organization are the part of one channel

To start the network use ./start_network.sh command.

Chaincode is written in Node.js
