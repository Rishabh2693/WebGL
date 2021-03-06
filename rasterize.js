/* GLOBAL CONSTANTS AND VARIABLES */
/**
 * @author Rishabh Sinha
 * rsinha2
 * Program4
 * Created by adding game features to the already created webgl rendering functionality in program 3
 */


//References https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
//http://learningwebgl.com/blog/?p=507
/* assignment specific globals */

function init(){
    defaultEye = vec3.fromValues(0.5,0.5,-0.2); // default eye position in world space
    defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
    defaultUp = vec3.fromValues(0,1,0); // default view up vector
    lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
    lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
    lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
    lightPosition = vec3.fromValues(2,4,-0.5); // default light position
    rotateTheta = Math.PI/50; // how much to rotate models by with each key press
    
    /* webgl and geometry data */
    gl = null; // the all powerful gl object. It's all here folks!
    inputTriangles = []; // the triangle data as loaded from input files
    numTriangleSets = 0; // how many triangle sets in input scene
    inputEllipsoids = []; // the ellipsoid data as loaded from input files
    numEllipsoids = 0; // how many ellipsoids in the input scene
    vNormAttribLoc;
    samplerUniform;
    alphaUniform;
    vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
    normalBuffers = []; // this contains normal component lists by set, in triples
    triSetSizes = []; // this contains the size of each triangle set
    triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
    textureBuffer = [];
    triangleTexture = [];
    ellipsoidTexture = [];
    vertexTextureCoordBuffer = [];
    textureCoordAttribute;
    isB = 0;
    /* shader parameter locations */
    vPosAttribLoc; // where to put position for vertex shader
    mMatrixULoc; // where to put model matrix for vertex shader
    pvmMatrixULoc; // where to put project model view matrix for vertex shader
    ambientULoc; // where to put ambient reflecivity for fragment shader
    diffuseULoc; // where to put diffuse reflecivity for fragment shader
    specularULoc; // where to put specular reflecivity for fragment shader
    shininessULoc; // where to put specular exponent for fragment shader
    triIndexMap = [];
    elliIndexMap = [];
    /* interaction variables */
    Eye = vec3.clone(defaultEye); // eye position in world space
    Center = vec3.clone(defaultCenter); // view direction in world space
    Up = vec3.clone(defaultUp); // view up vector in world space
    viewDelta = 0; // how much to displace view with each key press
    sound = [];
    crosshair = null
    lastX = null;
    lastY = null;
    downMissiles = [];
    frameCount = 0;
    dOver = false;
    reached = false;
    upMissiles = [];
    over = false;
    imageCanvas = null;
    ctx;
    timeNode;
    Gameflag = false;
    levelFlag = false;
}

const INPUT_TRIANGLES_URL = "https://rishabh2693.github.io/WebGL/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://rishabh2693.github.io/WebGL/ellipsoids.json"; // ellipsoids file loc
var defaultEye = vec3.fromValues(0.5,0.5,-0.2); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(2,4,-0.5); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numEllipsoids = 0; // how many ellipsoids in the input scene
var vNormAttribLoc;
var samplerUniform;
var alphaUniform;
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var textureBuffer = [];
var triangleTexture = [];
var ellipsoidTexture = [];
var vertexTextureCoordBuffer = [];
var textureCoordAttribute;
var isB = 0;
/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var triIndexMap = [];
var elliIndexMap = [];
/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space
var viewDelta = 0; // how much to displace view with each key press
var score = 0;
var sound = [];
var crosshair = null
var lastX = null;
var lastY = null;
var downMissiles = [];
var frameCount = 0;
var dOver = false;
var reached = false;
var upMissiles = [];
var over = false;
var imageCanvas = null;
var ctx;
var timeNode;
var Gameflag = false;
var levelFlag = false;

function initSound(){
    sound.push(new Audio("shot.mp3"));
    sound.push(new Audio("explosion.mp3"));
    sound.push(new Audio("sh.m4a"));
}

function playSound(id)
{
    switch(id)
    {
        case "shot": sound[0].play(); break;
        case "explosion": sound[1].play(); break;
    }

}

function stopSound(id)
{
    switch(id)
    {
        case "shot": sound[0].pause();sound.currentTime=0 ; break;
		case "explosion": sound[1].pause();sound.currentTime=0 ; break;        
    }    
}
// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file

// does stuff when keys are pressed
function handleKeyDown(event) {
    
    const modelEnum = {TRIANGLES: "triangles", ELLIPSOID: "ellipsoid"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction
    
    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel]; 
        else
            handleKeyDown.modelOn = inputEllipsoids[whichModel]; 
        handleKeyDown.modelOn.on = true; 
    } // end highlight model
    
    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model

    function rotateModel(axis,direction) {
        if (handleKeyDown.modelOn != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {
        
        // model selection
        case "KeyR": // translate down, rotate clockwise with shift
            score = 0;
            if (event.getModifierState("Shift"))
                main();
            else
                main();
            break;
    } // end switch
} // end handleKeyDown

function mouseMove(event){
   // console.log("im here 1");
   
    
    function translateModel(offset) {
        vec3.add(crosshair.translation,crosshair.translation,offset);
    } // end translate model

    if(crosshair == null){
        for(var i = 0; i< numTriangleSets;i++){
            if(inputTriangles[i].type == 4)
                crosshair = inputTriangles[i];
        }  
    }
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
   
    var x =  event.clientX - imageCanvas.getBoundingClientRect().left ;
    var y = event.clientY - imageCanvas.getBoundingClientRect().top;
    x = 1.4 - (x/284.5);
    y = 1.4 - (y/284.5); 
   
    if(lastX == null||lastY ==null)
    {
      
            translateModel(vec3.scale(temp,viewRight, -x));
            translateModel(vec3.scale(temp,Up, y));
        
    }
    else{
       
            translateModel(vec3.scale(temp,viewRight, -x+lastX));
            translateModel(vec3.scale(temp,Up, y-lastY));
      
    }
    lastX = x;
    lastY = y;
     // end if there is a highlighted model
   // end rotate model
    
    // set up needed view params
  
   
    
}


function startRandomMissile(){
    frameCount++;
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
   
    function rotateModel(axis,angle,num) {
        if (downMissiles[num] != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,angle,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(downMissiles[num].xAxis,downMissiles[num].xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(downMissiles[num].yAxis,downMissiles[num].yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    
    if(downMissiles.length==0&&!dOver)
        for(var i = 0; i< numEllipsoids;i++){
      //      console.log(inputEllipsoids);
            if(inputEllipsoids[i].type == 2)
                downMissiles.push(inputEllipsoids[i]);
        } 
    if(frameCount%200==0&&!dOver){
        var j = Math.floor(Math.random()*downMissiles.length);
        downMissiles[j].velocity_x = (downMissiles[j].target_x - downMissiles[j].x)*0.001;
        downMissiles[j].velocity_y = (0 - downMissiles[j].y)*0.001;
        downMissiles[j].goal_x = downMissiles[j].target_x;
        downMissiles[j].goal_y = 0;
        var angle = (-1*Math.atan(downMissiles[j].velocity_y/ downMissiles[j].velocity_x))+Math.PI/2;
       
        if(angle>Math.PI/2){
            angle+=Math.PI;
        }
       
        rotateModel(lookAt,angle,j);
        downMissiles.splice(j,1); ;
        if(downMissiles.length == 0)
            dOver = true;
    }    

}

function loadNewTriangles(whichSet){
    //console.log(inputTriangles[whichSet]);
    var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
    var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
    var minXYZ = vec3.create(), maxXYZ = vec3.create();
    inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
    inputTriangles[whichSet].on = false; // not highlighted
    inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
    inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
    inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

    // set up the vertex and normal arrays, define model center and axes
    inputTriangles[whichSet].glTextureCoords = []
    inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
    inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
    var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
    for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
        uvToAdd = inputTriangles[whichSet].uvs[whichSetVert];
        vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
        normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
        inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
        inputTriangles[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
        inputTriangles[whichSet].glTextureCoords.push(uvToAdd[0],uvToAdd[1]);
        vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
        vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
        vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum
    } // end for vertices in set
    vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum

    // send the vertex coords and normals to webGL
    vertexBuffers.push(gl.createBuffer()); // init empty webgl set vertex coord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
    normalBuffers.push(gl.createBuffer()); // init empty webgl set normal component buffer 
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
   
    vertexTextureCoordBuffer.push(gl.createBuffer());
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTextureCoordBuffer[vertexTextureCoordBuffer.length-1]);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glTextureCoords),gl.STATIC_DRAW);

    loadTexture(inputTriangles[whichSet].material.texture, true);

    // set up the triangle index array, adjusting indices across sets
    inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
    triSetSizes.push(inputTriangles[whichSet].triangles.length); // number of tris in this set
    for (whichSetTri=0; whichSetTri<triSetSizes[triSetSizes.length-1]; whichSetTri++) {
        triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
        inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]);
   //     console.log(inputTriangles); // put indices in set list
    } // end for triangles in set

    // send the triangle indices to webGL
    triIndexMap.push(triSetSizes.length-1)
    triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in

}


function loadNewEllipsoid(whichEllipsoid){
    var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
    var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
    var minXYZ = vec3.create(), maxXYZ = vec3.create();
    ellipsoid = inputEllipsoids[whichEllipsoid];
    ellipsoid.on = false; // ellipsoids begin without highlight
    ellipsoid.translation = vec3.fromValues(0,0,0); // ellipsoids begin without translation
    ellipsoid.xAxis = vec3.fromValues(1,0,0); // ellipsoid X axis
    ellipsoid.yAxis = vec3.fromValues(0,1,0); // ellipsoid Y axis 
    ellipsoid.center = vec3.fromValues(ellipsoid.x,ellipsoid.y,ellipsoid.z); // locate ellipsoid ctr
    vec3.set(minXYZ,ellipsoid.x-ellipsoid.a,ellipsoid.y-ellipsoid.b,ellipsoid.z-ellipsoid.c); 
    vec3.set(maxXYZ,ellipsoid.x+ellipsoid.a,ellipsoid.y+ellipsoid.b,ellipsoid.z+ellipsoid.c); 
    vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
    vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner
    loadTexture(inputEllipsoids[whichEllipsoid].texture,false);
    // make the ellipsoid model
    ellipsoidModel = makeEllipsoid(ellipsoid,16);
   
    // send the ellipsoid vertex coords and normals to webGL
    vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.vertices),gl.STATIC_DRAW); // data in
    normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.normals),gl.STATIC_DRAW); // data in
    vertexTextureCoordBuffer.push(gl.createBuffer()); // init empty webgl sphere vertex normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTextureCoordBuffer[vertexTextureCoordBuffer.length-1]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.texture),gl.STATIC_DRAW); // data in

    triSetSizes.push(ellipsoidModel.triangles.length);
    elliIndexMap.push(triSetSizes.length-1);
    // send the triangle indices to webGL
    triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ellipsoidModel.triangles),gl.STATIC_DRAW); // data in

}

function checkTriangles(){
    for(var i=0;i<numTriangleSets;i++){
        if(inputTriangles[i].timer){
            inputTriangles[i].timer++;
            if(inputTriangles[i].timer>250)
                inputTriangles[i].invisible = true;
        }
    }
}

function updateMssileLocation(){
    
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
   
    function translateModel(offset) {
        vec3.add(setModel.translation,setModel.translation,offset);
     //   console.log(offset);
    } // end translate model
    var setModel = null;
    for(var i = 0; i< numEllipsoids;i++){
          if(inputEllipsoids[i].temp){
              inputEllipsoids[i].timer++;
              if(inputEllipsoids[i].timer > 100)
              inputEllipsoids[i].invisible = true;
          }
           // inputEllipsoids[i].invisible = true;
        //  console.log(inputEllipsoids);
          if(!inputEllipsoids[i].phat&&!inputEllipsoids[i].invisible&&inputEllipsoids[i].velocity_x&&
            !((inputEllipsoids[i].goal_x-inputEllipsoids[i].x < inputEllipsoids[i].translation[0]+0.03)&&
            (inputEllipsoids[i].goal_x-inputEllipsoids[i].x > inputEllipsoids[i].translation[0]-0.03)&&
            (inputEllipsoids[i].goal_y-inputEllipsoids[i].y < inputEllipsoids[i].translation[1]+0.03)&&
            (inputEllipsoids[i].goal_y-inputEllipsoids[i].y > inputEllipsoids[i].translation[1]-0.03))){
              setModel = (inputEllipsoids[i]);
              translateModel(vec3.scale(temp,viewRight,-inputEllipsoids[i].velocity_x));
              translateModel(vec3.scale(temp,Up,inputEllipsoids[i].velocity_y));

                if(frameCount%13 == 0){
                    inputTriangles.push({
                    timer: 1,
                    material: 
                        {ambient: [0.0,0.2,0],
                        diffuse: [0,0.2,0], 
                        specular: [0.3,0.3,0.3], 
                        n: 11, 
                        alpha: 1, 
                        texture: "smoke.jpg"
                    }, 
                    vertices: [[inputEllipsoids[i].x+inputEllipsoids[i].translation[0]-0.01, inputEllipsoids[i].y+inputEllipsoids[i].translation[1]-0.01, 0.7],
                    [inputEllipsoids[i].x+inputEllipsoids[i].translation[0]-0.01, inputEllipsoids[i].y+inputEllipsoids[i].translation[1]+0.01, 0.7],
                    [inputEllipsoids[i].x+inputEllipsoids[i].translation[0]+0.01, inputEllipsoids[i].y+inputEllipsoids[i].translation[1]+0.01, 0.7],
                    [inputEllipsoids[i].x+inputEllipsoids[i].translation[0]+0.01, inputEllipsoids[i].y+inputEllipsoids[i].translation[1]-0.01, 0.7]],
                    normals: [[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0]],
                    uvs: [[0,0], [0,1], [1,0], [1,1]],
                    triangles: [[0,1,2],[0,2,3]]

                });
                loadNewTriangles(numTriangleSets);
                numTriangleSets+=1;
            }

          }else if(inputEllipsoids[i].velocity_x&&!inputEllipsoids[i].invisible){
            generateExplosion(inputEllipsoids[i])
          }
      }  
}

function generateExplosion(model){
    if(!model.timer){
        model.timer = 0;
        playSound("explosion");
      }
      model.ex = true;
      if(model.timer%20==0){
      inputEllipsoids.push({
        x: model.x+model.translation[0],
        y: model.y+model.translation[1],
        z: 0.7,
        a: model.timer*.0018,
        b: model.timer*.0018,
        c: model.timer*.0018,
        timer: model.timer,
        texture: "fire.jpg",
        temp: true,
        ambient: [0.8,0.8,0.1],
        diffuse: [0.8,0.8,0],
        specular: [0.3,0.3,0.3],
        n:5, 
        alpha: 1
      } ); 
      numEllipsoids++;
      loadNewEllipsoid(numEllipsoids-1);
    }
    model.timer+=1;
      if(model.timer>100){
        model.invisible = true;
      }
}

function checkInteraction(){
    for(var i=0;i<numEllipsoids;i++){
        for(var j=0;j<numEllipsoids;j++){
            if(i!=j){
                if(inputEllipsoids[i].texture == "fire.jpg" 
               &&!inputEllipsoids[i].invisible&&!inputEllipsoids[j].ex){
                    if(inputEllipsoids[j].x+inputEllipsoids[j].translation[0]>inputEllipsoids[i].x-inputEllipsoids[i].a&&
                    inputEllipsoids[j].x+inputEllipsoids[j].translation[0]<inputEllipsoids[i].x+inputEllipsoids[i].a&&
                    inputEllipsoids[j].y+inputEllipsoids[j].translation[1]>inputEllipsoids[i].y-inputEllipsoids[i].b&&
                    inputEllipsoids[j].y+inputEllipsoids[j].translation[1]<inputEllipsoids[i].y+inputEllipsoids[i].b
                    ){
                        
                        if(!inputEllipsoids[j].phat&&(inputEllipsoids[j].texture == "billie.jpg" || inputEllipsoids[j].texture == "miss.jpg" || inputEllipsoids[j].texture == "mis.png")&&!inputEllipsoids[j].invisible){
                            if(inputEllipsoids[j].texture == "miss.jpg")
                                score+=50;
                            if(inputEllipsoids[j].texture == "billie.jpg")
                                score+=150;    
                            inputEllipsoids[j].velocity_x = 0.0000001;
                            inputEllipsoids[j].velocity_y = 0;
                            inputEllipsoids[j].phat = true;
                        } 
                    }
                }
            }
        }

        for(var j=0;j<numTriangleSets;j++){
            if(!inputEllipsoids[i].invisible&&inputEllipsoids[i].texture == "fire.jpg" 
            && inputTriangles[j].texture != "smoke.jpg"&&inputTriangles[j].type == 3){
                for(var k=0;k<inputTriangles[j].vertices.length;k++){
                    if(inputTriangles[j].vertices[k][0]+0.1>inputEllipsoids[i].x-inputEllipsoids[i].a&&
                        inputTriangles[j].vertices[k][0]-0.1<inputEllipsoids[i].x+inputEllipsoids[i].a&&
                        inputTriangles[j].vertices[k][1]+0.1>inputEllipsoids[i].y-inputEllipsoids[i].b&&
                        inputTriangles[j].vertices[k][1]-0.1<inputEllipsoids[i].y+inputEllipsoids[i].b
                        ){
                            inputTriangles[j].invisible = true;
                            break;
                        }
                }
            }
        }
    }
}


function mouseUp(event){
    if(over)
        return;
    if(event.clientX < imageCanvas.getBoundingClientRect().left||
    event.clientY < imageCanvas.getBoundingClientRect().top ||
    event.clientX > imageCanvas.getBoundingClientRect().right ||
    event.clientY > (imageCanvas.getBoundingClientRect().bottom*2)/3){
       return;
    }
    playSound("shot");
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
   
    function rotateModel(axis,angle) {
        if (upMissiles[0] != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,angle,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(upMissiles[0].xAxis,upMissiles[0].xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(upMissiles[0].yAxis,upMissiles[0].yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    
    if(upMissiles.length==0&&!over){
        for(var i = 0; i< numEllipsoids;i++){
            if(inputEllipsoids[i].type == 1&&!inputEllipsoids[i].invisible)
                upMissiles.push(inputEllipsoids[i]);
        }  
    }
    var x =  event.clientX - imageCanvas.getBoundingClientRect().left ;
    var y = event.clientY - imageCanvas.getBoundingClientRect().top;
    x = 1.4 - (x/284.5);
    y = 1.4 - (y/284.5); 
    while(upMissiles[0].invisible)
        upMissiles.shift();
    upMissiles[0].velocity_x = (x-upMissiles[0].x)*0.02;
    upMissiles[0].velocity_y = (y-upMissiles[0].y)*0.02;
    var angle = (-1*Math.atan(upMissiles[0].velocity_y/ upMissiles[0].velocity_x))+Math.PI/2;
  
    if(angle>Math.PI/2){
        angle+=Math.PI;
    }
  
    rotateModel(lookAt,angle);
    upMissiles[0].goal_x = x;
    upMissiles[0].goal_y = y;
    upMissiles.shift();
    if(upMissiles.length == 0){
        over = true;
    }
}

// set up the webGL environment
function setupWebGL() {
    var textCanvas = document.getElementById("TextCanvas");
    // make a 2D context for it
    ctx = textCanvas.getContext("2d");
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed
    document.onmousemove = mouseMove;
    document.onmouseup = mouseUp;

      // Get the image canvas, render an image in it
     imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
      var cw = imageCanvas.width, ch = imageCanvas.height; 
      imageContext = imageCanvas.getContext("2d"); 
     var bkgdImage = new Image(); 
     bkgdImage.crossOrigin = "Anonymous";
     bkgdImage.src = "https://rishabh2693.github.io/WebGL/sky.jpg";
     bkgdImage.onload = function(){
         var iw = bkgdImage.width, ih = bkgdImage.height;
         imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
    } // end onload callback
    
     // create a webgl canvas and set it up
     var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
     gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
     try {
       if (gl == null) {
         throw "unable to create gl context -- is your browser gl ready?";
       } else {
        // gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
         gl.clearDepth(1.0); // use max when we clear the depth buffer
         gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
       }
     } // end try
     
     catch(e) {
       console.log(e);
     } // end catch
} // end setupWebGL

function getDotProd(modelVal){
    return  (Eye[0]-modelVal.x)*(Eye[0]-Center[0])+(Eye[1]-modelVal.y)*(Eye[1]-Center[1])+(Eye[2]-modelVal.z)*(Eye[2]-Center[2]);
}
function getDotProd1(modelVal){
    return  (Eye[0]-modelVal.center[0])*(Eye[0]-Center[0])+(Eye[1]-modelVal.center[1])*(Eye[1]-Center[1])+(Eye[2]-modelVal.center[2])*(Eye[2]-Center[2]);
}
function getDotProd2(modelVal){
    return  (Eye[0]-modelVal[0])*(Eye[0]-Center[0])+(Eye[1]-modelVal[1])*(Eye[1]-Center[1])+(Eye[2]-modelVal[2])*(Eye[2]-Center[2]);
}

function makeEllipsoid(currEllipsoid,numLongSteps) {
    
            try {
                if (numLongSteps % 2 != 0)
                    throw "in makeSphere: uneven number of longitude steps!";
                else if (numLongSteps < 4)
                    throw "in makeSphere: number of longitude steps too small!";
                else { // good number longitude steps
                
                    
                    // make vertices
                    var ellipsoidVertices = [0,-1,0]; // vertices to return, init to south pole
                    var angleIncr = (Math.PI+Math.PI) / numLongSteps; // angular increment 
                    var latLimitAngle = angleIncr * (Math.floor(numLongSteps/4)-1); // start/end lat angle
                    var latRadius, latY; // radius and Y at current latitude
                    var u, v;
                    var ellipsoidTextureCoords = [0,-1];
                    for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle; latAngle+=angleIncr) {
                        latRadius = Math.cos(latAngle); // radius of current latitude
                        latY = Math.sin(latAngle); // height at current latitude
                        for (var longAngle=0; longAngle<=2*Math.PI+angleIncr; longAngle+=angleIncr){ // for each long
                            ellipsoidVertices.push(latRadius*Math.sin(longAngle),latY,latRadius*Math.cos(longAngle));
                            u = (longAngle / (2*Math.PI));
                            v = (Math.PI/2 + latAngle)/ Math.PI;
                            ellipsoidTextureCoords.push(u, v);  
                        }
                    } // end for each latitude
                    
                    ellipsoidTextureCoords.push(0,1);
                    ellipsoidVertices.push(0,1,0); // add north pole
                    ellipsoidVertices = ellipsoidVertices.map(function(val,idx) { // position and scale ellipsoid
                        switch (idx % 3) {
                            case 0: // x
                                return(val*currEllipsoid.a+currEllipsoid.x);
                            case 1: // y
                                return(val*currEllipsoid.b+currEllipsoid.y);
                            case 2: // z
                                return(val*currEllipsoid.c+currEllipsoid.z);
                        } // end switch
                    }); 
    
                    // make normals using the ellipsoid gradient equation
                    // resulting normals are unnormalized: we rely on shaders to normalize
                    var ellipsoidNormals = ellipsoidVertices.slice(); // start with a copy of the transformed verts
                    ellipsoidNormals = ellipsoidNormals.map(function(val,idx) { // calculate each normal
                        switch (idx % 3) {
                            case 0: // x
                                return(2/(currEllipsoid.a*currEllipsoid.a) * (val-currEllipsoid.x));
                            case 1: // y
                                return(2/(currEllipsoid.b*currEllipsoid.b) * (val-currEllipsoid.y));
                            case 2: // z
                                return(2/(currEllipsoid.c*currEllipsoid.c) * (val-currEllipsoid.z));
                        } // end switch
                    }); 
                    
                    // make triangles, from south pole to middle latitudes to north pole
                    var ellipsoidTriangles = []; // triangles to return
                    for (var whichLong=1; whichLong<numLongSteps; whichLong++) // south pole
                        ellipsoidTriangles.push(0,whichLong,whichLong+1);
                    ellipsoidTriangles.push(0,numLongSteps,1); // longitude wrap tri
                    var llVertex; // lower left vertex in the current quad
                    for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
                        for (var whichLong=0; whichLong<numLongSteps-1; whichLong++) {
                            llVertex = whichLat*numLongSteps + whichLong + 1;
                            ellipsoidTriangles.push(llVertex,llVertex+numLongSteps,llVertex+numLongSteps+1);
                            ellipsoidTriangles.push(llVertex,llVertex+numLongSteps+1,llVertex+1);
                        } // end for each longitude
                        ellipsoidTriangles.push(llVertex+1,llVertex+numLongSteps+1,llVertex+2);
                        ellipsoidTriangles.push(llVertex+1,llVertex+2,llVertex-numLongSteps+2);
                    } // end for each latitude
                    for (var whichLong=llVertex+2; whichLong<llVertex+numLongSteps+1; whichLong++) // north pole
                        ellipsoidTriangles.push(whichLong,ellipsoidVertices.length/3-1,whichLong+1);
                    ellipsoidTriangles.push(ellipsoidVertices.length/3-2,ellipsoidVertices.length/3-1,
                                            ellipsoidVertices.length/3-numLongSteps-1); // longitude wrap
                } // end if good number longitude steps
    
                return({vertices:ellipsoidVertices, normals:ellipsoidNormals, texture:ellipsoidTextureCoords ,triangles:ellipsoidTriangles});
            } // end try
            
            catch(e) {
                console.log(e);
            } // end catch
}

// read models in, load them into webgl buffers
function loadModels() {
    // make an ellipsoid, with numLongSteps longitudes.
    // start with a sphere of radius 1 at origin
    // Returns verts, tris and normals.
    function findMedians(z1,z2,z3){
        return (z1+z2+z3)/3;
    }
     // end make ellipsoid
     if(inputTriangles.length == 0)
        inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data

    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the coord array
            var normToAdd; // vtx normal to add to the coord array
            var uvToAdd; // uv coords to add to the uv arry
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
            
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = inputTriangles.length; // remember how many tri sets
            for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set
                
                // set up hilighting, modeling translation and rotation
                inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
                inputTriangles[whichSet].on = false; // not highlighted
                inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
                inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
                inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex and normal arrays, define model center and axes
                inputTriangles[whichSet].glTextureCoords = []
                inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
                inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
                var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    uvToAdd = inputTriangles[whichSet].uvs[whichSetVert];
                    vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
                    normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
                    inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
                    inputTriangles[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
                    inputTriangles[whichSet].glTextureCoords.push(uvToAdd[0],uvToAdd[1]);
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum
                } // end for vertices in set
                vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum

                // send the vertex coords and normals to webGL
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer 
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
               
                vertexTextureCoordBuffer[whichSet] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexTextureCoordBuffer[whichSet]);
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glTextureCoords),gl.STATIC_DRAW);

                loadTexture(inputTriangles[whichSet].material.texture, true);

                // set up the triangle index array, adjusting indices across sets
                inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
                    inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                triIndexMap.push(triSetSizes.length-1);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set 
            
            if(inputEllipsoids.length == 0)
                inputEllipsoids = getJSONFile(INPUT_ELLIPSOIDS_URL,"ellipsoids"); // read in the ellipsoids

            if (inputEllipsoids == String.null)
                throw "Unable to load ellipsoids file!";
            else {
                
                // init ellipsoid highlighting, translation and rotation; update bbox
                var ellipsoid; // current ellipsoid
                var ellipsoidModel; // current ellipsoid triangular model
                var temp = vec3.create(); // an intermediate vec3
                var minXYZ = vec3.create(), maxXYZ = vec3.create();  // min/max xyz from ellipsoid
                numEllipsoids = inputEllipsoids.length; // remember how many ellipsoids

                

                for (var whichEllipsoid=0; whichEllipsoid<numEllipsoids; whichEllipsoid++) {
                    
                    // set up various stats and transforms for this ellipsoid
                    ellipsoid = inputEllipsoids[whichEllipsoid];
                    ellipsoid.on = false; // ellipsoids begin without highlight
                    ellipsoid.translation = vec3.fromValues(0,0,0); // ellipsoids begin without translation
                    ellipsoid.xAxis = vec3.fromValues(1,0,0); // ellipsoid X axis
                    ellipsoid.yAxis = vec3.fromValues(0,1,0); // ellipsoid Y axis 
                    ellipsoid.center = vec3.fromValues(ellipsoid.x,ellipsoid.y,ellipsoid.z); // locate ellipsoid ctr
                    vec3.set(minXYZ,ellipsoid.x-ellipsoid.a,ellipsoid.y-ellipsoid.b,ellipsoid.z-ellipsoid.c); 
                    vec3.set(maxXYZ,ellipsoid.x+ellipsoid.a,ellipsoid.y+ellipsoid.b,ellipsoid.z+ellipsoid.c); 
                    vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
                    vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner
                    loadTexture(inputEllipsoids[whichEllipsoid].texture,false);
                    // make the ellipsoid model
                    ellipsoidModel = makeEllipsoid(ellipsoid,16);
                   
            
                    // send the ellipsoid vertex coords and normals to webGL
                    vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.vertices),gl.STATIC_DRAW); // data in
                    normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.normals),gl.STATIC_DRAW); // data in
                    vertexTextureCoordBuffer.push(gl.createBuffer()); // init empty webgl sphere vertex normal buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTextureCoordBuffer[vertexTextureCoordBuffer.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.texture),gl.STATIC_DRAW); // data in

                    triSetSizes.push(ellipsoidModel.triangles.length);
    
                    // send the triangle indices to webGL
                    triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                    elliIndexMap.push(triSetSizes.length-1);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ellipsoidModel.triangles),gl.STATIC_DRAW); // data in
                } // end for each ellipsoid
                
                viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 500; // set global
            } // end if ellipsoid file loaded
        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

function loadTexture(path, triangle){
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.crossOrigin = 'anonymous';
    texture.image.src = "https://rishabh2693.github.io/WebGL/"+path;
    texture.image.onload = function() {
        handleLoadedTexture(texture);
      }
    if(triangle){
        triangleTexture.push(texture);
    }else {
        ellipsoidTexture.push(texture);
    }
}

function handleLoadedTexture(texture){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    if (isPowerOf2(texture.image.width) && isPowerOf2(texture.image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }
// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aTextureCoord;

        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader

        varying vec2 vTextureCoord;

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            vTextureCoord = aTextureCoord;
        }
    `;
    
    
      // define fragment shader in essl using es6 template strings
    var fShaderCode = `
    precision mediump float; // set float to medium precision

    // eye location
    uniform vec3 uEyePosition; // the eye's position in world
    
    // light properties
    uniform vec3 uLightAmbient; // the light's ambient color
    uniform vec3 uLightDiffuse; // the light's diffuse color
    uniform vec3 uLightSpecular; // the light's specular color
    uniform vec3 uLightPosition; // the light's position
    
    // material properties
    uniform vec3 uAmbient; // the ambient reflectivity
    uniform vec3 uDiffuse; // the diffuse reflectivity
    uniform vec3 uSpecular; // the specular reflectivity
    uniform float uShininess; // the specular exponent
    
    // geometry properties
    varying vec3 vWorldPos; // world xyz of fragment
    varying vec3 vVertexNormal; // normal of fragment

    varying vec2 vTextureCoord;

    uniform float uAlpha;
    uniform int isB;
    uniform sampler2D uSampler;
        
    void main(void) {
    
        // ambient term
        vec3 ambient = uAmbient*uLightAmbient; 
        
        // diffuse term
        vec3 normal = normalize(vVertexNormal); 
        vec3 light = normalize(uLightPosition - vWorldPos);
        float lambert = max(0.0,dot(normal,light));
        vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
        
        // specular term
        vec3 eye = normalize(uEyePosition - vWorldPos);
        vec3 halfVec = normalize(light+eye);
        float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
        vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
        
        vec4 fragmentColor; 
        // combine to output color
        vec3 colorOut = ambient + diffuse + specular; // no specular yet
        
        fragmentColor = texture2D(uSampler,vec2(vTextureCoord.s, vTextureCoord.t));
        if(isB==1)
            gl_FragColor = vec4(fragmentColor.rgb*colorOut, fragmentColor.a*uAlpha);
        else
            gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a);     
    }
    `;
  


    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
       
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                textureCoordAttribute = gl.getAttribLocation(shaderProgram,"aTextureCoord");
                gl.enableVertexAttribArray(textureCoordAttribute);
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess");
                samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
                alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
                isBUniform = gl.getUniformLocation(shaderProgram, "isB");
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders
var targetList = [-0.25, 0.1, 0.5, 0.9, 1.25];
function splitMissile(){
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
   
    function rotateModel(axis,angle) {
        if (inputEllipsoids[inputEllipsoids.length-1] != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,angle,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(inputEllipsoids[inputEllipsoids.length-1].xAxis,inputEllipsoids[inputEllipsoids.length-1].xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(inputEllipsoids[inputEllipsoids.length-1].yAxis,inputEllipsoids[inputEllipsoids.length-1].yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    for(var i=0;i<inputEllipsoids.length;i++){
        if(inputEllipsoids[i].duplicate&&inputEllipsoids[i].y+inputEllipsoids[i].translation[1]<1.1&&!inputEllipsoids[i].split){
            var new_target = targetList[Math.floor(Math.random()*targetList.length)];
            inputEllipsoids.push({
                x: inputEllipsoids[i].x+inputEllipsoids[i].translation[0],
                y: inputEllipsoids[i].y+inputEllipsoids[i].translation[1],
                z: inputEllipsoids[i].z,
                a: 0.01,
                b: 0.05,
                c: 0.01,
                texture: "miss.jpg",
                ambient: [0.1,0.1,0.1],
                diffuse: [0,0,0.6],
                specular: [0.3,0.3,0.3],
                n:5, 
                alpha: 1,
                target_x: new_target,
                velocity_x: (new_target - (inputEllipsoids[i].x+inputEllipsoids[i].translation[0]))*0.001,
                velocity_y: (0 - (inputEllipsoids[i].y+inputEllipsoids[i].translation[1]))*0.001,
                goal_x: new_target,
                goal_y: 0,
              } ); 
            var angle = (-1*Math.atan(inputEllipsoids[inputEllipsoids.length-1].velocity_y/ inputEllipsoids[inputEllipsoids.length-1].velocity_x))+Math.PI/2;
            if(angle>Math.PI/2){
                angle+=Math.PI;
            }  
            numEllipsoids++;
            loadNewEllipsoid(numEllipsoids-1);
            rotateModel(lookAt,angle);    
            inputEllipsoids[i].target_x = targetList[Math.floor(Math.random()*targetList.length)];
            inputEllipsoids[i].split = true;
        }
    }
}
function checkNewLevel(){
    flag = true;
    for(var i=0;i<inputTriangles.length;i++){
        if(inputTriangles[i].type==3&&!inputTriangles[i].invisible){
            flag = false;
        }
    }
}

function checkLevel(){
    levelFlag = true;
    for(var i=0;i<inputEllipsoids.length;i++){
        if(inputEllipsoids[i].type==2&&!inputEllipsoids[i].invisible){
            levelFlag = false;
        }
    }
    if(levelFlag){
        countSleep++;
        for(var i=0;i<inputEllipsoids.length;i++){
            if(inputEllipsoids[i].timer){
                inputEllipsoids[i].timer = 0;
            }
        }
        for(var i=0;i<inputTriangles.length;i++){
            if(inputTriangles[i].timer){
                inputTriangles[i].timer = 0;
            }
        }
        
    }
}


function Value(dist,type,idx,alpha){
    this.dist = dist;
    this.type = type;
    this.idx = idx;
    this.alpha = alpha;
}
// render the loaded model
function renderModels() {
    splitMissile();
    checkLevel();
    checkNewLevel();
    drawScore();
    checkInteraction();
    checkTriangles();
    updateMssileLocation();
    startRandomMissile();
    var Models = [];
    for(var i = 0; i<numTriangleSets;i++ ){
        var value = new Value(getDotProd1(inputTriangles[i]),"tri",i,inputTriangles[i].material.alpha);
        Models.push(value);
    }
    for(var i = 0; i<numEllipsoids;i++ ){
        var value = new Value(getDotProd(inputEllipsoids[i]),"eli",i,inputEllipsoids[i].alpha);
        Models.push(value);
    }
    
//console.log(Models);
    function makeModelTransform(currModel) {
        
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
        
        // scale for highlighting if needed
        if (currModel.on)
            mat4.multiply(mMatrix,mat4.fromScaling(temp,vec3.fromValues(1.2,1.2,1.2)),mMatrix); // S(1.2) * T(-ctr)
        
        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
        
        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
        
    } // end make model transform

    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); 
    // hand * proj * view * model matrices
  
    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    var currSet; // the tri set and its material properties
    for (var whichSet=0; whichSet<numTriangleSets+numEllipsoids; whichSet++) {
        if(Models[whichSet].type == "tri"){
            currSet = inputTriangles[Models[whichSet].idx];
            if(currSet.invisible)
                continue;
            makeModelTransform(currSet);
            mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
            gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
            gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
            
            // reflectivity: feed to the fragment shader
            gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
            gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
            gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
            gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
            
            // vertex buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[triIndexMap[Models[whichSet].idx]]); // activate
            gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
            gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[triIndexMap[Models[whichSet].idx]]); // activate
            gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed
    
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[triIndexMap[Models[whichSet].idx]]);
            gl.vertexAttribPointer(textureCoordAttribute,2,gl.FLOAT,false,0,0);
    
            if(isB)
                gl.uniform1i(isBUniform, 1);
            else
                gl.uniform1i(isBUniform, 0);  
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, triangleTexture[Models[whichSet].idx]);
            gl.uniform1i(samplerUniform, 0);
              
            if(inputTriangles[Models[whichSet].idx].material.alpha == 1) {
                //opaque
                gl.disable(gl.BLEND);
                gl.depthMask(true);
                //gl.enable(gl.DEPTH_TEST);
            }
            else {
                //transparency
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                gl.depthMask(false);
                //gl.disable(gl.DEPTH_TEST);
            }
            gl.uniform1f(alphaUniform, parseFloat(inputTriangles[Models[whichSet].idx].material.alpha));
    
            // triangle buffer: activate and render
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[triIndexMap[Models[whichSet].idx]]); // activate
            gl.drawElements(gl.TRIANGLES,3*triSetSizes[triIndexMap[Models[whichSet].idx]],gl.UNSIGNED_SHORT,0); // render    
        }
        else {
            var ellipsoid; // the current ellipsoid and material

            ellipsoid = inputEllipsoids[Models[whichSet].idx];

            if(ellipsoid.invisible)
                continue;
            // define model transform, premult with pvmMatrix, feed to vertex shader
            makeModelTransform(ellipsoid);
            pvmMatrix = mat4.multiply(pvmMatrix, pvMatrix, mMatrix); // premultiply with pv matrix
            gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in model matrix
            gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in project view model matrix

            // reflectivity: feed to the fragment shader
            gl.uniform3fv(ambientULoc, ellipsoid.ambient); // pass in the ambient reflectivity
            gl.uniform3fv(diffuseULoc, ellipsoid.diffuse); // pass in the diffuse reflectivity
            gl.uniform3fv(specularULoc, ellipsoid.specular); // pass in the specular reflectivity
            gl.uniform1f(shininessULoc, ellipsoid.n); // pass in the specular exponent

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[elliIndexMap[Models[whichSet].idx]]); // activate vertex buffer
            gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed vertex buffer to shader
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[elliIndexMap[Models[whichSet].idx]]); // activate normal buffer
            gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed normal buffer to shader
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[elliIndexMap[Models[whichSet].idx]]); // activate normal buffer
            gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0); // feed normal buffer to shader

            if (isB)
                gl.uniform1i(isBUniform, 1);
            else
                gl.uniform1i(isBUniform, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, ellipsoidTexture[Models[whichSet].idx]);
            gl.uniform1i(samplerUniform, 0);

            if (inputEllipsoids[Models[whichSet].idx].alpha == 1) {
                //opaque
                gl.disable(gl.BLEND);
                gl.depthMask(true);
                //gl.enable(gl.DEPTH_TEST);
            }
            else {
                //transparency
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                // gl.disable(gl.DEPTH_TEST);
                gl.depthMask(false);
            }
            gl.uniform1f(alphaUniform, parseFloat(inputEllipsoids[Models[whichSet].idx].alpha));

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[elliIndexMap[Models[whichSet].idx]]); // activate tri buffer

            // draw a transformed instance of the ellipsoid
            gl.drawElements(gl.TRIANGLES, triSetSizes[elliIndexMap[Models[whichSet].idx]], gl.UNSIGNED_SHORT, 0); // render
            // make model transform, add to view project

        }
    } // end for each triangle set
}
var countSleep = 0;
function drawScore() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if(!flag&&!levelFlag){
        ctx.font = "16px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText("Score: "+score, 5, 20);
        ctx.fillText("Destroy the Enemy Missiles before they destroy your Cities",30,500);
    }
    else if(flag){
        flag = false;
        ctx.font = "50px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText("GAME OVER", 100, 230);
        ctx.fillText("Score: "+score, 110, 300);
      //  throw new Error("Something went badly wrong!");
    }else{
        ctx.font = "50px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText("NEXT LEVEL", 100, 230);
        if(countSleep>300){
            countSleep = 0;
            levelFlag = false;
            main();
        }
    }
    
}

/* MAIN -- HERE is where execution begins after window load */

function main() {  
  init();  
  initSound();
  sound[2].play();
  setupWebGL(); // set up the webGL environment
  loadModels(); // load in the models from tri file
  setupShaders(); // setup the webGL shaders
  renderModels(); // draw the triangles using webGL
  drawScore();
} // end main
