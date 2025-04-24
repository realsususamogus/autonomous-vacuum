
class FloorPlan {
    constructor(){
      this.obstacles = []
      this.itemsTotalSize = 0
    }
    
    createObstacles(){
    this.obstacles = [];
    this.itemsTotalSize = 0;
    let numObstacles = 4; // You can increase this if needed
  
    for (let i = 0; i < numObstacles; i++) {
      let obsW = random(30,100);
      let obsH = random(30,100);
      let x = random(obsW / 2, width - obsW / 2);
      let y = random(obsH / 2, height - obsH / 2);
  
      // Ensure not placing at robot's starting zone
      if (dist(x, y, robot.sprite.x, robot.sprite.y) < 150) {
        i--; continue;
      }
  
      let obstacle = new Sprite(x, y, obsW, obsH);
      obstacle.shapeColor = color(165, 42, 42);
      obstacle.collider = 'k';
      obstacle.mass = 100000;
      this.obstacles.push(obstacle);
      this.itemsTotalSize += obsW * obsH;
    }
  }
  
  }
  
  
