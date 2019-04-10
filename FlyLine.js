class FlyLine extends THREE.Object3D{
    /**
     * curve 路径 THREE.Curve实例
     * color 颜色
     * segFlag 设置是不是单周期
    */
        constructor(curve, color, segFlag = false){
            super()

            this.mesh = null
            let v_shader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix * mvPosition;
                }`

            let define = segFlag ? '#define SEGFLAG': ''
            let f_shader = `
                ${define}
                #define PI 3.141592
                uniform float time;
                varying vec2 vUv;
                uniform vec3 color;
                void main() {
                    float alpha;
                    if (vUv.x > PI * 0.5 ){
                        alpha = 0.0;
                    } else {
                        #ifdef SEGFLAG
                        alpha = sin(3.0 *(vUv.x*14.0 + time - PI * 0.5));
                        #else
                        alpha = sin(1.0 * (vUv.x + time - PI * 0.5));
                        #endif
                    }
                    gl_FragColor = vec4(color, alpha);
                }`

            let tubeGeo = new THREE.TubeBufferGeometry(curve, 10, 0.15, 40)
            let shaderMat = new THREE.ShaderMaterial({
                uniforms: {
                    time: {
                        type: 'f', value: 0.0
                    },
                    color: {
                        type: 'v3', value: new THREE.Color(color)
                    }
                }, 
                vertexShader: v_shader,
                fragmentShader: f_shader,
                transparent: true,
                alphaTest: 0.5,
                blending: THREE.AdditiveBlending
            })
            this.mesh = new THREE.Mesh(tubeGeo, shaderMat)
            this.add(this.mesh)
        }
        get time(){
            return this.mesh.material.uniforms.time.value
        }
        set time(time){
            this.mesh.material.uniforms.time.value = time
        }
        update(){
            let time = this.time + 0.01
            this.time = time
        }
        dispose(){
            this.remove(this.mesh)
            this.mesh.geometry.dispose()
            this.mesh.material.dispose()
        }

    }

    // export default FlyLine