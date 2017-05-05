// ******************************
// File: wpui.js
// ******************************

// ** Main Controls **
var isMissionInProgress = false; //boolean to determine if a mission is currently in progress
var isControllingUAV = true; //boolean to determine if the operator is controlling the UAV or UGV. true = UAV, false = UGV
var isUAVOn = false; //boolean to determine if the UAV is on or not
var isUGVOn = false; //boolean to determine if the UGV is on or not
var isUAVInFlight = false; //boolean to determine if the UAV is in flight or not. False until the operator takes off. Gets reset when the UAVs power goes off/lands.
var isFlipInitiated = false; //boolean to determine if the UAV flip sequence is initiated or not
var lastCommandEntered = "NONE"; //this is to get the last command entered. it's really for the flip sequence
var oneCounter = 0; //to counter the number of times the key 1 is pressed for the flip sequence
var wheelsDegree = 0; //to keep track of the wheels degrees
var craneDegree = 0; //to keep track of the cranes degrees


// ** UGV Gradual Speed Up **
var UGVForwardCount = 0; // this is for a gradual speed up when moving forwards
var UGVBackwardsCount = 0; //this is for a gradual speed up when moving backwards

// ** Kill Switches **
var isUAVSafetyActive = false; //boolean to determine if the UAV's safety switch has been activiated or not
var isUGVSafetyActive = false; //boolean to determine if the UGV's safety switch has been activiated or not

// ** Video Camera Displays **
var UAVVideoDisplay = "FRONT"; //stirng to determin if the WPUI is displaying UAV's front camera, bottom camera, or thermal
var isUGVDisplayingFrontCamera = true; //boolean to determin if the WPUI is displaying UGV's front or back camera

// ** Mission Timer **
var missionTimeStamp; //every object gets this
var missionTime; //needed for timer
var timeBeforePopup;//need for timer when a popup appears
var timeAfterPopup; //needed for timer when a popup appears
var timeout; //needed for timer
var hours = 0; //needed for timer
var minutes = 0; //needed for timer
var seconds = 0; //needed for timer

// ** Priority Ranking  **
var animalMarkerList = []; //list of animals that need to be rescued
var animalOnboardList = []; //list of animals that are on the UGV
var animalRescuedList = []; //list of animals that have been rescued
var fireMarkerList = []; //list of fire markers that are currently on the map
var blockerMarkerList = []; //list of blocker markers that are currently on the map
var debrisMarkerList = []; //list of debris markers that are currently on the map
var treeMarkerList = []; //list of tree markers that are currently on the map
var uav1;//our UAV
var ugv1;//our UGV

// ** Telemetry Displays **
var isUAVBatteryHidden = false; //boolean to show/hide battery (mins)
var isUAVTempHidden = false; //boolean to show/hide temp
var isUAVAltitudeHidden = false; //boolean to show/hide altitude
var isUAVSpeedHidden = false; //boolean to show/hide speed
var isUGVBatteryHidden = false; //boolean to show/hide battery (mins)
var isUGVTempHidden = false; //boolean to show/hide temp
//var isUGVAnimalCountHidden = false; //boolean to show/hide animal count
var isUGVWheelAngleHidden = false; //boolean to show/hide wheel angle
var isUGVCraneAngleHidden = false; //boolean to show/hide crane angle
var isUGVSpeedHidden = false; //boolean to show/hide speed

// ** Displaying Controls **
var displayingControls = false;

// ** UAV Speed Control **
var uavSpeed = 0.5;

// ** Autonomous Paths **
var currentAutoPath = "MANUAL"; //auto path can also be set to FIG8, PSWEEP, FOLLOW, CENTER

// ** Emergency Stop buttons  **
var stopUAV = document.getElementById('UAVShutdown');
var stopUGV = document.getElementById('UGVShutdown');

// ** Placing Markers **
var selectedBucketMarker = "NONE"; //needed for placing markers
var animalIdCounter = 1001;
var fireIdCounter = 2001;
var debrisIdCounter = 3001;
var blockerIdCounter = 4001;

// ** Removing Markers **
var selectedMapMarker;
var selectedMapMarkerLat;
var selectedMapMarkerLng;
var selectedMapMarkerGroup = "NONE"; //needed for removing markers

// ** Display Warning Alert **
var isUAVAlertDisplaying = false;
var isUGVAlertDisplaying = false;

var initialize = function(){//TURN THIS INTO AN ON LOAD FUNCTION
	//this function is called on to initialize all the known animals, UAV, and UGV
	
	//making the home station
	var homeStation = L.circle([10,155],{
		color: 'green',
		fillColor: 'green',
		fillOpacity: 0.3,
		radius: 5
	}).addTo(zoomap);
	homeStation.bindPopup("<b>HOME STATION</b>");
	markers.addLayer(homeStation);
	
	//making the rescue station
	var rescueStation = L.circle([45,140],{
		color: 'green',
		fillColor: 'green',
		fillOpacity: 0.3,
		radius: 5
	}).addTo(zoomap);
	rescueStation.bindPopup("<b>RESCUE STATION</b>");
	markers.addLayer(rescueStation);

	uav1 = new UAV(155,10,101); //initialize a UAV (at home location)
	ugv1 = new UGV(155,10,201); //initialize a UGV (at home location)
	
	var panda1 = new animal("Panda",110,70,animalIdCounter,5,0,0,true,false);//initialize an animal
	var monkey1 = new animal("Monkey",165,10,animalIdCounter,2,0,0,true,false);//initialize an animal
	var monkey2 = new animal("Monkey",89,45,animalIdCounter,2,0,0,true,false);//initialize an animal
	var snake1 = new animal("Snake",60,35,animalIdCounter,3,1,0,true,false);//initialize an animal
	var monkey3 = new animal("Monkey",11,22,animalIdCounter,2,0,0,true,false);//initialize an animal
	
	animalMarkerList.push(panda1,monkey1,monkey2,snake1,monkey3);

	/** hard coded markers for demo purposes	
	var fire1 = new fire(30,60,fireIdCounter); //initialize a fire marker
	var fire2 = new fire(159,36,fireIdCounter); //initialize a fire marker
	var fire3 = new fire(64,4,fireIdCounter); //initialize a fire marker
	var fire4 = new fire(101,59,fireIdCounter); //initialize a fire marker
	var fire5 = new fire(87,73,fireIdCounter); //initialize a fire marker
	var fire6 = new fire(55,41,fireIdCounter); //initialize a fire marker
	
	fireMarkerList.push(fire1,fire2,fire3,fire4,fire5,fire6);


	var debris1 = new debris(71,30,debrisIdCounter); //initialize a debris marker
	var debris2 = new debris(45,62,debrisIdCounter); //initialize a debris marker
	
	debrisMarkerList.push(debris1,debris2);	

	var blocker1 = new impassableBlocker(5,30,blockerIdCounter); //initialize a blocker marker
	var blocker2 = new impassableBlocker(38,20,blockerIdCounter); //initialize a blocker marker
	var blocker3 = new impassableBlocker(40,12,blockerIdCounter); //initialize a blocker marker
	
	blockerMarkerList.push(blocker1,blocker2, blocker3);	
	**/
	
	//making tree markers
	var tree1 = new tree(55,25);
	var tree2 = new tree(45,30);
	
	treeMarkerList.push(tree1,tree2);
	
	updatePriorityRanking();//everything is in place, now we update the priority rank for the first time
};

var updatePriorityRanking = function(){
	//this function gets called every time a critical change occurs to the course (marker added, marker deleted) and it also updates every 30 seconds with the UGVs new location
	var curUGVXLocation = ugv1.xLocation;
	var curUGVYLocation = ugv1.yLocation;
	var extremelyCloseFires = 0; // fires that are <= 10feet of a cage
	var veryCloseFires = 0;//fires that are > 10 but <= 20 feet
	var semiCloseFires = 0; //fires that are > 20 but <= 30 feet
	var closenessToUGV = 0; // 3 is <= 25'   2 is > 25 but <=50,    1 is >50 but <=75    and 0 is >75
	var endangeredLevel = 0; // 7 is the highest endangered level, 1 is the lowest
	var newPriorityScore = 0;//animals new priority score
	var distanceFromAnimal = 0; //a fire markers distance from an animal (in feet)
	var distanceFromUGV = 0; //the UGV's distance from an animal (in feet)
	
	//console.log("UGV's Location is: ("+curUGVXLocation+","+curUGVYLocation+")");
	for(var i = 0; i < animalMarkerList.length; i++){//look at all the animal on the map
		//look at fire markers
		//reset values
		extremelyCloseFires=0;
		veryCloseFires=0;
		semiCloseFires=0;
		for(var j = 0; j < fireMarkerList.length; j++){//look at all the fire markers on the map
			distanceFromAnimal = getDistance((fireMarkerList[j].xLocation),(fireMarkerList[j].yLocation),(animalMarkerList[i].xLocation),(animalMarkerList[i].yLocation));
			//console.log("Fire distance from animal cage is: " + distanceFromAnimal);
			if(distanceFromAnimal <= 10){
				//console.log("ADDING an extremely close fire");
				extremelyCloseFires++;
			}else if(distanceFromAnimal <= 20){
				veryCloseFires++;
				//console.log("ADDING a very close fire");
			}else if(distanceFromAnimal <= 30){
				semiCloseFires++;
				//console.log("ADDING a semi close fire");
			}
		}
		
		//look at distance from UGV
		distanceFromUGV = getDistance(curUGVXLocation,curUGVYLocation,(animalMarkerList[i].xLocation),(animalMarkerList[i].yLocation));
		//console.log("UGV distance from animal is: "+distanceFromUGV);
		if(distanceFromUGV < 25){
			closenessToUGV = 3;
			//console.log("ADDING a 3 for closeness to UGV");
		}else if(distanceFromUGV < 50){
			closenessToUGV = 2;
			//console.log("ADDING a 2 for closeness to UGV");
		}else if(distanceFromUGV < 75){
			closenessToUGV = 1;
			//console.log("ADDING a 1 for closeness to UGV");
		}else{
			closenessToUGV = 0;
			//console.log("ADDING a 0 for closeness to UGV");
		}
		
		//look at animal endanger level
		endangeredLevel = animalMarkerList[i].endangeredLevel;
		//console.log("animal endangered level is: "+ endangeredLevel);
			
		//calculate priority score
		if(animalMarkerList[i].isAlive == false){
			//we want the dead animals to be picked up last
			newPriorityScore = 0;
		}else{
			newPriorityScore = (extremelyCloseFires)*(40) + (veryCloseFires)*(20) + (semiCloseFires)*(10) + (closenessToUGV)*(5) + (endangeredLevel)*(25); //weights may change based on customer feedback
		}
		animalMarkerList[i].changePriorityScore(newPriorityScore);
	}
	//done getting the new priority scores of all the animals on the map
		
	//remove the old priority markers
	priorityMarkers.clearLayers();
	var animalLivingStatus; //Alive or Deceased
	
	//sort from highest priority to lowest based on priority scores
	animalMarkerList.sort(function(a,b){return b.priorityScore - a.priorityScore});
	
	//write the new rankings and display rankings to the map
	for(var i = 0; i < animalMarkerList.length; i++){//look at all the animal on the map
		animalMarkerList[i].changePriorityRank(i+1); //1 is the highest rank (next to be picked up)
		//console.log("animal ID: " + animalMarkerList[i].id + " has a priority rank of: " + (i+1));
		var animalRankMarker = new L.Marker(new L.LatLng(animalMarkerList[i].yLocation,animalMarkerList[i].xLocation),{
			icon: new L.NumberedDivIcon({number: (i+1)})
		});
		if(animalMarkerList[i].isAlive == true){
			animalLivingStatus = "Alive";
		}else{
			animalLivingStatus = "Deceased";
		}
		animalRankMarker.bindPopup("<b>Animal:</b> "+animalMarkerList[i].name+"<br><b>Endngr Lvl:</b> "+animalMarkerList[i].endngrString + "<br><b>Living Status:</b> "+ animalLivingStatus);
		priorityMarkers.addLayer(animalRankMarker);
	}
};

var getDistance = function(x1, y1, x2, y2){
	//distance = sqrt((x2 - x1)^2 + (y2-y1)^2)
	var subXs = x2 - x1;
	var subYs = y2 - y1;
	var xSquared = Math.pow(subXs, 2);
	var ySquared = Math.pow(subYs, 2);
	var distance = Math.sqrt(xSquared + ySquared);
	
	return Math.floor(distance);
};

var keyEntered = function(){
	//this function is called whenever a keyboard command is entered
        var textAreaElement = document.getElementById('WPUIBody');
        //textAreaElement.addEventListener('keypress',eventHandler,false); //only shows for printable keys
        textAreaElement.addEventListener('keydown',eventHandler,false); //pressing and holding a key
        textAreaElement.addEventListener('keyup',eventHandler,false); //releasing a key
	
	function eventHandler(event){
		var eType = event.type;
		var eKeyCode = event.keyCode;

        	//console.log(eType); //keyup, keydown
        	//console.log(eKeyCode); //askii number
        	//console.log(String.fromCharCode(event.keyCode)); //symbol of key
		if(isMissionInProgress == true && displayingControls == false){
			//we only want to do these commands if the mission is currently in progress 
			//we also don't want to move if the control popup is being displayed
			
			if(eType == 'keydown'){
				//key down is the initial pressing of a key. it also can be held in and the command repeats until the button is released which is keyup
				console.log("User is pressing: "+ eKeyCode);
				switch(eKeyCode){
					case 39: //right arrow -> move right / turn wheel right
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.right(uavSpeed);
									console.log("UAV Move Right");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								if(wheelsDegree < 75){
									console.log("UGV Turn Wheel Right");
									wheelsDegree = wheelsDegree + 5;
									writeUGVWheelAngle(wheelsDegree);
								}else{
									console.log("Wheels cannot turn past 75 degrees");
								}
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 37: //left arrow -> move left / turn wheel left
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.left(uavSpeed);
									console.log("UAV Move Left");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								if(wheelsDegree > -75){
									console.log("UGV Turn Wheel Left");
									wheelsDegree = wheelsDegree - 5;
									writeUGVWheelAngle(wheelsDegree);
								}else{
									console.log("Wheels cannot turn past -75 degrees");
								}
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 38: //up arrow -> move forward
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.front(uavSpeed);
									console.log("UAV Move Forward");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								//gradual speed up
								if(UGVForwardCount < 15){
									console.log("UGV Move Forward at 25% speed");
									ugv1.changeXLocation(ugv1.xLocation + 0.1);
								}else if(UGVForwardCount < 30){
									console.log("UGV Move Forward at 50% speed");
									ugv1.changeXLocation(ugv1.xLocation + 0.2);
								}else if(UGVForwardCount < 45){
									console.log("UGV Move Forward at 75% speed");
									ugv1.changeXLocation(ugv1.xLocation + 0.3);
								}else{
									console.log("UGV Move Forward at full speed");
									ugv1.changeXLocation(ugv1.xLocation + 0.4);
								}
								UGVForwardCount ++; //inc counter
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 40: //down arrow -> move backwards
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.back(uavSpeed);
									console.log("UAV Move Backwards");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								//gradual speed up
								if(UGVBackwardsCount < 15){
									console.log("UGV Move Backwards at 25% speed");
									ugv1.changeXLocation(ugv1.xLocation - 0.1);
								}else if(UGVBackwardsCount < 30){
									console.log("UGV Move Backwards at 50% speed");
									ugv1.changeXLocation(ugv1.xLocation - 0.2);
								}else if(UGVBackwardsCount < 45){
									console.log("UGV Move Backwards at 75% speed");
									ugv1.changeXLocation(ugv1.xLocation - 0.3);
								}else{
									console.log("UGV Move Backwards at full speed");
									ugv1.changeXLocation(ugv1.xLocation - 0.4);
								}
								UGVBackwardsCount ++; //inc counter
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 68: //D -> Rotate Clockwise
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.clockwise(uavSpeed);
									console.log("UAV Rotate Clockwise");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								if(craneDegree < 330){
									console.log("UGV Rotate Crane Clockwise");
									craneDegree = craneDegree + 10;
									writeUGVCraneAngle(craneDegree);
								}else{
									console.log("Crane will not rotate past 330 degrees");
								}
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 65: //A -> Rotate Counter Clockwise
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.counterClockwise(uavSpeed);
									console.log("UAV Rotate Counter Clockwise");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								if(craneDegree > -330){
									console.log("UGV Rotate Crane Counter Clockwise");
									craneDegree = craneDegree - 10;
									writeUGVCraneAngle(craneDegree);
								}else{
									console.log("Crane will not rotate past -330 degrees");
								}
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 87: //W -> Ascend/Raise
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.up(uavSpeed);
									console.log("UAV Ascend");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								console.log("UGV Raise Crane Hook");
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 83: //S -> Descend/Lower
						if(isControllingUAV == true){
							if(isUAVOn == true){
								if(isUAVInFlight == true){
									client.down(uavSpeed);
									console.log("UAV Descend");
								}else{
									console.log("UAV must complete the take-off command (T) before doing any other commands");
								}
							}else{
								console.log("UAV won't do command since it is off");
							}
						}else{
							if(isUGVOn == true){
								console.log("UGV Lower Crane Hook");
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 70://F -> UGV conveyer belt Forward
						if(isControllingUAV == true){
							console.log("The Key F does not have an action for the UAV");
						}else{
							if(isUGVOn == true){
								console.log("UGV Move Conveyer Belt Forward");
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;					
					case 66://B -> UGV conveyer belt Back
						if(isControllingUAV == true){
							console.log("The Key B does not have an action for the UAV");
						}else{
							if(isUGVOn == true){
								console.log("UGV Move Conveyer Belt Backwards");
							}else{
								console.log("UGV won't do command since it is off");
							}
						}						
						break;
					case 32: // space bar -> switching controls
					//case 49: // 1 -> starting uAV
					//case 50: // 2 -> starting UGV
					//case 46: // delete ->stopping vehicles
					case 84: // T -> UAV take off command
						//these controls are only supposed pressed once so are implemented during the keyup
						break;
					default:
						//going to log this in the keyup block so we dont clog the log file with pointless commands. One log per button hit is enough.
						//console.log("User pressed down the key: " + eKeyCode + ", but it is not assigned to an action.");
						break;
				}
			}
			if(eType == 'keyup'){
				//key up is when the user releases a key. It is only called once no matter how long the user holds in the key
				console.log("User is releasing: " + eKeyCode);
				switch(eKeyCode){
					case 32: //space bar -> switching controls
						//the user wants to switch from controlling the UAV to the UGV or from UGV to UAV
						if(isControllingUAV == true){
							//right now op is controlling UAV and trying to switch to UGV
							if(isUGVOn == true){
								//UGV is on so we can switch over controlls to it
								if(currentAutoPath == "MANUAL"){
									client.stop(); //hover if UAV is not on an autonomous path
								}
								console.log("Switching controls from UAV to UGV");
								isControllingUAV = false;
								UAVControlLabel.style.backgroundColor="transparent";
								UGVControlLabel.style.backgroundColor="yellow";
							}else{
								//UGV is not on so we cannot switch to it
								console.log("Refuse to switch controls from UAV to UGV since UGV is off");
							}
						}else{
							//right now op is controlling UGV and trying to switch to UAV
							if(isUAVOn == true){
								//UAV is on so we can switch controls to it
								console.log("Switching controls from UGV to UAV");
								isControllingUAV = true;
								UAVControlLabel.style.backgroundColor="yellow";
								UGVControlLabel.style.backgroundColor="transparent";
								if(currentAutoPath != "MANUAL"){
									currentAutoPath = "MANUAL";
									UAVAutoPathLabel.style.backgroundColor="transparent";
									manualPath.style.backgroundColor = "grey"; //active
									fig8Path.style.backgroundColor = "white"; //standby
									perimSweepPath.style.backgroundColor = "white"; //standby
									followUGVPath.style.backgroundColor = "white"; //standby
									centerPath.style.backgroundColor = "white"; //standby
								}
							}else{
								//UAV is not on so we cannot switch to it
								console.log("Refuse to switch controls from UGV to UAV since UAV is off");
							}
						}
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
					case 16: //Shift -> starts the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								console.log("Starting UAV flip sequence");
								isFlipInitiated = true;
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
							}
						}else{
							console.log("The Shift Key does not have an action for the UGV");
						}						
						lastCommandEntered = "SHIFT";
						break;
					case 48: //0 -> part of the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								if(isFlipInitiated == true && lastCommandEntered == "SHIFT"){
									console.log("Continuing with flip sequence");
								}else{
									console.log("Incorrect Sequence, Resetting Sequence");
									isFlipInitiated = false;
								}
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
								isFlipInitiated = false;
							}
						}else{
							console.log("The Key 0 does not have an action for the UGV");
							isFlipInitiated = false;
						}
						oneCounter = 0;
						lastCommandEntered = "0";
						break;
					case 49: //1 -> part of the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								if(isFlipInitiated == true){
									if((lastCommandEntered == "0") && (oneCounter == 0)){
										console.log("Continuing with flip sequence");
									}else if((lastCommandEntered == "1") && (oneCounter == 1)){
										console.log("Continuing with flip sequence");
									}else{
										console.log("Incorrect Sequence, Resetting Sequence");	
									}
								}else{
									console.log("Incorrect Sequence, Resetting Sequence");
									isFlipInitiated = false;
								}
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
								isFlipInitiated = false;
							}
						}else{
							console.log("The Key 1 does not have an action for the UGV");
							isFlipInitiated = false;
						}
						oneCounter++;
						lastCommandEntered = "1";
						break;
					case 50: //2 -> part of the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								if(isFlipInitiated == true && lastCommandEntered == "1" && oneCounter == 2){
									console.log("Continuing with flip sequence");
								}else{
									console.log("Incorrect Sequence, Resetting Sequence");
									isFlipInitiated = false;
								}
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
								isFlipInitiated = false;
							}
						}else{
							console.log("The Key 2 does not have an action for the UGV");
							isFlipInitiated = false;
						}						
						lastCommandEntered = "2";
						break;
					case 51: //3 -> part of the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								if(isFlipInitiated == true && lastCommandEntered == "2"){
									console.log("Continuing with flip sequence");
								}else{
									console.log("Incorrect Sequence, Resetting Sequence");
									isFlipInitiated = false;
								}
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
								isFlipInitiated = false;
							}
						}else{
							console.log("The Key 3 does not have an action for the UGV");
							isFlipInitiated = false;
						}						
						lastCommandEntered = "3";
						break;
					case 53: //5 -> part of the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								if(isFlipInitiated == true && lastCommandEntered == "3"){
									console.log("Continuing with flip sequence");
								}else{
									console.log("Incorrect Sequence, Resetting Sequence");
									isFlipInitiated = false;
								}
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
								isFlipInitiated = false;
							}
						}else{
							console.log("The Key 5 does not have an action for the UGV");
							isFlipInitiated = false;
						}						
						lastCommandEntered = "5";
						break;
					case 56: //8 -> part of the flip sequence
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == true)){
								if(isFlipInitiated == true && lastCommandEntered == "5"){
									console.log("Completed Flip Sequence! Doing Flip");
									client.animate('flipLeft',1000);
									isFlipInitiated = false;//since we are done the flip, reset the sequence
								}else{
									console.log("Incorrect Sequence, Resetting Sequence");
									isFlipInitiated = false;
								}
							}else{
								console.log("UAV needs to be on and in flight for flip sequence");
								isFlipInitiated = false;
							}
						}else{
							console.log("The Key 8 does not have an action for the UGV");
							isFlipInitiated = false;
						}						
						lastCommandEntered = "8";
						break;
					case 84: // T -> UAV take off
						if(isControllingUAV == true){
							if((isUAVOn == true) && (isUAVInFlight == false)){
								console.log("UAV is Taking Off");
								client.takeoff();
								isUAVInFlight = true;
								UAVInFlightLabel.style.backgroundColor="green";
							}else if(isUAVOn == false){
								console.log("UAV won't do command since it is off");
							}else{
								console.log("UAV cannot take off if it is already in flight");
							}
						}else{
							console.log("The Key T does not have an action for the UGV");
						}						
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
					case 38: // up arrow -> move forward
						if(isControllingUAV == true){
							if(isUAVInFlight == true){
								//when the UAV is done moving, it needs to hover
								client.stop();
								console.log("UAV Hovers in Place"); //not sure if this is needed
							}
						}else{
							//reset UGV gradual speed up
							UGVForwardCount =0;
							console.log("UGV reset forward gradual speed up");
						}
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
					case 40: // down arrow -> move backwards
						if(isControllingUAV == true){
							if(isUAVInFlight == true){
								//when the UAV is done moving, it needs to hover
								console.log("UAV Hovers in Place"); //not sure if this is needed
							}
						}else{
							//reset gradual speed up
							UGVBackwardsCount = 0;
							console.log("UGV reset backwards gradual speed up");
						}
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
					case 39: // right arrow -> move right / turn wheel right
					case 37: // left arrow -> move left / turn wheel left
					case 68: // D -> rotate clockwise
					case 65: // A -> rotate counter clockwise
					case 87: // W -> ascend / raise crane hook
					case 83: // S -> descend / lower crane hook
						//these controlls are implemented in the keypress, they can be held down, but on release they get called here
						if(isControllingUAV == true){
							if(isUAVInFlight == true){
								//when the UAV is done moving, it needs to hover
								client.stop();
								console.log("UAV Hovers in Place"); //not sure if this is needed
							}
						}else{
							//the UGV doesn't need to do anything on key release
						}
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
					case 70: // F -> move conveyer belt forward
					case 66: // B -> move conveyer belt backwards
						//do nothing since the UGV doesnt need to do anything on release here and the UAV doesn't use this button
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
					default:
						console.log("User released key: " + eKeyCode + ", but it is not assigned to an action.");
						isFlipInitiated = false;
						lastCommandEntered = "DOESN'T MATTER";
						break;
				}
			}else{
				//do nothing...we only care about key up and key down
			}
		}else{
			if(displayingControls == true){
				console.log("Controls are disabled while the Control Display is being displayed");
			}else{
				//these commands are only for when the mission is not in progress
				console.log("Mission is currently not in Progress...Cick START MISSION to begin");
			}
		}
	}

};

var startStopMission = function(){
	//this function is called when the Start/End mission buttion is clicked
	
        var elem = document.getElementById('startStop');
        elem.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(elem.value == "START MISSION"){
			//begin logging - text log not possible in js
			missionTimeStamp = new Date();
			
			initialize();// BE SURE TO DELETE THIS AND ADD INIT A AN ON LOAD FUNCTION

			//start timer
			console.log("Starting mission timer");
			missionTimer();
			
			//we want to start the mission
			console.log("Starting the mission");
			isMissionInProgress = true;
				
			//start UAV
			console.log("Starting the UAV");
			isUAVOn = true;
			UAVLabel.style.color="green";
			stopUAV.value = "Emergency UAV Shutdown";
/** DRONE
			var arDrone = require('ar-drone');
			var client  = arDrone.createClient();
			client.takeoff();
			client
				.after(5000, function() {
					this.clockwise(0.5);
				})
				.after(3000, function() {
					this.stop();
					this.land();
				});
**/
			
			//auto path
			manualPath.style.backgroundColor = "grey"; //active
			fig8Path.style.backgroundColor = "white"; //standby
			perimSweepPath.style.backgroundColor = "white"; //standby
			followUGVPath.style.backgroundColor = "white"; //standby
			centerPath.style.backgroundColor = "white"; //standby
			currentAutoPath = "MANUAL";
			UAVAutoPathLabel.style.backgroundColor="transparent";
			
			//start UGV
			console.log("Starting the UGV");
			isUGVOn = true;
			UGVLabel.style.color="green";
			stopUGV.value = "Emergency UGV Shutdown";
			//writeUGVAnimalCount(0);
			writeUGVWheelAngle(0);
			writeUGVCraneAngle(0);
			
			//controlling UAV first
			console.log("Operator is currently controlling the UAV");
			isControllingUAV = true;
			UAVControlLabel.style.backgroundColor="yellow";
			UGVControlLabel.style.backgroundColor="transparent";
			
			//change button
			elem.value = "STOP MISSION";
		}else{
			timeBeforePopup = new Date();
			var popUp = confirm("CONFIRM STOP MISSION!!!\nClick OK to proceed to stop mission\nClick Cancel to abort and continue with mission");
			timeAfterPopup = new Date();
			updateMissionTimer(timeAfterPopup - timeBeforePopup);
			if(popUp == true){
				//we want to stop the mission
				console.log("Stopping the mission");
				
				//check to see if the UGV is currently flying
				if(isUAVInFlight == true){
					console.log("Do gradual landing");
					isUAVInFlight = false;
					UAVInFlightLabel.style.backgroundColor="transparent";
				}
				
				//make sure the UAV is off
				console.log("Making sure UAV is off");
				if(isUAVOn == true){
					console.log("UAV Powering Down");
				}
				isUAVOn = false;
				UAVLabel.style.color="black";
				stopUAV.value = "Start UAV";
				
				writeUAVBatteryPercent("UNK");
				writeUAVBatteryMin("UNK");
				writeUAVTemp("UNK");
				writeUAVAltitude("UNK");
				writeUAVSpeed("UNK");
				
				//auto path
				manualPath.style.backgroundColor = "white"; //standby
				fig8Path.style.backgroundColor = "white"; //standby
				perimSweepPath.style.backgroundColor = "white"; //standby
				followUGVPath.style.backgroundColor = "white"; //standby
				centerPath.style.backgroundColor = "white"; //standby
				currentAutoPath = "MANUAL";
				UAVAutoPathLabel.style.backgroundColor="transparent";

				//make sure the UGV is off
				console.log("Making sure UGV is off");
				if(isUGVOn == true){
					console.log("UGV Powering Down");
				}
				isUGVOn = false;
				UGVLabel.style.color="black";
				stopUGV.value = "Start UGV";
				
				writeUGVBatteryPercent("UNK");
				writeUGVBatteryMin("UNK");
				writeUGVTemp("UNK");
				//writeUGVAnimalCount("UNK");
				writeUGVWheelAngle("UNK");
				writeUGVCraneAngle("UNK");
				writeUGVSpeed("UNK");
				
				//stop timer
				console.log("Stopping mission timer");
				missionTimer();
				
				UAVControlLabel.style.backgroundColor="transparent";
				UGVControlLabel.style.backgroundColor="transparent";
				cleanupMap();
				
				isMissionInProgress = false;
				//stop log possibly??? - text log not possible
				
				//change button
				elem.value = "START MISSION";
			}else{
				console.log("Operator Aborted the STOP MISSION action");
			}
		}
	}
};

var missionTimer = function(){
	missionTime = document.getElementsByTagName('time')[0];
	var count = function(){
		seconds++;
		if(seconds >= 60){
			seconds = 0;
			minutes++;
			if(minutes >= 60){
				minutes = 0;
				hours++;
			}
		}
		
		missionTime.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
		timer();
	}
	
	var timer = function(){
		timeout = setTimeout(count,1000);//add 1 second to the timer
	}

	if(isMissionInProgress == false){
		//start timer
		timer();
	}else{
		//stop and reset timer
		console.log("Final Mission Time is: " + hours + " hours " + minutes + " minutes " + seconds + " seconds" );
		clearTimeout(timeout);
		hours = 0;
		minutes = 0;
		seconds = 0;
	}
};

var updateMissionTimer = function (ms){
	//this function takes the time length that a pop up was open and updates he timer accordingly
	var pausedTime = ms;
	//console.log("Hours: "+ hours + " Minutes: "+ minutes + " Seconds: " + seconds);
	var popupHours = Math.floor(pausedTime / 3600000);
	pausedTime = pausedTime - (popupHours * 3600000);
	var popupMinutes = Math.floor(pausedTime / 60000);
	pausedTime = pausedTime - (popupMinutes * 60000);
	var popupSeconds = Math.floor((pausedTime / 1000));
	
	hours = hours + popupHours;
	minutes = minutes + popupMinutes;
	seconds = seconds + popupSeconds;
	
	if(minutes >= 60){
		minutes = minutes - 60;
		hours++;
	}
	if(seconds >= 60){
		seconds = seconds - 60;
		minutes++;
		if(minutes >= 60){
			minutes = minutes - 60;
			hours ++;
		}
	}
	missionTime.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
	//console.log("Hours: "+ hours + " Minutes: "+ minutes + " Seconds: " + seconds);
};

var emergencyUGVStop = function(){
	//this function is called when the STOP UGV buttion is clicked
	
        stopUGV = document.getElementById('UGVShutdown');
        stopUGV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(isMissionInProgress == true){
			if(stopUGV.value == "Emergency UGV Shutdown"){
				console.log("Emergency shutdown for UGV initiated");
				timeBeforePopup = new Date();
				var popUp = confirm("CONFIRM EMERGENCY SHUTDOWN FOR UGV!\nClick OK to proceed with shutdown\nClick Cancel to abort shutdown");
				timeAfterPopup = new Date();
				updateMissionTimer(timeAfterPopup - timeBeforePopup);
				if (popUp == true){
					//do the shutdown	
					console.log("Powering down the UGV");
					isUGVOn = false;
					UGVLabel.style.color="red";
					console.log("Switching controls to UAV");
					isControllingUAV = true;
					stopUGV.value="Start UGV";
					UAVControlLabel.style.backgroundColor="yellow";
					UGVControlLabel.style.backgroundColor="transparent";
					if(currentAutoPath != "MANUAL"){
						currentAutoPath = "MANUAL";
						UAVAutoPathLabel.style.backgroundColor="transparent";
						manualPath.style.backgroundColor = "grey"; //active
						fig8Path.style.backgroundColor = "white"; //standby
						perimSweepPath.style.backgroundColor = "white"; //standby
						followUGVPath.style.backgroundColor = "white"; //standby
						centerPath.style.backgroundColor = "white"; //standby
					}
				}else{
					console.log("Operator aborted the emergency shutdown of the UGV");
				}
			}else{
				//value == Start UGV
				console.log("UGV turning UGV ON");
				isUGVOn=true;
				UGVLabel.style.color="green";
				console.log("Operator is now controlling UGV");
				if(isControllingUAV==true){
					isControllingUAV = false;
					UAVControlLabel.style.backgroundColor="transparent";
					UGVControlLabel.style.backgroundColor="yellow";
				}
				stopUGV.value="Emergency UGV Shutdown";
			}
		}else{
			console.log("Mission is not in progress, so emergency stop button does nothing.");
		}
	}
};

var emergencyUAVStop = function(){
	//this function is called when the STOP UAV buttion is clicked
	
        stopUAV = document.getElementById('UAVShutdown');
        stopUAV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(isMissionInProgress == true){
			if(stopUAV.value == "Emergency UAV Shutdown"){
				console.log("Emergency shutdown initiated");
				timeBeforePopup = new Date();
				var popUp = confirm("CONFIRM EMERGENCY SHUTDOWN FOR UAV!\nClick OK to proceed with shutdown\nClick Cancel to abort shutdown");
				timeAfterPopup = new Date();
				updateMissionTimer(timeAfterPopup - timeBeforePopup);
				if (popUp == true){
					//do the shutdown
					if(isUAVInFlight == true){
						//begin safe landing here
						console.log("UAV is currently in flight, beginning graceful landing process");
						client.stop();
						client.land();
						isUAVInFlight = false;
						UAVInFlightLabel.style.backgroundColor="transparent";
					}
					console.log("Powerering down UAV");
					isUAVOn = false;
					UAVLabel.style.color="red";
					console.log("Switching Controls to UGV");
					isControllingUAV = false;
					stopUAV.value="Start UAV";
					UAVControlLabel.style.backgroundColor="transparent";
					UGVControlLabel.style.backgroundColor="yellow";
			
					manualPath.style.backgroundColor = "white"; //standby
					fig8Path.style.backgroundColor = "white"; //standby
					perimSweepPath.style.backgroundColor = "white"; //standby
					followUGVPath.style.backgroundColor = "white"; //standby
					centerPath.style.backgroundColor = "white"; //standby
					currentAutoPath = "MANUAL";
					UAVAutoPathLabel.style.backgroundColor="transparent";
				}else{
					console.log("Operator chose not to do the emergency shutdown of the UAV");
				}
			}else{
				//value == Start UAV
				console.log("UAV turning UAV ON");
				isUAVOn = true;
				UAVLabel.style.color="green";
				console.log("Operator is now controlling UAV");
				if(isControllingUAV==false){
					isControllingUAV=true;
					UAVControlLabel.style.backgroundColor="yellow";
					UGVControlLabel.style.backgroundColor="transparent";
				}
				manualPath.style.backgroundColor = "grey"; //active
				currentAutoPath="MANUAL";
				stopUAV.value="Emergency UAV Shutdown";
			}
		}else{
			console.log("Mission is not in progress, so emergency stop button does nothing.");
		}
	}
};

var viewPreviousMissionData = function(){
	//this function is called when the view previous mission data buttion is clicked
	
        var viewData = document.getElementById('viewData');
        viewData.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(isMissionInProgress == true){
			console.log("Cannot view previous mission data while mission in progress, opening popup window");
			timeBeforePopup = new Date();
			alert("Cannot View Previous Mission Data while a mission is in progress");
			timeAfterPopup = new Date();
			updateMissionTimer(timeAfterPopup-timeBeforePopup);
		}else{
			console.log("Entering the previous mission page.");
		}
	}
};

var displayUAVThermal = function(){
	//this function is called when the UAV THERMAL button is clicked
	
        var thermalUAV = document.getElementById('UAVThermal');
	var fCameraUAV = document.getElementById('UAVFrontCamera');
	var bCameraUAV = document.getElementById('UAVBottomCamera');
        thermalUAV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(UAVVideoDisplay != "THERMAL"){
			//we are switching to thermal
			console.log("Switching to UAV Thermal Display");
			thermalUAV.style.backgroundColor = 'grey';//active
			fCameraUAV.style.backgroundColor = 'white';//standby
			bCameraUAV.style.backgroundColor = 'white';//standby
			UAVVideoDisplay = "THERMAL";
		}else{
			//UAV thermal is already being displayed
			console.log("UAV Thermal is already being displayed.");
		}
	}
};

var displayUAVFrontCamera = function(){
	//this function is called when the UAV FRONT CAMERA button is clicked
	
        var thermalUAV = document.getElementById('UAVThermal');
	var fCameraUAV = document.getElementById('UAVFrontCamera');
	var bCameraUAV = document.getElementById('UAVBottomCamera');
        fCameraUAV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(UAVVideoDisplay != "FRONT"){
			//we are switching to front camera
			console.log("Switching to UAV Front Camera Display");
			thermalUAV.style.backgroundColor = 'white';//standby
			fCameraUAV.style.backgroundColor = 'grey';//active
			bCameraUAV.style.backgroundColor = 'white';//standby
			UAVVideoDisplay = "FRONT";
		}else{
			//UAV front cam is already being displayed
			console.log("UAV Front Camera is already being displayed.");
		}
	}
};

var displayUAVBottomCamera = function(){
	//this function is called when the UAV BOTTOM CAMERA button is clicked
	
        var thermalUAV = document.getElementById('UAVThermal');
	var fCameraUAV = document.getElementById('UAVFrontCamera');
	var bCameraUAV = document.getElementById('UAVBottomCamera');
        bCameraUAV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(UAVVideoDisplay != "BOTTOM"){
			//we are switching to bottom camera
			console.log("Switching to UAV Bottom Camera Display");
			thermalUAV.style.backgroundColor = 'white';//standby
			fCameraUAV.style.backgroundColor = 'white';//standby
			bCameraUAV.style.backgroundColor = 'grey';//white
			UAVVideoDisplay = "BOTTOM";
		}else{
			//UAV bottom cam is already being displayed
			console.log("UAV Bottom Camera is already being displayed.");
		}
	}
};

var loadWPUI = function(){
/**DRONE
	console.log('before require ar drone');
	require('ar-drone');
	console.log('after require ar drone');
**/

//	var zoomap = L.map('zoomap').setView([51.505,-0.09],13);
/**	L.titleLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'your.mapbox.project.id',
		accessToken: 'your.mapbox.public.access.token'
	}).addTo(zoomap);**/
/**
var zoomap = L.map('zoomap', {
	crs:L.CRS.Simple
});**/
/**
var bounds = [[0,0],[1000,1000]];
var image = L.imageOverlay('SD_ZooMap.PNG',bounds).addTo(zoomap);
**/
	zoomap.on('popupopen',function(e){
		selectedMapMarker = e.popup._source;
		selectedMapMarkerLat = selectedMapMarker.getLatLng().lat;
		selectedMapMarkerLng = selectedMapMarker.getLatLng().lng;
		findSelectedMapMarker();
	});
	zoomap.on('popupclose',function(e){
		selectedMapMarkerGroup = "NONE";
		deleteMarker.style.background = "transparent";	
		onboardMarker.style.background = "transparent";	
		livingStatus.style.background = "transparent";
	});
	
        //this function is called when the WPUI page
        var thermalUAV = document.getElementById('UAVThermal');
	var fCameraUAV = document.getElementById('UAVFrontCamera');
	var bCameraUAV = document.getElementById('UAVBottomCamera');
        var frontCamUGV = document.getElementById('UGVForwardCamera');
	var rearCamUGV = document.getElementById('UGVRearCamera');
	
	UAVVideoDisplay = "FRONT"; //UAV display starts on camera
	isUGVDisplayingFrontCamera = true;//UGV display starts on front camera
	
	thermalUAV.style.backgroundColor = 'white';//standby
	fCameraUAV.style.backgroundColor = 'grey';//active
	bCameraUAV.style.backgroundColor = 'white';//standby
	rearCamUGV.style.backgroundColor = 'white';//standby
	frontCamUGV.style.backgroundColor = 'grey';//active

	UAVLabel.style.color="black";
	UGVLabel.style.color="black";
	
	var UAVBatteryOption = document.getElementById('UAVBatteryOption');
	var UAVTempOption = document.getElementById('UAVTempOption');
	var UAVAltitudeOption = document.getElementById('UAVAltitudeOption');
	var UAVSpeedOption = document.getElementById('UAVSpeedOption');
	var UGVBatteryOption = document.getElementById('UGVBatteryOption');
	var UGVTempOption = document.getElementById('UGVTempOption');
	//var UGVAnimalOption = document.getElementById('UGVAnimalOption');
	var UGVWheelOption = document.getElementById('UGVWheelOption');
	var UGVCraneOption = document.getElementById('UGVCraneOption');
	var UGVSpeedOption = document.getElementById('UGVSpeedOption');
	
	isUAVBatteryHidden = false;//boolean to show/hide Battery (mins)
	isUAVTempHidden = false; //boolean to show/hide temp
	isUAVAltitudeHidden = false;//boolean to show/hide altitude
	isUAVSpeedHidden = false;//boolean to show/hide speed
	isUGVBatteryHidden = false;//boolean to show/hide Battery (mins)
	isUGVTempHidden = false;//boolean to show/hide temp
	//isUGVAnimalCountHidden = false;//boolean to show/hide animal count
	isUGVWheelAngleHidden = false;//boolean to show/hide wheel angle
	isUGVCraneAngleHidden = false;//boolean to show/hide crane angle
	isUGVSpeedHidden = false;//boolean to show/hide speed
	
	UAVBatteryOption.style.backgroundColor = 'grey';//active
	UAVTempOption.style.backgroundColor = 'grey';//active
	UAVAltitudeOption.style.backgroundColor = 'grey';//active
	UAVSpeedOption.style.backgroundColor = 'grey';//active
	UGVBatteryOption.style.backgroundColor = 'grey';//active
	UGVTempOption.style.backgroundColor = 'grey';//active
	//UGVAnimalOption.style.backgroundColor = 'grey';//active
	UGVWheelOption.style.backgroundColor = 'grey';//active
	UGVCraneOption.style.backgroundColor = 'grey';//active
	UGVSpeedOption.style.backgroundColor = 'grey';//active
	
	var UAVTelem = document.getElementById('UAVTelem');
	var UGVTelem = document.getElementById('UGVTelem');
	
	
	UAVTelem.style.backgroundColor = 'white';//standby
	UGVTelem.style.backgroundColor = 'white';//standby


	var manualPath = document.getElementById('manualPath');
	var fig8Path = document.getElementById('fig8Path');
	var perimSweepPath = document.getElementById('perimSweepPath');
	var followUGVPath = document.getElementById('followUGVPath');
	var centerPath = document.getElementById('centerPath');

	manualPath.style.backgroundColor = "white"; //standby
	currentAutoPath = "MANUAL";
	UAVAutoPathLabel.style.backgroundColor="transparent";
	fig8Path.style.backgroundColor = "white"; //standby
	perimSweepPath.style.backgroundColor = "white"; //standby
	followUGVPath.style.backgroundColor = "white"; //standby
	centerPath.style.backgroundColor = "white"; //standby

	var UASControls = document.getElementById('UASControls');

};

var displayUGVFrontCam = function(){
	//this function is called when the UGV Front Camera button is clicked
	
        var frontCamUGV = document.getElementById('UGVForwardCamera');
	var rearCamUGV = document.getElementById('UGVRearCamera');
        frontCamUGV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(isUGVDisplayingFrontCamera == false){
			//we are switching from rear to front camera
			console.log("Switching from UGV rear camera to UGV front camera");
			rearCamUGV.style.backgroundColor = 'white';//standby
			frontCamUGV.style.backgroundColor = 'grey';//active
			isUGVDisplayingFrontCamera = true;
		}else{
			//UGV front camera is already being displayed
			console.log("UGV Front Camera is already being displayed.");
		}
	}
};

var displayUGVRearCam = function(){
	//this function is called when the UGV Rear Camera button is clicked
	
        var frontCamUGV = document.getElementById('UGVForwardCamera');
	var rearCamUGV = document.getElementById('UGVRearCamera');
        rearCamUGV.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(isUGVDisplayingFrontCamera == true){
			//we are switching from front to rear camera
			console.log("Switching from UGV front camera to UGV rear camera");
			rearCamUGV.style.backgroundColor = 'grey';//active
			frontCamUGV.style.backgroundColor = 'white';//standby
			isUGVDisplayingFrontCamera = false;
		}else{
			//UGV rear camera is already being displayed
			console.log("UGV Rear Camera is already being displayed.");
		}
	}
};

var displayControls = function(){
	//this function is called when the View Controls Box is clicked
	
	var UAVImg = document.getElementById('UAVImg');
	var UGVImg = document.getElementById('UGVImg');
	
	var controlDisplay = document.getElementById('controlDisplay');
	var controlImg = document.getElementById('controlImg');
	var controlCaption = document.getElementById('controlCaption');


	var UAVControlDisplay = document.getElementById('UAVControlDisplay');
	UAVControlDisplay.addEventListener('click',eventHandler); //ading click listener
	var UGVControlDisplay = document.getElementById('UGVControlDisplay');
	UGVControlDisplay.addEventListener('click',eventHandler); //ading click listener
	
	function eventHandler(event){
		displayingControls = true;
		controlDisplay.style.display = "block";
		if(this.id=="UAVControlDisplay"){
			controlImg.src = UAVImg.src;
			controlCaption.innerHTML = UAVImg.alt;
			console.log("Displaying UAV Controls");
		}else{
			controlImg.src = UGVImg.src;
			controlCaption.innerHTML = UGVImg.alt;	
			console.log("Display UGV Controls");
		}
	}

	var closeControlDisplay = document.getElementsByClassName("close")[0];

	closeControlDisplay.onclick = function(){
		//this is called on the clicking of the "X" when the control popup is displayed
		displayingControls = false;
		controlDisplay.style.display="none";
		console.log("hiding the control display");
	}
};

var animal = function(name, xLocation, yLocation, id, endangeredLevel, priorityScore, priorityRank, isAlive, isRescued) {
	this.name = name; //name of the animal to display on the map
	this.xLocation = xLocation; //x coordinate of the (x,y) animal location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) animal location on the map
	this.id = id; //animal's id in the database
	this.endangeredLevel = endangeredLevel; //7 is the most endangered, 1 is the least endangered
	this.priorityScore = priorityScore; //calculated priority score
	this.priorityRank = priorityRank; //calculated priority rank based off of other animal priority scores
	this.isAlive = isAlive; //boolean to determine if the animal is still alive
	this.isRescued = isRescued; //boolean to determine if the animal has been recued yet
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
	};
	this.changeId = function(newId){//change the id number
		//console.log("Write to database for ID = " + this.id + ": new ID = "+newId);
		this.id = newId;
	};
	this.changeEndangeredLevel = function(newEndangeredLevel){//change the endangered level of an animal
		//console.log("Write to database for ID = " + this.id + ": new endangered level  = "+newEndangeredLevel);
		this.endangeredLevel = newEndangeredLevel;
	};
	this.changePriorityScore = function(newPriorityScore){//change the priority score of an animal
		//console.log("Write to database for ID = " + this.id + ": new priority score = "+newPriorityScore);
		this.priorityScore = newPriorityScore;
	};
	this.changePriorityRank = function(newPriorityRank){//change the priority rank of an animal
		//console.log("Write to database for ID = " + this.id + ": new priority rank = "+newPriorityRank);
		this.priorityRank = newPriorityRank;
	};
	this.changeIsAlive = function(newIsAlive){ //change the alive status of the animal
		//console.log("Write to database for ID = " + this.id + ": new alive status = "+newIsAlive);
		this.isAlive = newIsAlive;
	};
	this.changeIsRescued = function(newIsRescued){ //change the rescue status of the animal
		//console.log("Write to database for ID = " + this.id + ": new rescued status = "+newIsRescued);
		this.isRescued = newIsRescued;
	};
	
	this.endngrString = "";
	switch(this.endangeredLevel){
		case 0:
			this.endngrString = "UNK";
			break;
		case 1:
			this.endngrString = "Least Concern";
			break;
		case 2:
			this.endngrString = "Near Threatened";
			break;
		case 3:
			this.endngrString = "Vulnerable";
			break;
		case 4:
			this.endngrString = "Endangered";
			break;
		case 5:
			this.endngrString = "Critically Endangered";
			break;
		case 6:
			this.endngrString = "Extinct in the Wild";
			break;
		case 7:
			this.endngrString = "Extinct";
			break;
		default:
			this.endngrString = "ERROR";
			break;
	}
	
	//console.log("Write to database for ID = "+ this.id + ":  Name = " + this.name + " (X,Y) = ("+this.xLocation+","+this.yLocation+") Endangered Level = " + this.endangeredLevel + " Priority Score = "+this.priorityScore + " Priority Rank = "+this.priorityRank + " Alive?= "+this.isAlive+ " Rescued?= "+ this.isRescued+ " missionStartTimeStamp= " + this.time);
	
	animalIdCounter ++;
};
	
var fire = function(xLocation, yLocation, id){
	this.name = "Fire Marker"; //name of the fire marker to display on the map (if applicable)
	this.xLocation = xLocation; //x coordinate of the (x,y) fire markers location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) fire markers location on the map
	this.id = id; //fire markers id in the database
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
	};
	this.changeId = function(newId){//change the id number
		//console.log("Write to database for ID = " + this.id + ": new ID = "+newId);
		this.id = newId;
	};

	//console.log("Write to database for ID = "+ this.id + ":  Name = " + this.name + " (X,Y) = ("+this.xLocation+","+this.yLocation+") missionStartTimeStamp= "+ this.time);
	
	var fireIcon = L.icon({
		iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_fire.png',
		iconSize:    [25,33], //size of the icon
		iconAnchor:  [13,24], //point of the icon which will correspond to marker's location
		popupAnchor: [0,-16]  //point from which the popup should open relative to the iconAnchor
	});
	var newFireMarker = L.marker([this.yLocation, this.xLocation], {icon: fireIcon}).addTo(zoomap);
	newFireMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;FIRE</b>");
	markers.addLayer(newFireMarker);
	fireIdCounter ++;
};

var UAV = function(xLocation, yLocation, id){
	this.name = "UAV"; //name of the UAV to display on the map (if applicable)
	this.xLocation = xLocation; //x coordinate of the (x,y) UAVs location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) UAVs location on the map
	this.id = id; //UAV's id in the database
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
		//check if vehicle is close to the boundary
		if(((this.xLocation <= 5) || (this.xLocation >= 180)) || ((this.yLocation <= 5) || (this.yLocation >= 70))){
			//console.log("Getting close to boundary");
			if(isUAVAlertDisplaying == false){
				displayAlert("UAV","BOUNDARY");
			}
		}
		//check if UAV is close to a tree
		for(var i = 0; i< treeMarkerList.length; i++){
			var treeDistance = getDistance(this.xLocation, this.yLocation, treeMarkerList[i].xLocation,treeMarkerList[i].yLocation);
			if(treeDistance <= 5){
				//console.log("Getting close to a tree");
				if(isUAVAlertDisplaying == false){
					displayAlert("UAV","TREE");
				}
			}
		}
		uavMarkers.clearLayers();
		var uavIcon = L.icon({
			iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_uav.png',
			iconSize:    [40,40], //size of the icon
			iconAnchor:  [20,20], //point of the icon which will correspond to marker's location
			popupAnchor: [0,0]  //point from which the popup should open relative to the iconAnchor
		});
		var newUAVMarker = L.marker([this.yLocation, this.xLocation], {icon: uavIcon}).addTo(zoomap);
		newUAVMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;UAV</b>");
		uavMarkers.addLayer(newUAVMarker);
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
		//check if vehicle is close to the boundary
		if(((this.xLocation <= 5) || (this.xLocation >= 180)) || ((this.yLocation <= 5) || (this.yLocation >= 70))){
			//console.log("Getting close to boundary");
			if(isUAVAlertDisplaying == false){
				displayAlert("UAV","BOUNDARY");
			}
		}
		//check if UAV is close to a tree
		for(var i = 0; i< treeMarkerList.length; i++){
			var treeDistance = getDistance(this.xLocation, this.yLocation, treeMarkerList[i].xLocation,treeMarkerList[i].yLocation);
			if(treeDistance <= 5){
				//console.log("Getting close to a tree");
				if(isUAVAlertDisplaying == false){
					displayAlert("UAV","TREE");
				}
			}
		}
		uavMarkers.clearLayers();
		var uavIcon = L.icon({
			iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_uav.png',
			iconSize:    [40,40], //size of the icon
			iconAnchor:  [20,20], //point of the icon which will correspond to marker's location
			popupAnchor: [0,0]  //point from which the popup should open relative to the iconAnchor
		});
		var newUAVMarker = L.marker([this.yLocation, this.xLocation], {icon: uavIcon}).addTo(zoomap);
		newUAVMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;UAV</b>");
		uavMarkers.addLayer(newUAVMarker);
	};
	this.changeId = function(newId){//change the id number
		//console.log("Write to database for ID = " + this.id + ": new ID = "+newId);
		this.id = newId;
	};

	//console.log("Write to database for ID = "+ this.id + ":  Name = " + this.name + " (X,Y) = ("+this.xLocation+","+this.yLocation+") missionStartTimeStamp= "+this.time);
	
	//check if vehicle is close to the boundary
	if(((this.xLocation <= 5) || (this.xLocation >= 180)) || ((this.yLocation <= 5) || (this.yLocation >= 70))){
		//console.log("Getting close to boundary");
		if(isUAVAlertDisplaying == false){
			displayAlert("UAV","BOUNDARY");
		}
	}
	//check if UAV is close to a tree
	for(var i = 0; i< treeMarkerList.length; i++){
		var treeDistance = getDistance(this.xLocation, this.yLocation, treeMarkerList[i].xLocation,treeMarkerList[i].yLocation);
		if(treeDistance <= 5){
			//console.log("Getting close to a tree");
			if(isUAVAlertDisplaying == false){
				displayAlert("UAV","TREE");
			}
		}
	}
	
	var uavIcon = L.icon({
		iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_uav.png',
		iconSize:    [40,40], //size of the icon
		iconAnchor:  [20,20], //point of the icon which will correspond to marker's location
		popupAnchor: [0,0]  //point from which the popup should open relative to the iconAnchor
	});
	var newUAVMarker = L.marker([this.yLocation, this.xLocation], {icon: uavIcon}).addTo(zoomap);
	newUAVMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;UAV</b>");
	uavMarkers.addLayer(newUAVMarker);
};

var UGV = function(xLocation, yLocation, id){
	this.name = "UGV"; //name of the UGV to display on the map (if applicable)
	this.xLocation = xLocation; //x coordinate of the (x,y) UGVs location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) UGVs location on the map
	this.id = id; //UGV's id in the database
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
	
		//check if vehicle is close to the boundary
		if(((this.xLocation <= 5) || (this.xLocation >= 180)) || ((this.yLocation <= 5) || (this.yLocation >= 70))){
			//console.log("Getting close to boundary");
			if(isUGVAlertDisplaying == false){
				displayAlert("UGV","BOUNDARY");
			}
		}
		ugvMarkers.clearLayers();
		var ugvIcon = L.icon({
			iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_ugv.png',
			iconSize:    [40,40], //size of the icon
			iconAnchor:  [20,20], //point of the icon which will correspond to marker's location
			popupAnchor: [0,0]  //point from which the popup should open relative to the iconAnchor
		});
		var newUGVMarker = L.marker([this.yLocation, this.xLocation], {icon: ugvIcon}).addTo(zoomap);
		newUGVMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;UGV</b>");
		ugvMarkers.addLayer(newUGVMarker);
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
		
		//check if vehicle is close to the boundary on location change
		if(((this.xLocation <= 5) || (this.xLocation >= 180)) || ((this.yLocation <= 5) || (this.yLocation >= 70))){
			//console.log("Getting close to boundary");
			if(isUGVAlertDisplaying == false){
				displayAlert("UGV","BOUNDARY");
			}
		}
		ugvMarkers.clearLayers();
		var ugvIcon = L.icon({
			iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_ugv.png',
			iconSize:    [40,40], //size of the icon
			iconAnchor:  [20,20], //point of the icon which will correspond to marker's location
			popupAnchor: [0,0]  //point from which the popup should open relative to the iconAnchor
		});
		var newUGVMarker = L.marker([this.yLocation, this.xLocation], {icon: ugvIcon}).addTo(zoomap);
		newUGVMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;UGV</b>");
		ugvMarkers.addLayer(newUGVMarker);
	};
	this.changeId = function(newId){//change the id number
		//console.log("Write to database for ID = " + this.id + ": new ID = "+newId);
		this.id = newId;
	};

	//console.log("Write to database for ID = "+ this.id + ":  Name = " + this.name + " (X,Y) = ("+this.xLocation+","+this.yLocation+") missionStartTimeStamp= "+this.time);
	
	//check if vehicle is close to the boundary on init placement
	if(((this.xLocation <= 5) || (this.xLocation >= 180)) || ((this.yLocation <= 5) || (this.yLocation >= 70))){
		//console.log("Getting close to boundary");
		if(isUGVAlertDisplaying == false){
			displayAlert("UGV","BOUNDARY");
		}
	}

	var ugvIcon = L.icon({
		iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_ugv.png',
		iconSize:    [40,40], //size of the icon
		iconAnchor:  [20,20], //point of the icon which will correspond to marker's location
		popupAnchor: [0,0]  //point from which the popup should open relative to the iconAnchor
	});
	var newUGVMarker = L.marker([this.yLocation, this.xLocation], {icon: ugvIcon}).addTo(zoomap);
	newUGVMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;UGV</b>");
	ugvMarkers.addLayer(newUGVMarker);
};

var debris = function(xLocation,yLocation, id){
	this.name = "Debris"; //name of the debris to display on the map (if applicable)
	this.xLocation = xLocation; //x coordinate of the (x,y) debris location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) debris location on the map
	this.id = id; //debris id in the database
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
	};
	this.changeId = function(newId){//change the id number
		//console.log("Write to database for ID = " + this.id + ": new ID = "+newId);
		this.id = newId;
	};

	//console.log("Write to database for ID = "+ this.id + ":  Name = " + this.name + " (X,Y) = ("+this.xLocation+","+this.yLocation+") missionStartTimeStamp= "+this.time);	
	
	var debrisIcon = L.icon({
		iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_debris.png',
		iconSize:    [25,25], //size of the icon
		iconAnchor:  [13,16], //point of the icon which will correspond to marker's location
		popupAnchor: [0,-16]  //point from which the popup should open relative to the iconAnchor
	});
	var newDebrisMarker = L.marker([this.yLocation, this.xLocation], {icon: debrisIcon}).addTo(zoomap);
	markers.addLayer(newDebrisMarker);
	newDebrisMarker.bindPopup("<b>&nbsp;DEBRIS</b>");
	debrisIdCounter ++;
};

var impassableBlocker = function(xLocation,yLocation, id){
	this.name = "Impassable Blocker"; //name of the impassable Blocker to display on the map (if applicable)
	this.xLocation = xLocation; //x coordinate of the (x,y) blockers location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) blockers location on the map
	this.id = id; //blockers id in the database
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
	};
	this.changeId = function(newId){//change the id number
		//console.log("Write to database for ID = " + this.id + ": new ID = "+newId);
		this.id = newId;
	};

	//console.log("Write to database for ID = "+ this.id + ":  Name = " + this.name + " (X,Y) = ("+this.xLocation+","+this.yLocation+") missionStartTimeStamp= "+this.time);

	var blockerIcon = L.icon({
		iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_blocker.png',
		iconSize:    [25,25], //size of the icon
		iconAnchor:  [13,16], //point of the icon which will correspond to marker's location
		popupAnchor: [0,-16]  //point from which the popup should open relative to the iconAnchor
	});
	var newBlockerMarker = L.marker([this.yLocation, this.xLocation], {icon: blockerIcon}).addTo(zoomap);
	markers.addLayer(newBlockerMarker);
	newBlockerMarker.bindPopup("<b>&nbsp;IMPASSABLE BLOCKER</b>");
	blockerIdCounter ++;
};

var tree = function(xLocation,yLocation){
	this.name = "Debris"; //name of the debris to display on the map (if applicable)
	this.xLocation = xLocation; //x coordinate of the (x,y) debris location on the map
	this.yLocation = yLocation; //y coordinate of the (x,y) debris location on the map
	this.time = missionTimeStamp.toString();
	this.changeName = function(newName){//change the name
		//console.log("Write to database for ID = " + this.id + ": new name = "+newName);
		this.name = newName;
	};
	this.changeXLocation = function(newXLocation){//change the x location
		//console.log("Write to database for ID = " + this.id + ": new xLocation = " + newXLocation);
		this.xLocation = newXLocation;
	};
	this.changeYLocation = function(newYLocation){//change the y location
		//console.log("Write to database for ID = " + this.id + ": new yLocation = " + newYLocation);
		this.yLocation = newYLocation;
	};
	var treeIcon = L.icon({
		iconUrl: 'https://s3.amazonaws.com/twolegittwoquit/images/zoomap_images/marker_tree.png',
		iconSize:    [25,33], //size of the icon
		iconAnchor:  [13,24], //point of the icon which will correspond to marker's location
		popupAnchor: [0,-16]  //point from which the popup should open relative to the iconAnchor
	});
	var newTreeMarker = L.marker([this.yLocation, this.xLocation], {icon: treeIcon}).addTo(zoomap);
	newTreeMarker.bindPopup("<b>&nbsp;&nbsp;&nbsp;TREE</b>");
	markers.addLayer(newTreeMarker);
};

var displayAlert = function(vehicle, object){
	//this function is called when the UAV or UGV gets too close to the boundary or UAV gets close to a tree
	var alertWarningUAV = document.getElementById("alertWarningUAV");
	var closeWarningUAV = document.getElementById("alertCloseUAV");
	var alertTextUAV = document.getElementById("alertTextUAV");
	var alertWarningUGV = document.getElementById("alertWarningUGV");
	var closeWarningUGV = document.getElementById("alertCloseUGV");
	var alertTextUGV = document.getElementById("alertTextUGV");

	if(vehicle == "UAV"){
		if(object == "BOUNDARY"){
			alertTextUAV.innerHTML="<strong>Warning!</strong> UAV is getting close to the boundary of the map!";
		}else if(object == "TREE"){
			alertTextUAV.innerHTML="<strong>Warning!</strong> UAV is getting close to an external object!";
		}else{
			console.log("Error while displaying alert message");
		}
		alertWarningUAV.style.display="block";
		isUAVAlertDisplaying = true;	
		setTimeout(function(){
			alertWarningUAV.style.display="none";
			isUAVAlertDisplaying = false;
		}, 5000);
	}else if(vehicle == "UGV"){
		if(object == "BOUNDARY"){
			alertTextUGV.innerHTML="<strong>Warning!</strong> UGV is getting close to the boundary of the map!";
		}else{
			console.log("Error while displaying alert message");
		}
		alertWarningUGV.style.display="block";
		isUGVAlertDisplaying = true;	
		setTimeout(function(){
			alertWarningUGV.style.display="none";
			isUGVAlertDisplaying = false;
		}, 5000);
	}else{
		console.log("Error while displaying alert message");
	}

		
};

var closeAlert = function(){
	//this function is called when the warning alert is getting closed
	var alertWarningUAV = document.getElementById("alertWarningUAV");
	var closeWarningUAV = document.getElementById("alertCloseUAV");
	closeWarningUAV.addEventListener('click',eventHandler);//adding click listener
	var alertWarningUGV = document.getElementById("alertWarningUGV");
	var closeWarningUGV = document.getElementById("alertCloseUGV");
	closeWarningUGV.addEventListener('click',eventHandler);//adding click listener

	function eventHandler(event){
		if(this.id == "alertCloseUAV"){
			alertWarningUAV.style.display="none";
			isUAVAlertDisplaying = false;
		}else{
			alertWarningUGV.style.display="none";
			isUGVAlertDisplaying = false;
		}
	}
};

var selectMarkerBucket = function(){
	//this function is called when a marker bucket is clicked
	var animalBucket = document.getElementById('animalBucket');
	var fireBucket = document.getElementById('fireBucket');
	var blockerBucket = document.getElementById('blockerBucket');
	var debrisBucket = document.getElementById('debrisBucket');
	
	animalBucket.addEventListener('click',eventHandler);//adding click listener
	fireBucket.addEventListener('click',eventHandler);//adding click listener
	blockerBucket.addEventListener('click',eventHandler);//adding click listener
	debrisBucket.addEventListener('click',eventHandler);//adding click listener
	
	var animalBucketText = document.getElementById('animalBucketText');
	var fireBucketText = document.getElementById('fireBucketText');
	var blockerBucketText = document.getElementById('blockerBucketText');
	var debrisBucketText = document.getElementById('debrisBucketText');
	
	function eventHandler(event){
		if(isMissionInProgress){
			if(this.id == "animalBucket"){
				if(selectedBucketMarker == "NONE"){
					//selecting animal marker
					animalBucketText.style.background="yellow";
					selectedBucketMarker = "ANIMAL";
				}else if(selectedBucketMarker == "ANIMAL"){
					//deselecting animal marker
					animalBucketText.style.backgroundColor="transparent";
					selectedBucketMarker = "NONE";
				}else{
					console.log("Cannot add another marker while animal marker is selected");
				}
			}else if(this.id == "fireBucket"){
				if(selectedBucketMarker == "NONE"){
					//select fire marker
					fireBucketText.style.background="yellow";
					selectedBucketMarker = "FIRE";
				}else if(selectedBucketMarker == "FIRE"){
					//deselect fire marker
					fireBucketText.style.background="transparent";
					selectedBucketMarker = "NONE";
				}else{
					console.log("Cannot add another marker while fire marker is selected");
				}
			}else if(this.id == "blockerBucket"){
				if(selectedBucketMarker == "NONE"){
					//select blocker marker
					blockerBucketText.style.background="yellow";
					selectedBucketMarker = "BLOCKER";
				}else if(selectedBucketMarker == "BLOCKER"){
					//deselect blocker marker
					blockerBucketText.style.background="transparent";
					selectedBucketMarker = "NONE";
				}else{
					console.log("Cannot add another marker while blocker marker is selected");
				}
			}else if(this.id == "debrisBucket"){
				if(selectedBucketMarker == "NONE"){
					//select debris marker
					debrisBucketText.style.background="yellow";
					selectedBucketMarker = "DEBRIS";
				}else if(selectedBucketMarker == "DEBRIS"){
					//deselect debris marker
					debrisBucketText.style.background="transparent";
					selectedBucketMarker = "NONE";
				}else{
					console.log("Cannot add another marker while debris marker is selected");
				}
			}else{
				console.log("ERROR while selecting marker");
			}
		}else{
			console.log("Can only select markers when mission is in progress");
		}
	}
};

var addMapMarker = function(){
	//called when one of the map buckets is placed on the map
	zoomap.on('click',function(e){
		if(selectedBucketMarker != "NONE"){
			if(e.latlng.lat <= 75 && e.latlng.lat >=0 && e.latlng.lng <= 185 && e.latlng.lng >= 0){
				if(selectedBucketMarker == "ANIMAL"){
					timeBeforePopup = new Date();
					var animalNamePrompt = prompt("Please enter the animal's name:", "UNK");
					var animalEndngrLvlPrompt = prompt("Please enter the animal's endangered level:\n1 = Least Concern\n2 = Near Threatened\n3 = Vulnerable\n4 = Endangered\n5 = Critically Endangered\n6 = Extinct in the Wild\n7 = Extinct","UNK");
					timeAfterPopup = new Date();
					updateMissionTimer(timeAfterPopup-timeBeforePopup);
					if ((animalNamePrompt == null) || (animalEndngrLvlPrompt == null)){
						console.log("Operator Canceled input");
					}else{
						var animalEndngrLvl = 0;
						if((animalEndngrLvlPrompt == "0") || (animalEndngrLvlPrompt == "UNK")){
							animalEndngrLvl = 0;
						}else if((animalEndngrLvlPrompt == "1") || (animalEndngrLvlPrompt == "Least Concern")){
							animalEndngrLvl = 1;
						}else if((animalEndngrLvlPrompt == "2") || (animalEndngrLvlPrompt == "Near Threatened")){
							animalEndngrLvl = 2;
						}else if((animalEndngrLvlPrompt == "3") || (animalEndngrLvlPrompt == "Vulnerable")){
							animalEndngrLvl = 3;
						}else if((animalEndngrLvlPrompt == "4") || (animalEndngrLvlPrompt == "Endangered")){
							animalEndngrLvl = 4;
						}else if((animalEndngrLvlPrompt == "5") || (animalEndngrLvlPrompt == "Critically Endangered")){
							animalEndngrLvl = 5;
						}else if((animalEndngrLvlPrompt == "6") || (animalEndngrLvlPrompt == "Extinct in the Wild")){
							animalEndngrLvl = 6;
						}else if((animalEndngrLvlPrompt == "7") || (animalEndngrLvlPrompt == "Extinct")){
							animalEndngrLvl = 7;
						}else{
							animalEndngrLvl = -1;
						}
						
						var newAnimalMarker = new animal(animalNamePrompt,e.latlng.lng,e.latlng.lat,animalIdCounter,animalEndngrLvl,0,0,true,false); //initialize a new animali
						animalMarkerList.push(newAnimalMarker);
						updatePriorityRanking();//update the priority rank since we added a new animal
					}
					animalBucketText.style.background="transparent";
				}else if(selectedBucketMarker == "FIRE"){
					var newFireMarker = new fire(e.latlng.lng,e.latlng.lat,fireIdCounter); //initialize a fire marker
					fireMarkerList.push(newFireMarker);
					updatePriorityRanking();//update the priority rank since we added a fire marker
					fireBucketText.style.background="transparent";
				}else if(selectedBucketMarker == "BLOCKER"){
					var newBlockerMarker = new impassableBlocker(e.latlng.lng,e.latlng.lat,blockerIdCounter); //initialize a blocker marker
					blockerMarkerList.push(newBlockerMarker);
					blockerBucketText.style.background="transparent";
				}else if(selectedBucketMarker == "DEBRIS"){
					var newDebrisMarker = new debris(e.latlng.lng,e.latlng.lat,debrisIdCounter); //initialize a debris marker
					debrisMarkerList.push(newDebrisMarker);
					debrisBucketText.style.background="transparent";
				}else{
					console.log("ERROR while adding marker to map");
				}
				selectedBucketMarker = "NONE"
			}else{
				console.log("Cannot place marker outside map bounds");
			}
		}else{
			console.log("No marker selected");
		}
	});
};


var findSelectedMapMarker = function(){
	//called when a map marker is clicked
	var deleteMarker = document.getElementById('deleteMarker');
	var onboardMarker = document.getElementById('onboardMarker');
	var livingStatus = document.getElementById('livingStatus');

	selectedMapMarkerGroup = "NONE"; //needed for removing markers. if group is UAV, UGV, home station, or rescue station this will stay as NONE
	deleteMarker.style.background = "transparent";	
	onboardMarker.style.background = "transparent";	
	livingStatus.style.background = "transparent";
	
	for(var i = 0; i< animalMarkerList.length; i++){
		if((animalMarkerList[i].yLocation == selectedMapMarkerLat) && (animalMarkerList[i].xLocation == selectedMapMarkerLng)){
			selectedMapMarkerGroup = "ANIMAL";
		}
	}
	for(var i = 0; i< fireMarkerList.length; i++){
		if((fireMarkerList[i].yLocation == selectedMapMarkerLat) && (fireMarkerList[i].xLocation == selectedMapMarkerLng)){
			selectedMapMarkerGroup = "FIRE";
		}
	}
	for(var i = 0; i< debrisMarkerList.length; i++){
		if((debrisMarkerList[i].yLocation == selectedMapMarkerLat) && (debrisMarkerList[i].xLocation == selectedMapMarkerLng)){
			selectedMapMarkerGroup = "DEBRIS";
		}
	}
	for(var i = 0; i< blockerMarkerList.length; i++){
		if((blockerMarkerList[i].yLocation == selectedMapMarkerLat) && (blockerMarkerList[i].xLocation == selectedMapMarkerLng)){
			selectedMapMarkerGroup = "BLOCKER";
		}
	}
	
	if(selectedMapMarkerGroup != "NONE"){
		deleteMarker.style.background = "yellow";	
	}
	if(selectedMapMarkerGroup == "ANIMAL"){
		onboardMarker.style.background = "yellow";	
		livingStatus.style.background = "yellow";
	}
	
};

var removeMapMarkerFromArray = function(){
	//called when a marker is being removed from the map
	if(selectedMapMarkerGroup == "ANIMAL"){
		for(var i = 0; i< animalMarkerList.length; i++){
			if((animalMarkerList[i].yLocation == selectedMapMarkerLat) && (animalMarkerList[i].xLocation == selectedMapMarkerLng)){
				animalMarkerList.splice(i,1);
			}
		}
	}else if(selectedMapMarkerGroup == "FIRE"){
		for(var i = 0; i< fireMarkerList.length; i++){
			if((fireMarkerList[i].yLocation == selectedMapMarkerLat) && (fireMarkerList[i].xLocation == selectedMapMarkerLng)){
				fireMarkerList.splice(i,1);
			}
		}
	}else if(selectedMapMarkerGroup == "DEBRIS"){
		for(var i = 0; i< debrisMarkerList.length; i++){
			if((debrisMarkerList[i].yLocation == selectedMapMarkerLat) && (debrisMarkerList[i].xLocation == selectedMapMarkerLng)){
				debrisMarkerList.splice(i,1);
			}
		}
	}else if(selectedMapMarkerGroup == "BLOCKER"){
		for(var i = 0; i< blockerMarkerList.length; i++){
			console.log(i);
			if((blockerMarkerList[i].yLocation == selectedMapMarkerLat) && (blockerMarkerList[i].xLocation == selectedMapMarkerLng)){
				blockerMarkerList.splice(i,1);
				console.log("splicing: "+i);
			}
		}
	}else{
		console.log("ERROR while removing marker from array");
	}
}


var removeMapMarker = function(){
	//called when the trashcan img is clicked
	var deleteMarker = document.getElementById('deleteMarker');
	var onboardMarker = document.getElementById('onboardMarker');
	var livingStatus = document.getElementById('livingStatus');
	var trashcan = document.getElementById('trashcan');
	trashcan.addEventListener('click',eventHandler);//adding click listener

	function eventHandler(event){
		if(selectedMapMarkerGroup != "NONE"){
			removeMapMarkerFromArray();
			if(selectedMapMarkerGroup == "ANIMAL" || selectedMapMarkerGroup == "FIRE"){
				updatePriorityRanking();//since we removed an animal or fire marker, we need to update the priority rankings
			}
			markers.removeLayer(selectedMapMarker);
			selectedMapMarkerGroup = "NONE";
			deleteMarker.style.background = "transparent";	
			onboardMarker.style.background = "transparent";	
			livingStatus.style.background = "transparent";
		}else{
			console.log("No removeable marker has been selected for deletion");
		}
	}
};

var changedAnimalLivingStatus = function(){
	//called when the Change Living Status button is clicked
	var deleteMarker = document.getElementById('deleteMarker');
	var onboardMarker = document.getElementById('onboardMarker');
	var livingStatus = document.getElementById('livingStatus');
	var changeStatus = document.getElementById('changeStatus');
	changeStatus.addEventListener('click',eventHandler);//adding click listener

	function eventHandler(event){
		if(selectedMapMarkerGroup == "ANIMAL"){
			for(var i = 0; i< animalMarkerList.length; i++){
				if((animalMarkerList[i].yLocation == selectedMapMarkerLat) && (animalMarkerList[i].xLocation == selectedMapMarkerLng)){
					if(animalMarkerList[i].isAlive == true){
						//changing from Alive to Deceased
						animalMarkerList[i].changeIsAlive(false);
					}else{
						//changing from Deceased to Alive
						animalMarkerList[i].changeIsAlive(true);
					}
				}
			}
			updatePriorityRanking(); //since we changed an animals living status we need to update the priority rankings
			
			selectedMapMarkerGroup = "NONE";
			deleteMarker.style.background = "transparent";	
			onboardMarker.style.background = "transparent";	
			livingStatus.style.background = "transparent";
		}else{
			console.log("Must select an animal marker to change its status");
		}
	}
};


var loadingAnimal = function(){
	//this is called when an animal is loaded onto the UGV
	var loadedProperly = false;
	var animalOnboard1 = document.getElementById('animalOnboard1');
	var animalOnboard2 = document.getElementById('animalOnboard2');
	var animalOnboard3 = document.getElementById('animalOnboard3');

	var animal1Vis = animalOnboard1.style.visibility;
	var animal2Vis = animalOnboard2.style.visibility;
	var animal3Vis = animalOnboard3.style.visibility;

	var loadingAnimalName = "";
	for(var i = 0; i< animalMarkerList.length; i++){
		if((animalMarkerList[i].yLocation == selectedMapMarkerLat) && (animalMarkerList[i].xLocation == selectedMapMarkerLng)){
			loadingAnimalName = animalMarkerList[i].name;
			animalOnboardList.push(animalMarkerList[i]); //adding the animal to the onboard list
		}
	}

	if(animal1Vis == "visible" && animal2Vis == "visible" && animal3Vis == "visible"){
		console.log("all are visable");
		loadedProperly = false;
	}else{
		loadedProperly = true;
		if(animal1Vis == "hidden"){
			animalOnboard1.innerHTML = "&ensp;&ensp;" + loadingAnimalName;
			animalOnboard1.style.visibility = "visible";
			//writeUGVAnimalCount(1);
		}else if(animal2Vis == "hidden"){
			animalOnboard2.innerHTML = "&ensp;&ensp;" + loadingAnimalName;
			animalOnboard2.style.visibility = "visible";
			//writeUGVAnimalCount(2);
		}else if(animal3Vis == "hidden"){
			animalOnboard3.innerHTML = "&ensp;&ensp;" + loadingAnimalName;
			animalOnboard3.style.visibility = "visible";
			//writeUGVAnimalCount(3);
		}
		
		
	}
	return loadedProperly;
};

var pickedUpAnimal = function(){
	//called when the Load Animal button is clicked (when an animal is picked up)
	var deleteMarker = document.getElementById('deleteMarker');
	var onboardMarker = document.getElementById('onboardMarker');
	var livingStatus = document.getElementById('livingStatus');
	var loadAnimal = document.getElementById('loadAnimal');
	loadAnimal.addEventListener('click',eventHandler);//adding click listener

	function eventHandler(event){
		if(selectedMapMarkerGroup == "ANIMAL"){
			var loadedProperly = loadingAnimal();
			if(loadedProperly == true){
				//set UGV position to the animal that was just picked up
				ugv1.changeXLocation(selectedMapMarkerLng);
				ugv1.changeYLocation(selectedMapMarkerLat);
				
				removeMapMarkerFromArray();
				updatePriorityRanking();//since we picked up an animal, we need to update the priority rankings
				markers.removeLayer(selectedMapMarker);
			}else{
				console.log("Did not load animal. Must have room to load the animal.");
			}
			selectedMapMarkerGroup = "NONE";
			deleteMarker.style.background = "transparent";	
			onboardMarker.style.background = "transparent";	
			livingStatus.style.background = "transparent";
		}else{
			console.log("No Animal Marker was selected to be picked up");
		}
	}
};

var droppedOffAnimal = function(){
	//called when the Unload Animals button is clicked
	var animalOnboard1 = document.getElementById('animalOnboard1');
	var animalOnboard2 = document.getElementById('animalOnboard2');
	var animalOnboard3 = document.getElementById('animalOnboard3');
	var unloadAnimal = document.getElementById("unloadAnimal");
	unloadAnimal.addEventListener('click',eventHandler);//adding click listener
	
	function eventHandler(event){
		for(var i = 0; i< animalOnboardList.length; i++){	
			animalOnboardList[i].changeIsRescued(true); //changing the its status to rescued
			animalRescuedList.push(animalOnboardList[i]); //adding the animal to the rescued list
		}
		while(animalOnboardList.length > 0){
			//empty out the animal onboard array
			animalOnboardList.pop();
		}

		//writeUGVAnimalCount(0);
		animalOnboard1.innerHTML = "";
		animalOnboard1.style.visibility = "hidden";
		animalOnboard2.innerHTML = "";
		animalOnboard2.style.visibility = "hidden";
		animalOnboard3.innerHTML = "";
		animalOnboard3.style.visibility = "hidden";
		
		//set UGV position to the rescue station
		ugv1.changeXLocation(140);
		ugv1.changeYLocation(45);
		updatePriorityRanking();//since reset the ugv location at rescue base, let's update the priority rankings
	}
};

var cleanupMap = function(){
	//called when mission ends. Removes all markers on the map. Also clears out the animalList and fireList.
	markers.clearLayers();
	uavMarkers.clearLayers();
	ugvMarkers.clearLayers();
	priorityMarkers.clearLayers();
	while(animalMarkerList.length > 0){
		//empty out the animal marker array
		animalMarkerList.pop();
	}
	while(animalOnboardList.length > 0){
		//empty out the animal onboard array
		animalOnboardList.pop();
	}
	while(animalRescuedList.length > 0){
		//empty out the animal rescued array
		animalRescuedList.pop();
	}
	while(fireMarkerList.length > 0){
		//empty out the fire array
		fireMarkerList.pop();
	}
	while(blockerMarkerList.length > 0){
		//empty out the blocker array
		blockerMarkerList.pop();
	}
	while(debrisMarkerList.length > 0){
		//empty out the debris array
		debrisMarkerList.pop();
	}
	while(treeMarkerList.length > 0){
		//empty out the tree array
		treeMarkerList.pop();
	}
	animalIdCounter = 1001;
	fireIdCounter = 2001;
	debrisIdCounter = 3001;
	blockerIdCounter = 4001;
	selectedBucketMarker = "NONE";
	animalBucketText.style.backgroundColor="transparent";
	fireBucketText.style.backgroundColor="transparent";
	debrisBucketText.style.backgroundColor="transparent";
	blockerBucketText.style.backgroundColor="transparent";
	selectedMapMarkerGroup = "NONE";
	deleteMarker.style.background = "transparent";	
	onboardMarker.style.background = "transparent";	
	livingStatus.style.background = "transparent";
};

var filterUAVBattery = function(){
	//this function is called when the UAV Battery (mins) telemetry button is clicked
	var UAVBatteryMin = document.getElementById('UAVBatteryMin');
	var UAVBatteryOption = document.getElementById('UAVBatteryOption');
	UAVBatteryOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUAVBatteryHidden == true){
			//UAV Battery is currently hidden so we want to show it
			console.log("Displaying UAV Battery (mins)");
			UAVBatteryMin.style.display="inline";
			isUAVBatteryHidden = false;
			UAVBatteryOption.style.backgroundColor = "grey";//active
		}else{
			//UAV Battery is currently showing so we want to hide it
			console.log("Hiding UAV Battery (mins)");
			UAVBatteryMin.style.display="none";
			isUAVBatteryHidden = true;
			UAVBatteryOption.style.backgroundColor = "white";//standby
		}
	}
	
};

var filterUAVTemp = function(){
	//this function is called when the UAV Temp telemetry buttons are clicked
	var UAVTemp = document.getElementById('UAVTemp');
	var UAVTempOption = document.getElementById('UAVTempOption');
	UAVTempOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUAVTempHidden == true){
			//UAV Temp is currently hidden so we want to show it
			console.log("Displaying UAV Temp");
			UAVTemp.style.display="inline";
			isUAVTempHidden = false;
			UAVTempOption.style.backgroundColor = "grey";//active
		}else{
			//UAV Temp is currently showing so we want to hide it
			console.log("Hiding UAV Temp");
			UAVTemp.style.display="none";
			isUAVTempHidden = true;
			UAVTempOption.style.backgroundColor = "white";//standby
		}
	}
};

var filterUAVAltitude = function(){
	//this function is called when the UAV Altitude telemetry buttons are clicked
	var UAVAltitude = document.getElementById('UAVAltitude');
	var UAVAltitudeOption = document.getElementById('UAVAltitudeOption');
	UAVAltitudeOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUAVAltitudeHidden == true){
			//UAV Altitude is currently hidden so we want to show it
			console.log("Displaying UAV Altitude");
			UAVAltitude.style.display="inline";
			isUAVAltitudeHidden = false;
			UAVAltitudeOption.style.backgroundColor = "grey";//active
		}else{
			//UAV Altitude is currently showing so we want to hide it
			console.log("Hiding UAV Altitude");
			UAVAltitude.style.display="none";
			isUAVAltitudeHidden = true;
			UAVAltitudeOption.style.backgroundColor = "white";//standby
		}
	}	
};

var filterUAVSpeed = function(){
	//this function is called when the UAV Speed telemetry buttons are clicked
	var UAVSpeed = document.getElementById('UAVSpeed');
	var UAVSpeedOption = document.getElementById('UAVSpeedOption');
	UAVSpeedOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUAVSpeedHidden == true){
			//UAV Speed is currently hidden so we want to show it
			console.log("Displaying UAV Speed");
			UAVSpeed.style.display="inline";
			isUAVSpeedHidden = false;
			UAVSpeedOption.style.backgroundColor = "grey";//active
		}else{
			//UAV Speed is currently showing so we want to hide it
			console.log("Hiding UAV Speed");
			UAVSpeed.style.display="none";
			isUAVSpeedHidden = true;
			UAVSpeedOption.style.backgroundColor = "white";//standby
		}
	}	
};

var filterUGVBattery = function(){
	//this function is called when the UGV Battery (mins) telemetry button is clicked
	var UGVBatteryMin = document.getElementById('UGVBatteryMin');
	var UGVBatteryOption = document.getElementById('UGVBatteryOption');
	UGVBatteryOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUGVBatteryHidden == true){
			//UGV Battery is currently hidden so we want to show it
			console.log("Displaying UGV Battery (mins)");
			UGVBatteryMin.style.display="inline";
			isUGVBatteryHidden = false;
			UGVBatteryOption.style.backgroundColor = "grey";//active
		}else{
			//UGV Battery is currently showing so we want to hide it
			console.log("Hiding UGV Battery (mins)");
			UGVBatteryMin.style.display="none";
			isUGVBatteryHidden = true;
			UGVBatteryOption.style.backgroundColor = "white";//standby
		}
	}
	
};

var filterUGVTemp = function(){
	//this function is called when the UGV Temp telemetry buttons are clicked
	var UGVTemp = document.getElementById('UGVTemp');
	var UGVTempOption = document.getElementById('UGVTempOption');
	UGVTempOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUGVTempHidden == true){
			//UGV Temp is currently hidden so we want to show it
			console.log("Displaying UGV Temp");
			UGVTemp.style.display="inline";
			isUGVTempHidden = false;
			UGVTempOption.style.backgroundColor = "grey";//active
		}else{
			//UGV Temp is currently showing so we want to hide it
			console.log("Hiding UGV Temp");
			UGVTemp.style.display="none";
			isUGVTempHidden = true;
			UGVTempOption.style.backgroundColor = "white";//standby
		}
	}
	
};

/** Deleted due to duplicate of zoo map animals onboard really
var filterUGVAnimal = function(){
	//this function is called when the UGV Animal Count telemetry buttons are clicked
	var UGVAnimalCount = document.getElementById('UGVAnimalCount');
	var UGVAnimalOption = document.getElementById('UGVAnimalOption');
	UGVAnimalOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUGVAnimalCountHidden == true){
			//UGV Animal Count is currently hidden so we want to show it
			console.log("Displaying UGV Animal Count");
			UGVAnimalCount.style.display="inline";
			isUGVAnimalCountHidden = false;
			UGVAnimalOption.style.backgroundColor = "grey";//active
		}else{
			//UGV Animal Count is currently showing so we want to hide it
			console.log("Hiding UGV Animal Count");
			UGVAnimalCount.style.display="none";
			isUGVAnimalCountHidden = true;
			UGVAnimalOption.style.backgroundColor = "white";//standby
		}
	}	
};
**/

var filterUGVWheel = function(){
	//this function is called when the UGV Wheel Angle telemetry buttons are clicked
	var UGVWheelAngle = document.getElementById('UGVWheelAngle');
	var UGVWheelOption = document.getElementById('UGVWheelOption');
	UGVWheelOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUGVWheelAngleHidden == true){
			//UGV Wheel Angle is currently hidden so we want to show it
			console.log("Displaying UGV Wheel Angle");
			UGVWheelAngle.style.display="inline";
			isUGVWheelAngleHidden = false;
			UGVWheelOption.style.backgroundColor = "grey";//active
		}else{
			//UGV Wheel Angle is currently showing so we want to hide it
			console.log("Hiding UGV Wheel Angle");
			UGVWheelAngle.style.display="none";
			isUGVWheelAngleHidden = true;
			UGVWheelOption.style.backgroundColor = "white";//standby
		}
	}	
};

var filterUGVCrane = function(){
	//this function is called when the UGV Crane Angle telemetry buttons are clicked
	var UGVCraneAngle = document.getElementById('UGVCraneAngle');
	var UGVCraneOption = document.getElementById('UGVCraneOption');
	UGVCraneOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUGVCraneAngleHidden == true){
			//UGV Crane Angle is currently hidden so we want to show it
			console.log("Displaying UGV Crane Angle");
			UGVCraneAngle.style.display="inline";
			isUGVCraneAngleHidden = false;
			UGVCraneOption.style.backgroundColor = "grey";//active
		}else{
			//UGV Crane Angle is currently showing so we want to hide it
			console.log("Hiding UGV Crane Angle");
			UGVCraneAngle.style.display="none";
			isUGVCraneAngleHidden = true;
			UGVCraneOption.style.backgroundColor = "white";//standby
		}
	}	
};

var filterUGVSpeed = function(){
	//this function is called when the UGV Speed telemetry buttons are clicked
	var UGVSpeed = document.getElementById('UGVSpeed');
	var UGVSpeedOption = document.getElementById('UGVSpeedOption');
	UGVSpeedOption.addEventListener('click',eventHandler); //adding click listener
	function eventHandler(event){
		if(isUGVSpeedHidden == true){
			//UGV Speed is currently hidden so we want to show it
			console.log("Displaying UGV Speed");
			UGVSpeed.style.display="inline";
			isUGVSpeedHidden = false;
			UGVSpeedOption.style.backgroundColor = "grey";//active
		}else{
			//UGV Speed is currently showing so we want to hide it
			console.log("Hiding UGV Speed");
			UGVSpeed.style.display="none";
			isUGVSpeedHidden = true;
			UGVSpeedOption.style.backgroundColor = "white";//standby
		}
	}	
};

var selectAutoPath = function(){
	//this function is called when the autonomous path buttons are clicked
	var manualPath = document.getElementById('manualPath');
	var fig8Path = document.getElementById('fig8Path');
	var perimSweepPath = document.getElementById('perimSweepPath');
	var followUGVPath = document.getElementById('followUGVPath');
	var centerPath = document.getElementById('centerPath');

	manualPath.addEventListener('click',eventHandler); //adding click listener
	fig8Path.addEventListener('click',eventHandler); //adding click listener
	perimSweepPath.addEventListener('click',eventHandler); //adding click listener
	followUGVPath.addEventListener('click',eventHandler); //adding click listener
	centerPath.addEventListener('click',eventHandler); //adding click listener
	
	function eventHandler(event){
		if(isUAVInFlight == true){
			manualPath.style.backgroundColor = "white"; //standby
			fig8Path.style.backgroundColor = "white"; //standby
			perimSweepPath.style.backgroundColor = "white"; //standby
			followUGVPath.style.backgroundColor = "white"; //standby
			centerPath.style.backgroundColor = "white"; //standby
		
			this.style.backgroundColor = "grey"; //active
			if(this.id == "manualPath"){
				console.log("Clicked the manual button");
				currentAutoPath = "MANUAL";
			}else if(this.id == "fig8Path"){
				console.log("Clicked the fig8 button");
				currentAutoPath = "FIG8";
			}else if(this.id == "perimSweepPath"){
				console.log("Clicked the perimiter sweep button");
				currentAutoPath = "PSWEEP";
			}else if(this.id == "followUGVPath"){
				console.log("Clicked the follow UGV button");
				currentAutoPath = "FOLLOW";
			}else if(this.id == "centerPath"){
				console.log("Clicked the center button");
				currentAutoPath = "CENTER";
			}else{
				console.log("auto path not recognised");
			}
			if(isControllingUAV == true){
				console.log("controls are being switched to UGV since UAV is on autopath");
				isControllingUAV = false;
				UAVControlLabel.style.backgroundColor="transparent";
				UGVControlLabel.style.backgroundColor="yellow";
			}
			if(currentAutoPath == "MANUAL"){
				UAVAutoPathLabel.style.backgroundColor="transparent";
			}else{
				UAVAutoPathLabel.style.backgroundColor="green";
			}
		}else{
			console.log("Autonomous path can only be set after UAV is in flight");
		}
	}
};

var statusDisplays = function(){
	// ** Display Labels **
	var UAVLabel = document.getElementById('UAVLabel');
	var UAVInFlightLabel = document.getElementById('UAVInFlightLabel');
	var UAVAutoPathLabel = document.getElementById('UAVAutoPathLabel');
	var UAVControlLabel = document.getElementById('UAVControlLabel');
	var UGVLabel = document.getElementById('UGVLabel');
	var UGVControlLabel = document.getElementById('UGVControlLabel');
	
	UAVInFlightLabel.style.backgroundColor="transparent";
	UAVAutoPathLabel.style.backgroundColor="transparent";
	UAVControlLabel.style.backgroundColor="transparent";
	UGVControlLabel.style.backgroundColor="transparent";
	UAVLabel.style.color="red";
	UGVLabel.style.color="red";
};

var writeUAVBatteryPercent = function(value){
	var UAVBatteryPercentField = document.getElementById('UAVBatteryPercentField');
	UAVBatteryPercentField.innerHTML = value; //should be displayed in %
	if(value <= 10){
		UAVBatteryPercentField.style.color="red";
	}else if(value <= 20){
		UAVBatteryPercentField.style.color="yellow";
	}else if(value <= 100){
		UAVBatteryPercentField.style.color="green";
	}else{
		UAVBatteryPercentField.style.color="black";
	}
};

var writeUAVBatteryMin = function(value){
	var UAVBatteryMinField = document.getElementById('UAVBatteryMinField');
	UAVBatteryMinField.innerHTML = value; //should be displayed in mins
	if(value <= 3){
		UAVBatteryMinField.style.color="red";
	}else if(value <= 10){
		UAVBatteryMinField.style.color="yellow";
	}else if(value > 10){
		UAVBatteryMinField.style.color="green";
	}else{
		UAVBatteryMinField.style.color="black";
	}
};

var writeUAVTemp = function(value){
	var UAVTempField = document.getElementById('UAVTempField');
	UAVTempField.innerHTML = value; //should be displayed in degrees F	
	if(value >= 120){
		UAVTempField.style.color="red";
	}else if(value >= 100){
		UAVTempField.style.color="yellow";
	}else if(value >= 0){
		UAVTempField.style.color="green";
	}else{
		UAVTempField.style.color="black";
	}
};

var writeUAVAltitude = function(value){
	var UAVAltitudeField = document.getElementById('UAVAltitudeField');
	UAVAltitudeField.innerHTML = value; //should be displayed in feet
	if(value >= 160){
		UAVAltitudeField.style.color="red";
	}else if(value >= 100){
		UAVAltitudeField.style.color="yellow";
	}else if(value >= 0){
		UAVAltitudeField.style.color="green";
	}else{
		UAVAltitudeField.style.color="black";
	}
};

var writeUAVSpeed = function(value){
	var UAVSpeedField = document.getElementById('UAVSpeedField');
	UAVSpeedField.innerHTML = value; //should be displayed in mph
	if(value >= 20){
		UAVSpeedField.style.color="red";
	}else if(value >= 10){
		UAVSpeedField.style.color="yellow";
	}else if(value >= 0){
		UAVSpeedField.style.color="green";
	}else{
		UAVSpeedField.style.color="black";
	}
};

var writeUGVBatteryPercent = function(value){
	var UGVBatteryPercentField = document.getElementById('UGVBatteryPercentField');
	UGVBatteryPercentField.innerHTML = value; //should be displayed in %
	if(value <= 10){
		UGVBatteryPercentField.style.color="red";
	}else if(value <= 20){
		UGVBatteryPercentField.style.color="yellow";
	}else if(value <= 100){
		UGVBatteryPercentField.style.color="green";
	}else{
		UGVBatteryPercentField.style.color="black";
	}
};

var writeUGVBatteryMin = function(value){
	var UGVBatteryMinField = document.getElementById('UGVBatteryMinField');
	UGVBatteryMinField.innerHTML = value; //should be displayed in mins
	if(value <= 3){
		UGVBatteryMinField.style.color="red";
	}else if(value <= 10){
		UGVBatteryMinField.style.color="yellow";
	}else if(value > 10){
		UGVBatteryMinField.style.color="green";
	}else{
		UGVBatteryMinField.style.color="black";
	}
};

var writeUGVTemp = function(value){
	var UGVTempField = document.getElementById('UGVTempField');
	UGVTempField.innerHTML = value; //should be displayed in degrees F
	if(value >= 180){
		UGVTempField.style.color="red";
	}else if(value >= 150){
		UGVTempField.style.color="yellow";
	}else if(value >= 0){
		UGVTempField.style.color="green";
	}else{
		UGVTempField.style.color="black";
	}
};

/** deleted due to duplicate of zoo map animal onboard fields
var writeUGVAnimalCount = function(value){
	var UGVAnimalCountField = document.getElementById('UGVAnimalCountField');
	UGVAnimalCountField.innerHTML = value; //should be displayed in # of animals
	if(value >= 3){
		UGVAnimalCountField.style.color="red";
	}else if(value == 2){
		UGVAnimalCountField.style.color="yellow";
	}else if(value == 1 || value == 0){
		UGVAnimalCountField.style.color="green";
	}else{
		UGVAnimalCountField.style.color="black";
	}
};
**/

var writeUGVWheelAngle = function(value){
	var UGVWheelAngleField = document.getElementById('UGVWheelAngleField');
	UGVWheelAngleField.innerHTML = value; //should be displayed in degrees
	if(value == 75 || value ==-75){
		UGVWheelAngleField.style.color="red";
	}else if(value >= 60 || value <= -60){
		UGVWheelAngleField.style.color="yellow";
	}else if(value < 60 && value > -60){
		UGVWheelAngleField.style.color="green";
	}else{
		UGVWheelAngleField.style.color="black";
	}
};

var writeUGVCraneAngle = function(value){
	var UGVCraneAngleField = document.getElementById('UGVCraneAngleField');
	UGVCraneAngleField.innerHTML = value; //should be displayed in degrees
	if(value == 330 || value ==-330){
		UGVCraneAngleField.style.color="red";
	}else if(value >= 270 || value <= -270){
		UGVCraneAngleField.style.color="yellow";
	}else if(value < 270 && value > -270){
		UGVCraneAngleField.style.color="green";
	}else{
		UGVCraneAngleField.style.color="black";
	}
};

var writeUGVSpeed = function(value){
	var UGVSpeedField = document.getElementById('UGVSpeedField');
	UGVSpeedField.innerHTML = value; //should be displayed in mph
	if(value >= 20){
		UGVSpeedField.style.color="red";
	}else if(value >= 10){
		UGVSpeedField.style.color="yellow";
	}else if(value >= 0){
		UGVSpeedField.style.color="green";
	}else{
		UGVSpeedField.style.color="black";
	}
};


window.addEventListener('load',statusDisplays,false);
window.addEventListener('load',selectAutoPath,false);
window.addEventListener('load',filterUAVBattery,false);
window.addEventListener('load',filterUAVTemp,false);
window.addEventListener('load',filterUAVAltitude,false);
window.addEventListener('load',filterUAVSpeed,false);
window.addEventListener('load',filterUGVBattery,false);
window.addEventListener('load',filterUGVTemp,false);
//window.addEventListener('load',filterUGVAnimal,false);
window.addEventListener('load',filterUGVWheel,false);
window.addEventListener('load',filterUGVCrane,false);
window.addEventListener('load',filterUGVSpeed,false);
window.addEventListener('load',keyEntered,false);
window.addEventListener('load',startStopMission,false);
window.addEventListener('load',emergencyUAVStop,false);
window.addEventListener('load',emergencyUGVStop,false);
window.addEventListener('load',displayControls,false);
window.addEventListener('load',viewPreviousMissionData,false);
window.addEventListener('load',displayUAVThermal,false);
window.addEventListener('load',displayUAVFrontCamera,false);
window.addEventListener('load',displayUAVBottomCamera,false);
window.addEventListener('load',displayUGVFrontCam,false);
window.addEventListener('load',displayUGVRearCam,false);
window.addEventListener('load',selectMarkerBucket,false);
window.addEventListener('load',addMapMarker,false);
window.addEventListener('load',removeMapMarker,false);
window.addEventListener('load',changedAnimalLivingStatus,false);
window.addEventListener('load',pickedUpAnimal,false);
window.addEventListener('load',droppedOffAnimal,false);
window.addEventListener('load',cleanupMap,false);
window.addEventListener('load',closeAlert,false);
