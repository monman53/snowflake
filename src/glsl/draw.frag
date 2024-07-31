#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform vec2 computeSize;

out vec4 outColor;

void main() {
    vec2 fragPos = gl_FragCoord.xy;
    fragPos.x = fragPos.x - 0.5f * fragPos.y;
    fragPos.y = fragPos.y * 2.0f / sqrt(3.0f);
    ivec2 pos = ivec2(fragPos - canvasSize / 2.f + computeSize / 2.f);
    vec4 value = texelFetch(computeTex, pos, 0);
    float a = value.x;
    float c = value.z;
    float d = value.w;
    if(a > 0.5f) {
        outColor = vec4(vec3(c / 2.f), 1.f);
    } else {
        outColor = vec4(vec3(d), 1.f);
    }
}
