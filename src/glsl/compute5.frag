#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform bool reset;
uniform vec2 computeSize;

out vec4 outColor;

void main() {
    ivec2 texelCoord = ivec2(gl_FragCoord.xy);
    vec4 value = texelFetch(computeTex, texelCoord, 0);
    outColor = value;
}
