#version 300 es

/////////////// K.jpg's Re-oriented 8-Point BCC Noise (OpenSimplex2S) ////////////////
////////////////////// Output: vec4(dF/dx, dF/dy, dF/dz, value) //////////////////////

// Borrowed from Stefan Gustavson's noise code
vec4 permute(vec4 t) {
    return t * (t * 34.0f + 133.0f);
}

// Gradient set is a normalized expanded rhombic dodecahedron
vec3 grad(float hash) {

    // Random vertex of a cube, +/- 1 each
    vec3 cube = mod(floor(hash / vec3(1.0f, 2.0f, 4.0f)), 2.0f) * 2.0f - 1.0f;

    // Random edge of the three edges connected to that vertex
    // Also a cuboctahedral vertex
    // And corresponds to the face of its dual, the rhombic dodecahedron
    vec3 cuboct = cube;
    cuboct[int(hash / 16.0f)] = 0.0f;

    // In a funky way, pick one of the four points on the rhombic face
    float type = mod(floor(hash / 8.0f), 2.0f);
    vec3 rhomb = (1.0f - type) * cube + type * (cuboct + cross(cube, cuboct));

    // Expand it so that the new edges are the same length
    // as the existing ones
    vec3 grad = cuboct * 1.22474487139f + rhomb;

    // To make all gradients the same length, we only need to shorten the
    // second type of vector. We also put in the whole noise scale constant.
    // The compiler should reduce it into the existing floats. I think.
    grad *= (1.0f - 0.042942436724648037f * type) * 3.5946317686139184f;

    return grad;
}

// BCC lattice split up into 2 cube lattices
vec4 openSimplex2SDerivativesPart(vec3 X) {
    vec3 b = floor(X);
    vec4 i4 = vec4(X - b, 2.5f);

    // Pick between each pair of oppposite corners in the cube.
    vec3 v1 = b + floor(dot(i4, vec4(.25f)));
    vec3 v2 = b + vec3(1, 0, 0) + vec3(-1, 1, 1) * floor(dot(i4, vec4(-.25f, .25f, .25f, .35f)));
    vec3 v3 = b + vec3(0, 1, 0) + vec3(1, -1, 1) * floor(dot(i4, vec4(.25f, -.25f, .25f, .35f)));
    vec3 v4 = b + vec3(0, 0, 1) + vec3(1, 1, -1) * floor(dot(i4, vec4(.25f, .25f, -.25f, .35f)));

    // Gradient hashes for the four vertices in this half-lattice.
    vec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0f));
    hashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0f));
    hashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0f)), 48.0f);

    // Gradient extrapolations & kernel function
    vec3 d1 = X - v1;
    vec3 d2 = X - v2;
    vec3 d3 = X - v3;
    vec3 d4 = X - v4;
    vec4 a = max(0.75f - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0f);
    vec4 aa = a * a;
    vec4 aaaa = aa * aa;
    vec3 g1 = grad(hashes.x);
    vec3 g2 = grad(hashes.y);
    vec3 g3 = grad(hashes.z);
    vec3 g4 = grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));

    // Derivatives of the noise
    vec3 derivative = -8.0f * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations) + mat4x3(g1, g2, g3, g4) * aaaa;

    // Return it all as a vec4
    return vec4(derivative, dot(aaaa, extrapolations));
}

// Use this if you don't want Z to look different from X and Y
vec4 openSimplex2SDerivatives_Conventional(vec3 X) {
    X = dot(X, vec3(2.0f / 3.0f)) - X;

    vec4 result = openSimplex2SDerivativesPart(X) + openSimplex2SDerivativesPart(X + 144.5f);

    return vec4(dot(result.xyz, vec3(2.0f / 3.0f)) - result.xyz, result.w);
}

// Use this if you want to show X and Y in a plane, then use Z for time, vertical, etc.
vec4 openSimplex2SDerivatives_ImproveXY(vec3 X) {

    // Not a skew transform.
    mat3 orthonormalMap = mat3(0.788675134594813f, -0.211324865405187f, -0.577350269189626f, -0.211324865405187f, 0.788675134594813f, -0.577350269189626f, 0.577350269189626f, 0.577350269189626f, 0.577350269189626f);

    X = orthonormalMap * X;
    vec4 result = openSimplex2SDerivativesPart(X) + openSimplex2SDerivativesPart(X + 144.5f);

    return vec4(result.xyz * orthonormalMap, result.w);
}

//////////////////////////////// End noise code ////////////////////////////////

float noise(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898f, 78.233f))) * 43758.5453f);
}

in vec4 oldPosition;
in vec4 oldVelocity;

uniform float time;
uniform float deltaTime;
uniform vec2 canvasDimensions;
uniform float simplexResolution;
uniform float simplexScale;
uniform float simplexTimeScale;
uniform float k;
uniform float diffusion;
uniform float gravity;

out vec4 newPosition;
out vec4 newVelocity;

void main() {
    vec4 random = openSimplex2SDerivatives_ImproveXY(vec3(oldPosition.xy * simplexResolution, time * simplexTimeScale));
    newPosition = oldPosition + oldVelocity * deltaTime;
    float m = 1.0f;
    vec4 accel;
    vec2 D = vec2(noise(oldPosition.xy) - 0.5f, noise(oldPosition.xy + 0.1f) - 0.5f) * diffusion;
    accel.xy = simplexScale * random.xy - k / m * oldVelocity.xy + D;
    accel.z = gravity;
    accel.w = 0.f;// unused
    newVelocity = oldVelocity + accel * deltaTime;
}