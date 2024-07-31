#version 300 es

precision highp float;

uniform sampler2D computeTex;

uniform vec2 canvasSize;
uniform int computeSize;
uniform float rot;
uniform float lightAngle;
uniform float lightIntensity;
uniform float hue;
uniform float saturation;
uniform float lightness;

out vec4 outColor;

#define M_PI 3.1415926535897932384626433832795

float hue2rgb(float f1, float f2, float hue) {
    if(hue < 0.0f)
        hue += 1.0f;
    else if(hue > 1.0f)
        hue -= 1.0f;
    float res;
    if((6.0f * hue) < 1.0f)
        res = f1 + (f2 - f1) * 6.0f * hue;
    else if((2.0f * hue) < 1.0f)
        res = f2;
    else if((3.0f * hue) < 2.0f)
        res = f1 + (f2 - f1) * ((2.0f / 3.0f) - hue) * 6.0f;
    else
        res = f1;
    return res;
}

vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;

    if(hsl.y == 0.0f) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float f2;

        if(hsl.z < 0.5f)
            f2 = hsl.z * (1.0f + hsl.y);
        else
            f2 = hsl.z + hsl.y - hsl.y * hsl.z;

        float f1 = 2.0f * hsl.z - f2;

        rgb.r = hue2rgb(f1, f2, hsl.x + (1.0f / 3.0f));
        rgb.g = hue2rgb(f1, f2, hsl.x);
        rgb.b = hue2rgb(f1, f2, hsl.x - (1.0f / 3.0f));
    }
    return rgb;
}

vec3 hsl2rgb(float h, float s, float l) {
    return hsl2rgb(vec3(h, s, l));
}

vec4 getValue(vec2 fragCoord) {
    vec2 fragPos = fragCoord - canvasSize * 0.5f;
    float angle = rot * M_PI * 2.f;
    float co = cos(angle);
    float si = sin(angle);
    mat2 rot = mat2(co, -si, si, co);
    fragPos = rot * fragPos;
    fragPos.y *= 2.0f / sqrt(3.0f);
    fragPos.x -= fragPos.y * 0.5f;
    vec2 pos = vec2(fragPos + float(computeSize) / 2.f);
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
    vec3 background = hsl2rgb(hue, saturation, lightness);
    float alpha = 1.0f;
    if(a > 0.5f) {
        float angle = lightAngle * 2.f * M_PI;
        vec2 lightVec = lightIntensity * vec2(cos(angle), sin(angle));
        float color = -dot(gradC, lightVec);
        outColor = vec4(background + vec3(color), alpha);
        // outColor = vec4(vec3(c), alpha);
    } else {
        outColor = vec4(vec3(background), alpha);
        // outColor = vec4(vec3(d), alpha);
    }
}
