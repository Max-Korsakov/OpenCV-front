import { Component, AfterViewInit } from '@angular/core';
declare var Module;

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements AfterViewInit {
  constructor() {}

  public streaming: any = false;
  public video;
  public videoShow = true;
  public loading = false;
  public videoWidth: any;
  public videoHeight: any;
  public picktureInterval = true;
  public canvasOutput: any;
  public canvasOutputCtx;
  public stream: any = null;
  public detectFace: any;
  public faceClassifier: any = null;
  public eyeClassifier: any = null;
  public src: any = null;
  public dstC1: any = null;
  public dstC3: any = null;
  public dstC4: any = null;
  public canvasInput: any = null;
  public canvasInputCtx: any = null;
  public canvasBuffer: any = null;
  public canvasBufferCtx: any = null;
  public srcMat: any;
  public grayMat: any;
  public showResult = false;
  public faceContanerFull = false;


  ngAfterViewInit() {
    this.video = document.getElementById('video');
    Module._main = this.opencvIsReady();
  }

  public startCamera() {
    if (this.streaming) {return; }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(
        function(s) {
          this.stream = s;
          this.video.srcObject = s;
          this.video.play();
        }.bind(this)
      )
      .catch((err) => {
        console.log('An error occured! ' + err);
      });

    this.video.addEventListener(
      'canplay',
      function(ev) {
        if (!this.streaming) {
          this.videoWidth = this.video.videoWidth;
          this.videoHeight = this.video.videoHeight;
          this.video.setAttribute('width', this.videoWidth);
          this.video.setAttribute('height', this.videoHeight);
          this.streaming = true;
        }
      }.bind(this),
      false
    );
  }

  public startVideoProcessing() {
    this.canvasInput = document.createElement('canvas');
    this.canvasInput.width = this.videoWidth;
    this.canvasInput.height = this.videoHeight;
    this.canvasInputCtx = this.canvasInput.getContext('2d');

    this.canvasBuffer = document.createElement('canvas');
    this.canvasBuffer.width = this.videoWidth;
    this.canvasBuffer.height = this.videoHeight;
    this.canvasBufferCtx = this.canvasBuffer.getContext('2d');

    this.srcMat = new Module.Mat(
      this.videoHeight,
      this.videoWidth,
      Module.CV_8UC4
    );
    this.grayMat = new Module.Mat(
      this.videoHeight,
      this.videoWidth,
      Module.CV_8UC1
    );

    this.faceClassifier = new Module.CascadeClassifier();
    this.faceClassifier.load('haarcascade_frontalface_default.xml');
    requestAnimationFrame(this.processVideo.bind(this));
  }

  public processVideo() {
    this.canvasInputCtx.drawImage(
      this.video,
      0,
      0,
      this.videoWidth,
      this.videoHeight
    );
    const imageData = this.canvasInputCtx.getImageData(
      0,
      0,
      this.videoWidth,
      this.videoHeight
    );
    this.srcMat.data.set(imageData.data);
    Module.cvtColor(this.srcMat, this.grayMat, Module.COLOR_RGBA2GRAY);
    const faces = [];
    let size;
    const faceVect = new Module.RectVector();
    const faceMat = new Module.Mat();

    Module.pyrDown(this.grayMat, faceMat);
    Module.pyrDown(faceMat, faceMat);
    size = faceMat.size();

    this.faceClassifier.detectMultiScale(faceMat, faceVect);
    for (let i = 0; i < faceVect.size(); i++) {
      const face = faceVect.get(i);
      faces.push(new Module.Rect(face.x, face.y, face.width, face.height));
    }
    faceMat.delete();
    faceVect.delete();

    this.canvasOutputCtx.drawImage(
      this.canvasInput,
      0,
      0,
      this.videoWidth,
      this.videoHeight
    );
    this.drawResults(this.canvasOutputCtx, faces, 'red', size);
    const container = document.querySelector('.face-container');
    if (container.childNodes.length < 15) {
    requestAnimationFrame(this.processVideo.bind(this)); } else {
      this.videoShow = true;
      this.faceContanerFull = true;
    }
  }


public processDocumentPhoto() {
  this.videoShow = false;
  this.canvasInputCtx.drawImage(
    this.video,
    0,
    0,
    this.videoWidth,
    this.videoHeight
  );
  const imageData = this.canvasInputCtx.getImageData(
    0,
    0,
    this.videoWidth,
    this.videoHeight
  );
  this.srcMat.data.set(imageData.data);
  Module.cvtColor(this.srcMat, this.grayMat, Module.COLOR_RGBA2GRAY);
  const faces = [];
  let size;
  const faceVect = new Module.RectVector();
  const faceMat = new Module.Mat();

  Module.pyrDown(this.grayMat, faceMat);
  Module.pyrDown(faceMat, faceMat);
  size = faceMat.size();

  this.faceClassifier.detectMultiScale(faceMat, faceVect);
  for (let i = 0; i < faceVect.size(); i++) {
    const face = faceVect.get(i);
    faces.push(new Module.Rect(face.x, face.y, face.width, face.height));
  }
  faceMat.delete();
  faceVect.delete();

  this.canvasOutputCtx.drawImage(
    this.canvasInput,
    0,
    0,
    this.videoWidth,
    this.videoHeight
  );
  this.drawResults(this.canvasOutputCtx, faces, 'red', size);
  const container = document.querySelector('.document-container');
  if (container.childNodes.length < 4) {
  requestAnimationFrame(this.processDocumentPhoto.bind(this)); } else {
    this.videoShow = true;
  }
}


  public drawResults(ctx, results, color, size) {
    for (let i = 0; i < results.length; ++i) {
      const rect = results[i];
      const xRatio = this.videoWidth / size.width;
      const yRatio = this.videoHeight / size.height;
      const face = {} as any;
      face.x = rect.x * xRatio;
      face.y = rect.y * yRatio;
      face.width = rect.width * xRatio;
      face.height = rect.height * yRatio;
      let container;
      if (!this.faceContanerFull) {
         container = document.querySelector('.face-container');
      } else {
         container = document.querySelector('.document-container');
      }
      if (this.picktureInterval && container.childNodes.length < 15) {
        this.picktureInterval = false;
        this.getPicture(face, this.canvasInputCtx);
        setTimeout(() => {
          this.picktureInterval = true;
        }, 300);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.strokeRect(
        rect.x * xRatio,
        rect.y * yRatio,
        rect.width * xRatio,
        rect.height * yRatio
      );
    }
  }

  public checkPhoto() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.showResult = !this.showResult;
    }, 1200);
  }

  public getPicture(imageData, ctx) {
    const ImageData = ctx.getImageData(
      imageData.x,
      imageData.y,
      imageData.height,
      imageData.width
    );
    const MyImage = new Image();
    MyImage.src = getImageURL(ImageData, imageData.width, imageData.height);
    MyImage.className = 'face-image';
    let container;
    if (!this.faceContanerFull) {
       container = document.querySelector('.face-container');
    } else {
       container = document.querySelector('.document-container');
    }
    container.append(MyImage);

    function getImageURL(imgData, width, height) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL();
    }
  }

  public stopVideoProcessing() {
    if (this.src != null && !this.src.isDeleted()) { this.src.delete(); }
    if (this.dstC1 != null && !this.dstC1.isDeleted()) { this.dstC1.delete(); }
    if (this.dstC3 != null && !this.dstC3.isDeleted()) { this.dstC3.delete(); }
    if (this.dstC4 != null && !this.dstC4.isDeleted()) { this.dstC4.delete(); }
  }

  public processFaceCapturing() {
    if (this.videoShow) {
      this.videoShow = false;
      this.canvasOutput = document.getElementById('canvasOutput');
      this.canvasOutput.width = this.videoWidth;
      this.canvasOutput.height = this.videoHeight;
      this.detectFace = document.getElementById('face');
      this.canvasOutputCtx = this.canvasOutput.getContext('2d');
      this.startVideoProcessing();
    } else {
      this.videoShow = true;
    }
  }

  public opencvIsReady() {
    console.log('OpenCV.js is ready');
    this.startCamera();
  }
}
