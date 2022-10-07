import { Component, HostListener, OnInit, } from '@angular/core';
import { Particle } from './particles';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {

  public canvas: any;
  public c: any;
  public mousePos: { x: number, y: number } = {
    x: 0,
    y: 0
  }
  public colors: any[] = [];
  public particles: any;
  public canvasWid: number = 800;
  public canvasHei: number = 800;

  constructor() {  }

  @HostListener('window:load',['$event'])
  onPageLoad(event: Event) {
     console.log('loaded',event);
     
    this.onChanges();
  }

  @HostListener('window:mousemove', ['$event'])
  handleMouseMove(event: any) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  }

  @HostListener('window:resize', ['$event'])
  handleOnResize(event?: any) {

    this.onChanges();
  }

  onChanges(){
    const parentwidth = document.getElementById('skillcanva')?.clientWidth ?? 800;
    const parentheight = document.getElementById('skillcanva')?.clientHeight ?? 800;

    this.canvasWid = parentwidth;
    this.canvasHei = parentheight;
    this.canvas.width = parentwidth;
    this.canvas.height = parentheight;

    // this.canvasWid = window.innerWidth;
    // this.canvasHei = window.innerHeight;
    // this.canvas.width = window.innerWidth;
    // this.canvas.height = window.innerHeight;

    this.init();
  }

  ngOnInit() {
    this.canvas = document.querySelector('canvas');
    this.c = this.canvas.getContext('2d');
    this.canvas.width = this.canvasWid;
    this.canvas.height = this.canvasHei;

    this.mousePos = {
      x: this.canvasWid / 2,
      y: this.canvasHei / 2
    };
    this.colors = [
      { r: 51, g: 99, b: 252 },
      { r: 77, g: 57, b: 206 },
      // {r: 0, g: 189, b: 255}, 
    ];
    this.init();
    this.animate();
  }
  randomIntFromRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  randomColor(colors: string | any[]) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  distance(x1: number, y1: number, x2: number, y2: number) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
  }

  init() {
    this.particles = [];
    let radius = 100;

    for (let i = 0; i < 10; i++) {
      let x = this.randomIntFromRange(radius, this.canvasWid - radius);
      let y = this.randomIntFromRange(radius, this.canvasHei - radius);

      if (this.particles.length >= 1) {
        for (let j = 0; j < this.particles.length; j++) {
          if (this.distance(x, y, this.particles[j].x, this.particles[j].y) - radius * 2 < 0) {
            x = this.randomIntFromRange(radius, this.canvasWid - radius);
            y = this.randomIntFromRange(radius, this.canvasHei - radius);

            j = -1;
            continue;

          }
        }
      }

      this.particles.push(new Particle(x, y, radius, this.randomColor(this.colors), this.canvas, this.c));
    }

  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle: { mousePos: { x: number; y: number; }; update: (arg0: any) => void; }) => {
      particle.mousePos = this.mousePos;
      particle.update(this.particles);
    });
  }

}
