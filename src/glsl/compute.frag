#version 300 es
precision highp float;

uniform sampler2D srcTex;

uniform float time;

out vec4 outColor;

void main() {
    ivec2 texelCoord = ivec2(gl_FragCoord.xy);
    vec4 value = texelFetch(srcTex, texelCoord, 0);  // 0 = mip level 0
    outColor = vec4(vec3(sin(time / 100.f)), 1.0f);
}