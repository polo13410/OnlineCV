export class Particle {

//   function proceed(){
    
//   }


//   planck.testbed('CollisionProcessing', function(testbed) {
//   var pl = planck, Vec2 = pl.Vec2;
//   var world = pl.World(Vec2(0, -10));

//   // Ground body
//   world.createBody().createFixture(pl.Edge(Vec2(-50.0, 0.0), Vec2(50.0, 0.0)));

//   var xLo = -5.0, xHi = 5.0;
//   var yLo = 2.0, yHi = 35.0;

//   // Small triangle
//   var body1 = world.createDynamicBody(Vec2(pl.Math.random(xLo, xHi), pl.Math.random(yLo, yHi)));
//   body1.createFixture(pl.Polygon([Vec2(-1.0, 0.0), Vec2(1.0, 0.0), Vec2(0.0, 2.0)]), 1.0);

//   // Large triangle (recycle definitions)
//   var body2 = world.createDynamicBody(Vec2(pl.Math.random(xLo, xHi), pl.Math.random(yLo, yHi)));
//   body2.createFixture(pl.Polygon([Vec2(-1.0, 0.0), Vec2(1.0, 0.0), Vec2(0.0, 2.0)]), 1.0);

//   // Small box
//   var body3 = world.createDynamicBody(Vec2(pl.Math.random(xLo, xHi), pl.Math.random(yLo, yHi)));
//   body3.createFixture(pl.Box(1.0, 0.5), 1.0);

//   // Large box (recycle definitions)
//   var body4 = world.createDynamicBody(Vec2(pl.Math.random(xLo, xHi), pl.Math.random(yLo, yHi)));
//   body4.createFixture(pl.Box(2.0, 1.0), 1.0);

//   // Small circle
//   var body5 = world.createDynamicBody(Vec2(pl.Math.random(xLo, xHi), pl.Math.random(yLo, yHi)));
//   body5.createFixture(pl.Circle(1.0), 1.0);

//   // Large circle
//   var body6 = world.createDynamicBody(Vec2(pl.Math.random(xLo, xHi), pl.Math.random(yLo, yHi)));
//   body6.createFixture(pl.Circle(2.0), 1.0);

//   var points = [];

//   world.on('pre-solve', function(contact, oldManifold) {
//     var manifold = contact.getManifold();

//     if (manifold.pointCount == 0) {
//       return;
//     }

//     var fixtureA = contact.getFixtureA();
//     var fixtureB = contact.getFixtureB();

//     var worldManifold = contact.getWorldManifold();

//     for (var i = 0; i < manifold.pointCount; ++i) {
//       var cp = {};
//       cp.fixtureA = fixtureA;
//       cp.fixtureB = fixtureB;
//       cp.position = worldManifold.points[i];
//       cp.normal = worldManifold.normal;
//       // cp.state = state2[i];
//       cp.normalImpulse = manifold.points[i].normalImpulse;
//       cp.tangentImpulse = manifold.points[i].tangentImpulse;
//       cp.separation = worldManifold.separations[i];
//       points.push(cp);
//     }
//   });

//   var bomb = null;
//   var MAX_NUKE = 6;

//   testbed.step = function() {

//     // We are going to destroy some bodies according to contact
//     // points. We must buffer the bodies that should be destroyed
//     // because they may belong to multiple contact points.
//     var nuke = [];

//     // Traverse the contact results. Destroy bodies that
//     // are touching heavier bodies.
//     for (var i = 0; i < points.length && nuke.length < MAX_NUKE; ++i) {
//       var point = points[i];

//       var body1 = point.fixtureA.getBody();
//       var body2 = point.fixtureB.getBody();
//       var mass1 = body1.getMass();
//       var mass2 = body2.getMass();

//       if (mass1 > 0.0 && mass2 > 0.0) {
//         if (mass2 > mass1) {
//           nuke.push(body1);
//         } else {
//           nuke.push(body2);
//         }
//       }
//     }

//     for (var i = 0; i < nuke.length; i++) {
//       var b = nuke[i];
//       if (b != bomb) {
//         world.destroyBody(b);
//       }
//     }

//     points.length = 0;
//   };

//   return world;
// });
}
