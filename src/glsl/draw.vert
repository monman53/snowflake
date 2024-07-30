#version 300 es

in vec4 position;
uniform mat4 matrix;
uniform float particleSize;

out vec3 hoge;
out float hue;

void main() {
    vec4 pos = matrix * vec4(position.xyz, 1);
    hoge = pos.xyz;
    // gl_Position = vec4(pos.xy, -pos.z / 100.f, 1);
    gl_Position = vec4(pos.xy, 0, 1);
    hue = position.w;
    gl_PointSize = particleSize;
}