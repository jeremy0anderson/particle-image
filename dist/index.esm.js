import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import React from 'react';

function ParticleSystem(props) {
  var imageRef = React.useRef();
  var wrapperRef = React.useRef();
  var mouse, canvas, context, wrapper;
  React.useEffect(function () {
    imageRef.current;
    var img = document.createElement('img');
    img.src = props.imageUrl;
    img.crossOrigin = 'anonymous';
    mouse = [{
      x: -1000,
      y: -1000,
      force: 1
    }];
    wrapper = wrapperRef.current;
    canvas = document.createElement('canvas');
    canvas.style.background = props.canvasBackground || "transparent";
    context = canvas.getContext('2d', {
      willReadFrequently: true
    });
    canvas.width = props.width;
    canvas.height = props.height;
    canvas.addEventListener('mousemove', function (e) {
      mouse = [{
        x: e.offsetX,
        y: e.offsetY,
        force: 1
      }];
    });
    canvas.addEventListener('mouseout', function (e) {
      mouse = [{
        x: -1000,
        y: -1000,
        force: 1
      }];
    });
    window.addEventListener('mouseout', function (e) {
      mouse = [{
        x: -1000,
        y: -1000,
        force: 1
      }];
    });
    var Particle = /*#__PURE__*/_createClass(function Particle(args) {
      _classCallCheck(this, Particle);
      this.originX = this.x = args.x;
      this.originY = this.y = args.y;
      this.colors = args.colors;
      this.vx = 0;
      this.vy = 0;
      this.isHidden = false;
    });
    var System = /*#__PURE__*/function () {
      function System(canvas, context, width, height) {
        _classCallCheck(this, System);
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
        }];
      }
      _createClass(System, [{
        key: "init",
        value: function init(args) {
          if (args.image) {
            var _image = args.image;
            this.imageWidth = _image.width || _image.naturalWidth;
            this.imageHeight = _image.height || _image.naturalHeight;
            this.imageRatio = this.imageWidth / this.imageHeight;
            this.ratio = Math.floor(Math.min(props.width, props.maxWidth || Number.POSITIVE_INFINITY) / Math.min(props.height, props.maxHeight || Number.POSITIVE_INFINITY));
            if (this.ratio < this.imageRatio) {
              this.renderWidth = ~~Math.min(props.width || Number.POSITIVE_INFINITY, props.minWidth || Number.POSITIVE_INFINITY, props.maxWidth || Number.POSITIVE_INFINITY);
              this.renderHeight = Math.floor(this.renderWidth / this.imageRatio);
            } else {
              this.renderHeight = ~~Math.min(props.height || Number.POSITIVE_INFINITY, props.minHeight || Number.POSITIVE_INFINITY, props.maxHeight || Number.POSITIVE_INFINITY);
              this.renderWidth = Math.floor(this.renderHeight * this.imageRatio);
            }
            this.offsetX = ~~(this.width / 2 - this.renderWidth / 2);
            this.offsetY = ~~(this.height / 2 - this.renderHeight / 2);
            // this.canvas.width = this.renderWidth;
            // this.canvas.height = this.renderHeight;
            // context = canvas.getContext('2d');
            // console.log(image);
            this.context.drawImage(_image, this.offsetX, this.offsetY, this.renderWidth, this.renderHeight);
            var data = context.getImageData(this.offsetX, this.offsetY, this.width, this.height).data;
            this.draw(data, this.offsetX, this.offsetY);
          }
        }
      }, {
        key: "draw",
        value: function draw(data, offsetX, offsetY) {
          for (var x = 0; x < this.width; x += props.gap) {
            for (var y = 0; y < this.height; y += props.gap) {
              var index = (x + y * this.width) * 4;
              var r = data[index];
              var g = data[index + 1];
              var b = data[index + 2];
              var a = data[index + 3];
              var colors = [r, g, b, a];
              if (a > 0) {
                this.origins.push(new Particle({
                  x: offsetX + x,
                  y: offsetY + y,
                  colors: colors
                }));
              }
            }
          }
        }
      }, {
        key: "initParticles",
        value: function initParticles(origins) {
          for (var i = 0; i < origins.length; i++) {
            var particle = new Particle({
              x: ~~origins[i].x,
              y: ~~origins[i].y,
              vx: 0,
              vy: 0,
              colors: origins[i].colors
            });
            this.particles.push(particle);
          }
        }
      }, {
        key: "update",
        value: function update() {
          for (var i = 0; i < this.origins.length; i++) {
            var o = this.origins[i];
            var p = this.particles[i];
            var x = Math.floor(p.x);
            var y = Math.floor(p.y);
            for (var j = 0; j < mouse.length; j++) {
              var touch = mouse[j];
              var dX = ~~touch.x - ~~p.x;
              var dY = ~~touch.y - ~~p.y;
              var d = Math.sqrt(dX * dX + dY * dY);
              var force = -props.radius / d;
              var angle = Math.atan2(dY, dX);
              this.speed = Math.log(this.origins.length) / 10;
              if (props.contained) {
                if (d < props.radius) {
                  p.vx += force * Math.cos(angle) * this.speed;
                  p.vy += force * Math.sin(angle) * this.speed;
                }
              } else if (!props.contained) {
                p.vx += force * Math.cos(angle) * this.speed;
                p.vy += force * Math.sin(angle) * this.speed;
              }

              // p.vx /= props.friction + (p.originX - p.x);
              // p.vy /= props.friction + (p.originY - p.y);
            }
            // p.vx *= this.speed;
            // p.vy *= this.speed;
            p.x += (p.vx *= props.friction) + (~~o.x - ~~p.x) * props.ease;
            p.y += (p.vy *= props.friction) + (~~o.y - ~~p.y) * props.ease;
            p.isHidden = false;
            if (0 >= x || 0 >= y || x >= this.width || y >= this.height) {
              p.isHidden = true;
            }
          }
        }
      }, {
        key: "render",
        value: function render() {
          var imageData = this.context.createImageData(this.width, this.height, {});
          for (var index = 0; index < this.origins.length; index++) {
            var origin = this.origins[index];
            var p = this.particles[index];
            if (!p.isHidden) {
              var x = Math.floor(p.x);
              var y = Math.floor(p.y);
              var a = origin.colors[3];
              var startIndex = ~~((x + y * props.width) * 4);
              imageData.data[startIndex + 0] = origin.colors[0];
              imageData.data[startIndex + 1] = origin.colors[1];
              imageData.data[startIndex + 2] = origin.colors[2];
              imageData.data[startIndex + 3] = a;
            }
          }
          this.context.putImageData(imageData, 0, 0);
        }
      }]);
      return System;
    }();
    img.addEventListener('load', function () {
      var system = new System(canvas, context, props.width, props.height);
      wrapper.appendChild(canvas);
      system.init(img);
      system.initParticles(system.origins);
      function animate() {
        system.update();
        system.render();
        window.requestAnimationFrame(animate);
      }
      animate();
    });
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapperRef
  }, /*#__PURE__*/React.createElement("img", {
    style: {
      display: 'none'
    },
    src: props.imageUrl,
    crossOrigin: "anonymous",
    ref: imageRef
  }));
}

export { ParticleSystem };
