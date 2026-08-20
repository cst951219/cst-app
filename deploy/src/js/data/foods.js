// 食物数据库 — 常见食物每100g卡路里（粗略值，仅供参考）
export const FOOD_DATABASE = [
  // === 主食 ===
  { id: 'rice', name: '米饭', emoji: '🍚', category: '主食', kcal: 116 },
  { id: 'noodle', name: '面条', emoji: '🍜', category: '主食', kcal: 138 },
  { id: 'mantou', name: '馒头', emoji: '🥟', category: '主食', kcal: 223 },
  { id: 'bread', name: '面包', emoji: '🍞', category: '主食', kcal: 313 },
  { id: 'oatmeal', name: '燕麦', emoji: '🥣', category: '主食', kcal: 367 },
  { id: 'sweet_potato', name: '红薯', emoji: '🍠', category: '主食', kcal: 86 },
  { id: 'corn', name: '玉米', emoji: '🌽', category: '主食', kcal: 112 },
  { id: 'dumpling', name: '饺子', emoji: '🥟', category: '主食', kcal: 253 },

  // === 肉蛋 ===
  { id: 'chicken_breast', name: '鸡胸肉', emoji: '🍗', category: '肉蛋', kcal: 133 },
  { id: 'egg', name: '鸡蛋', emoji: '🥚', category: '肉蛋', kcal: 144 },
  { id: 'beef', name: '牛肉', emoji: '🥩', category: '肉蛋', kcal: 125 },
  { id: 'pork', name: '猪肉', emoji: '🥓', category: '肉蛋', kcal: 395 },
  { id: 'fish', name: '鱼肉', emoji: '🐟', category: '肉蛋', kcal: 113 },
  { id: 'shrimp', name: '虾', emoji: '🦐', category: '肉蛋', kcal: 93 },
  { id: 'tofu', name: '豆腐', emoji: '🧈', category: '肉蛋', kcal: 81 },
  { id: 'salmon', name: '三文鱼', emoji: '🐟', category: '肉蛋', kcal: 208 },

  // === 蔬菜 ===
  { id: 'broccoli', name: '西兰花', emoji: '🥦', category: '蔬菜', kcal: 34 },
  { id: 'spinach', name: '菠菜', emoji: '🥬', category: '蔬菜', kcal: 23 },
  { id: 'lettuce', name: '生菜', emoji: '🥗', category: '蔬菜', kcal: 15 },
  { id: 'tomato', name: '番茄', emoji: '🍅', category: '蔬菜', kcal: 18 },
  { id: 'cucumber', name: '黄瓜', emoji: '🥒', category: '蔬菜', kcal: 16 },
  { id: 'carrot', name: '胡萝卜', emoji: '🥕', category: '蔬菜', kcal: 41 },
  { id: 'mushroom', name: '蘑菇', emoji: '🍄', category: '蔬菜', kcal: 22 },
  { id: 'eggplant', name: '茄子', emoji: '🍆', category: '蔬菜', kcal: 25 },

  // === 水果 ===
  { id: 'apple', name: '苹果', emoji: '🍎', category: '水果', kcal: 52 },
  { id: 'banana', name: '香蕉', emoji: '🍌', category: '水果', kcal: 89 },
  { id: 'orange', name: '橙子', emoji: '🍊', category: '水果', kcal: 47 },
  { id: 'strawberry', name: '草莓', emoji: '🍓', category: '水果', kcal: 32 },
  { id: 'blueberry', name: '蓝莓', emoji: '🫐', category: '水果', kcal: 57 },
  { id: 'grape', name: '葡萄', emoji: '🍇', category: '水果', kcal: 69 },
  { id: 'watermelon', name: '西瓜', emoji: '🍉', category: '水果', kcal: 30 },
  { id: 'pear', name: '梨', emoji: '🍐', category: '水果', kcal: 50 },

  // === 奶豆 ===
  { id: 'milk', name: '牛奶', emoji: '🥛', category: '奶豆', kcal: 54 },
  { id: 'yogurt', name: '酸奶', emoji: '🥛', category: '奶豆', kcal: 72 },
  { id: 'cheese', name: '奶酪', emoji: '🧀', category: '奶豆', kcal: 328 },
  { id: 'soy_milk', name: '豆浆', emoji: '🥛', category: '奶豆', kcal: 31 },

  // === 零食饮料 ===
  { id: 'nuts', name: '坚果', emoji: '🥜', category: '零食', kcal: 607 },
  { id: 'chocolate', name: '巧克力', emoji: '🍫', category: '零食', kcal: 546 },
  { id: 'cookie', name: '饼干', emoji: '🍪', category: '零食', kcal: 433 },
  { id: 'cake', name: '蛋糕', emoji: '🍰', category: '零食', kcal: 347 },
  { id: 'ice_cream', name: '冰淇淋', emoji: '🍦', category: '零食', kcal: 207 },
  { id: 'cola', name: '可乐', emoji: '🥤', category: '零食', kcal: 43 },
  { id: 'coffee', name: '咖啡(黑)', emoji: '☕', category: '零食', kcal: 2 },
  { id: 'juice', name: '果汁', emoji: '🧃', category: '零食', kcal: 45 },
];

// 按分类分组
export function getFoodsByCategory() {
  const grouped = {};
  for (const food of FOOD_DATABASE) {
    if (!grouped[food.category]) {
      grouped[food.category] = [];
    }
    grouped[food.category].push(food);
  }
  return grouped;
}

// 搜索食物
export function searchFoods(keyword) {
  if (!keyword) return FOOD_DATABASE;
  const lower = keyword.toLowerCase();
  return FOOD_DATABASE.filter(f =>
    f.name.includes(keyword) || f.name.toLowerCase().includes(lower)
  );
}

// 根据ID获取食物
export function getFoodById(id) {
  return FOOD_DATABASE.find(f => f.id === id);
}
