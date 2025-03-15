declare module 'react-chartjs-2' {
  import { ChartData, ChartOptions } from 'chart.js';
  import * as React from 'react';
  
  export interface ChartProps {
    data: ChartData;
    options?: ChartOptions;
    height?: number;
    width?: number;
    id?: string;
    className?: string;
    fallbackContent?: React.ReactNode;
  }
  
  export class Chart<P extends ChartProps = ChartProps> extends React.Component<P> {}
  export class Line extends Chart {}
  export class Bar extends Chart {}
  export class Pie extends Chart {}
  export class Doughnut extends Chart {}
  export class PolarArea extends Chart {}
  export class Radar extends Chart {}
  export class Scatter extends Chart {}
  export class Bubble extends Chart {}
} 