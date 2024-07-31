#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float mu;
uniform float gamma;
uniform int computeRadius;

out vec4 outColor;

vec4 getValue(sampler2D texture, ivec2 pos) {
    return texelFetch(texture, pos, 0);
}

ivec2 nei[7] = ivec2[](ivec2(0, 0), ivec2(1, 0), ivec2(0, 1), ivec2(-1, 1), ivec2(-1, 0), ivec2(0, -1), ivec2(1, -1));

int countA(sampler2D texture, ivec2 pos) {
    int count = 0;
    for(int i = 0; i < 7; i++) {
        if(getValue(texture, pos + nei[i]).x > 0.5f) {
            count++;
        }
    }
    return count;
}

void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    ivec2 center = ivec2(computeRadius);
    ivec2 posCenter = pos - center;
    vec4 current = texelFetch(computeTex, pos, 0);
    vec4 next = current;
    if(abs(posCenter.x + posCenter.y) > computeRadius) {
        outColor = next;
        return;
    }
    if(current.x < 0.5f) {
        int na = countA(computeTex, pos);
        if(na > 0) {
            next.y = (1.f - mu) * current.y;
            next.z = (1.f - gamma) * current.z;
            next.w = current.w + mu * current.y + gamma * current.z;
        }
    }
    outColor = next;
}
