#version 300 es
precision highp float;

uniform float rho;
uniform int computeRadius;

out vec4 outColor;

void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    ivec2 center = ivec2(computeRadius);
    if(pos == center) {
        outColor = vec4(1, 0, 1, 0);
    } else {
        outColor = vec4(0, 0, 0, rho);
    }
}
