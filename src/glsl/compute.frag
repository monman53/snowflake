#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform bool reset;
uniform vec2 computeSize;

out vec4 outColor;

void main() {
    ivec2 texelCoord = ivec2(gl_FragCoord.xy);
    ivec2 center = ivec2(computeSize / 2.f);
    vec4 value = texelFetch(computeTex, texelCoord, 0);  // 0 = mip level 0
    if(reset) {
        if(texelCoord == center) {
            outColor = vec4(1, 0, 0, 0);
        } else {
            outColor = vec4(0, 0, 0, 0);
        }
    } else {
        outColor = value;
    }
}
