#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float beta;
uniform float alpha;
uniform float theta;
uniform int computeRadius;

out vec4 outColor;

bool outOfRange(ivec2 pos) {
    ivec2 center = ivec2(computeRadius);
    ivec2 posCenter = pos - center;
    if(abs(posCenter.x + posCenter.y) > computeRadius) {
        return true;
    }
    return pos.x < 0 || pos.x >= computeRadius * 2 + 1 || pos.y < 0 || pos.y >= computeRadius * 2 + 1;
}

vec4 getValue(sampler2D texture, ivec2 pos) {
    return texelFetch(texture, pos, 0);
}

ivec2 nei[6] = ivec2[](ivec2(1, 0), ivec2(0, 1), ivec2(-1, 1), ivec2(-1, 0), ivec2(0, -1), ivec2(1, -1));

int countA(sampler2D texture, ivec2 pos) {
    int count = 0;

    if(getValue(texture, pos).x > 0.5f) {
        count++;
    }

    for(int i = 0; i < 6; i++) {
        if(outOfRange(pos + nei[i])) {
            continue;
        }
        if(getValue(texture, pos + nei[i]).x > 0.5f) {
            count++;
        }
    }
    return count;
}

int rotationOffset(ivec2 pos) {
    int x = pos.x;
    int y = pos.y;
    if(x > 0 && y >= 0) {
        return 0;
    }
    if(x <= 0 && y > 0 && -x < y) {
        return 1;
    }
    if(x <= 0 && y > 0 && -x >= y) {
        return 2;
    }
    if(x < 0 && y <= 0) {
        return 3;
    }
    if(x >= 0 && y < 0 && x < -y) {
        return 4;
    }
    if(x >= 0 && y < 0 && x >= -y) {
        return 5;
    }
    // Must be center of grid (x == 0 && y == 0)
    return 0;
}

vec4 sum(sampler2D texture, ivec2 pos) {
    vec4 sum = getValue(texture, pos);
    int o = rotationOffset(pos - computeRadius);
    for(int i = 0; i < 6; i++) {
        ivec2 nextPos = pos + nei[(i + o) % 6];
        if(outOfRange(nextPos)) {
            nextPos = pos;
        }
        sum += getValue(texture, nextPos);
    }
    return sum;
}

void main() {
    ivec2 pos = ivec2(gl_FragCoord.xy);
    ivec2 center = ivec2(computeRadius);
    ivec2 posCenter = pos - center;
    vec4 current = texelFetch(computeTex, pos, 0);
    vec4 next = current;
    outColor = next;
    return;
    if(abs(posCenter.x + posCenter.y) > computeRadius) {
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
            if(na == 3) {
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
