export const houseTags = [
  { id: 1, value: '一室一厅' },
  { id: 2, value: '两室一厅' },
  { id: 3, value: '三室一厅' },
  { id: 4, value: '三室两厅' },
  { id: 5, value: '四室及以上' },
];

export const sizeTags = [
  { id: 6, value: '30平米以下' },
  { id: 7, value: '30-60平米' },
  { id: 8, value: '60-90平米' },
  { id: 9, value: '90-120平米' },
  { id: 10, value: '120平米以上' },
];

export const afitmentTags = [
  { id: 11, value: '毛坯' },
  { id: 12, value: '简装' },
  { id: 13, value: '精装修' },
  { id: 14, value: '豪装' },
];

export const floorTags = [
  { id: 15, value: '低楼层' },
  { id: 16, value: '中楼层' },
  { id: 17, value: '高楼层' },
];

export const orientationTags = [
  { id: 18, value: '南' },
  { id: 19, value: '北' },
  { id: 20, value: '东西' },
  { id: 21, value: '南北通透' },
];

export const areaTags = [
  { id: 22, value: '朝阳区' },
  { id: 23, value: '海淀区' },
  { id: 24, value: '丰台区' },
  { id: 25, value: '昌平区' },
];

export const pirceTags = [
  { id: 26, value: '100万以下' },
  { id: 27, value: '100-300万' },
  { id: 28, value: '300-500万' },
  { id: 29, value: '500-800万' },
  { id: 30, value: '800万以上' },
];

export const typeTags = [
  { id: 31, value: '普通住宅' },
  { id: 32, value: '别墅' },
  { id: 33, value: '公寓' },
  { id: 34, value: '商住两用' },
];

export const statusTags = [
  { id: 35, value: '在售' },
  { id: 36, value: '已售出' },
  { id: 37, value: '已预约' },
];

export const all = [
  ...houseTags,
  ...sizeTags,
  ...afitmentTags,
  ...floorTags,
  ...orientationTags,
  ...areaTags,
  ...pirceTags,
  ...typeTags,
];
