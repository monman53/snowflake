#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float rho;
uniform bool reset;
uniform ivec2 computeSize;

out vec4 outColor;

vec4 getValue(sampler2D texture, ivec2 pos) {
    if(pos.x < 0)
        pos.x += computeSize.x;
    if(pos.x >= computeSize.x)
        pos.x -= computeSize.x;
    if(pos.y < 0)
        pos.y += computeSize.y;
    if(pos.y >= computeSize.y)
        pos.y -= computeSize.y;
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

vec4 sum(sampler2D texture, ivec2 pos) {
    vec4 sum = vec4(0.f);
    for(int i = 0; i < 7; i++) {
        sum += getValue(texture, pos + nei[i]);
    }
    return sum;
}

void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    ivec2 center = computeSize / 2;
    vec4 current = texelFetch(computeTex, pos, 0);  // 0 = mip level 0
    vec4 next = current;
    if(reset) {
        if(pos == center) {
            next = vec4(1, 0, 0, rho);
        } else {
            next = vec4(0, 0, 0, rho);
        }
    } else {
        int na = countA(computeTex, pos);
        // vec4 sum = sum(computeTex, pos);
        if(na == 0) {
            float d = 0.f;
            for(int i = 0; i < 7; i++) {
                vec4 value = getValue(computeTex, pos + nei[i]);
                if(value.x > 0.5f) {
                    d += current.w;
                } else {
                    d += value.w;
                }
            }
            next.w = d / 7.0f;
        }
    }
    outColor = next;
}
