#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

#docker-compose -f docker-compose.yml down

#docker-compose -f docker-compose.yml up -d ca.example.com orderer.example.com peer0.Manufacturer.example.com couchdb
docker-compose up -d 
docker ps -a

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@Manufacturer.example.com/msp" peer0.Manufacturer.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx

# Join peer0.Manufacturer.example.com to the channel.

docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@Manufacturer.example.com/msp" peer0.Manufacturer.example.com peer channel join -b mychannel.block

docker cp peer0.Manufacturer.example.com:/opt/gopath/src/github.com/hyperledger/fabric/mychannel.block mychannel.block

docker cp mychannel.block peer0.Dealer.example.com:/opt/gopath/src/github.com/hyperledger/fabric/
docker cp mychannel.block peer0.Insurance.example.com:/opt/gopath/src/github.com/hyperledger/fabric/
docker cp mychannel.block peer0.Gdt.example.com:/opt/gopath/src/github.com/hyperledger/fabric/

docker exec -e "CORE_PEER_LOCALMSPID=DealerMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@Dealer.example.com/msp" peer0.Dealer.example.com peer channel join -b mychannel.block

docker exec -e "CORE_PEER_LOCALMSPID=InsuranceMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@Insurance.example.com/msp" peer0.Insurance.example.com peer channel join -b mychannel.block

docker exec -e "CORE_PEER_LOCALMSPID=GdtMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@Gdt.example.com/msp" peer0.Gdt.example.com peer channel join -b mychannel.block



