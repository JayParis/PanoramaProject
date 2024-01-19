
precision highp float;

const vec4 cons1 = vec4(0.800000011921, 0.800000011921, 0.800000011921, 1.000000000000);

uniform sampler2D uMainMap;
uniform sampler2D uTransitionMap;
uniform float transitionMix;

varying vec3 Normal;
varying vec2 TexCoord;
varying vec3 Position;

void main()
{
	vec3 mainColour = texture2D(uMainMap, TexCoord).rgb;
	vec3 transitionColour = texture2D(uTransitionMap, TexCoord).rgb;

	vec3 composite = mix(mainColour, transitionColour, transitionMix);

    gl_FragColor = vec4(composite.rgb, 1.0);
    // gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
}

