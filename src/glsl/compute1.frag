#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float rho;
uniform bool reset;
uniform int computeSize;

out vec4 outColor;

bool outOfRange(ivec2 pos) {
    ivec2 center = ivec2(computeSize / 2);
    ivec2 posCenter = pos - center;
    if(abs(posCenter.x + posCenter.y) > computeSize / 2) {
        return true;
    }
    return pos.x < 0 || pos.x >= computeSize || pos.y < 0 || pos.y >= computeSize;
}

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
    ivec2 center = ivec2(computeSize / 2);
    ivec2 posCenter = pos - center;
    vec4 current = texelFetch(computeTex, pos, 0);
    vec4 next = current;
    if(reset) {
        if(pos == center) {
            next = vec4(1, 0, 1, 0);
        } else {
            next = vec4(0, 0, 0, rho);
        }
    } else {
        if(abs(posCenter.x + posCenter.y) > computeSize / 2) {
            outColor = next;
            return;
        }
        int na = countA(computeTex, pos);
        // vec4 sum = sum(computeTex, pos);
        if(current.x < 0.5f) {
            float d = 0.f;
            for(int i = 0; i < 7; i++) {
                ivec2 nextPos = pos + nei[i];
                if(outOfRange(nextPos)) {
                    nextPos = pos;
                }
                vec4 value = getValue(computeTex, nextPos);
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
