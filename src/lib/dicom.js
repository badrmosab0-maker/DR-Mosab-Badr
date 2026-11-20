// تحويل DICOM إلى PNG - مكتبات pure JS فقط (تعمل على Termux/ARM)
import dicomParser from "dicom-parser";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

export function dicomToPng(buffer) {
  const bytes = new Uint8Array(buffer);
  const ds = dicomParser.parseDicom(bytes);
  const rows = ds.uint16("x00280010") || 0;
  const cols = ds.uint16("x00280011") || 0;
  const meta = {
    modality: ds.string("x00080060") || "غير محدد",
    study: ds.string("x00081030") || "غير محدد",
    date: ds.string("x00080020") || "غير محدد",
    patientAge: ds.string("x00101010") || "غير محدد",
    patientSex: ds.string("x00100040") || "غير محدد",
    size: rows && cols ? `${cols}x${rows}` : "غير محدد",
  };
  const el = ds.elements.x7fe00010; // PixelData
  if (!el) return { meta, pngBase64: null, note: "لا توجد بيانات صور داخل الملف" };
  try {
    const samples = ds.uint16("x00280002") || 1;
    const ts = ds.string("x00020010") || "";
    const isJpeg = ts.indexOf("4.50") !== -1 || ts.indexOf("4.51") !== -1 || ts.indexOf("4.57") !== -1;
    let png;
    if (isJpeg) {
      const jpegBytes = dicomParser.readEncapsulatedPixelData(ds, el, 0);
      const img = jpeg.decode(jpegBytes, { useTArray: true, formatAsRGBA: true });
      png = new PNG({ width: img.width, height: img.height });
      png.data = Buffer.from(img.data);
      meta.size = `${img.width}x${img.height}`;
    } else {
      const bits = ds.uint16("x00280100") || 16;
      const signed = ds.uint16("x00280103") === 1;
      const wc = parseFloat(ds.string("x00281050")) || 40;
      const ww = Math.abs(parseFloat(ds.string("x00281051"))) || 400;
      const off = el.dataOffset;
      const N = rows * cols;
      const data = Buffer.alloc(N * 4);
      for (let i = 0; i < N; i++) {
        if (samples === 3) {
          data[i * 4] = bytes[off + i * 3]; data[i * 4 + 1] = bytes[off + i * 3 + 1];
          data[i * 4 + 2] = bytes[off + i * 3 + 2]; data[i * 4 + 3] = 255;
          continue;
        }
        let v;
        if (bits <= 8) v = bytes[off + i];
        else {
          const b = off + i * 2;
          v = bytes[b] | (bytes[b + 1] << 8);
          if (signed && v > 32767) v -= 65536;
        }
        let g = Math.round(((v - (wc - ww / 2)) / ww) * 255);
        if (g < 0) g = 0; if (g > 255) g = 255;
        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = g;
        data[i * 4 + 3] = 255;
      }
      png = new PNG({ width: cols, height: rows });
      png.data = data;
    }
    return { meta, pngBase64: PNG.sync.write(png).toString("base64") };
  } catch {
    return { meta, pngBase64: null, note: "تعذر فك ترميز الصورة (صيغة ضغط غير مدعومة بعد) - تم استخراج البيانات النصية فقط" };
  }
}
