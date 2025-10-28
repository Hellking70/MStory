import TreeStore from '../lib/TreeStore';
import type { TreeItem } from '../types/global';
import { describe, it, expect } from 'vitest';

// Вспомогательная функция для создания элемента
const makeItem = (id: string | number, parent: string | number | null, label = `Item ${id}`): TreeItem => ({
    id,
    parent,
    label,
});

describe('TreeStore', () => {
    let items: TreeItem[];
    let store: TreeStore;

    beforeEach(() => {
        items = [
            makeItem(1, null),
            makeItem(2, 1),
            makeItem(3, 1),
            makeItem(4, 2),
            makeItem(5, 2),
            makeItem(6, 3),
            makeItem(7, null),
        ];
        store = new TreeStore(items);
    });

    describe('constructor', () => {
        it('should initialize with items', () => {
            expect(store.getAll()).toHaveLength(7);
        });

        it('should build idMap correctly', () => {
            expect(store.getItem(1)).toEqual(items[0]);
            expect(store.getItem(999)).toBeUndefined();
        });

        it('should build childrenMap correctly', () => {
            expect(store.getChildren(1)).toHaveLength(2);
            expect(store.getChildren(2)).toHaveLength(2);
            expect(store.getChildren(999)).toHaveLength(0);
        });
    });

    describe('getAll', () => {
        it('should return original items array', () => {
            expect(store.getAll()).toEqual(items);
        });
    });

    describe('getItem', () => {
        it('should return item by id', () => {
            const item = store.getItem(2);
            expect(item).toEqual(makeItem(2, 1));
        });

        it('should return undefined for non-existent id', () => {
            expect(store.getItem('nonexistent')).toBeUndefined();
        });
    });

    describe('getChildren', () => {
        it('should return direct children', () => {
            const children = store.getChildren(1);
            expect(children).toHaveLength(2);
            expect(children.map(c => c.id)).toEqual([2, 3]);
        });

        it('should return empty array for leaf or unknown parent', () => {
            expect(store.getChildren(5)).toEqual([]);
            expect(store.getChildren('unknown')).toEqual([]);
        });
    });

    describe('getAllChildren', () => {
        it('should return all descendants in DFS order', () => {
            const descendants = store.getAllChildren(1);
            const ids = descendants.map(d => d.id);

            expect(ids).toContain(2);
            expect(ids).toContain(3);
            expect(ids).toContain(4);
            expect(ids).toContain(5);
            expect(ids).toContain(6);
            expect(ids).toHaveLength(5);
        });

        it('should return empty for leaf node', () => {
            expect(store.getAllChildren(4)).toEqual([]);
        });
    });

    describe('getAllParents', () => {
        it('should return path to root (inclusive)', () => {
            const path = store.getAllParents(4);
            const ids = path.map(p => p.id);
            expect(ids).toEqual([4, 2, 1]);
        });

        it('should return single item for root', () => {
            const path = store.getAllParents(1);
            expect(path.map(p => p.id)).toEqual([1]);
        });

        it('should stop at missing parent', () => {
            const brokenItem: TreeItem = { id: 99, parent: 98, label: 'broken' };
            const brokenStore = new TreeStore([...items, brokenItem]);
            const path = brokenStore.getAllParents(99);
            expect(path.map(p => p.id)).toEqual([99]);
        });
    });

    describe('addItem', () => {
        it('should add new item and update indexes', () => {
            const newItem = makeItem(8, 1);
            store.addItem(newItem);

            expect(store.getItem(8)).toEqual(newItem);
            expect(store.getChildren(1)).toHaveLength(3);
            expect(store.getAll()).toHaveLength(8);
        });

        it('should throw if id already exists', () => {
            expect(() => store.addItem(makeItem(1, null))).toThrow('already exists');
        });
    });

    describe('removeItem', () => {
        it('should remove item and all its descendants', () => {
            store.removeItem(2); // удаляем 2, 4, 5

            expect(store.getItem(2)).toBeUndefined();
            expect(store.getItem(4)).toBeUndefined();
            expect(store.getItem(5)).toBeUndefined();
            expect(store.getAll()).toHaveLength(4);
            expect(store.getChildren(1)).toHaveLength(1);
        });

        it('should remove root item', () => {
            store.removeItem(7);
            expect(store.getItem(7)).toBeUndefined();
            expect(store.getAll()).toHaveLength(6);
        });
    });

    describe('updateItem', () => {
        it('should update item fields', () => {
            const updated = { id: 2, parent: 1, label: 'Updated Item' };
            store.updateItem(updated);

            const item = store.getItem(2);
            expect(item?.label).toBe('Updated Item');
        });

        it('should handle parent change correctly', () => {
            // Перемещаем 2 из-под 1 к 3
            store.updateItem({ id: 2, parent: 3, label: 'Item 2' });

            expect(store.getChildren(1)).toHaveLength(1);
            expect(store.getChildren(3)).toHaveLength(2);
            expect(store.getChildren(2)).toHaveLength(2);
        });

        it('should throw if updating non-existent item', () => {
            expect(() => store.updateItem(makeItem(999, null))).toThrow('does not exist');
        });
    });

    describe('edge cases', () => {
        it('should handle empty input', () => {
            const emptyStore = new TreeStore([]);
            expect(emptyStore.getAll()).toEqual([]);
            expect(emptyStore.getChildren(1)).toEqual([]);
        });

        it('should handle multiple roots', () => {
            const roots = store.getAll().filter(item => item.parent === null);
            expect(roots).toHaveLength(2); // 1 и 7
        });
    });
});
