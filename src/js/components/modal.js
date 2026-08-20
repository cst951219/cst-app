// Modal 弹窗组件
export class Modal {
    constructor() {
        this.container = document.getElementById('modal-container');
    }

    show({ title, content, confirmText = '确定', cancelText = '取消', onConfirm, onCancel, danger = false }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            const modal = document.createElement('div');
            modal.className = 'modal';

            modal.innerHTML = `
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    <button class="btn btn-cancel">${cancelText}</button>
                    <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-confirm">${confirmText}</button>
                </div>
            `;

            overlay.appendChild(modal);
            this.container.appendChild(overlay);

            const close = (result) => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };

            modal.querySelector('.modal-close').addEventListener('click', () => {
                if (onCancel) onCancel();
                close(false);
            });

            modal.querySelector('.btn-cancel').addEventListener('click', () => {
                if (onCancel) onCancel();
                close(false);
            });

            modal.querySelector('.btn-confirm').addEventListener('click', () => {
                if (onConfirm) onConfirm();
                close(true);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    if (onCancel) onCancel();
                    close(false);
                }
            });
        });
    }
}
