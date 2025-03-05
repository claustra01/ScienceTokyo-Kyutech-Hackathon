import {
  Euler,
  EventDispatcher,
  MathUtils,
  Object3D,
  Quaternion,
  Vector3,
} from "three";

const zee = new Vector3(0, 0, 1);
const euler = new Euler();
const q0 = new Quaternion();
const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

const display = document.getElementById("display");

type Orientation = {
  alpha: number;
  beta: number;
  gamma: number;
};

class DeviceOrientationControls extends EventDispatcher {
  private lastQuaternion: Quaternion = new Quaternion();
  private static EPS = 0.000001;
  private static changeEvent = { type: "change" };
  object: Object3D;
  enabled: boolean = true;
  screenOrientation: Orientation;
  alphaOffset: number = 0;

  constructor(object: Object3D) {
    super();
    this.object = object;

    if (!window.isSecureContext) {
      console.error(
        "THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)",
      );
    }
    this.connect();
    this.screenOrientation = { alpha: 0, beta: 0, gamma: 0 };
  }

  private onDeviceOrientationChangeEvent(event) {
    this.screenOrientation = {
      alpha: event.alpha ?? this.screenOrientation.alpha,
      beta: event.beta ?? this.screenOrientation.beta,
      gamma: event.gamma ?? this.screenOrientation.gamma,
    };
  }

  connect() {
    if (
      window.DeviceOrientationEvent !== undefined &&
      typeof window.DeviceOrientationEvent.requestPermission === "function"
    ) {
      window.DeviceOrientationEvent.requestPermission().then(
        (response) => {
          if (response == "granted") {
            window.addEventListener(
              "deviceorientation",
              this.onDeviceOrientationChangeEvent.bind(this),
            );
          }
        },
      ).catch((error) => {
        console.error(
          "THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:",
          error,
        );
      });
    } else {
      window.addEventListener(
        "deviceorientation",
        this.onDeviceOrientationChangeEvent.bind(this),
      );
    }

    this.enabled = true;
  }

  disconnect() {
    window.removeEventListener(
      "deviceorientation",
      this.onDeviceOrientationChangeEvent.bind(this),
    );

    this.enabled = false;
  }

  dispose() {
    this.disconnect();
  }

  update() {
    if (!this.enabled) return;

    const alpha = MathUtils.degToRad(this.screenOrientation.alpha) +
      this.alphaOffset;
    const beta = MathUtils.degToRad(this.screenOrientation.beta);
    const gamma = MathUtils.degToRad(this.screenOrientation.gamma);
    const orient = MathUtils.degToRad(window.screen.orientation.angle || 0); // this is the device's offset

    euler.set(beta, alpha, -gamma, "YXZ"); // 'ZXY' for the device, but 'YXZ' for us
    this.object.quaternion.setFromEuler(euler); // orient the device
    this.object.quaternion.multiply(q1); // camera looks out the back of the device, not the top
    this.object.quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation
    console.log(this.object);

    if (display) {
      display.innerText =
        `alpha: ${this.screenOrientation.alpha.toFixed(2)}°\n` +
        `beta: ${this.screenOrientation.beta.toFixed(2)}°\n` +
        `gamma: ${this.screenOrientation.gamma.toFixed(2)}°\n` +
        `orient: ${orient.toFixed(2)}°\n`;
    }

    if (
      8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) >
        DeviceOrientationControls.EPS
    ) {
      this.lastQuaternion.copy(this.object.quaternion);
      this.dispatchEvent(DeviceOrientationControls.changeEvent);
    }
  }
}

export { DeviceOrientationControls };
