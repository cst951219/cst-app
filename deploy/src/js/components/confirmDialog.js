// ConfirmDialog 确认对话框（基于 Modal 封装）
import { Modal } from './modal.js';

const modal = new Modal();

export async function confirmDialog({
    title = '确认操作',
    message = '确定要执行此操作吗？',
    confirmText = '确定',
    cancelText = '取消',
    danger = false,
} = {}) {
    return modal.show({
        title,
        content: `<p style="color:var(--text-secondary);line-height:1.6;">${message}</p>`,
        confirmText,
        cancelText,
        danger,
    });
}

export async function alertDialog({ title = '提示', message = '', confirmText = '知道了' } = {}) {
    return modal.show({
        title,
        content: `<p style="color:var(--text-secondary);line-height:1.6;">${message}</p>`,
        confirmText,
        cancelText: '',
    });
}
