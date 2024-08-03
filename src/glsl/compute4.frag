#version 300 es
precision highp float;

uniform sampler2D computeTex;

uniform float time;
uniform float mu;
uniform float gamma;
uniform float sigma;
uniform int computeRadius;

out vec4 outColor;

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}
vec4 perm(vec4 x) {
    return mod289(((x * 34.0f) + 1.0f) * x);
}

float noise(vec3 p) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0f - 2.0f * d);

    vec4 b = a.xxyy + vec4(0.0f, 1.0f, 0.0f, 1.0f);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0f);

    vec4 o1 = fract(k3 * (1.0f / 41.0f));
    vec4 o2 = fract(k4 * (1.0f / 41.0f));

    vec4 o3 = o2 * d.z + o1 * (1.0f - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0f - d.x);

    return o4.y * d.y + o4.x * (1.0f - d.y);
}

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

ivec2 nei[7] = ivec2[](ivec2(0, 0), ivec2(1, 0), ivec2(0, 1), ivec2(-1, 1), ivec2(-1, 0), ivec2(0, -1), ivec2(1, -1));

int countA(sampler2D texture, ivec2 pos) {
    int count = 0;
    for(int i = 0; i < 7; i++) {
        if(outOfRange(pos + nei[i])) {
            continue;
        }
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
    outColor = next;
    return;
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

    if(sigma > 0.f) {
        if(noise(vec3(gl_FragCoord.xy, time)) < 0.5f) {
            next.w = (1.f + sigma) * next.w;
        } else {
            next.w = (1.f - sigma) * next.w;
        }
    }

    outColor = next;
}
