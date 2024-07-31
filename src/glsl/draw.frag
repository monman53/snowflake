#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform vec2 computeSize;
uniform float rot;
uniform float lightAngle;

out vec4 outColor;

#define M_PI 3.1415926535897932384626433832795

vec4 getValue(vec2 fragCoord) {
    vec2 fragPos = fragCoord - canvasSize * 0.5f;
    float angle = rot * M_PI * 2.f;
    float co = cos(angle);
    float si = sin(angle);
    mat2 rot = mat2(co, -si, si, co);
    fragPos = rot * fragPos;
    fragPos.y *= 2.0f / sqrt(3.0f);
    fragPos.x -= fragPos.y * 0.5f;
    vec2 pos = vec2(fragPos + computeSize / 2.f);
    ivec2 ipos = ivec2(pos);
    vec4 value = texelFetch(computeTex, ipos, 0);
    return value;
}

void main() {
    vec2 pos = gl_FragCoord.xy;
    vec4 value = getValue(pos);
    vec4 gradX, gradY;
    // x
    {
        vec4 v1 = getValue(vec2(pos.x - 2.0f, pos.y));
        vec4 v2 = getValue(vec2(pos.x - 1.0f, pos.y));
        vec4 v3 = getValue(vec2(pos.x + 1.0f, pos.y));
        vec4 v4 = getValue(vec2(pos.x + 2.0f, pos.y));
        gradX = -0.2f * v1 - v2 + v3 + 0.2f * v4;
    }
    // t
    {
        vec4 v1 = getValue(vec2(pos.x, pos.y - 2.0f));
        vec4 v2 = getValue(vec2(pos.x, pos.y - 1.0f));
        vec4 v3 = getValue(vec2(pos.x, pos.y + 1.0f));
        vec4 v4 = getValue(vec2(pos.x, pos.y + 2.0f));
        gradY = -0.2f * v1 - v2 + v3 + 0.2f * v4;
    }
    vec2 gradC = vec2(gradX.z, gradY.z);

    float a = value.x;
    float c = value.z;
    float d = value.w;
    vec3 background = vec3(0.4f, 0.5f, 0.7f);
    if(a > 0.5f) {
        float angle = lightAngle * 2.f * M_PI;
        float color = -dot(gradC, vec2(cos(angle), sin(angle)));
        outColor = vec4(background + vec3(color), 1.f);
    } else {
        outColor = vec4(vec3(background), 1.f);
    }
}
