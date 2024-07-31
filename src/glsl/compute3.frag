#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float beta;
uniform float alpha;
uniform float theta;
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

vec4 sum(sampler2D texture, ivec2 pos) {
    vec4 sum = vec4(0.f);
    for(int i = 0; i < 7; i++) {
        ivec2 nextPos = pos + nei[i];
        if(outOfRange(nextPos)) {
            nextPos = pos;
        }
        sum += getValue(texture, nextPos);
    }
    return sum;
}

void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    ivec2 center = ivec2(computeSize / 2);
    ivec2 posCenter = pos - center;
    vec4 current = texelFetch(computeTex, pos, 0);
    vec4 next = current;
    if(abs(posCenter.x + posCenter.y) > computeSize / 2) {
        outColor = next;
        return;
    }
    if(current.x < 0.5f) {
        int na = countA(computeTex, pos);
        if(na > 0) {
            if(na == 1 || na == 2) {
                if(current.y >= beta) {
                    next.x = 1.0f;
                }
            }
            if(na >= 3) {
                if(current.y >= 1.f) {
                    next.x = 1.0f;
                }
                vec4 s = sum(computeTex, pos);
                if(s.w < theta && current.y >= alpha) {
                    next.x = 1.0f;
                }
            }
            if(na >= 4) {
                next.x = 1.0f;
            }

            if(next.x > 0.5f) {
                next.z = current.y + current.z;
                next.y = 0.0f;
            }
        }
    }
    outColor = next;
}
