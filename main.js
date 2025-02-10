const SHIELD_W = 500;
const SHIELD_H = 600;
const SHIELD_SHOULDER = 0.25;

// origin at centre
// shapes centred on position
// y is down

const ANGLE_HORIZ = 0;
const ANGLE_TL_BR = Math.PI/4;
const ANGLE_VERT = Math.PI/2;
const ANGLE_TR_BL = 3*Math.PI/4;
const ANGLES = [ANGLE_HORIZ, ANGLE_TL_BR, ANGLE_VERT, ANGLE_TR_BL];

class Shield extends Two.Path {
  // rect: full width, height = hip size (1/5 height ?)
  // left arc: centre: rect bottom left, radius = rect width
  // right arc: centre: rect bottom right, radius = rect width
  constructor({w, h, two}) {
    let path = [
      [0, 0],
      [w, 0],
      [w, SHIELD_SHOULDER * h], // right curve start
    ];

    const c = [0, SHIELD_SHOULDER * h];
    const steps = 30;
    const curve = [];
    for (let i = 0; i < steps; i++) {
      // centre: 0, shoulder
      // pt0 = w, shoulder
      // 0 - pi/2
      // anti-clockwise
      const theta = (Math.PI/2) * i/steps;
      let x = SHIELD_W * Math.cos(theta);
      let y = SHIELD_W * Math.sin(theta);
      x += c[0];
      y += c[1];

      if (y < SHIELD_H && x > SHIELD_W/2) {
        curve.push([x, y]);
      }
    }

    const curve2 = curve.map(([x, y]) => [SHIELD_W - x, y]);
    curve2.reverse();
    path = path.concat(curve).concat(curve2);

    const anchors = path.map(([x, y]) => new Two.Anchor(x, y, 0, 0, 0, 0, Two.Commands.line));

    super(anchors, true, false, true);
    this.position.set(-w/2, -h/2);
    two.add(this);
  }
}

class FlatPattern extends Two.Rectangle {
  constructor({w, h, colour}) {
    super(0, 0, w, h);
    this.noStroke();
    this.fill = colour;
  }
}

class StripePattern extends Two.Group {
  constructor({w, h, size, angle, colour, two}) {
    super();
    const stripeHeight = size * h;
    for(let y = -h/2; y < h/2; y+= stripeHeight*2) {
      const stripe = two.makeRectangle(0, y + stripeHeight/2, w+300, stripeHeight);
      stripe.noStroke();
      stripe.fill = colour;
      this.add(stripe);
    }
    this.rotation = angle;
    two.add(this);
  }
}

class ChequerPattern extends Two.Group {
  constructor({w, h, size, colour, two}) {
    super();
    const checkSize = size * w;
    let oddYFlag = true;
    for(let y = -h/2; y < h/2; y += checkSize) {
      let oddXFlag = oddYFlag;
      for (let x = -w/2; x < w/2; x += checkSize) {
        if (oddXFlag) {
          const check = two.makeRectangle(x + checkSize/2, y + checkSize/2, checkSize, checkSize);
          check.noStroke();
          check.fill = colour;
          this.add(check);
        }
        oddXFlag = !oddXFlag;
      }
      oddYFlag = !oddYFlag;
    }
    two.add(this);
  }
}

const PATTERNS = ['flat', 'stripe', 'chequer'];

const capitalise = s => s[0].toUpperCase() + s.slice(1);

class Herald extends Two.Group {
  constructor({ bg = 'black', fg = 'white', pattern = 'Stripe', size = 0.1, angle = ANGLE_HORIZ, two }) {
    super();

    // shield mask
    const shieldShape = new Shield({ w: SHIELD_W, h: SHIELD_H, two });
    shieldShape.noStroke();
    shieldShape.noFill();
    shieldShape.fill = '#fff';
    this.mask = shieldShape;
    this.add([shieldShape]);

    const shieldBg = two.makeRectangle(0, 0, SHIELD_W, SHIELD_H);
    shieldBg.noStroke();
    shieldBg.fill = bg;
    this.add([shieldBg]);

    // pattern
    const patternClsName = capitalise(pattern) + 'Pattern';
    const PatternCls = eval(patternClsName);
    const patternShape = new PatternCls({ w: SHIELD_W, h: SHIELD_H, size, angle, colour: fg, two });
    this.add([patternShape]);

    // band

    // subject
  }
}

const COLOURS = [
  ['black', 'white'],
  ['#474', '#ddd'],
  ['cornflowerblue', 'black'],
  ['orange', 'red'],
  ['purple', 'black'],
  ['gold', 'black'],
];

const randInt = max => Math.floor(Math.random()*max);
const makeHeraldGo = () => {
  const two = new Two({ fullscreen: true }).appendTo(document.body);

  const bg = two.makeRectangle(two.width/2, two.height/2, two.width, two.height);
  bg.noStroke();
  bg.fill = '#333';

  const GRID_H = 3;
  const GRID_W = 5;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const colours = COLOURS[randInt(COLOURS.length)];
      const shield = new Herald({
        bg: colours[0],
        fg: colours[1],
        pattern: PATTERNS[randInt(PATTERNS.length)],
        size: 0.2,
        angle: ANGLES[randInt(ANGLES.length)],
        two
      });
      shield.scale = 0.4;
      shield.position.set((x+0.5) * (two.width/GRID_W), (y+0.5) * (two.height/GRID_H));
      two.add(shield);
    }
  }

  two.update();
};

document.addEventListener('DOMContentLoaded', makeHeraldGo);
