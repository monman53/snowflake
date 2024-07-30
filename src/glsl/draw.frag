#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform vec2 computeSize;

out vec4 outColor;

void main() {
    outColor = vec4(1.f, 0.f, 0.f, 1.f);
    ivec2 texelCoord = ivec2(gl_FragCoord.xy - canvasSize / 2.f + computeSize / 2.f);
    outColor = texelFetch(computeTex, texelCoord, 0);
}
