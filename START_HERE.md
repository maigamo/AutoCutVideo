# 🚀 AutoCutVideo 快速启动指南

## ⚡ 一键启动（推荐）

```powershell
.\fix-and-run.ps1
```

这个脚本会自动：
- ✅ 设置UTF-8编码（解决中文乱码）
- ✅ 重新编译 better-sqlite3
- ✅ 初始化数据库（如果需要）
- ✅ 启动开发服务器

---

## 🔧 如果一键启动失败

### 步骤1: 重新编译 better-sqlite3

```powershell
npm rebuild better-sqlite3
```

### 步骤2: 初始化数据库（仅首次）

```powershell
npm run db:init
```

### 步骤3: 启动开发服务器

```powershell
npm run dev
```

---

## 📝 预期结果

成功启动后，你会看到：

```
dev server running for the electron renderer process at:

  ➜  Local:   http://localhost:10031/
  ➜  Network: http://192.168.x.x:10031/

start electron app...
```

然后 Electron 窗口会自动打开，显示应用界面。

---

## ❌ 常见错误

### 错误1: ERR_DLOPEN_FAILED

**解决方案**: 执行 `npm rebuild better-sqlite3`

### 错误2: 中文乱码

**解决方案**: 使用 `fix-and-run.ps1` 脚本，或执行：
```powershell
chcp 65001
```

### 错误3: 端口被占用

**解决方案**: 
```powershell
# 查找占用进程
netstat -ano | findstr :10031

# 结束进程（替换12345为实际进程ID）
Stop-Process -Id 12345 -Force
```

---

## 📚 更多帮助

详细的故障排除指南请查看: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**祝你使用愉快！** 🎉

