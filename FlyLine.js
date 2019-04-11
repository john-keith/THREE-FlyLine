class FlyLine extends THREE.Object3D{
    /**
     * curveOrObject 路径 THREE.Curve实例或者bufferGeo/geo实例
     * 
     * color 颜色
     * segFlag 设置分段标记 （周期）
     * alphaTest 启用透明测试
    */
        constructor(curveOrObject, options){
            super()

            let color = options && options.color || 0xffffff
            let segFlag = options && options.segFlag || false
            let alphaTest = options && options.alphaTest || true
            
            this.mesh = null
            let v_shader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix * mvPosition;
                }`

            let define = segFlag ? '#define SEGFLAG': ''
            let alpha = alphaTest ? '#define ALPHATEST': ''
            let f_shader = `
                ${define}
                ${alpha}
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
                    #ifdef ALPHATEST
                    if(gl_FragColor.a < 0.3){
                        discard;
                    }
                    #endif
                }`

            let geo
            
            if(curveOrObject instanceof THREE.Curve){
                geo = new THREE.TubeBufferGeometry(curveOrObject, 10, 0.15, 4)
            }else if(curveOrObject instanceof THREE.Geometry || curveOrObject instanceof THREE.BufferGeometry ){
                geo = curveOrObject
            }else {
                throw new Error('please ensure first argument correct')
            }
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
                blending: THREE.AdditiveBlending
            })
            this.mesh = new THREE.Mesh(geo, shaderMat)
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