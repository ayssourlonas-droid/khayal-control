export default function(ccgxkObj){const W=ccgxkObj.W;W.isOpenShadow=!0,W.lightpos={rx:0,ry:-125,rz:-45},W.isShodowOne=!0,W.wjsHooks.on("reset_ok",function(W2){initDepthMapProgram(W2)}),W.wjsHooks.on("shadow_draw",function(W2){drawShadow(W2)});const intervalPOS=setInterval(()=>{executePerSecond(W)},1e3)}function createProgram(gl,vshaderSource,fshaderSource){const vShader=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vShader,vshaderSource),gl.compileShader(vShader);const fShader=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fShader,fshaderSource),gl.compileShader(fShader);const program=gl.createProgram();return gl.attachShader(program,vShader),gl.attachShader(program,fShader),gl.linkProgram(program),program}function initFramebufferObject(gl,width,height){var framebuffer,texture,depthRenderbuffer;framebuffer=gl.createFramebuffer(),texture=gl.createTexture(),gl.bindTexture(gl.TEXTURE_2D,texture),gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null),gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR),gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR),gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE),gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE),depthRenderbuffer=gl.createRenderbuffer(),gl.bindRenderbuffer(gl.RENDERBUFFER,depthRenderbuffer),gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,width,height),gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer),gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0),gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depthRenderbuffer);var status=gl.checkFramebufferStatus(gl.FRAMEBUFFER);return framebuffer.texture=texture,gl.bindFramebuffer(gl.FRAMEBUFFER,null),gl.bindTexture(gl.TEXTURE_2D,null),gl.bindRenderbuffer(gl.RENDERBUFFER,null),framebuffer}var OFFSCREEN_WIDTH,OFFSCREEN_HEIGHT;OFFSCREEN_WIDTH=OFFSCREEN_HEIGHT=2**12;var SHADOW_MAP_TEXTURE_UNIT=3,shadowProgram,shadowFBO;const initDepthMapProgram=W=>{const gl=W.gl;shadowProgram=createProgram(gl,SHADOW_VSHADER_SOURCE_300ES,SHADOW_FSHADER_SOURCE_300ES),shadowProgram.a_Position=gl.getAttribLocation(shadowProgram,"pos"),shadowProgram.u_MvpMatrix=gl.getUniformLocation(shadowProgram,"u_MvpMatrix"),shadowProgram.a_Color=gl.getAttribLocation(shadowProgram,"col"),W.program=createProgram(W.gl,RENDER_VSHADER_SOURCE_300ES,RENDER_FSHADER_SOURCE_300ES),gl.useProgram(W.program),W.shadowUniformLoc={u_MvpMatrixFromLight:W.gl.getUniformLocation(W.program,"u_MvpMatrixFromLight"),u_ShadowMap:W.gl.getUniformLocation(W.program,"u_ShadowMap"),u_ShadowMapTexelSize:W.gl.getUniformLocation(W.program,"u_ShadowMapTexelSize")},shadowFBO=initFramebufferObject(gl,OFFSCREEN_WIDTH,OFFSCREEN_HEIGHT)},drawShadow=W=>{W.debugShadow=!1,W.debugShadow===!1&&W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,shadowFBO),W.gl.useProgram(shadowProgram),W.gl.clear(W.gl.COLOR_BUFFER_BIT|W.gl.DEPTH_BUFFER_BIT),W.gl.viewport(0,0,OFFSCREEN_WIDTH,OFFSCREEN_HEIGHT);var lightpos=W.lightpos,vLight=new DOMMatrix().translateSelf(lightpos.x,lightpos.y,lightpos.z).rotateSelf(lightpos.rx,lightpos.ry,lightpos.rz);vLight.invertSelf();const lightNear=0,lightFar=400,lightWidth=100,lightHeight=200,lightProjectionMatrix=new DOMMatrix([2/lightWidth,0,0,0,0,2/lightHeight,0,0,0,0,-2/(lightFar-lightNear),0,0,0,-(lightFar+lightNear)/(lightFar-lightNear),1]);vLight.preMultiplySelf(lightProjectionMatrix),W.lightViewProjMatrix=vLight;for(const i in W.next){if(W.isOpenShadow===!1)continue;const object=W.next[i];if(!W.models[object.type]||["camera","light","group"].includes(object.type)||object.shadow!=="ok")continue;let modelMatrix=W.animation(object.n);const lightMvpMatrix=vLight.multiply(modelMatrix);W.gl.uniformMatrix4fv(shadowProgram.u_MvpMatrix,!1,lightMvpMatrix.toFloat32Array()),W.gl.bindBuffer(W.gl.ARRAY_BUFFER,W.models[object.type].verticesBuffer),W.gl.vertexAttribPointer(shadowProgram.a_Position,3,W.gl.FLOAT,!1,0,0),W.gl.enableVertexAttribArray(shadowProgram.a_Position),W.gl.drawArrays(W.gl.TRIANGLES,0,W.models[object.type].vertices.length/3),W.gl.disableVertexAttribArray(shadowProgram.a_Position)}W.gl.useProgram(W.program),W.gl.viewport(0,0,W.gl.canvas.width,W.gl.canvas.height),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,null),W.isOpenShadow===!0&&(W.gl.activeTexture(W.gl.TEXTURE0+SHADOW_MAP_TEXTURE_UNIT),W.gl.bindTexture(W.gl.TEXTURE_2D,shadowFBO.texture),W.gl.uniform1i(W.shadowUniformLoc.u_ShadowMap,SHADOW_MAP_TEXTURE_UNIT),W.gl.uniformMatrix4fv(W.shadowUniformLoc.u_MvpMatrixFromLight,!1,W.lightViewProjMatrix.toFloat32Array()),W.gl.uniform2f(W.shadowUniformLoc.u_ShadowMapTexelSize,1/OFFSCREEN_WIDTH,1/OFFSCREEN_HEIGHT))};function executePerSecond(W){var plr=W.current.mainPlayer;W.lightpos.x=plr.x,W.lightpos.y=plr.y+50,W.lightpos.z=plr.z-50}const SHADOW_VSHADER_SOURCE_300ES=`#version 300 es
  precision lowp float;
  in vec4 pos;
  in vec4 col;
  uniform mat4 u_MvpMatrix;
  out vec4 v_col_debug;
  void main() {
    gl_Position = u_MvpMatrix * pos;
    v_col_debug = col;  // 调试全彩
  }`,SHADOW_FSHADER_SOURCE_300ES=`#version 300 es
  precision lowp float;
  in vec4 v_col_debug;  // 调试
  out vec4 FragColor;
  vec4 encodeFloat(float v) { // 函数：将深度值编码到RGBA纹理
    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
    enc = fract(enc);
    enc -= enc.yzww * (1.0/255.0);
    return enc;
  }
  void main() {
    FragColor = encodeFloat(gl_FragCoord.z); // gl_FragCoord.z 是深度值 [0,1]
    // FragColor = vec4(gl_FragCoord.z, gl_FragCoord.z, gl_FragCoord.z, 1.0);
    // FragColor = v_col_debug;  // 调试
  }`,RENDER_VSHADER_SOURCE_300ES=`#version 300 es
          precision lowp float;                        
          in vec4 pos, col, uv, normal;                 // 普通模型的 位置、颜色、纹理坐标、法线...
          in mat4 instanceModelMatrix;                  // 实例化模型的 模型
          uniform mat4 pv, eye, m, im;                  // 矩阵：投影 * 视图、视线、模型、模型逆矩阵
          uniform vec4 bb;                              // 广告牌：bb = [w, h, 1.0, 0.0]
          out vec4 v_pos, v_col, v_uv, v_normal;
          uniform bool isInstanced;              // 是不是实例化绘制

          uniform mat4 u_MvpMatrixFromLight;       // 光源的 MVP 矩阵
          out vec4 v_PositionFromLight;            // 输出，顶点在光源眼中的位置

          void main() {
            mat4 currentModelMatrix;  // 当前的模型矩阵
            if (isInstanced) {
              currentModelMatrix = instanceModelMatrix;
            } else {
              currentModelMatrix = m;
            }
            gl_Position = pv * (    // 设置顶点位置：p * v * v_pos
              v_pos = bb.z > 0.                         
              ? currentModelMatrix[3] + eye * (pos * bb) // 广告牌
              : currentModelMatrix * pos               
            );
            v_col = col;
            v_uv = uv;
            v_normal = transpose(isInstanced ? inverse(currentModelMatrix) : im) * normal;  // 必要时使用实例矩阵
            v_PositionFromLight = u_MvpMatrixFromLight *  // 计算顶点在光源眼中的位置
                                 (isInstanced ? instanceModelMatrix * pos : m * pos);
          }`,RENDER_FSHADER_SOURCE_300ES=`#version 300 es
          precision lowp float;                  
          in vec4 v_pos, v_col, v_uv, v_normal;
          uniform vec3 light;
          uniform vec2 tiling;
          uniform vec4 o;
          uniform sampler2D sampler;
          out vec4 c;

          in vec4 v_PositionFromLight;   // 接收灯光视角的位置
          uniform sampler2D u_ShadowMap;  // 接收阴影深度图

          uniform vec2 u_ShadowMapTexelSize;  // 阴影图竖纹大小

          // 解码深度值（与encodeFloat对应）
          float decodeFloat(vec4 rgbaDepth) {
              const vec4 bitShift = vec4(1.0, 1.0/255.0, 1.0/(255.0*255.0), 1.0/(255.0*255.0*255.0));
              return dot(rgbaDepth, bitShift);
          }

          void main() {
            /* 阴影处理逻辑 */
            vec3 shadowCoord = (v_PositionFromLight.xyz    // 创建阴影映射
                                / v_PositionFromLight.w)
                                / 2.0 + 0.5;

            float shadowFactor = 0.0; // 累计阴影贡献值
            const float bias = 0.00015; // 相同的偏移值

            float shadowVisibility = 1.0;  // 非阴影部分亮度

            // for (int x = -4; x <= 4; x++) {
            //     for (int y = -4; y <= 4; y++) {
            //         vec2 offset = vec2(float(x), float(y)) * u_ShadowMapTexelSize;
            //         vec4 rgbaDepth = texture(u_ShadowMap, shadowCoord.xy + offset);
            //         float depth = decodeFloat(rgbaDepth);
            //         if (shadowCoord.z > depth + bias) {
            //             shadowFactor += 0.8; // 如果被遮挡，则降低亮度（0.8表示80%亮度，即20%阴影）
            //         } else {
            //             shadowFactor += 1.0; // 未被遮挡，完全亮度
            //         }
            //     }
            // }

            // // 取平均值
            // shadowFactor /= 81.0; // 3x3 采样一共9个点
            // shadowVisibility = shadowFactor;
            
            
            vec4 rgbaDepth = texture(u_ShadowMap, shadowCoord.xy);  // 解析深度
            

            if(shadowCoord.z > 1.0 || shadowCoord.x < 0.0 || shadowCoord.x > 1.0 || shadowCoord.y < 0.0 || shadowCoord.y > 1.0) {
              shadowVisibility = 1.0;  // 阴影在区域外，则不显示阴影
            } 
            else {  // 计算有没有被遮挡
              const vec4 bitShift = vec4(1.0, 1.0/255.0, 1.0/(255.0*255.0),
                                    1.0/(255.0*255.0*255.0));
              float depth = dot(rgbaDepth, bitShift);
              if (shadowCoord.z > depth + bias) {
                  shadowVisibility = 0.8;
              }
            }

            c = mix(texture(sampler, v_uv.xy * tiling), v_col, o[3]);
            if(o[1] > 0.){
              c = vec4(
                c.rgb * (max(0., dot(light, -normalize(
                  o[0] > 0.
                  ? vec3(v_normal.xyz)
                  : cross(dFdx(v_pos.xyz), dFdy(v_pos.xyz))
                )))
                + o[2]) * shadowVisibility,
                c.a
              );
            } else {
              c.rgb *= shadowVisibility;
            }
          }`;
