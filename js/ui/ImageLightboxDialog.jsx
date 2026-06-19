import { Lightbox } from "../core/platform.ts";

/** Puente local → ISAComponents.LightboxZoom. */
export function ImageLightboxDialog(props) {
  const Comp = Lightbox.ImageLightboxDialog;
  return <Comp ns="ISA" {...props} />;
}
