class Robot {
    constructor() {    
      this.sprite = new Sprite(random(600), random(600)); 
      
  
      this.r = offset;
      this.sprite.vel = createVector(0, 0);
      this.sprite.collider = 'k';
      this.maxSpeed = 0.5;
      this.trail = [];
      this.followIndex = -1
      
      this.sprite.draw = () => {
        fill(0);
        circle(0, 0, this.r * 2);
        noStroke();
        fill('lightblue');
        circle(0,0,this.r * 2 -10);
        fill(0);
      };
          
      this.sprite.update = () => {
        this.insideMap();
        
        if (frameCount % 5 == 0) {
          this.trail.push({x: this.sprite.x , y: this.sprite.y});
        }
        
      }
    }
    
    insideMap(){
      if (this.sprite.x > width - this.r) {
        this.sprite.x = width - this.r;
      }
      if (this.sprite.x < this.r) {
        this.sprite.x = this.r;
      }
      if (this.sprite.y > height - this.r) {
        this.sprite.y = height - this.r;
      }
      if (this.sprite.y < this.r) {
        this.sprite.y = this.r;
      } 
    }
    
         followPath() {
          if (this.followIndex === -1) {
              
              let target = path[0];
              let d = dist(this.sprite.x, this.sprite.y, target[0], target[1]);
              
            let startingspeed = 0.02
              this.sprite.x = lerp(this.sprite.x, target[0], startingspeed);
              this.sprite.y = lerp(this.sprite.y, target[1], startingspeed);
  
              if (d < 5) { 
                  this.followIndex = 0;
              }
          } 
          else if (this.followIndex < path.length - 1) {
              let target = path[this.followIndex + 1]; 
              let d = dist(this.sprite.x, this.sprite.y, target[0], target[1]);
  
              let tooClose = abs(this.sprite.x - target[0]) < 1 && abs(this.sprite.y - target[1]) < 1;
            
              let smoothingFactor = 0.6;
              
  
              this.sprite.x = lerp(this.sprite.x, target[0], smoothingFactor);
              this.sprite.y = lerp(this.sprite.y, target[1], smoothingFactor);
  
              let threshold = max(this.speed * 1.5, 10);
  
              if (d < threshold || tooClose) {
                  this.followIndex++;
              }
          } else {
              console.log("Path Completed!");
              noLoop()
          }
      }
  
  
  
    drawTrail(){
      for (let trail of this.trail) {
        noStroke();
        fill(255);
        circle(trail.x, trail.y, this.r * 2 - 10);
      }
    }
  }
