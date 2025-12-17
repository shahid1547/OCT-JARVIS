import React from 'react';

// Using React.createElement for icons since this file is .ts and cannot contain JSX
const commonProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ICONS = {
  // New Ice Crystal Logo
  JarvisLogo: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, viewBox: "0 0 24 24", fill: "none", ...props },
    React.createElement("path", { d: "M12 2v20", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    React.createElement("path", { d: "M12 12l8.66-5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    React.createElement("path", { d: "M12 12l8.66 5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    React.createElement("path", { d: "M12 12l-8.66 5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    React.createElement("path", { d: "M12 12l-8.66-5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    React.createElement("path", { d: "M12 2l4 2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    React.createElement("path", { d: "M12 22l-4-2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    React.createElement("path", { d: "M20.66 7l-2 3.46", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    React.createElement("path", { d: "M20.66 17l-4 0", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    React.createElement("path", { d: "M3.34 17l2-3.46", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    React.createElement("path", { d: "M3.34 7l4 0", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ),
  UserAvatar: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }),
    React.createElement("circle", { cx: "12", cy: "7", r: "4" })
  ),
  Brain: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" }),
    React.createElement("path", { d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" }),
    React.createElement("path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" }),
    React.createElement("path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375" }),
    React.createElement("path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5" }),
    React.createElement("path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396" }),
    React.createElement("path", { d: "M19.938 10.5a4 4 0 0 1 .585.396" }),
    React.createElement("path", { d: "M6 18a4 4 0 0 1-1.97-3.284" }),
    React.createElement("path", { d: "M17.97 14.716A4 4 0 0 1 18 18" })
  ),
  Chat: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" })
  ),
  Mic: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" }),
    React.createElement("path", { d: "M19 10v2a7 7 0 0 1-14 0v-2" }),
    React.createElement("line", { x1: "12", x2: "12", y1: "19", y2: "22" })
  ),
  Chart: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M3 3v18h18" }),
    React.createElement("path", { d: "m19 9-5 5-4-4-3 3" })
  ),
  Send: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "m22 2-7 20-4-9-9-4Z" }),
    React.createElement("path", { d: "M22 2 11 13" })
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" }),
    React.createElement("path", { d: "M5 3v4" }),
    React.createElement("path", { d: "M9 3v4" }),
    React.createElement("path", { d: "M3 7h4" }),
    React.createElement("path", { d: "M3 5h4" })
  ),
  LogOut: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
    React.createElement("polyline", { points: "16 17 21 12 16 7" }),
    React.createElement("line", { x1: "21", x2: "9", y1: "12", y2: "12" })
  ),
  Stop: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" })
  ),
  Sun: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("circle", { cx: "12", cy: "12", r: "5" }),
    React.createElement("path", { d: "M12 1v2" }),
    React.createElement("path", { d: "M12 21v2" }),
    React.createElement("path", { d: "M4.22 4.22l1.42 1.42" }),
    React.createElement("path", { d: "M18.36 18.36l1.42 1.42" }),
    React.createElement("path", { d: "M1 12h2" }),
    React.createElement("path", { d: "M21 12h2" }),
    React.createElement("path", { d: "M4.22 19.78l1.42-1.42" }),
    React.createElement("path", { d: "M18.36 5.64l1.42-1.42" })
  ),
  Moon: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })
  ),
  Search: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
    React.createElement("line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" })
  ),
  Trash: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("polyline", { points: "3 6 5 6 21 6" }),
    React.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
  ),
  Volume2: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
    React.createElement("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14" }),
    React.createElement("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" })
  ),
  VolumeX: (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", { ...commonProps, ...props },
    React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
    React.createElement("line", { x1: "23", x2: "17", y1: "9", y2: "15" }),
    React.createElement("line", { x1: "17", x2: "23", y1: "9", y2: "15" })
  ),
};

export const MOCK_ADMIN_STATS = [
  { name: 'Mon', active: 400, time: 24 },
  { name: 'Tue', active: 300, time: 30 },
  { name: 'Wed', active: 550, time: 28 },
  { name: 'Thu', active: 480, time: 35 },
  { name: 'Fri', active: 600, time: 40 },
  { name: 'Sat', active: 700, time: 45 },
  { name: 'Sun', active: 650, time: 38 },
];