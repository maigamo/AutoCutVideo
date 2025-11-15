# 快速安装指南

> 本文档提供快速安装命令清单，详细说明请查看 [环境安装指南](./docs/环境安装指南.md)

---

## ⚡ Windows 快速安装（PowerShell）

```powershell
# 1. 安装 Chocolatey（如果还没安装）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. 安装所有依赖（以管理员身份运行）
choco install nodejs-lts --version=18.20.5 -y
choco install python312 -y
choco install git -y
choco install ffmpeg -y

# 3. 验证安装
node -v     # 应该输出 v18.20.5
python --version  # 应该输出 Python 3.12.x
git --version
ffmpeg -version

# 4. 克隆项目并安装依赖
git clone <项目地址>
cd AutoCutVideo-dev
npm config set registry https://registry.npmmirror.com
npm install
npm run rebuild

# 5. 启动项目
npm run dev
```

---

## 🍎 macOS 快速安装（Terminal）

```bash
# 1. 安装 Homebrew（如果还没安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装所有依赖
brew install node@18
brew install python@3.12
brew install git
brew install ffmpeg

# 3. 链接 Node.js 18
brew link node@18

# 4. 验证安装
node -v     # 应该输出 v18.20.5
python3 --version  # 应该输出 Python 3.12.x
git --version
ffmpeg -version

# 5. 克隆项目并安装依赖
git clone <项目地址>
cd AutoCutVideo-dev
npm config set registry https://registry.npmmirror.com
npm install
npm run rebuild

# 6. 启动项目
npm run dev
```

---

## 🐧 Linux (Ubuntu/Debian) 快速安装

```bash
# 1. 更新系统
sudo apt update

# 2. 安装所有依赖
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs python3.12 python3-pip git ffmpeg build-essential

# 3. 验证安装
node -v     # 应该输出 v18.x.x
python3 --version  # 应该输出 Python 3.12.x
git --version
ffmpeg -version

# 4. 克隆项目并安装依赖
git clone <项目地址>
cd AutoCutVideo-dev
npm config set registry https://registry.npmmirror.com
npm install
npm run rebuild

# 5. 启动项目
npm run dev
```

---

## 📦 精确版本要求

| 工具 | 精确版本 | 验证命令 |
|------|---------|---------|
| **Node.js** | 18.20.5 | `node -v` |
| **npm** | 10.8.2 | `npm -v` |
| **Python** | 3.12.x | `python --version` |
| **Git** | 2.x+ | `git --version` |
| **FFmpeg** | 7.0+ | `ffmpeg -version` |

---

## 🔧 项目依赖精确版本

```json
{
  "dependencies": {
    "electron": "32.2.7",
    "vue": "3.5.12",
    "element-plus": "2.8.8",
    "pinia": "2.2.6",
    "better-sqlite3": "11.7.0",
    "playwright": "1.49.0",
    "fluent-ffmpeg": "2.1.3",
    "winston": "3.17.0"
  },
  "devDependencies": {
    "typescript": "5.7.2",
    "vite": "5.4.11",
    "electron-vite": "2.3.0",
    "electron-builder": "25.1.8"
  }
}
```

⚠️ **这些版本都经过测试，确保互相兼容！**

---

## ✅ 验证安装是否成功

运行以下命令，全部成功即可开始开发：

```bash
# 检查环境
node -v && npm -v && python --version && git --version && ffmpeg -version

# 检查项目依赖
cd AutoCutVideo-dev
npm list --depth=0

# 启动开发模式
npm run dev
```

**期望结果：**
- ✅ 所有版本号正确
- ✅ Electron 窗口成功打开
- ✅ 没有依赖错误

---

## 📖 详细文档

- 📄 [环境安装指南](./docs/环境安装指南.md) - 详细的安装步骤和问题排查
- 📄 [项目需求文档](./docs/项目需求文档.md) - 完整的技术选型说明
- 📄 [开发文档索引](./docs/开发文档索引.md) - 开发文档导航

---

**最后更新：** 2025-11-13
