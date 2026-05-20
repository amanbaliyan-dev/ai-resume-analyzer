const HISTORY_SIZE = 90; // ~3 seconds at 30fps

export class BodyLanguageAnalyzer {
  constructor() {
    this.history = {
      eyeContact:   [],
      posture:      [],
      headStability: [],
      smileScore:   [],
    };
    this.lastNosePos = null;
    this.gestureCount = 0;
    this.frameCount = 0;
  }

  // Called every frame with MediaPipe results
  analyze(results) {
    this.frameCount++;
    const scores = {};

    if (results.faceLandmarks) {
      scores.eyeContact = this._calcEyeContact(results.faceLandmarks);
      scores.smileScore = this._calcSmile(results.faceLandmarks);
      scores.headStability = this._calcHeadStability(results.faceLandmarks);
    }

    if (results.poseLandmarks) {
      scores.posture = this._calcPosture(results.poseLandmarks);
    }

    if (results.leftHandLandmarks || results.rightHandLandmarks) {
      this.gestureCount++;
    }

    // Push to rolling history
    Object.entries(scores).forEach(([key, val]) => {
      if (!this.history[key]) this.history[key] = [];
      this.history[key].push(val);
      if (this.history[key].length > HISTORY_SIZE)
        this.history[key].shift();
    });

    return this.getSummary();
  }

  // Eye contact: check if iris landmarks are centered vs looking away
  // Landmarks 468-472 = left iris, 473-477 = right iris (FaceMesh v2)
  _calcEyeContact(face) {
    // Left eye corners: 33 (outer), 133 (inner)
    // Left iris center: 468
    const leftOuter = face[33];
    const leftInner = face[133];
    const leftIris  = face[468];

    if (!leftIris) return 0.7; // fallback if v1 model

    const eyeWidth = Math.abs(leftOuter.x - leftInner.x);
    const irisOffset = Math.abs(leftIris.x - (leftOuter.x + leftInner.x) / 2);
    const ratio = 1 - Math.min(irisOffset / (eyeWidth * 0.5), 1);
    return Math.max(0, Math.min(1, ratio));
  }

  // Smile: distance between lip corners vs mouth height
  _calcSmile(face) {
    const leftCorner  = face[61];
    const rightCorner = face[291];
    const topLip      = face[13];
    const bottomLip   = face[14];

    const mouthWidth  = Math.abs(rightCorner.x - leftCorner.x);
    const mouthHeight = Math.abs(topLip.y - bottomLip.y);

    // High width-to-height ratio = smile
    const ratio = mouthWidth / (mouthHeight + 0.001);
    return Math.min(ratio / 6, 1); // normalize, 6 is ~max ratio
  }

  // Head stability: track nose tip movement between frames
  _calcHeadStability(face) {
    const nose = face[1]; // nose tip
    if (!this.lastNosePos) {
      this.lastNosePos = nose;
      return 1;
    }
    const dx = nose.x - this.lastNosePos.x;
    const dy = nose.y - this.lastNosePos.y;
    const movement = Math.sqrt(dx * dx + dy * dy);
    this.lastNosePos = nose;
    // movement < 0.005 = stable, > 0.03 = very fidgety
    return Math.max(0, 1 - movement / 0.03);
  }

  // Posture: are shoulders level and torso upright?
  _calcPosture(pose) {
    const leftShoulder  = pose[11];
    const rightShoulder = pose[12];
    const leftHip       = pose[23];
    const rightHip      = pose[24];
    const nose          = pose[0];

    if (!leftShoulder || !rightShoulder) return 0.5;

    // Shoulder level score (lower = more tilted)
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderScore = Math.max(0, 1 - shoulderTilt / 0.1);

    // Forward lean: nose should be roughly above mid-shoulder
    const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const leanOffset = Math.abs(nose.x - midShoulderX);
    const leanScore = Math.max(0, 1 - leanOffset / 0.15);

    return (shoulderScore * 0.6 + leanScore * 0.4);
  }

  getSummary() {
    const avg = arr =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      eyeContact:    Math.round(avg(this.history.eyeContact)   * 100),
      posture:       Math.round(avg(this.history.posture)       * 100),
      headStability: Math.round(avg(this.history.headStability) * 100),
      smileScore:    Math.round(avg(this.history.smileScore)    * 100),
      gestureRate:   Math.min(100, Math.round((this.gestureCount / Math.max(this.frameCount, 1)) * 300)),
      overallScore:  0, // computed below
    };
  }

  getOverallScore(summary) {
    return Math.round(
      summary.eyeContact    * 0.35 +
      summary.posture       * 0.25 +
      summary.headStability * 0.20 +
      summary.smileScore    * 0.10 +
      summary.gestureRate   * 0.10
    );
  }

  reset() {
    Object.keys(this.history).forEach(k => (this.history[k] = []));
    this.gestureCount = 0;
    this.frameCount = 0;
    this.lastNosePos = null;
  }
}
