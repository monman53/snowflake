#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform vec2 computeSize;
uniform float rot;

out vec4 outColor;

#define M_PI 3.1415926535897932384626433832795

vec4 getValue(vec2 fragCoord) {
    vec2 fragPos = fragCoord - canvasSize * 0.5f;
    float co = cos(rot * M_PI / 6.f);
    float si = sin(rot * M_PI / 6.f);
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
        gradX = getValue(vec2(pos.x + 1.0f, pos.y)) - getValue(vec2(pos.x - 1.0f, pos.y));
    }
    // t
    {
        gradY = getValue(vec2(pos.x, pos.y + 1.0f)) - getValue(vec2(pos.x, pos.y - 1.0f));
    }
    vec2 gradC = vec2(gradX.z, gradY.z);

    float a = value.x;
    float c = value.z;
    float d = value.w;
    vec3 background = vec3(0.4f, 0.5f, 0.7f);
    if(a > 0.5f) {
        float color = -dot(gradC, vec2(1, 0));
        // outColor = vec4(vec3(color), 1.f);
        outColor = vec4(background + vec3(color), 1.f);
    } else {
        // outColor = vec4(0.5f + vec3(d), 1.f);
        // outColor = vec4(vec3(-d), 1.f);
        // outColor = vec4(vec3(0), 1.f);
        outColor = vec4(background, 1.f);
        // outColor = vec4(1.f);
    }
}
