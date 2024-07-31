#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform vec2 computeSize;
uniform float rot;

out vec4 outColor;

#define M_PI 3.1415926535897932384626433832795

void main() {
    vec2 fragPos = gl_FragCoord.xy - canvasSize * 0.5f;
    float co = cos(rot * M_PI / 6.f);
    float si = sin(rot * M_PI / 6.f);
    mat2 rot = mat2(co, -si, si, co);
    fragPos = rot * fragPos;
    fragPos.y *= 2.0f / sqrt(3.0f);
    fragPos.x -= fragPos.y * 0.5f;
    vec2 pos = vec2(fragPos + computeSize / 2.f);
    ivec2 ipos = ivec2(pos);
    vec4 value = texelFetch(computeTex, ipos, 0);

    float a = value.x;
    float c = value.z;
    float d = value.w;
    if(a > 0.5f) {
        outColor = vec4(vec3(c / 2.f), 1.f);
    } else {
        outColor = vec4(vec3(d), 1.f);
    }
}
