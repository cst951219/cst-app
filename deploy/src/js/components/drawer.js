// Drawer 右侧抽屉组件
export class Drawer {
    constructor() {
        this.container = document.getElementById('drawer-container');
    }

    show({ title, content, footer = '', onClose, width = '480px', confirmText = '', cancelText = '取消', onConfirm, onCancel }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'drawer-overlay';

            const drawer = document.createElement('div');
            drawer.className = 'drawer';
            drawer.style.width = width;

            // 如果提供了 confirmText，自动生成 footer 按钮
            let footerHtml = footer;
            if (!footerHtml && confirmText) {
                footerHtml = `
                    <div style="display:flex;justify-content:flex-end;gap:8px;">
                        ${cancelText ? `<button class="btn" id="drawer-cancel-btn">${cancelText}</button>` : ''}
                        <button class="btn btn-primary" id="drawer-confirm-btn">${confirmText}</button>
                    </div>
                `;
            }

            drawer.innerHTML = `
                <div class="drawer-header">
                    <div class="drawer-title" style="font-size:1.1rem;font-weight:600;">${title}</div>
                    <button class="modal-close drawer-close">&times;</button>
                </div>
                <div class="drawer-body">${content}</div>
                ${footerHtml ? `<div class="drawer-footer">${footerHtml}</div>` : ''}
            `;

            overlay.appendChild(drawer);
            this.container.appendChild(overlay);

            const close = (result) => {
                drawer.style.transform = 'translateX(100%)';
                drawer.style.transition = 'transform 0.3s ease';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    overlay.remove();
                    if (onClose) onClose();
                    resolve(result);
                }, 300);
            };

            drawer.querySelector('.drawer-close').addEventListener('click', () => close(null));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(null);
            });

            // 绑定确认按钮
            const confirmBtn = drawer.querySelector('#drawer-confirm-btn');
            if (confirmBtn && onConfirm) {
                confirmBtn.addEventListener('click', async () => {
                    const result = await onConfirm(drawer);
                    if (result !== false) {
                        close(result);
                    }
                });
            }

            // 绑定取消按钮
            const cancelBtn = drawer.querySelector('#drawer-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (onCancel) onCancel();
                    close(null);
                });
            }

            // 返回抽屉元素引用，方便外部操作
            // body 返回整个 drawer 元素，以便查询 footer 中的按钮
            resolve({ element: drawer, body: drawer, close });
        });
    }
}
