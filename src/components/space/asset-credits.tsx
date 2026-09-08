import styles from "./space.module.css";
export function SpaceAssetCredits({ locale }: { locale: "ko" | "en" }) {
  const ko = locale === "ko";
  return <details className={styles.assetCredits}>
    <summary>{ko ? "가구·재질 출처와 이용조건" : "Furniture/material credits and licenses"}</summary>
    <p>{ko ? "외부 공개 라이선스 자산에는 아래 원래 라이선스가 적용됩니다. 공통 콘텐츠 보호 안내는 해당 자산의 라이선스상 권리를 제한하지 않습니다." : "Third-party assets retain their original licenses below. The shared content-protection notice does not restrict rights granted by those licenses."}</p>
    <ul>
      <li><a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa">GlamVelvetSofa</a> — Wayfair / Eric Chadwick, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. {ko ? "Champagne 변형 선택, 텍스처 압축, 좌표 정밀도 최적화, 내장 조명 제거." : "Champagne variant selected; texture compression, coordinate quantization and embedded-light removal."}</li>
      <li><a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair">SheenChair</a> — Wayfair / Eric Chadwick, CC0. {ko ? "세이지 색상 변경, 압축·정밀도 최적화." : "Sage recolor, compression and quantization."}</li>
      <li><a href="https://polyhaven.com/a/laminate_floor_03">Laminate Floor 03</a> — Charlotte Baglioni / Dario Barresi; <a href="https://polyhaven.com/a/studio_small_09">Studio Small 09</a> — Sergej Majboroda; <a href="https://polyhaven.com/a/okoume_veneer">Okoume Veneer</a> — Jenelle van Heerden; <a href="https://polyhaven.com/a/fabric_pattern_07">Fabric Pattern 07</a> — Rob Tuytel. <a href="https://polyhaven.com/license">CC0</a>. {ko ? "1K 재질·조명 자료 사용." : "1K material and lighting data."}</li>
      <li><a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/DiffuseTransmissionPlant">DiffuseTransmissionPlant</a> — Eric Chadwick / DGG, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; Rico Cilliers / Poly Haven, CC0. {ko ? "반딧불·애니메이션·카메라·조명 제거, 메시·1K 텍스처 최적화." : "Fireflies, animation, cameras and lights removed; mesh and 1K texture optimization."}</li>
    </ul>
    <p>{ko ? "그 외 가구 형상은 이 프로젝트에서 제작했습니다. 전체 자산 목록:" : "Other furniture geometry was created for this project. Complete asset manifest:"} <a href="/space/assets/manifest.json">manifest.json</a></p>
  </details>;
}
