#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform int computeRadius;

out vec4 outColor;

void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    vec4 current = texelFetch(computeTex, pos, 0);
    vec4 next = current;
    outColor = next;
}
