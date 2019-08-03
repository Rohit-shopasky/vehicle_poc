// ====CHAINCODE EXECUTION SAMPLES (CLI) ==================

// ==== Invoke Vehicles ====
// peer chaincode invoke -C myc1 -n Vehicles -c '{"Args":["initVehicle","Vehicle1","blue","35","tom"]}'
// peer chaincode invoke -C myc1 -n Vehicles -c '{"Args":["initVehicle","Vehicle2","red","50","tom"]}'
// peer chaincode invoke -C myc1 -n Vehicles -c '{"Args":["initVehicle","Vehicle3","blue","70","tom"]}'
// peer chaincode invoke -C myc1 -n Vehicles -c '{"Args":["transferVehicle","Vehicle2","jerry"]}'
// peer chaincode invoke -C myc1 -n Vehicles -c '{"Args":["transferVehiclesBasedOnColor","blue","jerry"]}'
// peer chaincode invoke -C myc1 -n Vehicles -c '{"Args":["delete","Vehicle1"]}'

// ==== Query Vehicles ====
// peer chaincode query -C myc1 -n Vehicles -c '{"Args":["readVehicle","Vehicle1"]}'
// peer chaincode query -C myc1 -n Vehicles -c '{"Args":["getVehiclesByRange","Vehicle1","Vehicle3"]}'
// peer chaincode query -C myc1 -n Vehicles -c '{"Args":["getHistoryForVehicle","Vehicle1"]}'

// Rich Query (Only supported if CouchDB is used as state database):
//   peer chaincode query -C myc1 -n Vehicles -c '{"Args":["queryVehiclesByOwner","tom"]}'
//   peer chaincode query -C myc1 -n Vehicles -c '{"Args":["queryVehicles","{\"selector\":{\"owner\":\"tom\"}}"]}'

//The following examples demonstrate creating indexes on CouchDB
//Example hostVIN_number:port configurations
//
//Docker or vagrant environments:
// http://couchdb:5984/
//
//Inside couchdb docker container
// http://127.0.0.1:5984/

// Index for chaincodeid, docType, owner.
// Note that docType and owner fields must be prefixed with the "data" wrapper
// chaincodeid must be added for all queries
//
// Definition for use with Fauxton interface
// {"index":{"fields":["chaincodeid","data.docType","data.owner"]},"ddoc":"indexOwnerDoc", "VIN_number":"indexOwner","type":"json"}
//
// example curl definition for use with command line
// curl -i -X POST -H "Content-Type: application/json" -d "{\"index\":{\"fields\":[\"chaincodeid\",\"data.docType\",\"data.owner\"]},\"VIN_number\":\"indexOwner\",\"ddoc\":\"indexOwnerDoc\",\"type\":\"json\"}" http://hostVIN_number:port/myc1/_index
//

// Index for chaincodeid, docType, owner, Model (descending order).
// Note that docType, owner and Model fields must be prefixed with the "data" wrapper
// chaincodeid must be added for all queries
//
// Definition for use with Fauxton interface
// {"index":{"fields":[{"data.Model":"desc"},{"chaincodeid":"desc"},{"data.docType":"desc"},{"data.owner":"desc"}]},"ddoc":"indexModelSortDoc", "VIN_number":"indexModelSortDesc","type":"json"}
//
// example curl definition for use with command line
// curl -i -X POST -H "Content-Type: application/json" -d "{\"index\":{\"fields\":[{\"data.Model\":\"desc\"},{\"chaincodeid\":\"desc\"},{\"data.docType\":\"desc\"},{\"data.owner\":\"desc\"}]},\"ddoc\":\"indexModelSortDoc\", \"VIN_number\":\"indexModelSortDesc\",\"type\":\"json\"}" http://hostVIN_number:port/myc1/_index

// Rich Query with index design doc and index VIN_number specified (Only supported if CouchDB is used as state database):
//   peer chaincode query -C myc1 -n Vehicles -c '{"Args":["queryVehicles","{\"selector\":{\"docType\":\"Vehicle\",\"owner\":\"tom\"}, \"use_index\":[\"_design/indexOwnerDoc\", \"indexOwner\"]}"]}'

// Rich Query with index design doc specified only (Only supported if CouchDB is used as state database):
//   peer chaincode query -C myc1 -n Vehicles -c '{"Args":["queryVehicles","{\"selector\":{\"docType\":{\"$eq\":\"Vehicle\"},\"owner\":{\"$eq\":\"tom\"},\"Model\":{\"$gt\":0}},\"fields\":[\"docType\",\"owner\",\"Model\"],\"sort\":[{\"Model\":\"desc\"}],\"use_index\":\"_design/indexModelSortDoc\"}"]}'

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type Vehicle struct {
	ObjectType string `json:"docType"`    //docType is used to distinguish the various types of objects in state database
	VIN_number string `json:"VIN_number"` //the fieldtags are needed to keep case from bouncing around
	Color      string `json:"color"`
	Model      int    `json:"Model"`
	Owner      string `json:"owner"`
}

// ===================================================================================
// Main
// ===================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init initializes chaincode
// ===========================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke - Our entry point for Invocations
// ========================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)

	// Handle different functions
	if function == "initVehicle" { //create a new Vehicle
		return t.initVehicle(stub, args)
	} else if function == "readVehicle" { //read a Vehicle
		return t.readVehicle(stub, args)
	} else if function == "transferVehicle" { //change owner of a specific Vehicle
		return t.transferVehicle(stub, args)
	} else if function == "transferVehiclesBasedOnColor" { //transfer all Vehicles of a certain color
		return t.transferVehiclesBasedOnColor(stub, args)
	} else if function == "delete" { //delete a Vehicle
		return t.delete(stub, args)
	} else if function == "queryVehiclesByOwner" { //find Vehicles for owner X using rich query
		return t.queryVehiclesByOwner(stub, args)
	} else if function == "queryVehicles" { //find Vehicles based on an ad hoc rich query
		return t.queryVehicles(stub, args)
	} else if function == "getHistoryForVehicle" { //get history of values for a Vehicle
		return t.getHistoryForVehicle(stub, args)
	} else if function == "getVehiclesByRange" { //get Vehicles based on range query
		return t.getVehiclesByRange(stub, args)
	}

	fmt.Println("invoke did not find func: " + function) //error
	return shim.Error("Received unknown function invocation")
}

// ============================================================
// initVehicle - create a new Vehicle, store into chaincode state
// ============================================================
func (t *SimpleChaincode) initVehicle(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	//   0       1       2     3
	// "asdf", "blue", "35", "bob"
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	// ==== Input sanitation ====
	fmt.Println("- start init Vehicle")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
	VehicleVIN_number := args[0]
	color := strings.ToLower(args[1])
	owner := strings.ToLower(args[3])
	Model, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("3rd argument must be a numeric string")
	}

	// ==== Check if Vehicle already exists ====
	VehicleAsBytes, err := stub.GetPrivateData("collection1", VehicleVIN_number)
	if err != nil {
		return shim.Error("Failed to get Vehicle: " + err.Error())
	} else if VehicleAsBytes != nil {
		fmt.Println("This Vehicle already exists: " + VehicleVIN_number)
		return shim.Error("This Vehicle already exists: " + VehicleVIN_number)
	}

	// ==== Create Vehicle object and marshal to JSON ====
	objectType := "Vehicle"
	Vehicle := &Vehicle{objectType, VehicleVIN_number, color, Model, owner}
	VehicleJSONasBytes, err := json.Marshal(Vehicle)
	if err != nil {
		return shim.Error(err.Error())
	}
	//Alternatively, build the Vehicle json string manually if you don't want to use struct marshalling
	//VehicleJSONasString := `{"docType":"Vehicle",  "VIN_number": "` + VehicleVIN_number + `", "color": "` + color + `", "Model": ` + strconv.Itoa(Model) + `, "owner": "` + owner + `"}`
	//VehicleJSONasBytes := []byte(str)

	// === Save Vehicle to state ===
	err = stub.PutPrivateData("collection1", VehicleVIN_number, VehicleJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	/*
		//  ==== Index the Vehicle to enable color-based range queries, e.g. return all blue Vehicles ====
		//  An 'index' is a normal key/value entry in state.
		//  The key is a composite key, with the elements that you want to range query on listed first.
		//  In our case, the composite key is based on indexVIN_number~color~VIN_number.
		//  This will enable very efficient state range queries based on composite keys matching indexVIN_number~color~*
		indexVIN_number := "color~VIN_number"
		colorVIN_numberIndexKey, err := stub.CreateCompositeKey(indexVIN_number, []string{Vehicle.Color, Vehicle.VIN_number})
		if err != nil {
			return shim.Error(err.Error())
		}
		//  Save index entry to state. Only the key VIN_number is needed, no need to store a duplicate copy of the Vehicle.
		//  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
		value := []byte{0x00}
		stub.PutPrivateData("collection1", colorVIN_numberIndexKey, value)
	*/
	// ==== Vehicle saved and indexed. Return success ====
	fmt.Println("- end init Vehicle")
	return shim.Success(nil)
}

// ===============================================
// readVehicle - read a Vehicle from chaincode state
// ===============================================
func (t *SimpleChaincode) readVehicle(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var VIN_number, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting VIN_number of the Vehicle to query")
	}

	VIN_number = args[0]
	valAsbytes, err := stub.GetPrivateData("collection1", VIN_number) //get the Vehicle from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + VIN_number + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Vehicle does not exist: " + VIN_number + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ==================================================
// delete - remove a Vehicle key/value pair from state
// ==================================================
func (t *SimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var jsonResp string
	var VehicleJSON Vehicle
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	VehicleVIN_number := args[0]

	// to maintain the color~VIN_number index, we need to read the Vehicle first and get its color
	valAsbytes, err := stub.GetPrivateData("collection1", VehicleVIN_number) //get the Vehicle from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + VehicleVIN_number + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Vehicle does not exist: " + VehicleVIN_number + "\"}"
		return shim.Error(jsonResp)
	}

	err = json.Unmarshal([]byte(valAsbytes), &VehicleJSON)
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to decode JSON of: " + VehicleVIN_number + "\"}"
		return shim.Error(jsonResp)
	}

	err = stub.DelPrivateData("collection1", VehicleVIN_number) //remove the Vehicle from chaincode state
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	// maintain the index
	indexVIN_number := "color~VIN_number"
	colorVIN_numberIndexKey, err := stub.CreateCompositeKey(indexVIN_number, []string{VehicleJSON.Color, VehicleJSON.VIN_number})
	if err != nil {
		return shim.Error(err.Error())
	}

	//  Delete index entry to state.
	err = stub.DelPrivateData("collection1", colorVIN_numberIndexKey)
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}
	return shim.Success(nil)
}

// ===========================================================
// transfer a Vehicle by setting a new owner VIN_number on the Vehicle
// ===========================================================
func (t *SimpleChaincode) transferVehicle(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0       1
	// "VIN_number", "bob"
	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	VehicleVIN_number := args[0]
	newOwner := strings.ToLower(args[1])
	fmt.Println("- start transferVehicle ", VehicleVIN_number, newOwner)

	VehicleAsBytes, err := stub.GetPrivateData("collection1", VehicleVIN_number)
	if err != nil {
		return shim.Error("Failed to get Vehicle:" + err.Error())
	} else if VehicleAsBytes == nil {
		return shim.Error("Vehicle does not exist")
	}

	VehicleToTransfer := Vehicle{}
	err = json.Unmarshal(VehicleAsBytes, &VehicleToTransfer) //unmarshal it aka JSON.parse()
	if err != nil {
		return shim.Error(err.Error())
	}
	VehicleToTransfer.Owner = newOwner //change the owner

	VehicleJSONasBytes, _ := json.Marshal(VehicleToTransfer)
	err = stub.PutPrivateData("collection1", VehicleVIN_number, VehicleJSONasBytes) //rewrite the Vehicle
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end transferVehicle (success)")
	return shim.Success(nil)
}

// ===========================================================================================
// getVehiclesByRange performs a range query based on the start and end keys provided.

// Read-only function results are not typically submitted to ordering. If the read-only
// results are submitted to ordering, or if the query is used in an update transaction
// and submitted to ordering, then the committing peers will re-execute to guarantee that
// result sets are stable between endorsement time and commit time. The transaction is
// invalidated by the committing peers if the result set has changed between endorsement
// time and commit time.
// Therefore, range queries are a safe option for performing update transactions based on query results.
// ===========================================================================================
func (t *SimpleChaincode) getVehiclesByRange(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	startKey := args[0]
	endKey := args[1]

	resultsIterator, err := stub.GetPrivateDataByRange("collection1", startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getVehiclesByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// ==== Example: GetStateByPartialCompositeKey/RangeQuery =========================================
// transferVehiclesBasedOnColor will transfer Vehicles of a given color to a certain new owner.
// Uses a GetStateByPartialCompositeKey (range query) against color~VIN_number 'index'.
// Committing peers will re-execute range queries to guarantee that result sets are stable
// between endorsement time and commit time. The transaction is invalidated by the
// committing peers if the result set has changed between endorsement time and commit time.
// Therefore, range queries are a safe option for performing update transactions based on query results.
// ===========================================================================================
func (t *SimpleChaincode) transferVehiclesBasedOnColor(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0       1
	// "color", "bob"
	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	color := args[0]
	newOwner := strings.ToLower(args[1])
	fmt.Println("- start transferVehiclesBasedOnColor ", color, newOwner)

	// Query the color~VIN_number index by color
	// This will execute a key range query on all keys starting with 'color'
	coloredVehicleResultsIterator, err := stub.GetPrivateDataByPartialCompositeKey("collection1", "color~VIN_number", []string{color})
	if err != nil {
		return shim.Error(err.Error())
	}
	defer coloredVehicleResultsIterator.Close()

	// Iterate through result set and for each Vehicle found, transfer to newOwner
	var i int
	for i = 0; coloredVehicleResultsIterator.HasNext(); i++ {
		// Note that we don't get the value (2nd return variable), we'll just get the Vehicle VIN_number from the composite key
		responseRange, err := coloredVehicleResultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		// get the color and VIN_number from color~VIN_number composite key
		objectType, compositeKeyParts, err := stub.SplitCompositeKey(responseRange.Key)
		if err != nil {
			return shim.Error(err.Error())
		}
		returnedColor := compositeKeyParts[0]
		returnedVehicleVIN_number := compositeKeyParts[1]
		fmt.Printf("- found a Vehicle from index:%s color:%s VIN_number:%s\n", objectType, returnedColor, returnedVehicleVIN_number)

		// Now call the transfer function for the found Vehicle.
		// Re-use the same function that is used to transfer individual Vehicles
		response := t.transferVehicle(stub, []string{returnedVehicleVIN_number, newOwner})
		// if the transfer failed break out of loop and return error
		if response.Status != shim.OK {
			return shim.Error("Transfer failed: " + response.Message)
		}
	}

	responsePayload := fmt.Sprintf("Transferred %d %s Vehicles to %s", i, color, newOwner)
	fmt.Println("- end transferVehiclesBasedOnColor: " + responsePayload)
	return shim.Success([]byte(responsePayload))
}

// =======Rich queries =========================================================================
// Two examples of rich queries are provided below (parameterized query and ad hoc query).
// Rich queries pass a query string to the state database.
// Rich queries are only supported by state database implementations
//  that support rich query (e.g. CouchDB).
// The query string is in the syntax of the underlying state database.
// With rich queries there is no guarantee that the result set hasn't changed between
//  endorsement time and commit time, aka 'phantom reads'.
// Therefore, rich queries should not be used in update transactions, unless the
// application handles the possibility of result set changes between endorsement and commit time.
// Rich queries can be used for point-in-time queries against a peer.
// ============================================================================================

// ===== Example: Parameterized rich query =================================================
// queryVehiclesByOwner queries for Vehicles based on a passed in owner.
// This is an example of a parameterized query where the query logic is baked into the chaincode,
// and accepting a single query parameter (owner).
// Only available on state databases that support rich query (e.g. CouchDB)
// =========================================================================================
func (t *SimpleChaincode) queryVehiclesByOwner(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0
	// "bob"
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	owner := strings.ToLower(args[0])

	queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"Vehicle\",\"owner\":\"%s\"}}", owner)

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// ===== Example: Ad hoc rich query ========================================================
// queryVehicles uses a query string to perform a query for Vehicles.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the queryVehiclesForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
// =========================================================================================
func (t *SimpleChaincode) queryVehicles(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0
	// "queryString"
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	queryString := args[0]

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// =========================================================================================
// getQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetPrivateDataQueryResult("collection1", queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}

func (t *SimpleChaincode) getHistoryForVehicle(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	VehicleVIN_number := args[0]

	fmt.Printf("- start getHistoryForVehicle: %s\n", VehicleVIN_number)

	resultsIterator, err := stub.GetHistoryForKey(VehicleVIN_number)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the Vehicle
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON Vehicle)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getHistoryForVehicle returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}
