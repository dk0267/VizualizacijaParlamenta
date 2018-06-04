//------------------------DATA PREPPIN-----------------------
var datas = ["t51.xml","t491.xml","t472.xml","t130.xml","t314.xml","t50.xml"];
var legendArray = [
"Dnevni red",
"Stališča Skupščine Republike Slovenije do zakonov iz pristojnosti Skupščine SFRJ",
"Pobude, predlogi in vprašanja poslancev",
"Zakon o lastninskem preoblikovanju podjetij",
"Zakon o proračunu Republike Slovenije za leto 1992",
"Ugotavljanje prisotnosti"
];//copied from accdb
//fab colors
var colorArray = ["156, 195, 206","109,154,167","160,179,156","73,120,64","239,229,171","255,212,98"];
//xAxis texts
var dates = ["05-1990","06-1990","07-1990","08-1990","09-1990","10-1990","11-1990","12-1990","01-1991","02-1991","03-1991","04-1991","05-1991","06-1991","07-1991","08-1991","09-1991","10-1991","11-1991","12-1991","01-1992","02-1992","03-1992","04-1992","05-1992","06-1992","07-1992","08-1992","09-1992","10-1992","11-1992","12-1992"];

//------------------------SET VARS----------------------------
var canvas_padding = 50;
var minY = -1;
var maxY = -1;
var maxPosY = -1;
var previousX = 0.0;
var previousY = 0.0;
var server_mode = true;
var debug_mode = false;
var connect_dots = false;
var dict;
var dictKeys = [];
var dictArray = [];
var dictAttendance = [];
var pair = [];
var xmls = [];


//window.addEventListener("resize", reDraw);
//var redrawBool = false;

var xml;


//array functions
function isIn(array,word){
	for (var i = 0; i < array.length; i++){
		if (word == array[i]){
			return true;
		}
	}
	return false;
}

//dict manipulation functions

//returns max value on our dict value
function maxCount(inputString){
	var splitArr = inputString.split(",");
	var maxVal = -1;
	for (var i = 0; i < splitArr.length; i++){
		//now we need to find max
		if (maxVal < parseInt(splitArr[i]))
			maxVal = parseInt(splitArr[i]);
	}
	return maxVal;
}


//returns min value on our dict value
function minCount(inputString){
	var splitArr = inputString.split(",");
	var minVal = 99999999;
	for (var i = 0; i < splitArr.length; i++){
		//now we need to find min
		var tmpVal = parseInt(splitArr[i]);
		if (minVal > tmpVal && tmpVal > 0)
			minVal = parseInt(splitArr[i]);
	}
	return minVal;
}

//returns average on our dict value
function avgCount(inputString){
	var splitArr = inputString.split(",");
	var avgVal = 0, n = 0;
	for (var i = 0; i < splitArr.length; i++){
		var tmpVal = parseInt(splitArr[i]);
		if (tmpVal > 0){
			avgVal += tmpVal;
			n++;
		}
	}
	return avgVal/n;
}

//returns sum on our dict value
function allCount(inputString){
	var splitArr = inputString.split(",");
	var avgVal = 0, n = 0;
	for (var i = 0; i < splitArr.length; i++){
		var tmpVal = parseInt(splitArr[i]);
		if (tmpVal > 0){
			avgVal += tmpVal;
			n++;
		}
	}
	return avgVal;
}

function attendanceCount(inputString1, inputString2){
	var splitArr1 = inputString1.split(",");
	var splitArr2 = inputString2.split(",");
var tmpArr = [];
	var retVal1 = "", retVal2 = "";
	for (var i = 0; i < splitArr1.length; i++){
		var tmpVal1 = parseInt(splitArr1[i]);
		var tmpVal2 = parseInt(splitArr2[i]);
		if (!isNaN(tmpVal2) && !isNaN(tmpVal1))
		tmpArr.push((tmpVal1 + tmpVal2).toString());

	}


	for (var i = 0; i < tmpArr.length; i++){
		retVal1 = retVal1 + tmpArr[i] + ",";
		//var tmpVal2 = parseInt(splitArr2[i]);
		//splitArr1[i] = tmpVal1 + tmpVal2;
	}
//console.log(retVal1);
return retVal1;


}





//data preload them prebuilt XMLs
function preload() {
	dict = createStringDict("p5","0");
	for (var i = 0; i < datas.length; i++){
		if (!server_mode){
			xml = loadXML('data/'+datas[0]);
		}
		else{
			xml = loadXML('http://travca.si/OO/projekt1/data/'+datas[i]);
		}

		if (debug_mode)
			console.log("loading XML: "+datas[i]);
		xmls.push(xml);
	}
}


//analyze prebuilt XMLs
function analyze(inXml, filterWord){
	//prvo words
       
	var words = inXml.getChildren("word");

	if (debug_mode)
		console.log('Dolzina-besed: '+words.length);
  	      //console.log(inXml);
	//mam divs
	//return;

	var cntAtt = words[0].getString("count");
var foundWord = false;
	for (var i = 0; i < words.length; i++) {
		var word = words[i].getContent();
		var count = words[i].getString("count");
		if (word.length <= 3) continue;
		if (isIn(['biti','tako','tudi','zato'],word)) continue;
		if (word == filterWord.toString()){
		//najdl besedo, rukn v array
//console.log("HI:"+count);
//console.log(allCount(count));
			dictArray.push(count);
			dictKeys.push(word);
foundWord = true;
		}
		
		cntAtt = attendanceCount(cntAtt, count);

							
						

	}

	if (foundWord == false) dictArray.push("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,");
	dictAttendance.push(cntAtt);
	
}


//obsolete
function most_common(n) {
	for (var i = 0; i < n; i++) {
		var mV = dict.maxValue();
		for (var j = 0; j < dictKeys.length; j++) {
			//console.log(beseda);
			if (dict.get(dictKeys[j]) == mV){
				console.log('top '+ (i+1) + ': \"' + dictKeys[j] + '\" repeats ' + mV + ' times.');
                pair.push(dictKeys[j]);
                pair.push(mV);
                dictArray.push(pair);
                pair = [];
				dict.remove(dictKeys[j]);
				dictKeys.splice(j, 1);
				break;
			}
		}

	}

}


//-------------------drawing functions--------------------------

function drawArrowHead(x,y, orientation){
	

}

//nodata error report message
function drawNoData(x,y){
		textSize(30);
		text("Ni podatkov!",x,y);

}



//function that draws legend
function drawLegend(x,y,offset){
	var stevec = 1;
	var radius = 15;

	for (var i = 0; i < legendArray.length; i++)
	{
		var color = colorArray[i];
		var colors = [];
		colors = color.split(",");


		fill(parseInt(colors[0]),parseInt(colors[1]),parseInt(colors[2]));
		ellipse(x+offset/2, y*stevec+(offset-offset/4),radius,radius);

		textSize(14);
		text(legendArray[i],x+offset,y*stevec+offset);
		stevec++;
	
	}



}

//function that draws points and lines that connect them
function drawPoints(x, xPad, inputPoints, inputAttendance, color, upY, downY)
{

console.log(inputPoints);
//x = 2*x;
	var radius = 10;
	var pointArray = [];
	pointArray = inputPoints.split(",");
	var pointArrayAtt = [];
	pointArrayAtt = inputAttendance.split(",");
	var stevec = 1;
	var colors = [];
	colors = color.split(",");
	for (var i = 4; i < pointArray.length;i++)
	{
		var tmpVal = 0.0;
		tmpVal = (float)(parseInt(pointArray[i].toString()) / maxY);//procent
		tmpVal = tmpVal * (downY-maxPosY);//utezena vrednost
		if (tmpVal != 0.0){
			if (previousX == 0.0 && !connect_dots) previousX = xPad+x*stevec;
			if (previousY == 0.0 && !connect_dots) previousY = downY-tmpVal;
			fill(parseInt(colors[0]),parseInt(colors[1]),parseInt(colors[2]));
			ellipse(xPad+x*stevec, downY-tmpVal,radius,radius);

			stroke(parseInt(colors[0]),parseInt(colors[1]),parseInt(colors[2]));
			line(previousX,previousY,xPad+x*stevec, downY-tmpVal);

			previousX = xPad+x*stevec;
			previousY = downY-tmpVal;
			stevec++;
		}
		
		else{

			if (parseInt(pointArrayAtt[i]) != 0)
			{
				if (previousX == 0.0) previousX = xPad+x*stevec;
				if (previousY == 0.0) previousY = downY-tmpVal;
				fill(parseInt(colors[0]),parseInt(colors[1]),parseInt(colors[2]));
				ellipse(xPad+x*stevec, downY-tmpVal,radius,radius);

				stroke(parseInt(colors[0]),parseInt(colors[1]),parseInt(colors[2]));
				line(previousX,previousY,xPad+x*stevec, downY-tmpVal);

				previousX = xPad+x*stevec;
				previousY = downY-tmpVal;
				stevec++;
			}
			else {
				stevec++;
				if(!connect_dots){
					previousX = 0.0;
					previousY = 0.0;
				}

			}
		}

		
	
	}






}


//draws those little nigger lines on the Axis + the text too, rotation to it je bla totalna pizdarija
function drawLineTxt(x, y, orientation, word, pad, offset)
{//recieves x, y of the line, the width will be calculated onthe fly, and also text to be displayed
	//if orientation is true it means its vertical
	var weightedHeight = 0.05 * windowHeight;
	var weightedWidth = 0.02 * windowWidth;

	if (orientation){
		//vertical
		//   |
		//vse je slabo
		
		var newY = y - weightedHeight/2;
		line(x+pad,newY,x+pad, newY+ weightedHeight);
		//rotate(45);

		textSize(12);
		text(word,x+pad-textWidth(word)/2,newY+textWidth(word)*offset);
		//rotate(-45);
	}
	
	else{
		//horizontal
		//   -
		//vse je slabo
		
		var newX = x - weightedWidth/2;
		line(newX,y+pad,newX + weightedWidth, y+pad);	

		//rotate(45);

		textSize(14);
		text(word,newX-textWidth(word),y+pad*1.05);
		//rotate(-45);
		
	
	
	
	}
	
	
}

//function that draws the coordinate system
function drawCSystem()
{
	var xPad = 65, yPad=50, weightX = 0.028, weightY = 0.078, weightPad = 1.2, weightScreen = 0.9;

	//funkcija ki izrise koordinatni sistem
	//windowWidth - canvas_padding, windowHeight - canvas_padding
	
	//yAxis
	fill(255, 255, 255);
	line(xPad, yPad, xPad, windowHeight*weightScreen - yPad);


	//xAxis
	fill(255, 255, 255);
	line(xPad, windowHeight*weightScreen - yPad, windowWidth*weightScreen - yPad , windowHeight*weightScreen - yPad);
	

	//draw legend last cuz of colors
	drawLegend(xPad + yPad,yPad/2,20);
	fill(255,255,255);
	//lines on xAxis

	if (dictArray.length == 0)
	{
		//ERROR NO DATa
		drawNoData(windowWidth/2.5,windowHeight/2.5);

	}


//narisemo se izbrano besedo
	textSize(30);
	text(dictKeys[0],windowWidth/2-xPad, yPad);



	for (var i = 1; i <= dates.length; i++){
		//this is used for up and down text
		var tmpOff = i % 2;
		if (tmpOff == 0) tmpOff = 1;
		else tmpOff = 1.5;
		drawLineTxt(windowWidth*weightScreen*weightX*i, windowHeight*weightScreen - yPad,true,dates[i-1],xPad,tmpOff);
	
	}
	
	var yAxis = [];
	var procent = 0.1;
	
	while (procent <= 1.0){
		var tmpVal = maxY * procent;
		var strVal = tmpVal.toString();
		if (debug_mode)
			console.log(strVal);
		yAxis.push(strVal.split(".")[0]);
		procent += 0.1;
	}
	yAxis.reverse();
	for (var i = yAxis.length-1; i >= 0; i--){
		if(debug_mode)
			console.log(yAxis[i]);
		drawLineTxt(xPad,windowHeight*weightScreen*weightY*i,false,yAxis[i],xPad*weightPad,0);

	}
	

	maxPosY = windowHeight*weightScreen*weightY+yPad;

	previousX =windowWidth*weightScreen*weightX*1+xPad;
	previousY = windowHeight*weightScreen - yPad;

	//if (debug_mode)
		//console.log(dictAttendance);
console.log(dictArray[0]);
	for (var i = 0; i < dictArray.length; i++){
		//(x, inputPoints, color, upY,downY)
		drawPoints(windowWidth*weightScreen*weightX*1, xPad,dictArray[i], dictAttendance[i], colorArray[i], yPad, windowHeight*weightScreen - yPad );
	
	}



}














//-------------------------SETUP AND DRAW --------------------------------


function setup() {
var inputW = localStorage.getItem('storeWord');
//console.log(inputW);
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    wx = w.innerWidth || e.clientWidth || g.clientWidth,
    wy = w.innerHeight|| e.clientHeight|| g.clientHeight;

	var platno = createCanvas(windowWidth - canvas_padding, windowHeight - canvas_padding);
//var platno = createCanvas(wx - canvas_padding, wy - canvas_padding);
	platno.parent('content');
	//window.onresize = function(){platno.redraw();};


	for (var i = 0; i < xmls.length; i++){
		analyze(xmls[i],inputW);
	}
	
	if (debug_mode)
	console.log(dictKeys[0]+" se pojavi: "+dictArray[0]);
	//pretestiram se nove funkcije
	//console.log(maxCount(dictArray[0]));
	
	var localMin = 99999, localMax = -1;
	for (var i = 0; i < dictArray.length; i++)
	{
		//zdej pa treba izracunat max pa min useh
		var tmpMin = minCount(dictArray[i]);
		var tmpMax = maxCount(dictArray[i]);
		if (tmpMin < localMin)
			localMin = tmpMin;
		if (tmpMax > localMax)
			localMax = tmpMax;
	}
	if (debug_mode){
		console.log(localMin);
		console.log(localMax);
	}
	//dict.sortValuesReverse();
	//dict.print();
	
	minY = localMin;
	maxY = localMax;
	
	//noStroke();
noLoop();
	rectMode(CENTER);
   //gremo risat yay
}




function draw() {
	//greeemo risat
	//var x = 0, y = 0, pad = 120, max_word = 40, i = 0;
//platno.redraw();



	max_count = maxY;
	drawCSystem();
	
	
	
	
	
}