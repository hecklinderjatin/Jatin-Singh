// physics/collisionManager.js
const models = [];

const MAX_VELOCITY = 0.03; // max speed to clamp

export const registerModel = (model) => {
  models.push(model);
};

export const unregisterModel = (id) => {
  const index = models.findIndex(m => m.id === id);
  if (index !== -1) models.splice(index, 1);
};

export const handleCollisions = () => {
  for (let i = 0; i < models.length; i++) {
    for (let j = i + 1; j < models.length; j++) {
      const m1 = models[i];
      const m2 = models[j];
      const pos1 = m1.getPosition();
      const pos2 = m2.getPosition();

      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radiusSum = m1.getRadius() + m2.getRadius();

      if (dist < radiusSum && dist > 0) {
        // Normalized collision vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity
        const v1 = m1.getVelocity();
        const v2 = m2.getVelocity();
        const relVelX = v2.x - v1.x;
        const relVelY = v2.y - v1.y;

        // Dot product of relative velocity and normal
        const relVelDotNorm = relVelX * nx + relVelY * ny;

        // Only resolve if velocities are converging
        if (relVelDotNorm < 0) {
          // Simple elastic collision: exchange velocity components along normal
          const v1n = v1.x * nx + v1.y * ny;
          const v1t = -v1.x * ny + v1.y * nx;
          const v2n = v2.x * nx + v2.y * ny;
          const v2t = -v2.x * ny + v2.y * nx;

          // Swap normal components, keep tangential the same
          const v1nAfter = v2n;
          const v2nAfter = v1n;

          // Convert scalar normal/tangential back to vector
          const v1xNew = v1nAfter * nx - v1t * ny;
          const v1yNew = v1nAfter * ny + v1t * nx;
          const v2xNew = v2nAfter * nx - v2t * ny;
          const v2yNew = v2nAfter * ny + v2t * nx;

          // Clamp velocity magnitude to MAX_VELOCITY
          const clamp = (vx, vy) => {
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > MAX_VELOCITY) {
              const scale = MAX_VELOCITY / speed;
              return { x: vx * scale, y: vy * scale };
            }
            return { x: vx, y: vy };
          };

          m1.setVelocity(clamp(v1xNew, v1yNew));
          m2.setVelocity(clamp(v2xNew, v2yNew));

          // Separate overlapping models evenly
          const overlap = radiusSum - dist;
          const separationX = nx * overlap / 2;
          const separationY = ny * overlap / 2;

          const pos1New = { x: pos1.x - separationX, y: pos1.y - separationY };
          const pos2New = { x: pos2.x + separationX, y: pos2.y + separationY };

          m1.setPosition(pos1New);
          m2.setPosition(pos2New);
        }
      }
    }
  }
};
