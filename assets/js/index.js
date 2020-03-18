const display = document.getElementById("display");
const { width, height } = display;
const displaySize = { width, height };

const startDisplay = async () => {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    if (Array.isArray(devices)) {
      for (const device of devices) {
        if (device.kind === "videoinput") {
          const camera = device;
          navigator.getUserMedia(
            {
              video: {
                deviceId: camera.deviceId
              }
            },
            stream => (display.srcObject = stream),
            error => console.log(error)
          );
        }
      }
    }
  });
};

const loadResources = async () => {
  const nets = faceapi.nets;
  return Promise.all([
    // Detecta rostos no vídeo
    nets.tinyFaceDetector.loadFromUri("/assets/lib/face-api/models/"),
    // Detecta partes do rosto
    nets.faceLandmark68Net.loadFromUri("/assets/lib/face-api/models/"),
    // Reconhece o rosto
    nets.faceRecognitionNet.loadFromUri("/assets/lib/face-api/models/"),
    // Detecta expressões
    nets.faceExpressionNet.loadFromUri("/assets/lib/face-api/models/"),
    // Detecta idade e gênero
    nets.ageGenderNet.loadFromUri("/assets/lib/face-api/models/"),
    // Desenha as marcações
    nets.ssdMobilenetv1.loadFromUri("/assets/lib/face-api/models/")
  ]);
};

const detectAndDrawAllFaces = () => {
  const canvas = faceapi.createCanvasFromMedia(display);
  const draw = faceapi.draw;
  faceapi.matchDimensions(canvas, displaySize);
  document.body.appendChild(canvas);
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(display, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    draw.drawDetections(canvas, resizedDetections);
    draw.drawFaceLandmarks(canvas, resizedDetections)
    console.log(detections)
  }, 200);
};

const bindEvents = () => {
  display.addEventListener("play", () => {
    detectAndDrawAllFaces();
  });
};

const init = async () => {
  await loadResources();
  await startDisplay();
  bindEvents();
};

init();
