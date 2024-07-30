#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform vec2 computeSize;

out vec4 outColor;

void main() {
    ivec2 texelCoord = ivec2(gl_FragCoord.xy - canvasSize / 2.f + computeSize / 2.f);
    vec4 value = texelFetch(computeTex, texelCoord, 0);
    float x = 0.f;
    // for(int i = 0; i < 256; i++) {
    //     vec4 value = texelFetch(computeTex, texelCoord, 0);
    //     x += float(i) * value.x;
    // }
    outColor = vec4(vec3(sin(value.x / 10000.f)), 1.0f);
}
