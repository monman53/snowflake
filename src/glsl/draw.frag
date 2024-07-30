#version 300 es

precision highp float;
out vec4 outColor;

uniform float opacity;
uniform float saturation;
uniform float lightness;

in vec3 hoge;
in float hue;

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

void main() {
    float alpha = opacity * exp(hoge.z);
    vec3 rgb = hsl2rgb(hue, saturation, lightness);
    outColor = vec4(rgb, alpha);
}
