float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
in vec2 vUV;

uniform sampler2D uTexture;
uniform vec2 uSize;
uniform vec3 uShadowColor;
uniform float uPad;

void main() {
    float asp = uSize.x / uSize.y;
    vec2 uv = vUV - vec2(0.5);
    uv = uv * uSize;

    float pad = uPad;

    float f = sdBox(uv, vec2(uSize - vec2(uPad)) / 2.0);

    f = smoothstep(pad * 0.3, -pad * 0.2, f);

    vec3 color = uShadowColor;
    gl_FragColor = vec4(color * f, f);
}
