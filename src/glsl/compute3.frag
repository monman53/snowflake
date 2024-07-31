#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float beta;
uniform float alpha;
uniform float theta;
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
    vec4 current = texelFetch(computeTex, pos, 0);  // 0 = mip level 0
    vec4 next = current;
    if(current.x < 0.5f) {
        int na = countA(computeTex, pos);
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
    // next.y = current.y + (1.f - kappa) * current.w;
    // next.z = current.z + kappa * current.w;
    // next.w = 0.f;
    outColor = next;
}
