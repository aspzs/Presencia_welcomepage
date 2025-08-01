let imgs = [];
let imgCount = 100;
let theta = 0;
let ellipseA, ellipseB;
let ellipseSpeed = 0.006;
let centerButton;

let hoverIndex = -1;
let hoverAngle = 0;
let releasingIndex = -1;
let releaseAngle = 0;
let releasingLerpAmount = 0;

// Parámetro para desplazamiento horizontal oscilante
let xMoveAmplitude;
let xMoveSpeed = 0;
let xMovePhase = 0;

// Variables para la línea dinámica
let buttonCenterX, buttonCenterY;

function preload() {
  for (let i = 0; i <= imgCount; i++) {
    imgs.push(loadImage('assets/Presencia_' + i + '.png'));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ellipseA = width * -0.16;
  ellipseB = height * 0.43;
  xMoveAmplitude = width * 0.1; // Máximo desplazamiento horizontal

  centerButton = createButton('ENTER');
  centerButton.position(width / 2 - 60, height / 2 - 25);
  centerButton.size(120, 50);
  centerButton.style('font-size', '22px');
  centerButton.style('border-radius', '25px');
  centerButton.style('background', '#fff');
  centerButton.style('border', 'none');
  centerButton.mousePressed(() => window.open('https://presencia.shop', '_blank'));
  centerButton.style('z-index', '10');
  
  // Inicializar posición del centro del botón
  buttonCenterX = width / 2;
  buttonCenterY = height / 2;
}

function draw() {
  background(232, 249, 183);
  let cx = width / 2;
  let cy = height / 2;

  centerButton.position(cx - 60, cy - 25);
  buttonCenterX = cx;
  buttonCenterY = cy;

  // Dibujar línea dinámica del botón al mouse
  drawDynamicLine();

  let prevHoverIndex = hoverIndex;
  hoverIndex = 0;

  // Desplazamiento horizontal oscilante (de derecha a izquierda y viceversa)
  xMovePhase += xMoveSpeed;
  let xOffset = xMoveAmplitude * sin(xMovePhase);

  // Detectar hover
  for (let i = 0; i < imgCount; i++) {
    let angle = theta + TWO_PI * (i / imgCount);
    let y = cy + ellipseB * sin(angle);
    let baseX = cx + ellipseA * cos(angle);
    let offsetXByY = map(y, cy - ellipseB, cy + ellipseB, -ellipseA * 0.3, ellipseA * 0.3);
    let x = baseX + offsetXByY + xOffset;

    let d = dist(mouseX, mouseY, x, y);
    if (d < 40) {
      hoverIndex = i;
      break;
    }
  }

  // Si se quitó el hover, iniciar animación de regreso para la imagen que perdió hover
  if (prevHoverIndex !== -1 && hoverIndex !== prevHoverIndex && releasingIndex === -1) {
    releasingIndex = prevHoverIndex;
    releasingLerpAmount = 0;
    hoverAngle = hoverAngle % TWO_PI;
  }

  if (releasingIndex !== -1) {
    releasingLerpAmount += 0.03;
    if (releasingLerpAmount > 1) releasingLerpAmount = 1;

    let targetAngle = theta + TWO_PI * (releasingIndex / imgCount);

    // Ajustar interpolación ángulos cíclicos
    let a0 = hoverAngle;
    let a1 = targetAngle;
    if (abs(a1 - a0) > PI) {
      if (a0 > a1) a1 += TWO_PI;
      else a0 += TWO_PI;
    }

    releaseAngle = lerp(a0, a1, releasingLerpAmount) % TWO_PI;

    if (releasingLerpAmount >= 1) {
      releasingIndex = -1;
    }
  }

  // Dibujar imágenes
  for (let i = 0; i < imgCount; i++) {
    let angle;
    let isHover = (i === hoverIndex);
    let isReleasing = (i === releasingIndex);

    if (isHover) {
      if (hoverIndex !== prevHoverIndex) {
        hoverAngle = theta + TWO_PI * (i / imgCount);
      }
      angle = hoverAngle;
    } else if (isReleasing) {
      angle = releaseAngle;
    } else {
      angle = theta + TWO_PI * (i / imgCount);
    }

    let y = cy + ellipseB * sin(angle);
    let baseX = cx + ellipseA * cos(angle);
    let offsetXByY = map(y, cy - ellipseB, cy + ellipseB, -ellipseA * 0.3, ellipseA * 0.3);
    let x = baseX + offsetXByY + xOffset;

    // Usar tamaño real de la imagen para hover, tamaño pequeño para normal
    let imgSize = isHover ? 420 : 44;
    
    // Calcular el tamaño real manteniendo aspect ratio
    if (imgs[i]) {
      let realWidth = imgs[i].width;
      let realHeight = imgs[i].height;
      let aspectRatio = realWidth / realHeight;
      
      if (isHover) {
        // Para hover, mantener el tamaño 420 pero con aspect ratio correcto
        if (aspectRatio > 1) {
          // Imagen más ancha que alta
          imgSize = { width: 420, height: 420 / aspectRatio };
        } else {
          // Imagen más alta que ancha
          imgSize = { width: 420 * aspectRatio, height: 420 };
        }
      } else {
        // Para tamaño normal, mantener aspect ratio también
        if (aspectRatio > 1) {
          imgSize = { width: 44, height: 44 / aspectRatio };
        } else {
          imgSize = { width: 44 * aspectRatio, height: 44 };
        }
      }
    } else {
      // Fallback si la imagen no está cargada
      imgSize = isHover ? { width: 420, height: 420 } : { width: 44, height: 44 };
    }

    if (isHover) {
      push();
      
      // Dibujar el resplandor circular blanco
      drawGlow(x, y, 500);
      
      // Dibujar la imagen con sombra
      imageMode(CENTER);
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 0;
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(0,0,0,0.8)';
      
      if (typeof imgSize === 'object') {
        image(imgs[i], x, y, imgSize.width, imgSize.height);
      } else {
        image(imgs[i], x, y, imgSize, imgSize);
      }
      
      pop();
    } else {
      imageMode(CENTER);
      if (typeof imgSize === 'object') {
        image(imgs[i], x, y, imgSize.width, imgSize.height);
      } else {
        image(imgs[i], x, y, imgSize, imgSize);
      }
    }
  }

  theta += ellipseSpeed;
}

function drawDynamicLine() {
  // Solo dibujar la línea si el mouse no está sobre el botón
  let distToButton = dist(mouseX, mouseY, buttonCenterX, buttonCenterY);
  if (distToButton > 60) {
    push();
    stroke(255, 255, 255, 120); // Línea blanca semi-transparente
    strokeWeight(12);
    
    // Crear efecto de línea ondulante
    let segments = 20;
    let prevX = buttonCenterX;
    let prevY = buttonCenterY;
    
    for (let i = 1; i <= segments; i++) {
      let t = i / segments;
      let x = lerp(buttonCenterX, mouseX, t);
      let y = lerp(buttonCenterY, mouseY, t);
      
      // Agregar ondulación sutil
      let wave = sin(frameCount * 0.1 + t * PI * 2) * 5;
      x += wave;
      
      // Hacer la línea más transparente hacia el final
      let alpha = map(i, 1, segments, 120, 20);
      stroke(255, 255, 255, alpha);
      
      line(prevX, prevY, x, y);
      prevX = x;
      prevY = y;
    }
    pop();
  }
}

function drawGlow(x, y, size) {
  push();
  
  // Crear múltiples círculos concéntricos para el efecto de resplandor
  for (let r = size; r > 0; r -= 20) {
    let alpha = map(r, 0, size, 200, 0);
    fill(255, 255, 255, alpha);
    noStroke();
    ellipse(x, y, r, r);
  }
  
  // Círculo central más brillante
  fill(255, 255, 255, 100);
  ellipse(x, y, 200, 200);
  
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ellipseA = width * 0.36;
  ellipseB = height * 0.23;
  xMoveAmplitude = width * 0.1;
}
