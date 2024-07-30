#version 300 es
precision highp float;

uniform sampler2D srcTex;

out vec4 outColor;

void main() {
    ivec2 texelCoord = ivec2(gl_FragCoord.xy);
    vec4 value = texelFetch(srcTex, texelCoord, 0);  // 0 = mip level 0
    // outColor = value * 2.0f;
    outColor = vec4(0.f, 1.f, 0.f, 1.0f);
}