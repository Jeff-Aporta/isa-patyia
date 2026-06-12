/** Botón con icono Iconify (mismo patrón que ISP ButtonIconify). */
export function ButtonIconify({
  icon,
  title = "",
  label = "",
  onClick,
  disabled = false,
  busy = false,
  color = "",
  variant = "",
  className = "",
  type = "button",
}) {
  const shown = busy ? "mdi:loading" : icon;
  const variantCls = variant ? `btn-iconify--${variant}` : "";
  const colorCls = color ? `btn-iconify--${color}` : "";
  const labeledCls = label ? "btn-iconify--labeled" : "";
  const aria = label || title || undefined;
  return (
    <button
      type={type}
      className={`btn-iconify ${variantCls} ${colorCls} ${labeledCls} ${className}`.trim()}
      title={title || label || undefined}
      aria-label={aria}
      onClick={onClick}
      disabled={disabled || busy}
    >
      <iconify-icon icon={shown} width="1.15em" height="1.15em" />
      {label ? <span className="btn-iconify__lbl">{label}</span> : null}
    </button>
  );
}

export function Iconify({ icon, width = "1em", height = "1em", className = "" }) {
  return <iconify-icon class={className} icon={icon} width={width} height={height} />;
}
