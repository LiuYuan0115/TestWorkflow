#!/bin/bash

# 启动智算派所有服务（后台模式，启动后等待端口就绪再退出）
# 被 start-zhisuanpai.js 调用
#
# 启动顺序很关键：
#   1) 控制平面(2130) 是认证后端，前端登录需连接它 → 必须最先起；
#   2) 前端 Web(1520) 是登录入口；
#   3) 人工登录产生 runtimeAuthUserId；
#   4) dev:api 启动前会校验 runtimeAuthUserId（require_authenticated_runtime_user_scope），
#      scope 仍为 guest 时直接 exit 1，故 API 必须放在登录之后。
# 正确顺序：控制平面(2130) → 前端 Web(1520) → 人工登录 → API(2126)。

set -e

# 先于任何 cd 解析脚本所在目录，避免切换工作目录后相对路径失效
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_TESTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

ZHISUANPAI_DIR="/Users/test/Documents/developer/zhisuanpai"
LOG_DIR="/tmp"

cd "$ZHISUANPAI_DIR"

# 检查端口是否在监听
is_port_up() {
  lsof -ti :"$1" >/dev/null 2>&1
}

# 等待端口就绪
wait_for_port() {
  local port=$1
  local name=$2
  local timeout=${3:-120}
  local elapsed=0

  while [ $elapsed -lt $timeout ]; do
    if is_port_up "$port"; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done

  echo "❌ $name (端口 $port) 启动超时 (${timeout}s)" >&2
  echo "  日志: $LOG_DIR/zhisuanpai-$name.log" >&2
  tail -20 "$LOG_DIR/zhisuanpai-$name.log" 2>/dev/null >&2
  return 1
}

# 检测前端登录态。
# 真相源：测试运行时由 fixture 注入的 .auth-state.json（npm run auth 保存的快照）。
# dev 模式下登录态写在前端 localStorage 的 caiclaw:desktop.config → runtimeAuth.userId，
# storageState() 已把它持久化进 .auth-state.json 的 origins[].localStorage。
# 这里直接读该文件，与测试实际使用的认证来源保持一致；登录态有效则 userId 非空。
# 注意：不读磁盘 desktop-client-config.json —— dev 模式下它通常不生成，会误判为 guest。
AUTH_STATE_FILE="${AUTH_STATE_FILE:-$UI_TESTS_DIR/.auth-state.json}"
is_logged_in() {
  [ -f "$AUTH_STATE_FILE" ] || return 1
  local uid
  uid="$(node -e '
    try {
      const j = require(process.argv[1]);
      let uid = "";
      for (const o of (j.origins || [])) {
        for (const it of (o.localStorage || [])) {
          if (it.name === "caiclaw:desktop.config") {
            try {
              const c = JSON.parse(it.value);
              uid = String(c?.sections?.runtimeAuth?.userId || "").trim();
            } catch (e) {}
          }
        }
      }
      process.stdout.write(uid);
    } catch (e) {}
  ' "$AUTH_STATE_FILE" 2>/dev/null)"
  [ -n "$uid" ]
}

# 等待人工登录完成（轮询登录态）
wait_for_login() {
  local timeout=${1:-180}
  local elapsed=0

  # 可通过 ICLAW_SKIP_LOGIN_WAIT=1 跳过（确知已登录或由外部保证时）
  if [ "${ICLAW_SKIP_LOGIN_WAIT:-0}" = "1" ]; then
    echo "⏭️  ICLAW_SKIP_LOGIN_WAIT=1，跳过登录等待"
    return 0
  fi

  if is_logged_in; then
    echo "♻️  检测到已有登录态，跳过登录等待"
    return 0
  fi

  echo ""
  echo "🔐 API 网关需要已认证用户才能启动。"
  echo "   请在浏览器打开 http://127.0.0.1:1520 完成登录，登录后将自动继续..."
  echo "   （最多等待 ${timeout}s；确知已登录可设 ICLAW_SKIP_LOGIN_WAIT=1 跳过）"

  while [ $elapsed -lt $timeout ]; do
    if is_logged_in; then
      echo "✅ 已检测到登录态，继续启动 API 与控制平面"
      return 0
    fi
    sleep 3
    elapsed=$((elapsed + 3))
  done

  echo "❌ 等待登录态超时 (${timeout}s)，请先在浏览器登录后重试" >&2
  return 1
}

PIDS=""

# 1. 控制平面 (2130) —— 认证后端，必须最先启动：前端登录需连接它做认证
if ! is_port_up 2130; then
  echo "▶ 启动控制平面 (端口 2130)..."
  nohup pnpm dev:control-plane > "$LOG_DIR/zhisuanpai-control-plane.log" 2>&1 &
  PIDS="$PIDS $!"
  wait_for_port 2130 "control-plane" 120 || exit 1
  echo "✅ 控制平面已就绪"
else
  echo "♻️  控制平面已在运行 (端口 2130)"
fi

# 2. 前端 Web (1520) —— 登录入口，依赖控制平面完成认证
if ! is_port_up 1520; then
  echo "▶ 启动前端 Web (端口 1520)..."
  nohup pnpm dev:web > "$LOG_DIR/zhisuanpai-web.log" 2>&1 &
  PIDS="$PIDS $!"
  wait_for_port 1520 "web" 120 || exit 1
  echo "✅ 前端 Web 已就绪"
else
  echo "♻️  前端 Web 已在运行 (端口 1520)"
fi

# 3. 等待人工登录：登录会产生 runtimeAuthUserId，API 启动强依赖它
wait_for_login "${ICLAW_LOGIN_WAIT_TIMEOUT:-180}" || exit 1

# 4. 启动 API 网关 (2126) —— 依赖前端登录产生的 runtimeAuthUserId
if ! is_port_up 2126; then
  echo "▶ 启动 OpenClaw API (端口 2126)..."
  nohup pnpm dev:api > "$LOG_DIR/zhisuanpai-api.log" 2>&1 &
  PIDS="$PIDS $!"
  wait_for_port 2126 "api" 120 || exit 1
  echo "✅ OpenClaw API 已就绪"
else
  echo "♻️  OpenClaw API 已在运行 (端口 2126)"
fi

echo ""
echo "✅ 所有服务启动完成"
echo "  - 前端 Web:       http://127.0.0.1:1520"
echo "  - OpenClaw API:    http://127.0.0.1:2126"
echo "  - 控制平面:       http://127.0.0.1:2130"
echo "  - PID:$PIDS"
echo "  - 日志: /tmp/zhisuanpai-*.log"

# 将 PID 保存供 node 脚本读取
echo "$PIDS" > /tmp/zhisuanpai-pids.txt

exit 0
