/* 孕娘王者 - Service Worker
 *
 * 为什么需要它: Chrome / Edge 判断一个网站"能不能装成 App"的硬性条件之一是
 * 必须注册一个带 fetch 事件处理器的 service worker。没有它, 手机上点
 * "添加到主屏幕 / 安装应用"会毫无反应 —— 这就是之前装不上的原因。
 *
 * 这里刻意【不做任何缓存】, 只提供一个空的 fetch 处理器来满足可安装性要求。
 * 原因: 游戏有 135MB 素材, 全量缓存又慢又占空间, 而且会导致更新后手机上
 * 还跑着旧版本(要等缓存过期)。直接走网络反而更省心。
 */

self.addEventListener('install', () => {
    // 新的 SW 立刻进入等待结束状态, 不要卡住
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // 立刻接管页面
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
    // 空实现: 什么都不拦截, 请求照常走网络。
    // 这个监听器的存在本身就是"可安装"的条件。
});
