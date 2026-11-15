/** 3B sahneyi dışarıdan süren değerler: kaydırma, sürükleme, yakınlaşma. Her karede okunur, React'i yeniden çizdirmez. */
export type ChairCtrl = {
  rot: number;
  zoom: number;
  drag: number;
  vel: number;
  dragging: boolean;
  idle: number;
  pulse: number;
};

export const newCtrl = (): ChairCtrl => ({ rot: 0, zoom: 0, drag: 0, vel: 0, dragging: false, idle: 0, pulse: 0 });
