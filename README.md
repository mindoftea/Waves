Waves Demo
==========

A one-dimensional fluid simulator demo.

The fluid is composed of vertical cells, each of which is locked horizontally. As a result, it acts more like a fluid under a thin layer of some elastic material, like water under plastic wrap. Click and move your mouse to interact with it and make waves. There is a fully 'physics-ed' ellipse resting on the surface of the fluid.

See it live here: http://mindoftea.jit.su/demos/w.

## How it works:

### The Fluid:

At its heart, Waves is an iterative DE solver. The fluid is really a set of point masses, each moving in response to forces acting on it. At each "step" of the simulation, the forces on a point are calculated based on its current velocity and position. Then, these forces are added into a single net-force and divided by the point's mass to find an acceleration. Then, this acceleration is multiplied by the amount of time between steps (`dt`) and added to the point's velocity. (In other words, velocity is the integral of acceleration `dt`.) Then, this new velocity is multiplied by `dt` and added to the point's position. As the cycle repeats, it creates a complex feedback loop; force causes change in velocity, velocity causes change in position, and position and velocity cause change in force. By finding the right set of forces, we can make the points react in almost any way we want. For a fluid, the motion of each point doesn't just depend on its own position and velocity, but also on those of its neighbors.

There are several forces at work at any time on any fluid. The models that Waves uses are idealized versions, but correspond to counterparts in reality. They are:

 - Surface tension:
 	 - This is perhaps the most important; it is responsible for keeping the surface of the fluid a continuous shape and is also the cause of surface waves.
 	 - Surface tension is basically a force which tends to pull adjacent points on the surface of a fluid toward each other. (Or, if you prefer, it's Hydrogen bonding which pulls water molecules toward each other, but not toward air.) The simplest force that behaves like this is a Hookean spring, which applies a restoring force proportional to the separation between objects.
 	 - Waves uses Hooke's law, `f = k*x`, to simulate surface tension. In effect, each pair of adjacent points is bound together by a spring.
 - Viscosity:
 	 - This force is the internal friction of a liquid. It tends to make adjacent points within a fluid travel at similar speeds. Water is a relatively non-viscous liquid, while honey is quite viscous. Viscosity tends to make many small waves coalesce into a single, larger wave.
 	 - The best model for this is viscous harmonic damping. It applies a force proportional to the difference in speed of two objects, making them tend to match speed.
 	 - Each pair of adjacent points in waves is bound together by a damper. When one moves fast relative to its neighbors, it slows down, while its neighbors speed up to match.
 - Drag:
 	 - Drag is a lot like viscosity, except that it is absolute, rather than relative. When you throw a rock into a pond, the resulting waves do not continue to propogate forever; the pond eventually returns to its placid state. This is a result of drag. When a point in a fluid is moving quickly, it tends to lose energy, slowing it down.
 	 - We can simulate this behavior by applying viscous damping between each point and the stationary floor of their container.
 - Gravity:
 	 - Gravity in a fluid is tricky; when a fluid is resting calmly in a container, no part of it "falls" because it is, at every point, supported by its own internal pressure. Only when a part of a fluid is raised above the rest does it begin to fall.
 	 - The best model for this behavior is to calculate pressure separately and make the force of gravity proportional to the height of a point above the bottom of the container. This makes sense because each point effectively represents a column of water. The force of gravity is proportional to the mass upon which it is acting, so a taller column of water is literally heavier.
 - Pressure:
 	 - All fluids, even water, are at least slightly compressible. When you "squish" them down, they tend to push back, attempting to return to their old size. This behavior is governed by the ideal gas law, `P*V = E`. The fluid as a whole has some internal energy, `E` (or `n*R*T`, in general). The internal pressure of a fluid is the amount of this energy in a given unit of volume. In our 2d case, we use area instead of volume.
 	 - Before the main force-calculating loop, Waves adds up the area of all of the points, yeilding the total area of the fluid, and divides the fluid's energy (a constant defined at the beginning of the program) by it. This yields a pressure.
 	 - In a real fluid, this internal pressure is countered by external atomspheric pressure, another constant. The force on each object is `width * internalPressure * externalPressure`.

And that's it. When those five forces act on each point, the overall behavior of the points is like that of a fluid.

### The Boat:

The boat is simpler. It too is based on an iterative solver, but there is only one force acting on it: collisions with the points of the fluid.

I chose to make the boat an ellipse because ellipses have several convenient properties:

 - They have a continuous and differentiable surface so it is possible to find the normal vector to any point on the surface of an ellipse.
 - It is easy to check if a point is within an ellipse by finding the distance to each focus, and checking if the sum is less than some radius.
 - Because they are not circles, it is possible for them to be spun even without friction, a key property in wave interaction.

On each step, each point in the fluid is checked for collisions with the boat's surface. If they collide, a force is applied to the boat in the direction of the fluid's normal vector at that point with a magnitude proportional to the amount of overlap between the boat and the fluid column, with drag. An opposite force pushes the fluid column down. This force is then decomposed into a torque, which changes the boat's angualr speed.

