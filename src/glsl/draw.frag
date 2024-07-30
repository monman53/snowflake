#version 300 es

precision highp float;

uniform sampler2D computeTex;

out vec4 outColor;

void main() {
    outColor = vec4(1.f, 0.f, 0.f, 1.f);
}
