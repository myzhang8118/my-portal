#!/bin/bash
set -e

echo "========================================="
echo "   个人网站 - 更新脚本"
echo "========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/srv/projects/my-portal"
APP_DIR="$PROJECT_DIR/app"

# 1. 备份当前代码
echo -e "${YELLOW}[1/4] 备份当前代码...${NC}"
BACKUP_NAME="app_backup_$(date +%Y%m%d%H%M%S)"
cp -r "$APP_DIR" "$PROJECT_DIR/$BACKUP_NAME"
echo -e "${GREEN}  备份到 $PROJECT_DIR/$BACKUP_NAME ✓${NC}"

# 2. 安装后端依赖
echo -e "${YELLOW}[2/4] 更新后端依赖...${NC}"
cd "$APP_DIR/backend"
npm install --production
echo -e "${GREEN}  后端依赖更新完成 ✓${NC}"

# 3. 构建前端
echo -e "${YELLOW}[3/4] 重新构建前端...${NC}"
cd "$APP_DIR/frontend"
npm install
npm run build
echo -e "${GREEN}  前端构建完成 ✓${NC}"

# 4. 重启服务
echo -e "${YELLOW}[4/4] 重启服务...${NC}"
cd "$PROJECT_DIR"
pm2 restart my-portal
echo -e "${GREEN}  服务重启完成 ✓${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}  🎉 更新完成！${NC}"
echo "========================================="
echo "  数据目录未动，你的内容不会丢失"
echo "  如有问题，可回滚："
echo "  cp -r $PROJECT_DIR/$BACKUP_NAME $APP_DIR"
echo "  pm2 restart my-portal"
echo "========================================="
