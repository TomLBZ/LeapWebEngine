export const IMAGE_SETTINGS = {
    "LEFT_IMG_WIDTH": 400.,
    "LEFT_IMG_HEIGHT": 300.,
    "RIGHT_IMG_WIDTH": 400.,
    "RIGHT_IMG_HEIGHT": 300.,
    "KERNAL_GAUSSIAN3x3": [ [0.0625, 0.125, 0.0625],
                            [0.125,  0.25,  0.125 ],
                            [0.0625, 0.125, 0.0625] ],
    //add more constants here
}
export class Pixel{
    constructor(r,g,b,a){
        this.R = r || 0.;
        this.G = g || 0.;
        this.B = b || 0.;
        this.A = a || 0.;
        this.Gray = 0.299 * this.R +  0.587 * this.G + 0.114 * this.B || 0.;
    }
    UpdateColor(r,g,b,a){
        this.R = r || 0.;
        this.G = g || 0.;
        this.B = b || 0.;
        this.A = a || 0.;
        this.Gray = 0.299 * this.R +  0.587 * this.G + 0.114 * this.B || 0.;
    }
}
export class Picture{
    constructor(width, height){
        this.Width = width;
        this.Height = height;
        this.DataRows = new Array(height);
        for (let i = 0; i < height; i++) {
            this.DataRows.push(new Array(width));
        }
    }
    LoadImgData(imgdata, sourcewidth, sourceheight){
        let len = sourcewidth * sourceheight;
        if(sourcewidth != this.Width || sourceheight != this.Height) return;
        let rc = 0, cc = 0;
        for (let i = 0; i < len; i+=4) {
            this.DataRows[rc].push(new Pixel(imgdata[i],imgdata[i+1],imgdata[i+2],imgdata[i+3]));
            if(cc < width) cc++;
            else{cc -= width; rc++;}
        }
    }
    Getpixel(x,y){
        return this.DataRows[y][x];
    }
    ToImgData(){
        var rt = new Array();
        for (let i = 0; i < this.Height; i++) {
            for (let j = 0; j < this.Width; j++) {
                let gray = this.DataRows[i][j].Gray;
                rt.push(gray);
                rt.push(gray);
                rt.push(gray);
                rt.push(255);
            }
        }
        return rt;
    }
}
export class StereoProcessor{
    constructor(cOut, picLeft, picRight){
        this.OutputCanvas = cOut || {};
        this.OutputContext = cOut.getContext("2d") || {};
        this.LeftPic = picLeft || new Picture(IMAGE_SETTINGS.LEFT_IMG_WIDTH, IMAGE_SETTINGS.LEFT_IMG_HEIGHT);
        this.RightPic = picRight || new Picture(IMAGE_SETTINGS.RIGHT_IMG_WIDTH, IMAGE_SETTINGS.RIGHT_IMG_HEIGHT);
        this.Kernal = IMAGE_SETTINGS.KERNAL_GAUSSIAN3x3;
    }
    UpdateImages(picL, picR){
        this.LeftPic = picL || this.LeftPic;
        this.RightPic = picR || this.RightPic;
    }
    LoadImagesFromImgData(dataL, lw, lh, dataR, rw, rh){
        var picL = new Picture(lw, lh);
        picL.LoadImgData(dataL, lw, lh);
        var picR = new Picture(rw, rh);
        picR.LoadImgData(dataR, rw, rh);
        this.LeftPic = picL;
        this.RightPic = picR;
    }
    LoadImagesFromCanvas(leftC, rightC){
        var cxtL = leftC.getContext("2d");
        var cxtR = rightC.getContext("2d");
        var dataL = cxtL.getImageData(0,0,leftC.width,leftC.height);
        var dataR = cxtR.getImageData(0,0,rightC.width,rightC.height);
        this.LoadImagesFromImgData(dataL,leftC.width,leftC.height,dataR,rightC.width,rightC.height);
    }
    SetKernal(kernal){
        this.Kernal = kernal || this.Kernal;
    }
    PreProcessing(pic, searchlen){
        //perform cutting and filtering
    }
    GetDisparityMap(searchlen, tolerance){
        var left = this.PreProcessing(this.LeftPic, searchlen);
        var right = this.PreProcessing(this.right, searchlen);
        //perform stereobm match
    }
    GetDepthMap(searchlen, tolerance,focus,base){
        var disparity = this.GetDisparityMap(searchlen, tolerance);
        //perform triangulation
    }
}