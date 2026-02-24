import { ModuleSchema } from '../../domain/vflowTypes';

export const fileSchemas: Record<string, ModuleSchema> = {
  "vflow.file.import_image": {
    inputs: [
      { id: "image_path", name: "图片路径", staticType: "string", pickerType: "file", hint: "点击选择本地图片或填入 content:// 路径" }
    ],
    outputs: [{ id: "image", name: "图像数据", typeName: "vflow.type.image" }]
  },
  "vflow.file.save_image": {
    inputs: [
      { id: "image", name: "要保存的图像", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"] },
      { id: "directory", name: "保存目录", staticType: "string", pickerType: "directory" },
      { id: "file_name", name: "文件名", staticType: "string", defaultValue: "saved_image.png" }
    ],
    outputs: [{ id: "file_path", name: "文件完整路径", typeName: "vflow.type.string" }]
  },
  "vflow.file.adjust_image": {
    inputs: [
      { id: "image", name: "源图像", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"] },
      { id: "exposure", name: "曝光", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1] },
      { id: "contrast", name: "对比度", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1] },
      { id: "brightness", name: "亮度", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1] },
      { id: "saturation", name: "饱和度", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1] },
      { id: "vibrance", name: "鲜明度", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1], isFolded: true },
      { id: "highlights", name: "高光", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1], isFolded: true },
      { id: "shadows", name: "阴影", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1], isFolded: true },
      { id: "blackPoint", name: "黑点", staticType: "number", defaultValue: 0, sliderConfig: [0, 100, 1], isFolded: true },
      { id: "warmth", name: "色温", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1], isFolded: true },
      { id: "tint", name: "色调", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1], isFolded: true },
      { id: "vignette", name: "暗角", staticType: "number", defaultValue: 0, sliderConfig: [-100, 100, 1], isFolded: true },
      { id: "sharpness", name: "锐化", staticType: "number", defaultValue: 0, sliderConfig: [0, 100, 1], isFolded: true },
      { id: "clarity", name: "清晰度", staticType: "number", defaultValue: 0, sliderConfig: [0, 100, 1], isFolded: true },
      { id: "denoise", name: "噪点消除", staticType: "number", defaultValue: 0, sliderConfig: [0, 5, 1], isFolded: true }
    ],
    outputs: [{ id: "image", name: "处理后的图像", typeName: "vflow.type.image" }]
  },
  "vflow.file.rotate_image": {
    inputs: [
      { id: "image", name: "源图像", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"] },
      { id: "degrees", name: "旋转角度", staticType: "number", defaultValue: 90, sliderConfig: [-360, 360, 90] }
    ],
    outputs: [{ id: "image", name: "旋转后的图像", typeName: "vflow.type.image" }]
  },
  "vflow.file.apply_mask": {
    inputs: [
      { id: "image", name: "背景图像", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"] },
      { id: "mask", name: "遮罩/前景图", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"] },
      { id: "x", name: "叠加位置 X", staticType: "number", defaultValue: 0 },
      { id: "y", name: "叠加位置 Y", staticType: "number", defaultValue: 0 },
      { id: "alpha", name: "透明度", staticType: "number", defaultValue: 1, sliderConfig: [0, 1, 0.1] }
    ],
    outputs: [{ id: "image", name: "合成后的图像", typeName: "vflow.type.image" }]
  }
};
