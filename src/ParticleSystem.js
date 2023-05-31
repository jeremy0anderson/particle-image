import React from 'react';


export function ParticleSystem(props){
   const imageRef = React.useRef();
   const wrapperRef = React.useRef();
   var mouse, canvas, context, image, wrapper;
   
   React.useEffect(()=>{
      image = imageRef.current;
      let img = document.createElement('img');
      img.src = props.imageUrl;
      img.crossOrigin = 'anonymous';
      mouse = [{
         x:-1000,
         y:-1000,
         force:1
      }]
      wrapper = wrapperRef.current;
      canvas = document.createElement('canvas');
      canvas.style.background = props.canvasBackground||"transparent";
      context = canvas.getContext('2d', {willReadFrequently: true});
      canvas.width = props.width;
      canvas.height = props.height;
      canvas.addEventListener('mousemove', (e)=>{
         mouse = [{
            x: e.offsetX,
            y: e.offsetY,
            force: 1
         }]
      });
      canvas.addEventListener('mouseout', (e)=>{
         mouse = [{
            x: -1000,
            y: -1000,
            force: 1
         }]
      })
      window.addEventListener('mouseout', (e)=>{
         mouse = [{
            x: -1000,
            y: -1000,
            force: 1
         }]
      })
      class Particle{
         constructor(args) {
            this.originX = this.x = args.x;
            this.originY = this.y = args.y;
            this.colors = args.colors;
            this.vx = 0;
            this.vy = 0;
            this.isHidden = false;
         }
         
      }
      class System{
         constructor(canvas, context, width, height){
            this.canvas = canvas;
            this.context = context;
            this.width = width;
            this.height = height;
            this.origins = [];
            this.particles = [];
            this.mouse = [{
               x: 0,
               y: 0,
               force: 1
            }]
         }
         init(args){
            if (args.image) {
               let {image} = args;
   
               this.imageWidth = (image.width || image.naturalWidth);
               this.imageHeight = (image.height || image.naturalHeight);
               this.imageRatio = this.imageWidth / this.imageHeight;
               this.ratio =
                  Math.floor(Math.min(props.width, props.maxWidth || Number.POSITIVE_INFINITY) /
                     Math.min(props.height, props.maxHeight || Number.POSITIVE_INFINITY));
               if (this.ratio < this.imageRatio) {
                  this.renderWidth = ~~Math.min(
                     props.width || Number.POSITIVE_INFINITY,
                     props.minWidth || Number.POSITIVE_INFINITY,
                     props.maxWidth || Number.POSITIVE_INFINITY,
                  );
                  this.renderHeight = Math.floor(this.renderWidth / this.imageRatio);
               } else {
                  this.renderHeight = ~~Math.min(
                     props.height || Number.POSITIVE_INFINITY,
                     props.minHeight || Number.POSITIVE_INFINITY,
                     props.maxHeight || Number.POSITIVE_INFINITY,
                  );
                  this.renderWidth = (Math.floor(this.renderHeight * this.imageRatio));
               }
               this.offsetX = ~~((this.width / 2 - this.renderWidth / 2));
               this.offsetY = ~~((this.height / 2 - this.renderHeight / 2));
               // this.canvas.width = this.renderWidth;
               // this.canvas.height = this.renderHeight;
               // context = canvas.getContext('2d');
               // console.log(image);
               this.context.drawImage(image, this.offsetX, this.offsetY, this.renderWidth, this.renderHeight);
               let data = context.getImageData(this.offsetX, this.offsetY, this.width, this.height).data;
               this.draw(data, this.offsetX, this.offsetY);
            }
         }
         draw(data, offsetX, offsetY){
            for (let x = 0; x < this.width; x+=props.gap) {
               for (let y = 0; y < this.height; y+=props.gap) {
                  let index = ((x + y *this.width)*4);
                  let r = data[index];
                  let g = data[index+1];
                  let b = data[index+2];
                  let a = data[index+3];
                  let colors = [r, g, b, a];
                  if ( a > 0){
                     this.origins.push(new Particle({
                        x:offsetX+x, y:offsetY+y, colors
                     }));
                  }
               }
            }
         }
         initParticles(origins){
            for (let i = 0; i < origins.length; i++) {
               const particle = new Particle({
                  x: ~~origins[i].x,
                  y: ~~origins[i].y,
                  vx: 0,
                  vy: 0,
                  colors: origins[i].colors
               });
               this.particles.push(particle);
            }
         }
         update(){
            for (let i = 0; i < this.origins.length; i++) {
               let o = this.origins[i];
               let p = this.particles[i];
               let x = Math.floor(p.x);
               let y = Math.floor(p.y);
               for (let j = 0; j < mouse.length; j++) {
                  let touch = mouse[j];
                  let dX = ~~touch.x - ~~p.x;
                  let dY = ~~touch.y - ~~p.y;
                  let d = Math.sqrt(dX * dX + dY * dY);
                  let force = (-props.radius/d) ;
                  let angle = Math.atan2(dY, dX);
                  this.speed = Math.log(this.origins.length)/10
                  if (props.contained) {
                     if (d < props.radius) {
                        p.vx += force * Math.cos(angle) * this.speed;
                        p.vy += force * Math.sin(angle) * this.speed;
                     }
                  } else if (!props.contained){
                     p.vx += force * Math.cos(angle) * this.speed;
                     p.vy += force * Math.sin(angle) * this.speed;
                  }
                  
                  // p.vx /= props.friction + (p.originX - p.x);
                  // p.vy /= props.friction + (p.originY - p.y);
               }
               // p.vx *= this.speed;
               // p.vy *= this.speed;
               p.x += (p.vx *= props.friction ) + (~~o.x - ~~p.x) * (props.ease);
               p.y += (p.vy *= props.friction ) + (~~o.y - ~~p.y) * (props.ease);
               p.isHidden = false;
               if (0 >= x ||0 >= y || x >= this.width || y >= this.height ){
                  p.isHidden = true;
               }
            }
         }
         render(){
            let imageData = this.context.createImageData(this.width, this.height, {});
            for (let index = 0; index < this.origins.length; index++) {
               let origin = this.origins[index];
               let p = this.particles[index];
               if (!p.isHidden) {
                  let x = Math.floor(p.x);
                  let y = Math.floor(p.y);
                  let a = origin.colors[3];
                  let startIndex = ~~((x + y * props.width) * 4);
                  imageData.data[startIndex + 0] = origin.colors[0];
                  imageData.data[startIndex + 1] = origin.colors[1];
                  imageData.data[startIndex + 2] = origin.colors[2];
                  imageData.data[startIndex + 3] = a;
               }
            }
            this.context.putImageData(imageData, 0, 0);
            
         }
      }
      
      
      img.addEventListener('load', ()=>{
         const system = new System(canvas, context, props.width, props.height);
         wrapper.appendChild(canvas);
         system.init(img);
         system.initParticles(system.origins)
         
         function animate(){
            system.update();
            system.render();
            window.requestAnimationFrame(animate);
         }
         animate();
         
      })
      
   })
   
   return(
      <div ref={wrapperRef}>
         <img style={{display: 'none'}} src={props.imageUrl} crossOrigin={"anonymous"} ref={imageRef}/>
      </div>
   )
}