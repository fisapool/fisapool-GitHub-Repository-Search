declare module 'chart.js' {
  export const Chart: any;
  export const registerables: any[];
  
  export interface ChartData {
    labels?: (string | string[])[];
    datasets: ChartDataset[];
  }
  
  export interface ChartDataset {
    label?: string;
    data: (number | null | undefined)[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointBackgroundColor?: string | string[];
    pointBorderColor?: string | string[];
    pointHoverBackgroundColor?: string | string[];
    pointHoverBorderColor?: string | string[];
  }
  
  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'left' | 'right' | 'bottom';
        labels?: {
          font?: {
            size?: number;
          };
        };
      };
      title?: {
        display?: boolean;
        text?: string;
        font?: {
          size?: number;
        };
      };
      tooltip?: {
        enabled?: boolean;
      };
    };
    scales?: {
      x?: {
        display?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
      y?: {
        display?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
        min?: number;
        max?: number;
      };
    };
  }
  
  // Chart.js components
  export const ArcElement: any;
  export const LineElement: any;
  export const BarElement: any;
  export const PointElement: any;
  export const Rectangle: any;
  export const CategoryScale: any;
  export const LinearScale: any;
  export const TimeScale: any;
  export const Tooltip: any;
  export const Legend: any;
  export const Title: any;
} 