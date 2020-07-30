import React from 'react';
import { SketchPicker } from 'react-color';

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function trim(str) {
  return str.replace(/^\s+|\s+$/gm, '');
}
function rgbaToHex(r, g, b, a) {
  var outParts = [
    r.toString(16),
    g.toString(16),
    b.toString(16),
    Math.round(a * 255)
      .toString(16)
      .substring(0, 2),
  ];

  // Pad single-digit output values
  outParts.forEach(function (part, i) {
    if (part.length === 1) {
      outParts[i] = '0' + part;
    }
  });

  return '#' + outParts.join('');
}
export default function ColorPicker(props: { value: string; onChange: any }) {
  const { value , onChange } = props;
  return (
    <SketchPicker
      color={value}
      onChange={(v) => {
        const { r, g, b, a } = v.rgb;
        onChange(rgbaToHex(r,g,b,a));
      }}
    />
  );
}
