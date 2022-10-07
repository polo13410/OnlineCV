export class Particle {

    public x;
    public y;
    public velocity = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
    };
    public radius;
    public mass;
    public opacity = 0;
    public r;
    public g;
    public b;
    public canvas:any;
    public c:any;
    public mousePos:{x:number , y:number } = {
      x:0,
      y:0
    }

    constructor (x: number, y: number, radius: number, rgb: { r: any; g: any; b: any; }, canvas: any, c: any){
      this.x = x;
      this.y = y;
      this.velocity = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1
      };
      this.radius = radius;
      this.mass = 1;
      this.opacity = 0;
      this.r = rgb.r;
      this.g = rgb.g;
      this.b = rgb.b;
      this.canvas = canvas;
      this.c = c;
    }



    update(particles: string | any[]){
        this.draw();

        for (let i = 0; i < particles.length; i++) {
            const otherParticle = particles[i];
            if (this.x === otherParticle.x) continue;

            if (this.distance(this.x, this.y, otherParticle.x, otherParticle.y) - this.radius * 2 < 0) {

                const res = {
                    x: this.velocity.x - otherParticle.velocity.x,
                    y: this.velocity.y - otherParticle.velocity.y
                };

                if (res.x * (otherParticle.x - this.x) + res.y * (otherParticle.y - this.y) >= 0) {

                    const m1 = this.mass;
                    const m2 = otherParticle.mass;
                    const theta = -Math.atan2(otherParticle.y - this.y, otherParticle.x - this.x);

                    const rotatedVelocity1 = this.rotateVelocities(this.velocity, theta);
                    const rotatedVelocity2 = this.rotateVelocities(otherParticle.velocity, theta);

                    const swapVelocity1 = { x: rotatedVelocity1.x * (m1 - m2) / (m1 + m2) + rotatedVelocity2.x * 2 * m2 / (m1 + m2), y: rotatedVelocity1.y };
                    const swapVelocity2 = { x: rotatedVelocity2.x * (m1 - m2) / (m1 + m2) + rotatedVelocity1.x * 2 * m2 / (m1 + m2), y: rotatedVelocity2.y };

                    const u1 = this.rotateVelocities(swapVelocity1, -theta);
                    const u2 = this.rotateVelocities(swapVelocity2, -theta);

                    this.velocity.x = u1.x;
                    this.velocity.y = u1.y;
                    otherParticle.velocity.x = u2.x;
                    otherParticle.velocity.y = u2.y;
                }
            }
        }

        if (this.distance(this.x, this.y, this.mousePos.x, this.mousePos.y) - this.radius * 2 < 100 && this.opacity <= 0.2) {
            this.opacity += 0.01;
        } else if (this.opacity > 0) {
            this.opacity -= 0.01;
        }

        if (this.x + this.radius >= this.canvas.width || this.x - this.radius <= 0)
            this.velocity.x = -this.velocity.x;

        if (this.y + this.radius >= this.canvas.height || this.y - this.radius <= 0)
            this.velocity.y = -this.velocity.y;

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };

    draw (){
        this.c.beginPath();
        this.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.c.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, 1)`;
        this.c.stroke();
        this.c.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity}`;
        this.c.fill();
        this.c.closePath();
    };
    rotateVelocities(velocity: { x: any; y: any; }, theta: number) {
      const rotatedVelocity = {
          x: velocity.x * Math.cos(theta) - velocity.y * Math.sin(theta),
          y: velocity.x * Math.sin(theta) + velocity.y * Math.cos(theta)
      };
      return rotatedVelocity;
  }
  distance(x1: number, y1: number, x2: number, y2: number) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
  }
}