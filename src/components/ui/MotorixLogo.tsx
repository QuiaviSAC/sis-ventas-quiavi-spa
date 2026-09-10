import React from "react";

export default function MotorixLogo({ size = "md", light = false }: { size?: "sm" | "md" | "lg"; light?: boolean }) {
  const dimensions = {
    sm: { box: "w-8 h-8", svg: 18, text: "text-base" },
    md: { box: "w-9 h-9", svg: 20, text: "text-lg" },
    lg: { box: "w-11 h-11", svg: 24, text: "text-2xl" },
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icono de Calibre / Tuerca / Piston de Ingenieria Automotriz */}
      <div
        className={`${dimensions.box} rounded-lg flex items-center justify-center relative overflow-hidden transition-transform`}
        style={{
          background: "linear-gradient(135deg, #2B2B2B 0%, #1E1E1E 100%)",
          border: "1px solid #595959",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <svg
          width={dimensions.svg}
          height={dimensions.svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Corona dentada exterior */}
          <path
            d="M12 2L14.4 3.7L17.2 2.8L18.4 5.4L21.3 5.7L21.3 8.6L23.8 10.1L22.6 12.8L23.8 15.5L21.3 17L21.3 19.9L18.4 20.2L17.2 22.8L14.4 21.9L12 23.6L9.6 21.9L6.8 22.8L5.6 20.2L2.7 19.9L2.7 17L0.2 15.5L1.4 12.8L0.2 10.1L2.7 8.6L2.7 5.7L5.6 5.4L6.8 2.8L9.6 3.7L12 2Z"
            fill="#3D3D3D"
            stroke="#A3A3A3"
            strokeWidth="0.8"
          />
          {/* Anillo central con relieve */}
          <circle cx="12" cy="12" r="6" fill="#1E1E1E" stroke="#BFBFBF" strokeWidth="1.2" />
          {/* Detalle piston / bujia en Rojo Caliper */}
          <circle cx="12" cy="12" r="2.8" fill="#D32F2F" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-wider uppercase ${dimensions.text} font-mono`}
          style={{ color: light ? "#FFFFFF" : "#1E1E1E" }}
        >
          MOTOR<span style={{ color: "#D32F2F" }}>IX</span>
        </span>
        <span
          className="text-[9px] tracking-widest font-semibold uppercase mt-0.5"
          style={{ color: light ? "#A3A3A3" : "#808080" }}
        >
          Automotive System
        </span>
      </div>
    </div>
  );
}
