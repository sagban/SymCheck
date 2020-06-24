const DB = require('./db');
const Dynamo = new DB();

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

const putCase = async (event) => {
    let uid = event.uid;
    return Dynamo.increment(uid, event, 'PossibleCases')
    
}

const getCases = async ()=>{
    return Dynamo.getAll('PossibleCases');
}

const calculateCases = async (event) =>{
    const location = event.location;
    const lat1 = parseFloat(location.split(",")[0]);
    const lng1 = parseFloat(location.split(",")[1]);
    let cases = 0;
    let items = await getCases();
    items = items.Items;
    for(let i in items){
        const item = items[i]
        // console.log(item);
        const lat2 = parseFloat(item.location.split(",")[0]);
        const lng2 = parseFloat(item.location.split(",")[1]);
        const distance = getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2);
        console.log(distance);
        if(distance <= parseFloat(event.radius))cases++;
    };
    return cases
}


exports.handler = async (event) => {
    
    let response;
    
    if (event.httpMethod === 'GET') {
        const cases = await calculateCases(event);
        response = {
          "version": "v2",
          "content": {
            "messages": [
              {
                "type": "text",
                "text": "The total number of covid cases in a radius of "+ event.radius+"km are "+cases
              }
            ],
            "actions": [],
            "quick_replies": []
          }
        }
        return response
    }
    else{
        response = await putCase(event);
        return response;
    }
    
};
