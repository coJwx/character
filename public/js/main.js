$(document).ready(() => {
    var v = new Viewer('assets');
});

class Viewer {
    constructor(basePath) {
        this.l2d = new L2D(basePath);

        this.canvas = $(".Canvas");
        this.selectCharacter = $(".selectCharacter");
        this.selectAnimation = $(".selectAnimation");

        let stringCharacter = "<option>Select</option>";
        for (let val in charData) {
            stringCharacter += '<option value="' + charData[val] + '">' + val + '</option>';
        }
        this.selectCharacter.html(stringCharacter);
        this.selectCharacter.attr("disabled", false);
        this.selectCharacter.change((event) => {
            if (event.target.selectedIndex == 0) {
                return;
            }
            this.name = event.target.value;
            this.l2d.load(this.name, this);
            setTimeout(() => {
                this.startAnimation("home", "base");
            }, 500)
        });
        this.selectCharacter.val("baerdimo_5");
        this.selectCharacter.change();

        var wt = window.innerWidth;
        var ht = window.innerHeight;
        this.app = new PIXI.Application(wt, ht, { transparent: true });
        this.canvas.html(this.app.view);

        this.app.ticker.add((deltaTime) => {
            if (!this.model) {
                return;
            }

            this.model.update(deltaTime);
            this.model.masks.update(this.app.renderer);
        });
        window.onresize = (event) => {
            if (event === void 0) { event = null; }
            // let width = window.innerWidth * 0.9;
            // let height = (width / 16.0) * 9.0;
            let width = window.innerWidth;
            let height = window.innerHeight;
            this.canvas.css({ "width": width, "height": height })
            $(".main-container").css({ "width": width - 0.1, "height": height - 0.1 })
            this.app.view.style.width = width + "px";
            this.app.view.style.height = height + "px";
            this.app.renderer.resize(width, height);

            if (this.model) {
                this.model.position = new PIXI.Point((width * 0.5), (height * 0.5));
                this.model.scale = new PIXI.Point((this.model.position.x * 0.06), (this.model.position.x * 0.06));
                this.model.masks.resize(this.app.view.width, this.app.view.height);
            }
        };
        this.isClick = false;
        this.app.view.addEventListener('mousedown', (event) => {
            this.isClick = true;
        });
        this.app.view.addEventListener('mousemove', (event) => {
            if (this.isClick) {
                this.isClick = false;
                if (this.model) {
                    this.model.inDrag = true;
                }
            }

            if (this.model) {
                let mouse_x = this.model.position.x - event.offsetX;
                let mouse_y = this.model.position.y - event.offsetY;
                this.model.pointerX = -mouse_x / this.app.view.height;
                this.model.pointerY = -mouse_y / this.app.view.width;
            }
        });
        this.app.view.addEventListener('mouseup', (event) => {
            if (!this.model) {
                return;
            }

            if (this.isClick) {
                if (this.isHit('TouchHead', event.offsetX, event.offsetY)) {
                    this.startAnimation("touch_head", "base");
                } else if (this.isHit('TouchSpecial', event.offsetX, event.offsetY)) {
                    this.startAnimation("touch_special", "base");
                } else {
                    const bodyMotions = ["touch_body", "main_1", "main_2", "main_3"];
                    let currentMotion = bodyMotions[Math.floor(Math.random() * bodyMotions.length)];
                    this.startAnimation(currentMotion, "base");
                }
            }

            this.isClick = false;
            this.model.inDrag = false;
        });
    }

    changeCanvas(model) {
        this.app.stage.removeChildren();

        this.selectAnimation.empty();

        Array.from(model.motions.keys()).sort().forEach((key, index) => {
            if (key != "effect") {
                let btn = document.createElement("button");
                const animationName = {
                    idle: "默认",
                    // home: "home",
                    // wedding: "婚礼",
                    main_1: "1",
                    main_2: "2",
                    main_3: "3",
                }
                let label = document.createTextNode(animationName[key] ?? key);
                btn.appendChild(label);
                btn.className = "btnGenericText";
                btn.addEventListener("click", () => {
                    this.startAnimation(key, "base");
                });
                this.selectAnimation.append(btn);
            }
        });

        this.model = model;
        this.model.update = this.onUpdate; // HACK: use hacked update fn for drag support
        this.model.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);

        this.app.stage.addChild(this.model);
        this.app.stage.addChild(this.model.masks);

        window.onresize();
    }

    onUpdate(delta) {
        let deltaTime = 0.016 * delta;

        if (!this.animator.isPlaying) {
            let m = this.motions.get("idle");
            this.animator.getLayer("base").play(m);
        }
        this._animator.updateAndEvaluate(deltaTime);

        if (this.inDrag) {
            this.addParameterValueById("ParamAngleX", this.pointerX * 30);
            this.addParameterValueById("ParamAngleY", -this.pointerY * 30);
            this.addParameterValueById("ParamBodyAngleX", this.pointerX * 10);
            this.addParameterValueById("ParamBodyAngleY", -this.pointerY * 10);
            this.addParameterValueById("ParamEyeBallX", this.pointerX);
            this.addParameterValueById("ParamEyeBallY", -this.pointerY);
        }

        if (this._physicsRig) {
            this._physicsRig.updateAndEvaluate(deltaTime);
        }

        this._coreModel.update();

        let sort = false;
        for (let m = 0; m < this._meshes.length; ++m) {
            this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
            this._meshes[m].visible = Live2DCubismCore.Utils.hasIsVisibleBit(this._coreModel.drawables.dynamicFlags[m]);
            if (Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
                this._meshes[m].dirtyVertex = true;
            }
            if (Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                sort = true;
            }
        }

        if (sort) {
            this.children.sort((a, b) => {
                let aIndex = this._meshes.indexOf(a);
                let bIndex = this._meshes.indexOf(b);
                let aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
                let bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];

                return aRenderOrder - bRenderOrder;
            });
        }

        this._coreModel.drawables.resetDynamicFlags();
    }

    startAnimation(motionId, layerId) {
        if (!this.model) {
            return;
        }

        let m = this.model.motions.get(motionId);
        if (!m) {
            return;
        }

        let l = this.model.animator.getLayer(layerId);
        if (!l) {
            return;
        }

        l.play(m);
        // let filePath = `/assets/${this.name}/sounds/${motionId}.mp3`;
        // loadAudio(filePath);
    }

    isHit(id, posX, posY) {
        if (!this.model) {
            return false;
        }

        let m = this.model.getModelMeshById(id);
        if (!m) {
            return false;
        }

        const vertexOffset = 0;
        const vertexStep = 2;
        const vertices = m.vertices;

        let left = vertices[0];
        let right = vertices[0];
        let top = vertices[1];
        let bottom = vertices[1];

        for (let i = 1; i < 4; ++i) {
            let x = vertices[vertexOffset + i * vertexStep];
            let y = vertices[vertexOffset + i * vertexStep + 1];

            if (x < left) {
                left = x;
            }
            if (x > right) {
                right = x;
            }
            if (y < top) {
                top = y;
            }
            if (y > bottom) {
                bottom = y;
            }
        }

        let mouse_x = m.worldTransform.tx - posX;
        let mouse_y = m.worldTransform.ty - posY;
        let tx = -mouse_x / m.worldTransform.a;
        let ty = -mouse_y / m.worldTransform.d;

        return ((left <= tx) && (tx <= right) && (top <= ty) && (ty <= bottom));
    }
}

function onSelectBG() {
    console.log(window.pageXOffset + " : " + window.pageYOffset);
    var div = document.createElement('div');
    div.className = "darken";
    div.id = "darken";
    div.style.top = window.pageYOffset + "px";
    div.addEventListener("click", function (e) {
        document.body.removeChild(document.getElementById("selector"));
        document.body.removeChild(document.getElementById("darken"));
        document.body.style.overflow = "auto";
    }, false);
    document.body.appendChild(div);
    document.body.style.overflow = "hidden";
    var selector = document.createElement('div');
    selector.id = "selector";
    selector.className = "selector";
    selector.style.top = (window.pageYOffset + (window.innerHeight * 0.05)) + "px";
    document.body.appendChild(selector);
    for (var i = 0; i < backgroundData.length; i++) {
        var img = document.createElement('div');
        img.className = "thumbbutton";
        img.style.backgroundImage = "url(../assets/bg/" + backgroundData[i] + ")";
        img.style.backgroundSize = "100%";
        img.id = backgroundData[i];
        img.addEventListener("click", function (e) {
            document.getElementById("L2dCanvas").style.backgroundImage = "url(../assets/bg/" + this.id + ")";
            document.body.removeChild(document.getElementById("selector"));
            document.body.removeChild(document.getElementById("darken"));
            document.body.style.overflow = "auto";
        }, false);
        document.getElementById("selector").appendChild(img);
    }
}

function changeNav() {
    if ($("#show-nav").attr("class") === "hideNav") {
        $("#show-nav").attr("class", "showNav")
        $(".control-container").css("display", "none")
    } else {
        $("#show-nav").attr("class", "hideNav")
        $(".control-container").css("display", "block")
    }
}

const loadAudio = async (filePath) => {
    return fetch(filePath).then(responce =>
        responce.status === 200 && responce.arrayBuffer()
    ).then(buffer => {
        if (!buffer) return
        const bufferCopy = buffer.slice(0);
        const context = new AudioContext();
        // 使用Web Audio API播放音频
        context.decodeAudioData(buffer, decodedData => {
            const source = context.createBufferSource();
            source.buffer = decodedData;
            source.connect(context.destination);
            source.start();
        });
        return bufferCopy
    }).catch(error => console.log(error))
};