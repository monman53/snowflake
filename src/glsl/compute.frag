#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;

out vec4 outColor;

void main() {
    ivec2 texelCoord = ivec2(gl_FragCoord.xy);
    vec4 value = texelFetch(computeTex, texelCoord, 0);  // 0 = mip level 0
    // outColor = vec4(vec3(sin(time / 100.0f)), 1.0f);
    outColor = vec4(vec3(value + 1.f), 1.0f);
}