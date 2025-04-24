//'d' to rotate the robot clockwise
//'w' to start moving in the direction robot is facing

let robot
let scoreButton
let floorPlan

let path = []
let followIndex = 0
let offset = 25
let stepSize = 5

function setup() {
  new Canvas(600, 600);
  robot = new Robot();
  floorPlan = new FloorPlan();
  floorPlan.createObstacles();
  generateZigzagPath(); // Generate path AFTER obstacles
  scoreButton = createButton('check score');
  scoreButton.mousePressed(tabulate);
  console.log("test")
}


function draw() {
  background(100);
  
  robot.drawTrail();
  
  if (path.length > 1) {
    robot.followPath();
  }

  // Check if the robot has completed the path
  if (followIndex >= path.length) {
    createP('done!');
    noLoop(); // Stop the program when the robot finishes the path
  }
  
  stroke(0);
  noFill();
//  for (let i = 0; i < path.length; i++) {
   // let p = path[i];
   // point(p[0], p[1]); 
//  }
}

function tabulate(){    
  let total = width * height;
  loadPixels();
  let pixelsPerSquare = pixelDensity() * pixelDensity();
  let count = 0;
  for (i = 0; i < pixels.length; i += 4) {
    if ( pixels[i] == 255 && pixels[i+1] == 255 && pixels[i+2] == 255 && pixels[i+3] == 255) {
      count += 1;
    }
  }
  let score = str(round((100 * count / pixelsPerSquare)/(total-floorPlan.itemsTotalSize),2)) + '% of the room is clean.';
  createP(score);
}


function generateZigzagPath() {
  path = []; 
  let cols = 12;
  let rows = (height - 10) / (offset * 2 - 10);
  let w = width / cols;
  let h = (height - 20) / rows;
  let direction = 1; // 1 = right, -1 = left
  let robotBuffer = offset; // Account for robot size

  // Add path from robot's spawn point to the starting point
  let spawnPoint = [robot.sprite.x, robot.sprite.y]; // Use robot.sprite.x and robot.sprite.y as the spawn point
  let startPoint = [offset, offset]; // Starting point of the zigzag path
  let currentX = spawnPoint[0];
  let currentY = spawnPoint[1];

  while (currentX !== startPoint[0] || currentY !== startPoint[1]) {
    if (currentX < startPoint[0]) currentX = min(currentX + stepSize, startPoint[0]);
    else if (currentX > startPoint[0]) currentX = max(currentX - stepSize, startPoint[0]);

    if (currentY < startPoint[1]) currentY = min(currentY + stepSize, startPoint[1]);
    else if (currentY > startPoint[1]) currentY = max(currentY - stepSize, startPoint[1]);

    if (collidesWithObstacle(currentX, currentY, robotBuffer)) {
      currentY = findSafeY(currentX, currentY, robotBuffer);
    }
    path.push([currentX, currentY]);
  }

  // Generate the zigzag path
  for (let y = 0; y < rows; y++) {
    let startX = direction === 1 ? offset : (cols - 1) * w + offset;
    let endX = direction === 1 ? (cols - 1) * w + offset : offset;

    for (let px = startX; direction === 1 ? px <= endX : px >= endX; px += direction * stepSize) {
      let py = y * h + offset;

      // Check for obstacle collision
      if (collidesWithObstacle(px, py, robotBuffer)) {
        py = findSafeY(px, py, robotBuffer);
      }
      path.push([px, py]);
    }

    direction *= -1;

    // Optional vertical connector
    if (y < rows - 1) {
      let lastX = path[path.length - 1][0];
      let startY = y * h + offset;
      let endY = (y + 1) * h + offset;
      for (let py = startY; py <= endY; py += stepSize) {
        if (collidesWithObstacle(lastX, py, robotBuffer)) {
          py = findSafeY(lastX, py, robotBuffer);
        }
        path.push([lastX, py]);
      }
    }
  }
}


function collidesWithObstacle(x, y, buffer) {
  for (let obs of floorPlan.obstacles) {
    if (x > obs.x - obs.w / 2 - buffer && x < obs.x + obs.w / 2 + buffer &&
        y > obs.y - obs.h / 2 - buffer && y < obs.y + obs.h / 2 + buffer) {
      return true;
    }
  }
  return false;
}



function findSafeY(x, y, buffer) {
  let safeY = y; // Default to the current Y position
  let closestAdjustment = null; // Track the closest valid adjustment
  let topmostEdge = null; // Track the topmost edge of all obstacles in the column

  for (let obs of floorPlan.obstacles) {
    let topEdge = obs.y - obs.h / 2 - buffer;
    let bottomEdge = obs.y + obs.h / 2 + buffer;

    // Check if the robot is colliding with this obstacle
    if (x > obs.x - obs.w / 2 - buffer && x < obs.x + obs.w / 2 + buffer) {
      // Calculate distances to the top and bottom edges
      let distanceToTop = abs(y - topEdge);
      let distanceToBottom = abs(y - bottomEdge);

      // Prefer the closer edge, but ensure it's within canvas bounds
      if (distanceToTop < distanceToBottom && topEdge >= robot.r) {
        if (!closestAdjustment || abs(y - topEdge) < abs(y - closestAdjustment)) {
          closestAdjustment = topEdge;
        }
      } else if (bottomEdge <= height - robot.r) {
        if (!closestAdjustment || abs(y - bottomEdge) < abs(y - closestAdjustment)) {
          closestAdjustment = bottomEdge;
        }
      }

      // Track the topmost edge of all obstacles
      if (topmostEdge === null || topEdge < topmostEdge) {
        topmostEdge = topEdge;
      }
    }
  }

  // If a valid adjustment was found, use it
  if (closestAdjustment !== null) {
    safeY = closestAdjustment;

    // Ensure the selected safeY does not overlap with other obstacles
    for (let obs of floorPlan.obstacles) {
      let topEdge = obs.y - obs.h / 2 - buffer;
      let bottomEdge = obs.y + obs.h / 2 + buffer;

      if (x > obs.x - obs.w / 2 - buffer && x < obs.x + obs.w / 2 + buffer &&
          safeY > topEdge && safeY < bottomEdge) {
        // If the safeY overlaps with another obstacle, adjust it
        if (abs(safeY - topEdge) < abs(safeY - bottomEdge)) {
          safeY = topEdge >= robot.r ? topEdge : safeY;
        } else {
          safeY = bottomEdge <= height - robot.r ? bottomEdge : safeY;
        }
      }
    }
  } else if (topmostEdge !== null) {
    // If no valid adjustment was found, move above the topmost obstacle
    safeY = topmostEdge - buffer;
  }

  // Clamp the final position within the canvas bounds
  return constrain(safeY, robot.r, height - robot.r);
}


