# 安装指南

## 快速安装

### Windows

```powershell
# 1. 安装 Node.js
# 访问 https://nodejs.org/ 下载并安装 LTS 版本

# 2. 安装 FFmpeg (使用 Chocolatey)
# 首先安装 Chocolatey: https://chocolatey.org/install
choco install ffmpeg -y

# 或使用 Scoop
scoop install ffmpeg

# 3. 验证安装
node --version
ffmpeg -version

# 4. 克隆或下载项目
cd C:\cursor_workspace\AutoCutVideo

# 5. 安装项目依赖（如果有）
npm install

# 6. 运行环境检查
npm run check

# 7. 开始使用
npm run process videos/input videos/output music
```

### macOS

```bash
# 1. 安装 Homebrew (如果还没安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Node.js
brew install node

# 3. 安装 FFmpeg
brew install ffmpeg

# 4. 验证安装
node --version
ffmpeg -version

# 5. 克隆或下载项目
cd ~/AutoCutVideo

# 6. 安装项目依赖
npm install

# 7. 运行环境检查
npm run check

# 8. 开始使用
npm run process videos/input videos/output music
```

### Linux (Ubuntu/Debian)

```bash
# 1. 更新包管理器
sudo apt update

# 2. 安装 Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 FFmpeg
sudo apt install -y ffmpeg

# 4. 验证安装
node --version
ffmpeg -version

# 5. 克隆或下载项目
cd ~/AutoCutVideo

# 6. 安装项目依赖
npm install

# 7. 运行环境检查
npm run check

# 8. 开始使用
npm run process videos/input videos/output music
```

## 详细安装步骤

### 1. 安装 Node.js

#### Windows
1. 访问 https://nodejs.org/
2. 下载 LTS (长期支持) 版本
3. 运行安装程序
4. 保持默认选项，完成安装
5. 重启命令提示符或 PowerShell

#### macOS
```bash
# 方法 1: 使用 Homebrew (推荐)
brew install node

# 方法 2: 从官网下载
# 访问 https://nodejs.org/ 下载 .pkg 文件
```

#### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Arch Linux
sudo pacman -S nodejs npm
```

### 2. 安装 FFmpeg

#### Windows

**方法 1: 使用 Chocolatey (推荐)**
```powershell
# 首先安装 Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 FFmpeg
choco install ffmpeg -y
```

**方法 2: 使用 Scoop**
```powershell
# 安装 Scoop
iwr -useb get.scoop.sh | iex

# 安装 FFmpeg
scoop install ffmpeg
```

**方法 3: 手动安装**
1. 访问 https://www.gyan.dev/ffmpeg/builds/
2. 下载 `ffmpeg-release-full.7z`
3. 解压到 `C:\ffmpeg`
4. 添加到 PATH:
   - 右键"此电脑" → 属性 → 高级系统设置
   - 环境变量 → 系统变量 → Path → 编辑
   - 新建 → 输入 `C:\ffmpeg\bin`
   - 确定保存
5. 重启命令提示符

#### macOS
```bash
# 使用 Homebrew
brew install ffmpeg

# 或使用 MacPorts
sudo port install ffmpeg
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y ffmpeg

# CentOS/RHEL (需要 EPEL)
sudo yum install -y epel-release
sudo yum install -y ffmpeg

# Arch Linux
sudo pacman -S ffmpeg

# 从源代码编译 (最新版本)
git clone https://git.ffmpeg.org/ffmpeg.git
cd ffmpeg
./configure
make
sudo make install
```

### 3. 验证安装

```bash
# 检查 Node.js
node --version
# 应显示: v20.x.x 或更高

npm --version
# 应显示: 9.x.x 或更高

# 检查 FFmpeg
ffmpeg -version
# 应显示 FFmpeg 版本信息

ffprobe -version
# 应显示 FFprobe 版本信息
```

### 4. 项目设置

```bash
# 进入项目目录
cd AutoCutVideo

# 运行环境检查脚本
npm run check

# 输出应该全部显示 ✅
```

## 常见问题

### Q: Windows 提示 "无法识别 'node' 命令"

**A**: Node.js 未正确安装或未添加到 PATH

解决方法：
1. 重新安装 Node.js，确保勾选 "Add to PATH"
2. 重启命令提示符或 PowerShell
3. 手动添加到 PATH：`C:\Program Files\nodejs\`

### Q: Windows 提示 "无法识别 'ffmpeg' 命令"

**A**: FFmpeg 未安装或未添加到 PATH

解决方法：
1. 使用 `choco install ffmpeg` 自动安装
2. 或手动添加 FFmpeg bin 目录到 PATH
3. 重启命令提示符

### Q: PowerShell 脚本执行被禁用

**A**: 执行策略限制

解决方法：
```powershell
# 临时允许（当前会话）
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 或永久允许（需要管理员权限）
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Q: macOS 提示 "命令未找到"

**A**: 工具未安装或不在 PATH 中

解决方法：
```bash
# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 添加 Homebrew 到 PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile

# 重新安装工具
brew install node ffmpeg
```

### Q: Linux 权限错误

**A**: 缺少必要的权限

解决方法：
```bash
# 使用 sudo 安装
sudo apt install nodejs ffmpeg

# 或修复 npm 权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Q: FFmpeg 版本太旧

**A**: 系统源提供的版本过旧

解决方法：
```bash
# Ubuntu: 添加 PPA
sudo add-apt-repository ppa:savoury1/ffmpeg4
sudo apt update
sudo apt install ffmpeg

# 或从官方下载静态编译版本
# 访问 https://johnvansickle.com/ffmpeg/
```

## 升级

### 升级 Node.js

```bash
# Windows (Chocolatey)
choco upgrade nodejs

# macOS
brew upgrade node

# Linux
# 按照安装步骤重新安装最新版本
```

### 升级 FFmpeg

```bash
# Windows (Chocolatey)
choco upgrade ffmpeg

# macOS
brew upgrade ffmpeg

# Linux
sudo apt update && sudo apt upgrade ffmpeg
```

### 升级项目

```bash
# 进入项目目录
cd AutoCutVideo

# 拉取最新代码 (如果使用 Git)
git pull

# 更新依赖
npm install
```

## 卸载

### 卸载 Node.js

```bash
# Windows
choco uninstall nodejs

# macOS
brew uninstall node

# Linux
sudo apt remove nodejs
```

### 卸载 FFmpeg

```bash
# Windows
choco uninstall ffmpeg

# macOS
brew uninstall ffmpeg

# Linux
sudo apt remove ffmpeg
```

## 下一步

安装完成后，请查看：
- [README.md](README.md) - 使用指南
- [docs/批量视频处理指南.md](docs/批量视频处理指南.md) - 详细文档
- [scripts/README.md](scripts/README.md) - 脚本说明

运行环境检查：
```bash
npm run check
```

开始处理视频：
```bash
npm run process videos/input videos/output music
```

